import React, { createContext, useEffect, useMemo, useState } from "react";
import { Recipe } from "../types/recipe";
import { RecipeStorage } from "../services/RecipeStorage";
import * as Crypto from "expo-crypto";

const SAMPLE_RECIPES: Recipe[] = [
  {
    id: "1",
    title: "Bak Kut Teh",
    typeKey: "CHINESE",
    imageKey: "bkt",
    imageUri: undefined,
    ingredients: [
      "Pork ribs",
      "Garlic",
      "White pepper",
      "Soy sauce",
      "Chinese herbs (optional)",
    ],
    steps: [
      "Blanch pork ribs to remove impurities",
      "Add water, garlic, pepper and herbs into a pot",
      "Simmer for 45–60 minutes until tender",
      "Season with soy sauce and serve hot",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Nasi Lemak",
    typeKey: "MALAY",
    imageKey: "nasiLemak",
    imageUri: undefined,
    ingredients: [
      "Rice",
      "Coconut milk",
      "Pandan leaves",
      "Sambal",
      "Egg",
      "Anchovies",
    ],
    steps: [
      "Wash rice and cook with coconut milk and pandan leaves",
      "Prepare sambal (or use ready-made sambal)",
      "Serve rice with sambal, egg and anchovies",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Roti Canai",
    typeKey: "INDIAN",
    imageKey: "rotiCanoi",
    imageUri: undefined,
    ingredients: ["Flour", "Water", "Salt", "Oil / ghee", "Egg (optional)"],
    steps: [
      "Mix flour, water, salt and oil to form dough",
      "Rest the dough for at least 2 hours",
      "Stretch and fold dough into layers",
      "Pan-fry until golden and crispy",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Chicken Chop",
    typeKey: "WESTERN",
    imageKey: "chickenChop",
    imageUri: undefined,
    ingredients: [
      "Chicken thigh / breast",
      "Salt & pepper",
      "Flour",
      "Butter",
      "Black pepper sauce",
    ],
    steps: [
      "Season chicken with salt & pepper",
      "Coat chicken lightly with flour",
      "Pan-fry until cooked through and golden",
      "Serve with black pepper sauce",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Curry Rice",
    typeKey: "JAPANESE",
    imageKey: "curryRice",
    imageUri: undefined,
    ingredients: [
      "Japanese curry roux",
      "Onion",
      "Potato",
      "Carrot",
      "Chicken (optional)",
    ],
    steps: [
      "Saute onion until fragrant",
      "Add vegetables (and chicken if using) and cook",
      "Add water and simmer until soft",
      "Add curry roux and stir until thick, serve with rice",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
      setRecipes(SAMPLE_RECIPES);
      await RecipeStorage.save(SAMPLE_RECIPES);
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
