import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { RecipeProvider } from "./src/store/RecipeContext";
import { ToastProvider } from "./src/store/ToastContext";
import { LoadingProvider } from "./src/store/LoadingContext";
import ToastRoot from "./src/components/ToastRoot";
import LoadingRoot from "./src/components/LoadingRoot";

export default function App() {
  return (
    <RecipeProvider>
      <LoadingProvider>
        <ToastProvider>
          <NavigationContainer>
            <RootNavigator />

            <LoadingRoot />
            <ToastRoot />
          </NavigationContainer>
        </ToastProvider>
      </LoadingProvider>
    </RecipeProvider>
  );
}
