import React, { useState, useCallback } from 'react';
import { Recipe, ShoppingListItem } from './types';
import { generateRecipeFromImage, generateRecipeFromText } from './services/geminiService';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { RecipeDisplay } from './components/RecipeDisplay';
import { FavoritesList } from './components/FavoritesList';
import { Loader } from './components/Loader';
import { ShoppingListPage } from './components/ShoppingListPage';

type InputMode = 'upload' | 'text' | 'camera' | 'fridge';
type Page = 'home' | 'favorites' | 'shopping-list';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [textInput, setTextInput] = useState('');
  const [fridgeInput, setFridgeInput] = useState('');
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = (file: File | null) => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRecipe(null);
      setError(null);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleGenerateRecipe = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRecipe(null);

    try {
      let generatedRecipe: Recipe;
      
      if ((inputMode === 'upload' || inputMode === 'camera') && imageFile) {
        const base64Image = await fileToBase64(imageFile);
        generatedRecipe = await generateRecipeFromImage(base64Image, imageFile.type);
      } else if (inputMode === 'text' && textInput.trim()) {
        const prompt = `Identify the dish named "${textInput}". Provide two recipes for it: one simplified for a beginner cook and one for a professional chef. Include ingredients, a step-by-step process, nutritional information, minimum cooking time, and an estimated cost rating for both versions. Format the output according to the provided JSON schema.`;
        generatedRecipe = await generateRecipeFromText(prompt);
      } else if (inputMode === 'fridge' && fridgeInput.trim()) {
        const prompt = `Based on the following ingredients: ${fridgeInput}. First, suggest a suitable dish name. Then, provide two recipes for that dish: one simplified for a beginner cook and one for a professional chef. If some key ingredients are missing for a good recipe, list them as optional or suggest substitutes. Include a step-by-step process, nutritional information, minimum cooking time, and an estimated cost rating for both versions. Format the output according to the provided JSON schema.`;
        generatedRecipe = await generateRecipeFromText(prompt);
      } else {
        throw new Error("No valid input provided.");
      }
      
      setRecipe(generatedRecipe);
    } catch (e) {
      const err = e as Error;
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [inputMode, imageFile, textInput, fridgeInput]);

  const handleToggleFavorite = useCallback((recipeToToggle: Recipe) => {
    setFavorites(prevFavorites => {
      const isFavorite = prevFavorites.some(fav => fav.dishName === recipeToToggle.dishName);
      if (isFavorite) {
        return prevFavorites.filter(fav => fav.dishName !== recipeToToggle.dishName);
      } else {
        return [...prevFavorites, recipeToToggle];
      }
    });
  }, []);
  
  const handleSelectFavorite = useCallback((recipeToShow: Recipe) => {
    setRecipe(recipeToShow);
    setCurrentPage('home');
  }, []);


  const handleUpdateRecipe = (updatedRecipe: Recipe) => {
    setRecipe(updatedRecipe);
    // Also update it in favorites if it's there
    setFavorites(prev => prev.map(fav => 
        fav.dishName === updatedRecipe.dishName ? updatedRecipe : fav
    ));
  };
  
  const isRecipeFavorite = (recipeToCheck: Recipe | null): boolean => {
    if (!recipeToCheck) return false;
    return favorites.some(fav => fav.dishName === recipeToCheck.dishName);
  }

  // --- Shopping List Handlers ---
  const handleToggleShoppingListItem = (id: string) => {
    setShoppingList(prev => 
        prev.map(item => item.id === id ? { ...item, isChecked: !item.isChecked } : item)
    );
  };

  const handleAddOrRemoveShoppingListItem = (ingredient: string, recipeName: string) => {
      setShoppingList(prev => {
          const existingItem = prev.find(item => item.ingredient === ingredient && item.recipeName === recipeName);
          if (existingItem) {
              return prev.filter(item => item.id !== existingItem.id);
          } else {
              const newItem: ShoppingListItem = {
                  id: `${recipeName}-${ingredient}-${Date.now()}`,
                  ingredient,
                  recipeName,
                  isChecked: false,
              };
              return [...prev, newItem];
          }
      });
  };

  const handleClearShoppingList = () => {
    setShoppingList([]);
  };

  const isSubmittable = 
    ((inputMode === 'upload' || inputMode === 'camera') && !!imageFile) ||
    (inputMode === 'text' && textInput.trim().length > 2) ||
    (inputMode === 'fridge' && fridgeInput.trim().length > 5);

  const renderCurrentPage = () => {
    switch (currentPage) {
        case 'favorites':
            return <FavoritesList 
                        favorites={favorites} 
                        onRemoveFavorite={handleToggleFavorite} 
                        onImportFavorites={setFavorites} 
                        onSelectFavorite={handleSelectFavorite}
                    />;
        case 'shopping-list':
            return <ShoppingListPage list={shoppingList} onToggleItem={handleToggleShoppingListItem} onClearList={handleClearShoppingList} onRemoveItem={(id) => setShoppingList(prev => prev.filter(item => item.id !== id))} />;
        case 'home':
        default:
            return (
                <>
                <p className="text-center text-lg text-gray-400 mb-8">
                    Generate a recipe by uploading a photo, using your camera, describing a dish, or listing your ingredients!
                </p>
                <ImageUploader
                    isGenerating={isLoading}
                    onGenerate={handleGenerateRecipe}
                    imagePreview={imagePreview}
                    onImageChange={handleImageChange}
                    textValue={textInput}
                    onTextChange={setTextInput}
                    fridgeValue={fridgeInput}
                    onFridgeChange={setFridgeInput}
                    inputMode={inputMode}
                    setInputMode={setInputMode}
                    isSubmittable={isSubmittable}
                />

                {isLoading && <Loader />}
                
                {error && (
                    <div className="mt-8 text-center bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Oops! </strong>
                    <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {recipe && (
                    <RecipeDisplay 
                    recipe={recipe} 
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={isRecipeFavorite(recipe)}
                    onRecipeUpdate={handleUpdateRecipe}
                    shoppingList={shoppingList}
                    onToggleShoppingListItem={handleAddOrRemoveShoppingListItem}
                    />
                )}
                </>
            );
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header onNavigate={setCurrentPage} shoppingListCount={shoppingList.length} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
            {renderCurrentPage()}
        </div>
      </main>
    </div>
  );
};

export default App;