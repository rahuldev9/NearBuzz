import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ConfirmDialog from "@/Components/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import { deleteAccount, updateProfile } from "../../services/userService";

export default function EditProfileScreen() {
  const router = useRouter();

  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [image, setImage] = useState(user?.profileImage ?? "");
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission denied");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
      base64: true,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    if (!asset.base64) return;

    setImage(`data:image/jpeg;base64,${asset.base64}`);
  };

  const saveProfile = async () => {
    try {
      setLoading(true);

      const res = await updateProfile({
        name,
        profileImage: image,
      });

      setUser(res.user);

      Alert.alert("Success", "Profile updated.");

      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };
  const { signOut } = useAuth();

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);

      await deleteAccount();

      setDeleteDialogVisible(false);

      await signOut();

      router.replace("/(auth)/login");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be removed."
        loading={deleting}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => {
          if (!deleting) {
            setDeleteDialogVisible(false);
          }
        }}
        onConfirm={handleDeleteAccount}
      />
      <View className="bg-white border-b border-slate-200 px-5 py-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"
        >
          <AntDesign name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-slate-900">
          Edit Profile
        </Text>
        <View className="h-10 w-10" />
      </View>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile */}
        <View className="items-center mt-8">
          <TouchableOpacity activeOpacity={0.8} onPress={pickImage}>
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-32 h-32 rounded-full"
              />
            ) : (
              <View className="w-32 h-32 rounded-full bg-blue-600 justify-center items-center">
                <Text className="text-5xl text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <View className="absolute bottom-1 right-1 bg-blue-800 active:bg-blue-900 p-2 rounded-full border-2 border-white">
              <MaterialIcons name="camera-alt" color="white" size={18} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={pickImage}>
            <Text className="text-blue-600 mt-3 font-semibold">
              Change Profile Photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View className="mx-5 mt-8 bg-white rounded-2xl p-5">
          <Text className="text-lg font-semibold text-slate-900 mb-5">
            Personal Information
          </Text>

          <Text className="text-slate-500 mb-2">Username</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            className="border border-slate-200 rounded-xl px-4 py-4 text-base mb-5"
            placeholder="Username"
          />

          <Text className="text-slate-500 mb-2">Email Address</Text>

          <TextInput
            value={user?.email}
            editable={false}
            className="bg-slate-100 rounded-xl px-4 py-4 text-base text-slate-500"
          />
        </View>

        {/* Security */}
        <View className="mx-5 mt-6 bg-white rounded-2xl p-5">
          <Text className="text-lg font-semibold text-slate-900 mb-4">
            Security
          </Text>

          <TouchableOpacity
            className="flex-row items-center py-4 border-b border-slate-100"
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            <MaterialIcons name="lock-outline" size={22} color="#2563eb" />

            <Text className="flex-1 ml-4 text-base">Change Password</Text>

            <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-4"
            onPress={() =>
              Alert.alert("Coming Soon", "This feature will be available soon.")
            }
          >
            <MaterialIcons name="verified-user" size={22} color="#2563eb" />

            <Text className="flex-1 ml-4 text-base">
              Two-Factor Authentication
            </Text>

            <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View className="mx-5 mt-6 bg-white rounded-2xl p-5">
          <Text className="text-lg font-semibold text-red-500 mb-4">
            Danger Zone
          </Text>

          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setDeleteDialogVisible(true)}
          >
            <MaterialIcons name="delete-outline" size={22} color="#ef4444" />

            <Text className="flex-1 ml-4 text-red-500 text-base">
              Delete Account
            </Text>

            <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <View className="mx-5 mt-8">
          <TouchableOpacity
            disabled={loading}
            onPress={saveProfile}
            className="bg-blue-800 active:bg-blue-900 rounded-xl py-4 items-center"
          >
            <Text className="text-white text-lg font-semibold">
              {loading ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
