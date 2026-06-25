import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
const USERNAME_PATTERN = /^(?!.*\.\.)(?!\.)(?!.*\.$)[a-z0-9._]{3,30}$/;
const USERNAME_ERROR =
  "Username must be 3-30 characters and can only use lowercase letters, numbers, periods, and underscores.";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    requestSignUpOtp,
    isAuthenticated,
    isLoading,
    error: authError,
  } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(root)/(tabs)");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authError) {
      setLocalError(authError);
      toast.error(authError);
    }
  }, [authError]);

  const handleNameChange = (text: string) => {
    setName(text.trim().toLowerCase());
    if (localError) setLocalError(null);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (localError) setLocalError(null);
  };

  const handleRegister = async () => {
    if (!name || !email) {
      setLocalError("Please enter your username and email.");
      toast.error("Please enter your username and email.");
      return;
    }

    if (!USERNAME_PATTERN.test(name)) {
      toast.error(USERNAME_ERROR);
      setLocalError(USERNAME_ERROR);
      return;
    }

    try {
      await requestSignUpOtp(name, email);
      router.push(
        `/(auth)/otp-verification?mode=register&email=${encodeURIComponent(
          email,
        )}`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to register.";

      setLocalError(message);
      toast.error(message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-slate-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 rounded-full bg-slate-100 items-center justify-center"
        >
          <AntDesign name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>

        <Text className="ml-4 text-2xl font-bold text-slate-900">Register</Text>
      </View>

      {/* Body */}
      <View className="flex-1 px-6 justify-center">
        <Text className="text-4xl font-bold text-slate-900">
          Create Account 🚀
        </Text>

        <Text className="text-slate-500 text-base mt-2 mb-10">
          Join NearBuzz and start exploring nearby events.
        </Text>

        {/* {localError && (
          <View className="bg-red-100 border border-red-300 rounded-xl p-4 mb-5">
            <Text className="text-red-700 font-medium">{localError}</Text>
          </View>
        )} */}

        {/* Username */}
        <TextInput
          placeholder="Username"
          value={name}
          onChangeText={handleNameChange}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
          className="bg-white h-14 rounded-xl px-4 border border-slate-200 mb-4"
        />

        {/* Email */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
          className="bg-white h-14 rounded-xl px-4 border border-slate-200 mb-8"
        />

        {/* Register Button */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={isLoading}
          className={`h-14 rounded-xl items-center justify-center bg-blue-800 active:bg-blue-900 ${
            isLoading ? "bg-blue-800" : "bg-blue-900"
          }`}
        >
          <Text className="text-white text-lg font-bold">
            {isLoading ? "Sending OTP..." : "Continue"}
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-slate-600">Already have an account?</Text>

          <TouchableOpacity
            onPress={() => router.push("/login")}
            disabled={isLoading}
          >
            <Text className="text-blue-600 font-bold ml-1">Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
