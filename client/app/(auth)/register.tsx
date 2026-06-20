import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
      return;
    }

    if (!USERNAME_PATTERN.test(name)) {
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
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 justify-center px-6 m-2">
      <Text className="text-4xl font-bold">Create Account</Text>

      {localError && (
        <View className="bg-red-100 border-l-4 border-red-600 p-4 mb-6 rounded mt-8">
          <Text className="text-red-700 font-semibold text-sm">
            {localError}
          </Text>
        </View>
      )}

      <TextInput
        placeholder="Username"
        value={name}
        onChangeText={handleNameChange}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
        className="bg-white h-14 rounded-2xl px-4 mt-8 mb-4"
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={handleEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
        className="bg-white h-14 rounded-2xl px-4 mb-4"
      />

      <TouchableOpacity
        onPress={handleRegister}
        disabled={isLoading}
        className={`h-14 rounded-2xl items-center justify-center ${
          isLoading ? "bg-blue-400" : "bg-blue-600"
        }`}
      >
        <Text className="text-white font-semibold text-lg">
          {isLoading ? "Sending OTP..." : "Register"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-5"
        onPress={() => router.back()}
        disabled={isLoading}
      >
        <Text className="text-center text-blue-600">
          Already have an account?
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
