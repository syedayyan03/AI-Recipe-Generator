import React, { useState } from 'react';
import { Recipe, ShoppingListItem } from '../types';
import { RecipeCard } from './RecipeCard';
import { CookingMode } from './CookingMode';
import { CommunityFeedback } from './CommunityFeedback';

// --- ICONS ---
const HeartIcon: React.FC<{isFavorite: boolean}> = ({ isFavorite }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-all duration-300 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>);
const YoutubeIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.25,4,12,4,12,4S5.75,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.75,2,12,2,12s0,4.25,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.75,20,12,20,12,20s6.25,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.25,22,12,22,12S22,7.75,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" /></svg>);
const ShareIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>);
const PrintIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h1v-4a1 1 0 011-1h10a1 1 0 011 1v4h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>);

interface RecipeDisplayProps {
  recipe: Recipe;
  onToggleFavorite: (recipe: Recipe) => void;
  isFavorite: boolean;
  onRecipeUpdate: (recipe: Recipe) => void;
  shoppingList: ShoppingListItem[];
  onToggleShoppingListItem: (ingredient: string, recipeName: string) => void;
}

export const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, onToggleFavorite, isFavorite, onRecipeUpdate, shoppingList, onToggleShoppingListItem }) => {
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.dishName + ' recipe')}`;

  const [cookingMode, setCookingMode] = useState<{ active: boolean; steps: string[], dishName: string }>({ active: false, steps: [], dishName: '' });

  const handleStartCooking = (steps: string[], dishName: string) => {
    setCookingMode({ active: true, steps, dishName });
  };

  const handlePrint = () => {
    window.print();
  };
  
  const handleShare = async () => {
    const shareData = {
      title: `${recipe.dishName} Recipe`,
      text: `Check out this recipe for ${recipe.dishName} that I found on Culinary Vision!`,
      // url: window.location.href, // This can cause errors in sandboxed/iframe environments. Text/title sharing is more reliable.
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for desktop
        const recipeText = `
${recipe.dishName.toUpperCase()}\n
--- BEGINNER RECIPE ---\n
Ingredients:\n- ${recipe.beginner.ingredients.join('\n- ')}\n
Process:\n${recipe.beginner.process.map((s, i) => `${i+1}. ${s}`).join('\n')}\n
--- PROFESSIONAL RECIPE ---\n
Ingredients:\n- ${recipe.professional.ingredients.join('\n- ')}\n
Process:\n${recipe.professional.process.map((s, i) => `${i+1}. ${s}`).join('\n')}
        `;
        await navigator.clipboard.writeText(recipeText);
        alert('Recipe copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Don't show an alert if the user cancels the share dialog (DOMException: AbortError)
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      alert('Could not share the recipe.');
    }
  };

  const handleFeedbackSubmit = (level: 'beginner' | 'professional', feedback: { rating: number, comment: string }) => {
    const newRecipe = { ...recipe };
    const targetRecipe = newRecipe[level];
    
    if (feedback.rating) {
        targetRecipe.ratings.push(feedback.rating);
    }
    if (feedback.comment) {
        targetRecipe.comments.push({ text: feedback.comment, date: new Date().toISOString() });
    }
    
    onRecipeUpdate(newRecipe);
  }

  return (
    <>
      <div className="mt-8 p-6 bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-2xl animate-fade-in print-area">
        <div className="flex justify-between items-start mb-6">
          <div>
              <h2 className="text-4xl font-extrabold text-white">{recipe.dishName}</h2>
          </div>
          <div className="flex items-center space-x-2 no-print">
              <a 
                  href={youtubeSearchUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  title="Watch Tutorial"
              >
                  <YoutubeIcon />
              </a>
              <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Share Recipe"><ShareIcon /></button>
              <button onClick={handlePrint} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Print Recipe"><PrintIcon /></button>
              <button
                  onClick={() => onToggleFavorite(recipe)}
                  className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                  <HeartIcon isFavorite={isFavorite}/>
              </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <RecipeCard 
            title="Beginner's Recipe" 
            recipeName={recipe.dishName}
            recipeDetail={recipe.beginner} 
            onStartCooking={() => handleStartCooking(recipe.beginner.process, `${recipe.dishName} (Beginner)`)}
            shoppingList={shoppingList}
            onToggleShoppingListItem={onToggleShoppingListItem}
          />
          <RecipeCard 
            title="Professional's Recipe" 
            recipeName={recipe.dishName}
            recipeDetail={recipe.professional} 
            onStartCooking={() => handleStartCooking(recipe.professional.process, `${recipe.dishName} (Professional)`)}
            shoppingList={shoppingList}
            onToggleShoppingListItem={onToggleShoppingListItem}
          />
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700 grid md:grid-cols-2 gap-8 no-print">
            <CommunityFeedback 
                title="Beginner Recipe Feedback"
                recipeDetail={recipe.beginner} 
                onFeedbackSubmit={(feedback) => handleFeedbackSubmit('beginner', feedback)}
            />
             <CommunityFeedback 
                title="Professional Recipe Feedback"
                recipeDetail={recipe.professional} 
                onFeedbackSubmit={(feedback) => handleFeedbackSubmit('professional', feedback)}
            />
        </div>

      </div>
      {cookingMode.active && <CookingMode dishName={cookingMode.dishName} steps={cookingMode.steps} onClose={() => setCookingMode({ active: false, steps: [], dishName: '' })} />}
    </>
  );
};
