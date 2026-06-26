import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
interface AppHeaderProps {
  title: string;
  onBackPress?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, onBackPress }) => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View className="dark:bg-neutral-900 border-slate-200 px-5 py-4 flex-row items-center justify-between">
      <TouchableOpacity
        onPress={handleBack}
        className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-neutral-900 "
      >
        <AntDesign
          name="arrow-left"
          size={20}
          color={colorScheme === "dark" ? "#fff" : "#0F172A"}
        />
      </TouchableOpacity>

      <Text className="text-lg font-semibold dark:text-slate-200">{title}</Text>

      {/* Placeholder to keep title centered */}
      <View className="w-10" />
    </View>
  );
};

export default AppHeader;
