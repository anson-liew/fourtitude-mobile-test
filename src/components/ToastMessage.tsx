import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
} from "react-native";

type ToastType = "success" | "error" | "info";

type Props = {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
};

export default function ToastMessage({
  visible,
  message,
  type = "success",
  duration = 2500,
  onHide,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }, duration);

    return () => clearTimeout(t);
  }, [visible, duration, onHide, opacity, translateY]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Pressable
        style={[
          styles.toast,
          type === "success" && styles.success,
          type === "error" && styles.error,
          type === "info" && styles.info,
        ]}
        onPress={onHide}
      >
        <View style={styles.dot} />
        <Text style={styles.text} numberOfLines={2}>
          {message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: Platform.OS === "ios" ? 58 : 18,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  success: { backgroundColor: "#E9FFF2" },
  error: { backgroundColor: "#FFECEC" },
  info: { backgroundColor: "#EEF5FF" },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: "#111",
  },
  text: {
    flex: 1,
    color: "#111",
    fontWeight: "800",
    fontSize: 14,
  },
});
