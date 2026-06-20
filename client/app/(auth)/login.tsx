import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const { signIn, isAuthenticated, isLoading, error: authError } = useAuth();

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

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (localError) setLocalError(null);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (localError) setLocalError(null);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }

    try {
      await signIn(email, password);
      router.replace("/(root)/(tabs)");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to login.";
      setLocalError(message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 justify-center px-6">
      <Text className="text-4xl font-bold text-slate-900">Welcome Back 👋</Text>

      <Text className="text-slate-500 mt-2 mb-8">Sign in to continue</Text>

      {localError && (
        <View className="bg-red-100 border-l-4 border-red-600 p-4 mb-6 rounded">
          <Text className="text-red-700 font-semibold text-sm">
            {localError}
          </Text>
        </View>
      )}

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
        onPress={handleLogin}
        disabled={isLoading}
        className={`h-14 rounded-2xl items-center justify-center ${
          isLoading ? "bg-blue-400" : "bg-blue-600"
        }`}
      >
        <Text className="text-white font-semibold text-lg">
          {isLoading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4"
        onPress={() => router.push("/(auth)/forgot-password")}
        disabled={isLoading}
      >
        <Text className="text-center text-blue-600">Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-6"
        onPress={() => router.push("/(auth)/register")}
        disabled={isLoading}
      >
        <Text className="text-center">
          {"Don't have an account? "}
          <Text className="font-bold text-blue-600">Register</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
