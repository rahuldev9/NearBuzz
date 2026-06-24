import { AntDesign } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { verifyBooking } from "@/services/eventService";

export default function ScanQRScreen() {
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [verifyResult, setVerifyResult] = useState<{
    success: boolean;
    message: string;
    eventId?: string;
  } | null>(null);

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    requestPermission();

    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <ActivityIndicator size="large" color="#2563EB" />

        <Text className="text-slate-700 mt-4 text-center">
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  const handleScan = async ({ data }: { data: string }) => {
    if (scanned || verifying) return;

    setScanned(true);
    setVerifying(true);

    try {
      const qrData = JSON.parse(data);

      const response = await verifyBooking(qrData.bookingId, qrData.eventCode);

      setVerifyResult({
        success: true,
        message: "User checked in successfully.",
        eventId: response.eventId,
      });
    } catch (error: any) {
      setVerifyResult({
        success: false,
        message: error?.message || "This QR code has already been used.",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Camera */}
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={handleScan}
      />

      {/* Header */}
      <View className="absolute top-14 left-5 right-5 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-11 w-11 rounded-full bg-black/40 items-center justify-center"
        >
          <AntDesign size={22} color="white" />
        </TouchableOpacity>

        <View className="flex-1 items-center mr-11">
          <Text className="text-white text-xl font-bold">Scan Event QR</Text>

          <Text className="text-slate-300 mt-1">Align QR inside the frame</Text>
        </View>
      </View>

      {/* Scanner Frame */}
      <View className="absolute inset-0 items-center justify-center">
        <View className="w-72 h-72 border-4 border-white rounded-3xl" />
      </View>

      {/* Bottom Instructions */}
      <View className="absolute bottom-20 left-8 right-8">
        <View className="bg-black/50 rounded-2xl p-4">
          <Text className="text-white text-center font-semibold">
            Point your camera at the attendee QR code
          </Text>

          <Text className="text-slate-300 text-center mt-2 text-sm">
            Verification will happen automatically after scanning.
          </Text>
        </View>
      </View>

      {/* Loading Overlay */}
      {verifying && (
        <View className="absolute inset-0 bg-black/70 items-center justify-center z-50">
          <View className="bg-white rounded-3xl p-8 items-center w-72">
            <ActivityIndicator size="large" color="#2563EB" />

            <Text className="text-xl font-bold text-slate-900 mt-5">
              Verifying Ticket
            </Text>

            <Text className="text-slate-500 text-center mt-2">
              Please wait while we verify the attendee QR code.
            </Text>
          </View>
        </View>
      )}

      {/* Result Modal */}
      {verifyResult && (
        <View className="absolute inset-0 bg-black/70 items-center justify-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full">
            <View className="items-center">
              <View
                className={`h-24 w-24 rounded-full items-center justify-center ${
                  verifyResult.success ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <Text className="text-5xl">
                  {verifyResult.success ? "✅" : "❌"}
                </Text>
              </View>

              <Text className="text-2xl font-bold text-slate-900 mt-5">
                {verifyResult.success
                  ? "Check-In Successful"
                  : "Verification Failed"}
              </Text>

              <Text className="text-slate-500 text-center mt-3">
                {verifyResult.message}
              </Text>
            </View>

            {verifyResult.success ? (
              <>
                <TouchableOpacity
                  className="bg-blue-600 rounded-2xl py-4 mt-8"
                  onPress={() => {
                    router.replace(`/event-details/${verifyResult.eventId}`);
                  }}
                >
                  <Text className="text-white text-center font-bold">
                    View Event
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-slate-100 rounded-2xl py-4 mt-3"
                  onPress={() => {
                    setVerifyResult(null);
                    setScanned(false);
                  }}
                >
                  <Text className="text-center font-semibold text-slate-700">
                    Scan Another QR
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  className="bg-blue-600 rounded-2xl py-4 mt-8"
                  onPress={() => {
                    setVerifyResult(null);
                    setScanned(false);
                  }}
                >
                  <Text className="text-white text-center font-bold">
                    Try Again
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-slate-100 rounded-2xl py-4 mt-3"
                  onPress={() => {
                    router.back();
                  }}
                >
                  <Text className="text-center font-semibold text-slate-700">
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
