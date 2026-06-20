import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const { signUp, isAuthenticated, isLoading, error: authError } = useAuth();

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
    setName(text);
    if (localError) setLocalError(null);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (localError) setLocalError(null);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (localError) setLocalError(null);
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setLocalError("Please fill in all fields.");
      return;
    }

    try {
      await signUp(name, email, password);
      router.replace("/(root)/(tabs)");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to register.";
      setLocalError(message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 justify-center px-6">
      <Text className="text-4xl font-bold">Create Account</Text>

      {localError && (
        <View className="bg-red-100 border-l-4 border-red-600 p-4 mb-6 rounded mt-8">
          <Text className="text-red-700 font-semibold text-sm">
            {localError}
          </Text>
        </View>
      )}

      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={handleNameChange}
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

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={handlePasswordChange}
        editable={!isLoading}
        className="bg-white h-14 rounded-2xl px-4 mb-6"
      />

      <TouchableOpacity
        onPress={handleRegister}
        disabled={isLoading}
        className={`h-14 rounded-2xl items-center justify-center ${
          isLoading ? "bg-blue-400" : "bg-blue-600"
        }`}
      >
        <Text className="text-white font-semibold text-lg">
          {isLoading ? "Creating account..." : "Register"}
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
