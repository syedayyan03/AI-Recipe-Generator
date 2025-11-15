import React, { useMemo } from 'react';
import { Recipe } from '../types';
import { StarRating } from './StarRating';

const TimeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>);
const CostIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.162-.682zM11 12.849v-1.698c.22.071.412.164.567.267a2.5 2.5 0 001.162.682zM10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.5 4.5 0 00-1.879 3.407A1 1 0 009 9.5v1a1 1 0 001.879.497A4.5 4.5 0 0013 8.092V7a1 1 0 10-2 0z" /></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>);
const ViewIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.03 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>);

interface FavoriteRecipeCardProps {
  recipe: Recipe;
  onView: (recipe: Recipe) => void;
  onRemove: (recipe: Recipe) => void;
}

export const FavoriteRecipeCard: React.FC<FavoriteRecipeCardProps> = ({ recipe, onView, onRemove }) => {
  const averageRating = useMemo(() => {
    const ratings = recipe.beginner.ratings.length > 0 ? recipe.beginner.ratings : recipe.professional.ratings;
    if (ratings.length === 0) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
  }, [recipe]);

  const totalRatings = useMemo(() => {
    return (recipe.beginner.ratings?.length || 0) + (recipe.professional.ratings?.length || 0);
  }, [recipe]);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col justify-between transition-transform transform hover:scale-105 duration-300">
      <div className="p-5">
        <h3 className="text-xl font-bold text-orange-400 truncate mb-2" title={recipe.dishName}>{recipe.dishName}</h3>
        <div className="flex items-center mb-4">
          <StarRating rating={averageRating} size="sm" />
          <span className="text-xs text-gray-400 ml-2">({totalRatings} rating{totalRatings !== 1 ? 's' : ''})</span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-300">
          <span className="flex items-center"><TimeIcon /> {recipe.beginner.minTime}</span>
          <span className="flex items-center"><CostIcon /> {recipe.beginner.estimatedCost}</span>
        </div>
      </div>
      <div className="bg-gray-700/50 p-3 flex justify-end items-center space-x-2">
        <button onClick={() => onRemove(recipe)} className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors" title="Remove Favorite">
          <TrashIcon />
        </button>
        <button onClick={() => onView(recipe)} className="flex items-center px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors text-sm">
          <ViewIcon />
          <span className="ml-2">View</span>
        </button>
      </div>
    </div>
  );
};
