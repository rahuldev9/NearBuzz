import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner";
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
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      await signIn(email, password);
      router.replace("/(root)/(tabs)");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to login.";
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

        <Text className="ml-4 text-2xl font-bold text-slate-900">Login</Text>
      </View>

      {/* Body */}
      <View className="flex-1 px-6 justify-center">
        <Text className="text-4xl font-bold text-slate-900">
          Welcome Back 👋
        </Text>

        <Text className="text-slate-500 text-base mt-2 mb-10">
          Sign in to continue to your account.
        </Text>

        {/* {localError && (
          <View className="bg-red-100 border border-red-300 rounded-xl p-4 mb-5">
            <Text className="text-red-700 font-medium">{localError}</Text>
          </View>
        )} */}

        {/* Email */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
          className="bg-white h-14 rounded-xl px-4 border border-slate-200 mb-4"
        />

        {/* Password */}
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={handlePasswordChange}
          editable={!isLoading}
          className="bg-white h-14 rounded-xl px-4 border border-slate-200 mb-3"
        />

        {/* Forgot Password */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgot-password")}
          disabled={isLoading}
          className="self-end mb-8"
        >
          <Text className="text-blue-600 font-medium">Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          className={`h-14 rounded-xl items-center justify-center bg-blue-800 py-4 active:bg-blue-900 ${
            isLoading ? "bg-blue-800" : "bg-blue-900"
          }`}
        >
          <Text className="text-white text-lg font-bold">
            {isLoading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        {/* Register */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-slate-600">Don't have an account?</Text>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/register")}
            disabled={isLoading}
          >
            <Text className="text-blue-600 font-bold ml-1">Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
