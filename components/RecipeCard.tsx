import React, { useState, useMemo } from 'react';
import { RecipeDetail, ShoppingListItem } from '../types';
import { StarRating } from './StarRating';

const ServingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>);
const TimeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>);
const CostIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.162-.682zM11 12.849v-1.698c.22.071.412.164.567.267a2.5 2.5 0 001.162.682zM10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.5 4.5 0 00-1.879 3.407A1 1 0 009 9.5v1a1 1 0 001.879.497A4.5 4.5 0 0013 8.092V7a1 1 0 10-2 0z" /></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>);
const MinusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>);


interface RecipeCardProps {
  title: string;
  recipeName: string;
  recipeDetail: RecipeDetail;
  onStartCooking: () => void;
  shoppingList: ShoppingListItem[];
  onToggleShoppingListItem: (ingredient: string, recipeName: string) => void;
}

// Simple ingredient scaling logic
const scaleIngredient = (ingredient: string, factor: number): string => {
  return ingredient.replace(/[\d/.\s]+/, (match) => {
    const amount = match.trim();
    let num = 0;
    if (amount.includes('/')) {
      const parts = amount.split(/[\s/]/).filter(Boolean);
      num = parts.reduce((acc, part) => acc + (eval(part) || 0), 0);
    } else {
      num = parseFloat(amount);
    }
    if (isNaN(num)) return match;
    const newAmount = num * factor;
    // a bit of formatting for fractions
    if (newAmount % 1 !== 0) return `${Math.round(newAmount * 100) / 100} `;
    return `${newAmount} `;
  });
};

export const RecipeCard: React.FC<RecipeCardProps> = ({ title, recipeName, recipeDetail, onStartCooking, shoppingList, onToggleShoppingListItem }) => {
  const [servings, setServings] = useState(2);
  const scalingFactor = servings / 2; // Assuming original recipe is for 2 servings

  const scaledIngredients = useMemo(() => {
    if (scalingFactor === 1) return recipeDetail.ingredients;
    return recipeDetail.ingredients.map(ing => scaleIngredient(ing, scalingFactor));
  }, [recipeDetail.ingredients, scalingFactor]);

  const averageRating = useMemo(() => {
    if (!recipeDetail.ratings || recipeDetail.ratings.length === 0) return 0;
    const sum = recipeDetail.ratings.reduce((a, b) => a + b, 0);
    return sum / recipeDetail.ratings.length;
  }, [recipeDetail.ratings]);

  const isIngredientInList = (ingredient: string) => {
    return shoppingList.some(item => item.ingredient === ingredient && item.recipeName === recipeName);
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg h-full flex flex-col">
      <div className='flex justify-between items-start'>
        <h3 className="text-2xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">{title}</h3>
        <StarRating rating={averageRating} size="sm" />
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4 border-b border-gray-700 pb-3">
          <div className="flex items-center"><TimeIcon /><span>{recipeDetail.minTime}</span></div>
          <div className="flex items-center"><CostIcon /><span>{recipeDetail.estimatedCost}</span></div>
      </div>
      
      <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
        <div>
          <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-lg text-gray-300">Ingredients</h4>
              <div className="flex items-center space-x-2 no-print">
                  <label htmlFor={`servings-${title}`} className="text-sm flex items-center"><ServingsIcon />Servings:</label>
                  <input 
                    id={`servings-${title}`}
                    type="number"
                    min="1"
                    max="20"
                    value={servings}
                    onChange={(e) => setServings(Math.max(1, parseInt(e.target.value, 10)))}
                    className="w-16 bg-gray-700 text-white rounded px-2 py-1"
                  />
              </div>
          </div>
          <ul className="space-y-1 text-gray-400">
            {scaledIngredients.map((item, index) => {
              const originalIngredient = recipeDetail.ingredients[index];
              const inList = isIngredientInList(originalIngredient);
              return (
                <li key={index} className="flex items-center justify-between group">
                  <span>{item}</span>
                   <button 
                    onClick={() => onToggleShoppingListItem(originalIngredient, recipeName)}
                    className={`
                      p-1 rounded-full transition-all duration-200 
                      ${inList 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-700 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-green-600 hover:text-white'
                      }`}
                    title={inList ? 'Remove from shopping list' : 'Add to shopping list'}
                  >
                    {inList ? <MinusIcon /> : <PlusIcon />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-2 text-gray-300">Process</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-400">
            {recipeDetail.process.map((step, index) => <li key={index}>{step}</li>)}
          </ol>
        </div>
         <div>
          <h4 className="font-semibold text-lg mb-2 text-gray-300">Nutrition</h4>
          <p className="text-gray-400">{recipeDetail.nutrition}</p>
        </div>
      </div>
  
      <div className="mt-4 pt-4 border-t border-gray-700 no-print">
         <button
            onClick={onStartCooking}
            className="w-full py-2 px-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            Start Cooking
          </button>
      </div>
    </div>
  );
};
