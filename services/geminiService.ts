import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const recipeDetailSchema = {
    type: Type.OBJECT,
    properties: {
      ingredients: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of ingredients."
      },
      process: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Step-by-step cooking process."
      },
      nutrition: {
        type: Type.STRING,
        description: "A summary of nutritional information."
      },
      minTime: {
        type: Type.STRING,
        description: "Minimum estimated cooking time."
      },
      estimatedCost: {
        type: Type.STRING,
        description: "An estimated cost rating for the ingredients, like '$ (Inexpensive)', '$$ (Moderate)', or '$$$ (Expensive)'."
      }
    },
    required: ["ingredients", "process", "nutrition", "minTime", "estimatedCost"]
};

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    dishName: {
      type: Type.STRING,
      description: "The name of the dish."
    },
    beginner: {
      ...recipeDetailSchema,
      description: "A simple recipe for a beginner cook."
    },
    professional: {
      ...recipeDetailSchema,
      description: "A more advanced recipe for a professional cook, with more complex techniques."
    },
  },
  required: ["dishName", "beginner", "professional"]
};


const initializeRecipe = (recipeData: any): Recipe => {
  recipeData.beginner.ratings = [];
  recipeData.beginner.comments = [];
  recipeData.professional.ratings = [];
  recipeData.professional.comments = [];
  return recipeData as Recipe;
}

export const generateRecipeFromImage = async (base64Image: string, mimeType: string): Promise<Recipe> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };

    const textPart = {
      text: "Identify the dish in this image. Provide two recipes for it: one simplified for a beginner cook and one for a professional chef. Include ingredients, a step-by-step process, nutritional information, minimum cooking time, and an estimated cost rating for both versions. Format the output according to the provided JSON schema.",
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      }
    });

    const jsonString = response.text.trim();
    const recipeData = JSON.parse(jsonString);
    
    return initializeRecipe(recipeData);

  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate recipe. The model may not have recognized the dish or there was an API error.");
  }
};

export const generateRecipeFromText = async (prompt: string): Promise<Recipe> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      }
    });

    const jsonString = response.text.trim();
    const recipeData = JSON.parse(jsonString);
    
    return initializeRecipe(recipeData);

  } catch (error) {
    console.error("Error generating recipe from text:", error);
    throw new Error("Failed to generate recipe. Please check your input or try a different one.");
  }
};