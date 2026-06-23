import React from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  title?: string;
  message: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
};

export default function ConfirmDialog({
  visible,
  title = "Confirm Action",
  message,
  loading = false,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-5">
        <View
          className="bg-white rounded-3xl p-6 w-full"
          style={{
            maxWidth: 420,
            elevation: 8, // Android
            shadowColor: "#000", // iOS/Web
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
          }}
        >
          <Text className="text-2xl font-bold text-slate-900">{title}</Text>

          <Text className="text-slate-600 mt-3 leading-6">{message}</Text>

          {loading && (
            <View className="items-center mt-6">
              <ActivityIndicator size="large" />
              <Text className="mt-3 text-slate-500">Processing...</Text>
            </View>
          )}

          <View className="flex-row justify-end mt-8 gap-3">
            <Pressable
              disabled={loading}
              onPress={onCancel}
              className="px-5 py-3 rounded-xl"
              style={({ hovered, pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: hovered ? "#f8fafc" : "transparent",
                },
              ]}
            >
              <Text className="font-medium text-slate-700">{cancelText}</Text>
            </Pressable>

            <Pressable
              disabled={loading}
              onPress={onConfirm}
              className="px-5 py-3 rounded-xl bg-red-500"
              style={({ hovered, pressed }) => [
                {
                  opacity: loading ? 0.6 : pressed ? 0.8 : 1,
                  ...(Platform.OS === "web" &&
                    hovered && {
                      transform: [{ scale: 1.02 }],
                    }),
                },
              ]}
            >
              <Text className="text-white font-semibold">{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
