import { MaterialIcons } from "@expo/vector-icons";
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
import AppHeader from "../Components/AppHeader";

export default function EditProfileScreen() {
  const router = useRouter();

  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [image, setImage] = useState(user?.profileImage ?? "");
  const [Phone, setPhone] = useState(user?.phone ?? "");
  const [phoneError, setPhoneError] = useState("");
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [loading, setLoading] = useState(false);

  const validatePhone = (phone: string) => {
    if (!phone) {
      setPhoneError("");
      return;
    }

    const internationalRegex = /^\+\d{1,3}[6-9]\d{9}$/;
    const domesticRegex = /^[6-9]\d{9}$/;

    if (!internationalRegex.test(phone) && !domesticRegex.test(phone)) {
      setPhoneError("10 digits (6-9xxxxxxxxx) or +CC-10 digits");
    } else {
      setPhoneError("");
    }
  };

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
        phone: Phone,
      });

      setUser(res.user);

      Alert.alert("Success", "Profile updated successfully.");

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
    <SafeAreaView className="flex-1 dark:bg-neutral-900 dark:text-slate-200">
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

      <AppHeader title="Edit Profile" />
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
              <View className="w-32 h-32 rounded-full bg-blue-800 justify-center items-center">
                <Text className="text-5xl dark:text-slate-200 text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <View className="absolute bottom-1 right-1 bg-blue-800 active:bg-blue-900 p-2 rounded-full border-2 border-white">
              <MaterialIcons name="camera-alt" color="#fff" size={18} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={pickImage}>
            <Text className="text-blue-600 dark:text-slate-200 mt-3 font-semibold">
              Change Profile Photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View className="mx-5 mt-8  rounded-2xl p-5">
          <Text className="text-lg font-semibold dark:text-slate-200 mb-5">
            Personal Information
          </Text>

          <Text className="text-slate-500 dark:text-slate-200 mb-2">
            Username
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            className="border border-slate-200 dark:border-none rounded-xl px-4 py-4 text-base mb-5"
            placeholder="Username"
          />

          <Text className="text-slate-500 dark:text-slate-200 mb-2">
            Email Address
          </Text>

          <TextInput
            value={user?.email}
            editable={false}
            className="bg-slate-100 dark:bg-neutral-900 rounded-xl px-4 py-4 text-base text-slate-500 dark:text-slate-200"
          />
          <Text className="text-slate-500 mb-2">Phone</Text>

          <TextInput
            value={Phone}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9+]/g, "");
              // Only allow + at the start
              const formatted = cleaned.startsWith("++")
                ? "+" + cleaned.slice(2)
                : cleaned;
              setPhone(formatted);
              validatePhone(formatted);
            }}
            keyboardType="phone-pad"
            maxLength={15}
            className={`border rounded-xl dark:border-none px-4 py-4 text-base mb-2 ${
              phoneError ? "border-red-500" : "border-slate-200"
            }`}
            placeholder="+91-10 digits or 10-digit (6-9xxxxxxxxx)"
          />
          {phoneError ? (
            <Text className="text-red-500 text-sm mb-5">{phoneError}</Text>
          ) : Phone ? (
            <Text className="text-green-600 text-sm mb-5">
              ✓ Phone number valid
            </Text>
          ) : null}
        </View>

        {/* Security */}
        <View className="mx-5 mt-6  rounded-2xl p-5">
          <Text className="text-lg font-semibold  dark:text-slate-200 mb-4">
            Security
          </Text>

          <TouchableOpacity
            className="flex-row items-center py-4 border-b border-slate-100"
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            <MaterialIcons name="lock-outline" size={22} color="#2563eb" />

            <Text className="flex-1 ml-4 text-base dark:text-slate-200">
              Change Password
            </Text>

            <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center py-4"
            onPress={() =>
              Alert.alert("Coming Soon", "This feature will be available soon.")
            }
          >
            <MaterialIcons name="verified-user" size={22} color="#2563eb" />

            <Text className="flex-1 ml-4 text-base dark:text-slate-200">
              Two-Factor Authentication
            </Text>

            <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View className="mx-5 mt-6  rounded-2xl p-5">
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
            <Text className="dark:text-slate-200 text-white text-lg font-semibold">
              {loading ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
