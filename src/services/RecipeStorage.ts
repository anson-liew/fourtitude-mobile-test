import AsyncStorage from "@react-native-async-storage/async-storage";
import { Recipe } from "../types/recipe";

export class RecipeStorage {
  private static STORAGE_KEY = "RECIPES_V1";

  static async load(): Promise<Recipe[] | null> {
    try {
      const raw = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as Recipe[];
      return parsed;
    } catch (error) {
      console.error("RecipeStorage.load error:", error);
      return null;
    }
  }

  static async save(recipes: Recipe[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(recipes));
      return true;
    } catch (error) {
      console.error("RecipeStorage.save error:", error);
      return false;
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("RecipeStorage.clear error:", error);
    }
  }
}
