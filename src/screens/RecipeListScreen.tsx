import React, { useLayoutEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import { RootStackParamList } from "../navigation/RootNavigator";
import recipeTypesData from "../assets/data/recipetypes.json";
import RecipeCard from "../components/RecipeCard";
import { RecipeType } from "../types/recipe";
import { useRecipes } from "../store/useRecipes";
import ToastMessage from "../components/ToastMessage";

type Props = NativeStackScreenProps<RootStackParamList, "RecipeList">;

export default function RecipeListScreen({ navigation, route }: Props) {
  const { isLoading, filteredRecipes, selectedTypeKey, setSelectedTypeKey } =
    useRecipes();

  const recipeTypes = recipeTypesData as RecipeType[];

  const typeLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    recipeTypes.forEach((t) => {
      map[t.key] = t.label;
    });
    return map;
  }, [recipeTypes]);

  const [toast, setToast] = useState<{
    type?: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (!route.params?.toast) return;

      setToast(route.params.toast);

      navigation.setParams({ toast: undefined });
    }, [route.params?.toast, navigation]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          style={styles.headerBtn}
          onPress={() => navigation.navigate("AddRecipe")}
        >
          <Text style={styles.headerBtnText}>+ Add</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.filterBox}>
        <Text style={styles.filterLabel}>Recipe Type</Text>

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedTypeKey}
            onValueChange={(v) => setSelectedTypeKey(v)}
          >
            <Picker.Item label="All Types" value="" />
            {recipeTypes.map((t) => (
              <Picker.Item key={t.id} label={t.label} value={t.key} />
            ))}
          </Picker>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading recipes...</Text>
        </View>
      ) : filteredRecipes.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No recipes found</Text>
          <Text style={styles.emptyDesc}>
            Try changing the filter or add a new recipe.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              typeLabel={typeLabelMap[item.typeKey] ?? item.typeKey}
              onPress={() =>
                navigation.navigate("RecipeDetail", { recipeId: item.id })
              }
            />
          )}
        />
      )}

      <ToastMessage
        visible={!!toast}
        type={toast?.type}
        message={toast?.message ?? ""}
        onHide={() => setToast(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },

  filterBox: {
    padding: 16,
    paddingBottom: 8,
  },
  filterLabel: {
    fontSize: 13,
    color: "#444",
    marginBottom: 8,
    fontWeight: "600",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  center: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: "#555",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptyDesc: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },

  headerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#111",
  },
  headerBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
