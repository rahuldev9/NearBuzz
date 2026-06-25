import { Slot } from "expo-router";
import { Toaster } from "sonner";
import { AuthProvider } from "../context/AuthContext";
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <Slot />
    </AuthProvider>
  );
}
