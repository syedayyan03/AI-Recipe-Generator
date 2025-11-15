import React from 'react';

type Page = 'home' | 'favorites' | 'shopping-list';

// --- ICONS ---
const ChefHatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.68 7.32a3.98 3.98 0 0 0-3.6-2.32H8a4 4 0 0 0-3.68 2.32L3 11.41V18a2 2 0 0 0 2 2h5v-2H5v-1.59l1.32-3.96a2 2 0 0 1 1.84-1.45h7.68a2 2 0 0 1 1.84 1.45L19 16.41V18h-5v2h5a2 2 0 0 0 2-2v-6.59l-1.32-4.09zM12 2a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4z"/>
  </svg>
);

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const ShoppingCartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    </svg>
);


interface HeaderProps {
    onNavigate: (page: Page) => void;
    shoppingListCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, shoppingListCount }) => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button onClick={() => onNavigate('home')} className="flex items-center space-x-3 group" aria-label="Go to homepage">
            <ChefHatIcon />
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 group-hover:opacity-80 transition-opacity">
              Culinary Vision
            </h1>
          </button>
          
          <div className="flex items-center space-x-2">
            <button
                onClick={() => onNavigate('shopping-list')}
                className="relative flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="View shopping list"
            >
                <ShoppingCartIcon />
                <span>Shopping List</span>
                {shoppingListCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-orange-600 rounded-full">
                        {shoppingListCount}
                    </span>
                )}
            </button>
            <button
                onClick={() => onNavigate('favorites')}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="View favorite recipes"
            >
                <StarIcon />
                <span>Favorites</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
