import { useContext } from "react";
import { RecipeContext } from "./RecipeContext";

export function useRecipes() {
  const ctx = useContext(RecipeContext);
  if (!ctx) {
    throw new Error("useRecipes must be used within RecipeProvider");
  }
  return ctx;
}
