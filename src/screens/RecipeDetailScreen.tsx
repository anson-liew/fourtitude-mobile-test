import { useMemo, useState } from "react";
import {
  Image,
  InteractionManager,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { RootStackParamList } from "../navigation/RootNavigator";
import recipeTypesData from "../assets/data/recipetypes.json";
import { RecipeType } from "../types/recipe";
import { useRecipes } from "../store/useRecipes";
import { recipeImages, RecipeImageKey } from "../assets/recipeImages";
import ActionModal from "../components/ActionModal";
import BottomSheetModal from "../components/BottomSheetModal";
import { useLoading } from "../store/useLoading";
import { useToast } from "../store/useToast";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Props = NativeStackScreenProps<RootStackParamList, "RecipeDetail">;

export default function RecipeDetailScreen({ route, navigation }: Props) {
  const { recipeId } = route.params;

  const loading = useLoading();
  const toast = useToast();

  const { getRecipeById, updateRecipe, deleteRecipe } = useRecipes();

  const recipeTypes = recipeTypesData as RecipeType[];

  const typeLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    recipeTypes.forEach((t) => (map[t.key] = t.label));
    return map;
  }, [recipeTypes]);

  const recipe = getRecipeById(recipeId);
  const isNotFound = !recipe;

  const safeRecipe = recipe ?? {
    id: "missing",
    title: "",
    typeKey: recipeTypes?.[0]?.key ?? "",
    imageKey: undefined as RecipeImageKey | undefined,
    imageUri: undefined as string | undefined,
    ingredients: [""],
    steps: [""],
    createdAt: "",
    updatedAt: "",
  };

  const [editMode, setEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);

  const [validationModal, setValidationModal] = useState<{
    title?: string;
    message: string;
  } | null>(null);

  const showValidation = (message: string, title = "Validation") => {
    setValidationModal({ title, message });
  };

  const [title, setTitle] = useState(safeRecipe.title);
  const [typeKey, setTypeKey] = useState(safeRecipe.typeKey);
  const [imageUri, setImageUri] = useState<string | undefined>(
    safeRecipe.imageUri,
  );

  const [ingredients, setIngredients] = useState<string[]>(
    safeRecipe.ingredients.length ? safeRecipe.ingredients : [""],
  );

  const [steps, setSteps] = useState<string[]>(
    safeRecipe.steps.length ? safeRecipe.steps : [""],
  );

  const imageSource = useMemo(() => {
    if (imageUri) return { uri: imageUri };
    if (safeRecipe.imageKey) return recipeImages[safeRecipe.imageKey];
    return null;
  }, [imageUri, safeRecipe.imageKey]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showValidation(
        "Please allow access to your photo library.",
        "Permission required",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (result.canceled) return;
    setImageUri(result.assets[0].uri);
  };

  const updateIngredient = (index: number, value: string) => {
    setIngredients((prev) => prev.map((x, i) => (i === index ? value : x)));
  };
  const addIngredientRow = () => setIngredients((prev) => [...prev, ""]);
  const removeIngredientRow = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, value: string) => {
    setSteps((prev) => prev.map((x, i) => (i === index ? value : x)));
  };
  const addStepRow = () => setSteps((prev) => [...prev, ""]);
  const removeStepRow = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const onCancelEdit = () => {
    if (!recipe) {
      setEditMode(false);
      return;
    }

    setTitle(recipe.title);
    setTypeKey(recipe.typeKey);
    setImageUri(recipe.imageUri);

    setIngredients(recipe.ingredients.length ? recipe.ingredients : [""]);
    setSteps(recipe.steps.length ? recipe.steps : [""]);

    setEditMode(false);
  };

  const onSave = async () => {
    if (!recipe) return;

    const cleanTitle = title.trim();
    const cleanIngredients = ingredients.map((x) => x.trim()).filter(Boolean);
    const cleanSteps = steps.map((x) => x.trim()).filter(Boolean);

    if (!cleanTitle) {
      showValidation("Title cannot be empty.");
      return;
    }

    if (!typeKey) {
      showValidation("Please select a recipe type.");
      return;
    }

    if (cleanIngredients.length === 0) {
      showValidation("Please add at least 1 ingredient.");
      return;
    }

    if (cleanSteps.length === 0) {
      showValidation("Please add at least 1 step.");
      return;
    }

    try {
      loading.show();

      await updateRecipe(recipe.id, {
        title: cleanTitle,
        typeKey,
        imageUri,
        ingredients: cleanIngredients,
        steps: cleanSteps,
      });

      await sleep(900);

      setEditMode(false);
      toast.success("Recipe updated successfully!");
    } catch (err) {
      console.log(err);
      toast.error("Failed to update recipe.");
    } finally {
      loading.hide();
    }
  };

  const confirmDelete = () => {
    if (!recipe) return;

    setShowDeleteModal(false);

    InteractionManager.runAfterInteractions(async () => {
      try {
        loading.show();

        await sleep(50);
        await deleteRecipe(recipeId);
        await sleep(900);

        navigation.goBack();

        setTimeout(() => {
          toast.success("Recipe deleted successfully!");
        }, 150);
      } catch (err) {
        console.log(err);
        toast.error("Failed to delete recipe.");
      } finally {
        loading.hide();
      }
    });
  };

  if (isNotFound && !loading.visible) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundTitle}>Recipe not found</Text>
        <Text style={styles.notFoundDesc}>
          This recipe may have been deleted.
        </Text>

        <Pressable
          style={styles.primaryBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.primaryBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={60}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topCard}>
          {imageSource ? (
            <Image source={imageSource} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>No Image</Text>
            </View>
          )}

          {editMode && (
            <Pressable style={styles.imageBtn} onPress={pickImage}>
              <Text style={styles.imageBtnText}>
                {imageUri ? "Change Image" : "Pick Image"}
              </Text>
            </Pressable>
          )}

          <Text style={styles.label}>Title</Text>
          {editMode ? (
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />
          ) : (
            <Text style={styles.readText}>{recipe?.title}</Text>
          )}

          <Text style={styles.label}>Recipe Type</Text>
          {editMode ? (
            <>
              <Pressable
                style={styles.selectBox}
                onPress={() => setShowTypeModal(true)}
              >
                <Text style={styles.selectText}>
                  {typeLabelMap[typeKey] ?? "Select type"}
                </Text>
                <Text style={styles.selectArrow}>▼</Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.readText}>
              {typeLabelMap[recipe?.typeKey ?? ""] ?? recipe?.typeKey}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ingredients</Text>

            {editMode && (
              <Pressable style={styles.smallBtn} onPress={addIngredientRow}>
                <Text style={styles.smallBtnText}>+ Add</Text>
              </Pressable>
            )}
          </View>

          {ingredients.map((ing, idx) => (
            <View key={`ing-${idx}`} style={styles.row}>
              {editMode ? (
                <TextInput
                  value={ing}
                  onChangeText={(v) => updateIngredient(idx, v)}
                  placeholder={`Ingredient ${idx + 1}`}
                  style={[styles.input, styles.rowInput]}
                />
              ) : (
                <Text style={styles.bulletText}>• {ing}</Text>
              )}

              {editMode && ingredients.length > 1 && (
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => removeIngredientRow(idx)}
                >
                  <Text style={styles.deleteBtnText}>✕</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Steps</Text>

            {editMode && (
              <Pressable style={styles.smallBtn} onPress={addStepRow}>
                <Text style={styles.smallBtnText}>+ Add</Text>
              </Pressable>
            )}
          </View>

          {steps.map((step, idx) => (
            <View key={`step-${idx}`} style={styles.row}>
              {editMode ? (
                <TextInput
                  value={step}
                  onChangeText={(v) => updateStep(idx, v)}
                  placeholder={`Step ${idx + 1}`}
                  style={[styles.input, styles.rowInput]}
                  multiline
                />
              ) : (
                <Text style={styles.stepText}>
                  {idx + 1}. {step}
                </Text>
              )}

              {editMode && steps.length > 1 && (
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => removeStepRow(idx)}
                >
                  <Text style={styles.deleteBtnText}>✕</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          {!editMode ? (
            <>
              <Pressable
                style={styles.primaryBtn}
                onPress={() => setEditMode(true)}
              >
                <Text style={styles.primaryBtnText}>Edit</Text>
              </Pressable>

              <Pressable
                style={styles.dangerBtn}
                onPress={() => setShowDeleteModal(true)}
              >
                <Text style={styles.dangerBtnText}>Delete</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable style={styles.primaryBtn} onPress={onSave}>
                <Text style={styles.primaryBtnText}>Save</Text>
              </Pressable>

              <Pressable style={styles.secondaryBtn} onPress={onCancelEdit}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </Pressable>
            </>
          )}
        </View>

        <View style={{ height: 24 }} />
      </KeyboardAwareScrollView>

      {/* ✅ Recipe Type Bottom Sheet */}
      <BottomSheetModal
        visible={showTypeModal}
        title="Select Recipe Type"
        onClose={() => setShowTypeModal(false)}
      >
        {recipeTypes.map((t) => {
          const active = t.key === typeKey;

          return (
            <Pressable
              key={t.id}
              style={[styles.typeItem, active && styles.typeItemActive]}
              onPress={() => {
                setTypeKey(t.key);
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

      {/* ✅ Delete confirmation modal */}
      <ActionModal
        visible={showDeleteModal}
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe?"
        leftText="Cancel"
        rightText="Delete"
        rightVariant="danger"
        onLeftPress={() => setShowDeleteModal(false)}
        onRightPress={confirmDelete}
      />

      {/* ✅ Validation modal */}
      <ActionModal
        visible={!!validationModal}
        title={validationModal?.title ?? "Validation"}
        message={validationModal?.message ?? ""}
        leftText="OK"
        onLeftPress={() => setValidationModal(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  content: { padding: 16, paddingBottom: 40 },

  topCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 12,
  },

  image: { width: "100%", height: 220, borderRadius: 14, marginBottom: 12 },
  imagePlaceholder: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: { color: "#666" },

  imageBtn: {
    backgroundColor: "#111",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  imageBtnText: { color: "#fff", fontWeight: "800" },

  label: { fontSize: 13, fontWeight: "800", marginBottom: 8, color: "#333" },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },

  readText: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
    color: "#111",
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
    marginBottom: 14,
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

  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: "900" },

  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#111",
  },
  smallBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  row: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  rowInput: { flex: 1 },

  bulletText: { fontSize: 14, color: "#111", marginBottom: 6 },
  stepText: { fontSize: 14, color: "#111", marginBottom: 8, flex: 1 },

  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ffeded",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  deleteBtnText: { color: "#c00", fontWeight: "900" },

  actions: { gap: 10, marginTop: 8 },

  primaryBtn: {
    backgroundColor: "#0b5cff",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 15 },

  secondaryBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#111", fontWeight: "900", fontSize: 15 },

  dangerBtn: {
    backgroundColor: "#ffeded",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  dangerBtnText: { color: "#c00", fontWeight: "900", fontSize: 15 },

  center: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  notFoundTitle: { fontSize: 18, fontWeight: "900" },
  notFoundDesc: { fontSize: 13, color: "#666", textAlign: "center" },

  // bottom sheet list styles
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
