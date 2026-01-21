import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
  visible: boolean;
  iconName?: string;
};

export default function LoadingOverlay({
  visible,
  iconName = "autorenew",
}: Props) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;

    if (visible) {
      rotateAnim.setValue(0);

      loop = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );

      loop.start();
    }

    return () => {
      if (loop) loop.stop();
    };
  }, [visible, rotateAnim]);

  if (!visible) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Icon name={iconName} size={30} color="#111" />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },

  box: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    minWidth: 70,
    minHeight: 70,
    alignItems: "center",
    justifyContent: "center",
  },
});
