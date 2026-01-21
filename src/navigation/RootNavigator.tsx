import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RecipeListScreen from "../screens/RecipeListScreen";
import RecipeDetailScreen from "../screens/RecipeDetailScreen";
import AddRecipeScreen from "../screens/AddRecipeScreen";

export type ToastPayload = {
  type?: "success" | "error" | "info";
  message: string;
};

export type RootStackParamList = {
  RecipeList: { toast?: ToastPayload } | undefined;
  RecipeDetail: { recipeId: string };
  AddRecipe: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="RecipeList"
        component={RecipeListScreen}
        options={{ title: "Recipes" }}
      />

      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={{ title: "Recipe Detail" }}
      />

      <Stack.Screen
        name="AddRecipe"
        component={AddRecipeScreen}
        options={{ title: "Add Recipe" }}
      />
    </Stack.Navigator>
  );
}
