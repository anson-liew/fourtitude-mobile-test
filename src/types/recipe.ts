import { RecipeImageKey } from "../assets/recipeImages";

export type RecipeType = {
  id: string;
  key: string;
  label: string;
};

export type Recipe = {
  id: string;
  title: string;
  typeKey: string;
  imageKey?: RecipeImageKey;
  imageUri?: string;
  ingredients: string[];
  steps: string[];
  createdAt: string;
  updatedAt: string;
};
