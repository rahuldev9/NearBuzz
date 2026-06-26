import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";
import { updateProfile } from "../../../services/userService";

export default function ProfileScreen() {
  const { user, setUser, signOut, isLoading } = useAuth();

  const router = useRouter();

  const pickProfileImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow photo library access.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.5,
        base64: true,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      if (!asset.base64) {
        Alert.alert("Error", "Unable to read image.");
        return;
      }

      const image = `data:image/jpeg;base64,${asset.base64}`;

      const res = await updateProfile({
        profileImage: image,
      });

      setUser(res.user);

      Alert.alert("Success", "Profile updated.");

      toast.success("Profile updated.");
    } catch (err: any) {
      Alert.alert("Error", err.message);
      toast.error(err.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <View className="items-center pt-10">
        <TouchableOpacity onPress={pickProfileImage}>
          {user?.profileImage ? (
            <Image
              source={{ uri: user.profileImage }}
              className="w-28 h-28 rounded-full"
            />
          ) : (
            <View className="w-28 h-28 rounded-full bg-blue-500 items-center justify-center">
              <Text className="text-slate-200  dark:text-slate-200 text-4xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View className="absolute bottom-0 right-0 bg-blue-800 active:bg-blue-900 rounded-full p-2">
            <MaterialIcons name="camera-alt" size={18} color="white" />
          </View>
        </TouchableOpacity>

        <Text className="text-2xl font-bold mt-4 dark:text-slate-200">
          {user?.name ?? "NearBuzz User"}
        </Text>

        <Text className=" dark:text-slate-200">{user?.email}</Text>
      </View>

      <View className="px-5 mt-10">
        <TouchableOpacity
          onPress={() => router.push("/edit-profile")}
          className="dark:bg-neutral-900 rounded-2xl p-4 flex-row items-center mb-3"
        >
          <MaterialIcons name="person" color="#2563eb" size={24} />
          <Text className="ml-3 dark:text-slate-200">Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/settings")}
          className="dark:bg-neutral-900 rounded-2xl p-4 flex-row items-center mb-3"
        >
          <MaterialIcons name="settings" color="#2563eb" size={24} />
          <Text className="ml-3 dark:text-slate-200">Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/my-bookings")}
          className="dark:bg-neutral-900 rounded-2xl p-4 flex-row items-center mb-3"
        >
          <MaterialIcons name="confirmation-number" color="#2563eb" size={24} />
          <Text className="ml-3 dark:text-slate-200">My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={signOut}
          disabled={isLoading}
          className="bg-red-500 rounded-2xl p-4 items-center mt-4"
        >
          <Text className="text-white font-semibold">
            {isLoading ? "Signing out..." : "Logout"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
