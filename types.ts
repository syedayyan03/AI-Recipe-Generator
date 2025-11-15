export interface Comment {
  text: string;
  date: string;
}

export interface RecipeDetail {
  ingredients: string[];
  process: string[];
  nutrition: string;
  minTime: string;
  estimatedCost: string;
  ratings: number[]; // Array of ratings from 1-5
  comments: Comment[];
}

export interface Recipe {
  dishName: string;
  beginner: RecipeDetail;
  professional: RecipeDetail;
}

export interface ShoppingListItem {
  id: string;
  ingredient: string;
  recipeName: string;
  isChecked: boolean;
}
