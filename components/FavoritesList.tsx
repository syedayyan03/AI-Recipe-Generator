import React, { useRef, useState, useMemo } from 'react';
import { Recipe } from '../types';
import { FavoriteRecipeCard } from './FavoriteRecipeCard';

const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);

interface FavoritesListProps {
  favorites: Recipe[];
  onRemoveFavorite: (recipe: Recipe) => void;
  onImportFavorites: (recipes: Recipe[]) => void;
  onSelectFavorite: (recipe: Recipe) => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({ favorites, onRemoveFavorite, onImportFavorites, onSelectFavorite }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleExport = () => {
    if (favorites.length === 0) return;
    const dataStr = JSON.stringify(favorites, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'culinary-vision-favorites.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const importedRecipes = JSON.parse(text);
        if (Array.isArray(importedRecipes) && (importedRecipes.length === 0 || importedRecipes[0].dishName)) {
            onImportFavorites(importedRecipes);
        } else {
            alert('Invalid file format.');
        }
      } catch (error) {
        console.error("Failed to parse favorites file", error);
        alert('Could not read the favorites file. Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveWithConfirmation = (recipe: Recipe) => {
    if (window.confirm(`Are you sure you want to remove "${recipe.dishName}" from your favorites?`)) {
        onRemoveFavorite(recipe);
    }
  };

  const filteredAndSortedFavorites = useMemo(() => {
    return favorites
      .filter(recipe => recipe.dishName.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const nameA = a.dishName.toLowerCase();
        const nameB = b.dishName.toLowerCase();
        if (sortOrder === 'asc') {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
  }, [favorites, searchTerm, sortOrder]);

  return (
    <div className="animate-fade-in">
        <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-300 text-center sm:text-left mb-6">My Favorite Recipes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="relative md:col-span-1">
                    <input 
                        type="text"
                        placeholder="Search favorites..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                </div>
                <div className="relative md:col-span-1">
                    <select
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none"
                    >
                        <option value="asc">Sort by Name (A-Z)</option>
                        <option value="desc">Sort by Name (Z-A)</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-end md:col-span-1">
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
                    <button onClick={handleImportClick} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Import</button>
                    <button onClick={handleExport} disabled={favorites.length === 0} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">Export</button>
                </div>
            </div>
        </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12 px-6 bg-gray-800 rounded-lg">
            <p className="text-xl text-gray-400">Your favorites list is empty.</p>
            <p className="text-gray-500 mt-2">Add some recipes from the main page or import a favorites file.</p>
        </div>
      ) : filteredAndSortedFavorites.length === 0 ? (
        <div className="text-center py-12 px-6 bg-gray-800 rounded-lg">
            <p className="text-xl text-gray-400">No matching recipes found.</p>
            <p className="text-gray-500 mt-2">Try clearing your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedFavorites.map((recipe) => (
                <FavoriteRecipeCard
                    key={recipe.dishName}
                    recipe={recipe}
                    onView={onSelectFavorite}
                    onRemove={handleRemoveWithConfirmation}
                />
            ))}
        </div>
      )}
    </div>
  );
};