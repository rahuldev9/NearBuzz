import React from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
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
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50 px-5">
        <View className="bg-white rounded-3xl p-6 w-full max-w-md">
          <Text className="text-xl font-bold">{title}</Text>

          <Text className="text-slate-600 mt-3">{message}</Text>

          {loading && (
            <View className="items-center mt-5">
              <ActivityIndicator size="large" />
              <Text className="mt-2 text-slate-500">Deleting event...</Text>
            </View>
          )}

          <View className="flex-row justify-end mt-6">
            <TouchableOpacity
              disabled={loading}
              onPress={onCancel}
              className="px-4 py-2 mr-3"
            >
              <Text className="text-slate-600">{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={loading}
              onPress={onConfirm}
              className="bg-red-500 px-5 py-2 rounded-xl"
            >
              <Text className="text-white font-semibold">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
