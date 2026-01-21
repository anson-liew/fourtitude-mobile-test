import React, { createContext, useEffect, useMemo, useState } from "react";
import { Recipe } from "../types/recipe";
import { RecipeStorage } from "../services/RecipeStorage";
import * as Crypto from "expo-crypto";
import { MOCK_DATA } from "../assets/data/recipeMock";

type AddRecipeInput = {
  title: string;
  typeKey: string;
  imageUri?: string;
  ingredients: string[];
  steps: string[];
};

type UpdateRecipeInput = {
  title?: string;
  typeKey?: string;
  imageUri?: string;
  ingredients?: string[];
  steps?: string[];
};

type RecipeContextValue = {
  recipes: Recipe[];
  isLoading: boolean;
  selectedTypeKey: string;
  setSelectedTypeKey: (key: string) => void;
  filteredRecipes: Recipe[];
  reload: () => Promise<void>;
  addRecipe: (input: AddRecipeInput) => Promise<Recipe>;
  updateRecipe: (recipeId: string, input: UpdateRecipeInput) => Promise<void>;
  deleteRecipe: (recipeId: string) => Promise<void>;
  getRecipeById: (recipeId: string) => Recipe | undefined;
};

export const RecipeContext = createContext<RecipeContextValue | null>(null);

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTypeKey, setSelectedTypeKey] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      await RecipeStorage.clear();
      await reload();
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reload = async () => {
    setIsLoading(true);

    const stored = await RecipeStorage.load();

    if (!stored || stored.length === 0) {
      setRecipes(MOCK_DATA);
      await RecipeStorage.save(MOCK_DATA);
      setIsLoading(false);
      return;
    }

    setRecipes(stored);
    setIsLoading(false);
  };

  const addRecipe = async (input: AddRecipeInput) => {
    const now = new Date().toISOString();

    const newRecipe: Recipe = {
      id: Crypto.randomUUID(),
      title: input.title.trim(),
      typeKey: input.typeKey,
      imageUri: input.imageUri,
      ingredients: input.ingredients,
      steps: input.steps,
      createdAt: now,
      updatedAt: now,
    };

    const next = [newRecipe, ...recipes];
    setRecipes(next);
    await RecipeStorage.save(next);

    return newRecipe;
  };

  const updateRecipe = async (recipeId: string, input: UpdateRecipeInput) => {
    const now = new Date().toISOString();

    const next = recipes.map((r) => {
      if (r.id !== recipeId) return r;

      return {
        ...r,
        ...input,
        updatedAt: now,
      };
    });

    setRecipes(next);
    await RecipeStorage.save(next);
  };

  const deleteRecipe = async (recipeId: string) => {
    const next = recipes.filter((r) => r.id !== recipeId);
    setRecipes(next);
    await RecipeStorage.save(next);
  };

  const getRecipeById = (recipeId: string) => {
    return recipes.find((r) => r.id === recipeId);
  };

  const filteredRecipes = useMemo(() => {
    if (!selectedTypeKey) return recipes;
    return recipes.filter((r) => r.typeKey === selectedTypeKey);
  }, [recipes, selectedTypeKey]);

  const value: RecipeContextValue = {
    recipes,
    isLoading,

    selectedTypeKey,
    setSelectedTypeKey,

    filteredRecipes,

    reload,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    getRecipeById,
  };

  return (
    <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
  );
}
