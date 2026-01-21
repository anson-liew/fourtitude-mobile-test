import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  leftText?: string;
  rightText?: string;
  rightVariant?: "primary" | "danger";
  onLeftPress: () => void;
  onRightPress: () => void;
};

export default function ActionModal({
  visible,
  title = "Title",
  message = "",
  leftText = "Cancel",
  rightText = "Confirm",
  rightVariant = "primary",
  onLeftPress,
  onRightPress,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>

          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.actions}>
            <Pressable style={styles.leftBtn} onPress={onLeftPress}>
              <Text style={styles.leftText}>{leftText}</Text>
            </Pressable>

            <Pressable
              style={[
                styles.rightBtn,
                rightVariant === "danger" && styles.rightBtnDanger,
              ]}
              onPress={onRightPress}
            >
              <Text
                style={[
                  styles.rightText,
                  rightVariant === "danger" && styles.rightTextDanger,
                ]}
              >
                {rightText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 6,
      },
    }),
  },

  title: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111",
    marginBottom: 6,
  },

  message: {
    fontSize: 13,
    color: "#666",
    marginBottom: 14,
    lineHeight: 18,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },

  leftBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
  },
  leftText: {
    fontWeight: "800",
    color: "#111",
  },

  rightBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#111",
  },
  rightText: {
    fontWeight: "900",
    color: "#fff",
  },

  rightBtnDanger: {
    backgroundColor: "#ffeded",
  },
  rightTextDanger: {
    color: "#c00",
  },
});
