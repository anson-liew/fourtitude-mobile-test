import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Recipe } from "../types/recipe";
import { recipeImages } from "../assets/recipeImages";

type Props = {
  recipe: Recipe;
  typeLabel: string;
  onPress: () => void;
};

export default function RecipeCard({ recipe, typeLabel, onPress }: Props) {
  const imageSource = useMemo(() => {
    if (recipe.imageUri) return { uri: recipe.imageUri };
    if (recipe.imageKey) return recipeImages[recipe.imageKey];
    return null;
  }, [recipe.imageUri, recipe.imageKey]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <View style={styles.imageBox}>
          {imageSource ? (
            <Image source={imageSource} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>No Image</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {recipe.title}
          </Text>

          <Text style={styles.type} numberOfLines={1}>
            {typeLabel}
          </Text>

          <Text style={styles.meta} numberOfLines={1}>
            {recipe.ingredients.length} ingredients • {recipe.steps.length}{" "}
            steps
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  pressed: { opacity: 0.8 },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  imageBox: { width: 64, height: 64, borderRadius: 10, overflow: "hidden" },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: { fontSize: 12, color: "#666" },
  content: { flex: 1, gap: 4 },
  title: { fontSize: 16, fontWeight: "700" },
  type: { fontSize: 13, color: "#333" },
  meta: { fontSize: 12, color: "#777" },
});
