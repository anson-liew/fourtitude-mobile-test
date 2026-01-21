import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import recipeTypesData from "../assets/data/recipetypes.json";
import { RecipeType } from "../types/recipe";
import { useRecipes } from "../store/useRecipes";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useToast } from "../store/useToast";
import { useLoading } from "../store/useLoading";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Props = NativeStackScreenProps<RootStackParamList, "AddRecipe">;

export default function AddRecipeScreen({ navigation }: Props) {
  const { addRecipe, setSelectedTypeKey } = useRecipes();

  const toast = useToast();
  const loading = useLoading();

  const recipeTypes = recipeTypesData as RecipeType[];

  const defaultTypeKey = useMemo(() => {
    return recipeTypes?.[0]?.key ?? "";
  }, [recipeTypes]);

  const [title, setTitle] = useState("");
  const [typeKey, setTypeKey] = useState(defaultTypeKey);
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [steps, setSteps] = useState<string[]>([""]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library.",
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

  const addIngredientRow = () => {
    setIngredients((prev) => [...prev, ""]);
  };

  const removeIngredientRow = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, value: string) => {
    setSteps((prev) => prev.map((x, i) => (i === index ? value : x)));
  };

  const addStepRow = () => {
    setSteps((prev) => [...prev, ""]);
  };

  const removeStepRow = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const onSave = async () => {
    const cleanTitle = title.trim();
    const cleanIngredients = ingredients.map((x) => x.trim()).filter(Boolean);
    const cleanSteps = steps.map((x) => x.trim()).filter(Boolean);

    if (!cleanTitle) {
      Alert.alert("Validation", "Please enter a recipe title.");
      return;
    }

    if (!typeKey) {
      Alert.alert("Validation", "Please select a recipe type.");
      return;
    }

    if (cleanIngredients.length === 0) {
      Alert.alert("Validation", "Please add at least 1 ingredient.");
      return;
    }

    if (cleanSteps.length === 0) {
      Alert.alert("Validation", "Please add at least 1 step.");
      return;
    }

    try {
      loading.show();

      await addRecipe({
        title: cleanTitle,
        typeKey,
        imageUri,
        ingredients: cleanIngredients,
        steps: cleanSteps,
      });

      setSelectedTypeKey("");

      await sleep(1200);

      navigation.goBack();

      setTimeout(() => {
        toast.success("Recipe added successfully!");
      }, 150);
    } catch (err) {
      console.log(err);
      toast.error("Failed to add recipe. Please try again.");
    } finally {
      loading.hide();
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      enableOnAndroid
      enableAutomaticScroll
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <Text style={styles.label}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="E.g. Chicken Curry"
        style={styles.input}
        textAlignVertical="top"
      />

      {/* Type Picker */}
      <Text style={styles.label}>Recipe Type</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={typeKey} onValueChange={(v) => setTypeKey(v)}>
          {recipeTypes.map((t) => (
            <Picker.Item key={t.id} label={t.label} value={t.key} />
          ))}
        </Picker>
      </View>

      {/* Image */}
      <Text style={styles.label}>Picture</Text>
      <Pressable style={styles.imageBtn} onPress={pickImage}>
        <Text style={styles.imageBtnText}>
          {imageUri ? "Change Image" : "Pick Image"}
        </Text>
      </Pressable>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
      ) : (
        <Text style={styles.helperText}>No image selected (optional)</Text>
      )}

      {/* Ingredients */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        <Pressable style={styles.smallBtn} onPress={addIngredientRow}>
          <Text style={styles.smallBtnText}>+ Add</Text>
        </Pressable>
      </View>

      {ingredients.map((ing, idx) => (
        <View key={`ing-${idx}`} style={styles.row}>
          <TextInput
            value={ing}
            onChangeText={(v) => updateIngredient(idx, v)}
            placeholder={`Ingredient ${idx + 1}`}
            style={[styles.input, styles.rowInput]}
            textAlignVertical="top"
          />

          {ingredients.length > 1 && (
            <Pressable
              style={styles.deleteBtn}
              onPress={() => removeIngredientRow(idx)}
            >
              <Text style={styles.deleteBtnText}>✕</Text>
            </Pressable>
          )}
        </View>
      ))}

      {/* Steps */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Steps</Text>
        <Pressable style={styles.smallBtn} onPress={addStepRow}>
          <Text style={styles.smallBtnText}>+ Add</Text>
        </Pressable>
      </View>

      {steps.map((step, idx) => (
        <View key={`step-${idx}`} style={styles.row}>
          <TextInput
            value={step}
            onChangeText={(v) => updateStep(idx, v)}
            placeholder={`Step ${idx + 1}`}
            style={[styles.input, styles.rowInput]}
            multiline
            textAlignVertical="top"
          />

          {steps.length > 1 && (
            <Pressable
              style={styles.deleteBtn}
              onPress={() => removeStepRow(idx)}
            >
              <Text style={styles.deleteBtnText}>✕</Text>
            </Pressable>
          )}
        </View>
      ))}

      {/* Save */}
      <Pressable style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveBtnText}>Save Recipe</Text>
      </Pressable>

      <View style={{ height: 24 }} />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  content: { padding: 16, paddingBottom: 40 },

  label: { fontSize: 13, fontWeight: "700", marginBottom: 8, color: "#333" },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 14,
  },

  imageBtn: {
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  imageBtnText: { color: "#fff", fontWeight: "700" },

  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 14,
    marginTop: 12,
    marginBottom: 12,
  },

  helperText: {
    marginTop: 10,
    marginBottom: 14,
    fontSize: 12,
    color: "#666",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: "800" },

  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#111",
  },
  smallBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  row: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  rowInput: { flex: 1 },

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

  saveBtn: {
    marginTop: 20,
    backgroundColor: "#0b5cff",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
