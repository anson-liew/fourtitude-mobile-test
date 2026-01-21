import React, { useLayoutEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import { RootStackParamList } from "../navigation/RootNavigator";
import recipeTypesData from "../assets/data/recipetypes.json";
import RecipeCard from "../components/RecipeCard";
import { RecipeType } from "../types/recipe";
import { useRecipes } from "../store/useRecipes";
import ToastMessage from "../components/ToastMessage";
import BottomSheetModal from "../components/BottomSheetModal";

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

  const selectedTypeLabel = useMemo(() => {
    if (!selectedTypeKey) return "All Types";
    return typeLabelMap[selectedTypeKey] ?? selectedTypeKey;
  }, [selectedTypeKey, typeLabelMap]);

  const [showTypeModal, setShowTypeModal] = useState(false);

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

        <Pressable
          style={styles.selectBox}
          onPress={() => setShowTypeModal(true)}
        >
          <Text style={styles.selectText}>{selectedTypeLabel}</Text>
          <Text style={styles.selectArrow}>▼</Text>
        </Pressable>
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
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomSheetModal
        visible={showTypeModal}
        title="Filter by Recipe Type"
        onClose={() => setShowTypeModal(false)}
      >
        <Pressable
          style={[styles.typeItem, !selectedTypeKey && styles.typeItemActive]}
          onPress={() => {
            setSelectedTypeKey("");
            setShowTypeModal(false);
          }}
        >
          <Text
            style={[styles.typeText, !selectedTypeKey && styles.typeTextActive]}
          >
            All Types
          </Text>
        </Pressable>

        {recipeTypes.map((t) => {
          const active = t.key === selectedTypeKey;

          return (
            <Pressable
              key={t.id}
              style={[styles.typeItem, active && styles.typeItemActive]}
              onPress={() => {
                setSelectedTypeKey(t.key);
                setShowTypeModal(false);
              }}
            >
              <Text style={[styles.typeText, active && styles.typeTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </BottomSheetModal>

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

  // ✅ bottom-sheet select trigger
  selectBox: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  selectArrow: {
    fontSize: 12,
    color: "#666",
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

  // ✅ BottomSheet items
  typeItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    marginBottom: 10,
  },
  typeItemActive: {
    backgroundColor: "#111",
  },
  typeText: {
    fontWeight: "800",
    color: "#111",
  },
  typeTextActive: {
    color: "#fff",
  },
});
