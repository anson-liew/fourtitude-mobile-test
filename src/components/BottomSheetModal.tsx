import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  closeThreshold?: number;
  backdropOpacity?: number;
};

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function BottomSheetModal({
  visible,
  title,
  onClose,
  children,
  closeThreshold = 120,
  backdropOpacity = 0.45,
}: Props) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const currentDragY = useRef(0);

  const openSheet = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      currentDragY.current = 0;
    });
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      currentDragY.current = 0;
      onClose();
    });
  };

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      translateY.setValue(SCREEN_HEIGHT);
      openSheet();
    }
  }, [visible]);

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dy, dx } = gestureState;
        return Math.abs(dy) > 4 && Math.abs(dy) > Math.abs(dx) && dy > 0;
      },

      onPanResponderGrant: () => {
        translateY.stopAnimation((value) => {
          currentDragY.current = value;
        });
      },

      onPanResponderMove: (_, gestureState) => {
        const dy = Math.max(0, gestureState.dy);

        translateY.setValue(dy);

        const progress = Math.min(1, dy / 260);
        fadeAnim.setValue(1 - progress * 0.35);
      },

      onPanResponderRelease: (_, gestureState) => {
        const dy = Math.max(0, gestureState.dy);
        const vy = gestureState.vy;

        const shouldClose = dy > closeThreshold || vy > 1.2;

        if (shouldClose) {
          closeSheet();
        } else {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 120,
              useNativeDriver: true,
            }),
            Animated.spring(translateY, {
              toValue: 0,
              damping: 18,
              stiffness: 160,
              useNativeDriver: true,
            }),
          ]).start(() => {
            currentDragY.current = 0;
          });
        }
      },
    });
  }, [closeThreshold]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, backdropOpacity],
            }),
          },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
      </Animated.View>

      <View style={styles.bottomArea} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View {...panResponder.panHandlers} style={styles.dragArea}>
            <View style={styles.handle} />
          </View>

          {!!title && <Text style={styles.title}>{title}</Text>}

          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  bottomArea: {
    flex: 1,
    justifyContent: "flex-end",
  },

  sheet: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 18,
    paddingTop: 10,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  dragArea: {
    paddingTop: 6,
    paddingBottom: 10,
    alignItems: "center",
  },

  handle: {
    width: 52,
    height: 5,
    borderRadius: 99,
    backgroundColor: "#ddd",
  },

  title: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111",
    marginBottom: 12,
  },
});
