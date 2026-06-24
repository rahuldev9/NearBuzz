import { AntDesign, Entypo, MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { verifyBooking } from "@/services/eventService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const FRAME_SIZE = Math.min(SCREEN_WIDTH * 0.72, 300);
const ACCENT = "#2563EB";

type VerifyResult = {
  success: boolean;
  message: string;
  eventId?: string;
} | null;

export default function ScanQRScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyResult>(null);

  const lastScannedDataRef = useRef<string | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Ask for permission once, only if we're still allowed to ask
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Animated scan line — only runs while we're actively looking for a code
  useEffect(() => {
    if (!cameraActive || verifying || verifyResult) {
      scanLineAnim.stopAnimation();
      return;
    }

    scanLineAnim.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [cameraActive, verifying, verifyResult, scanLineAnim]);

  // Auto-resume camera on failure after a short delay so scanning feels responsive
  useEffect(() => {
    if (!verifyResult) return;

    if (verifyResult.success === false) {
      resumeTimerRef.current = setTimeout(() => {
        resetScanner();
      }, 2200);
    }

    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifyResult]);

  // Make sure no timer fires after the screen has unmounted
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const resetScanner = () => {
    lastScannedDataRef.current = null;
    setVerifyResult(null);
    setScanned(false);
    setCameraActive(true);
  };

  const handleScan = async ({ data }: { data: string }) => {
    if (scanned || verifying || verifyResult) return;
    if (lastScannedDataRef.current === data) return; // guard against duplicate frames firing twice

    lastScannedDataRef.current = data;
    setScanned(true);
    setCameraActive(false);
    setVerifying(true);

    let qrData: any = null;

    try {
      qrData = JSON.parse(data);
    } catch {
      Vibration.vibrate(50);
      setVerifyResult({ success: false, message: "Invalid QR code format." });
      setVerifying(false);
      return;
    }

    if (!qrData || !qrData.bookingId || !qrData.eventCode) {
      Vibration.vibrate(50);
      setVerifyResult({
        success: false,
        message: "QR code missing required fields.",
      });
      setVerifying(false);
      return;
    }

    try {
      const response = await verifyBooking(qrData.bookingId, qrData.eventCode);

      Vibration.vibrate(60);
      setVerifyResult({
        success: true,
        message: "User checked in successfully.",
        eventId: response.eventId,
      });
    } catch (error: any) {
      Vibration.vibrate(50);
      setVerifyResult({
        success: false,
        message:
          error?.response?.data?.message ||
          error?.message ||
          "This QR code has already been used.",
      });
    } finally {
      setVerifying(false);
    }
  };

  // --- Permission states ---------------------------------------------------

  if (!permission) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  if (!permission.granted) {
    const canAskAgain = permission.canAskAgain;

    return (
      <View style={[styles.centerScreen, { paddingTop: insets.top + 24 }]}>
        <View style={styles.permissionIconWrap}>
          <MaterialIcons name="camera-alt" size={40} color={ACCENT} />
        </View>

        <Text className="text-slate-900 text-xl font-bold mt-5 text-center">
          Camera Access Needed
        </Text>

        <Text className="text-slate-500 text-center mt-2 px-10">
          We need camera access to scan attendee QR codes for check-in.
        </Text>

        <TouchableOpacity
          className="bg-blue-600 rounded-2xl py-4 px-8 mt-8"
          onPress={() => {
            if (canAskAgain) {
              requestPermission();
            } else {
              Linking.openSettings();
            }
          }}
        >
          <Text className="text-white text-center font-bold">
            {canAskAgain ? "Grant Camera Access" : "Open Settings"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-4 px-8 mt-2"
          onPress={() => router.back()}
        >
          <Text className="text-slate-500 text-center font-semibold">
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Main scanner ----------------------------------------------------------

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, FRAME_SIZE - 10],
  });

  return (
    <View style={styles.root}>
      {/* Camera */}
      {cameraActive ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          mode="picture"
          autofocus="on"
          enableTorch={torchOn}
          zoom={0}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={handleScan}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.pausedCamera]}>
          <Text className="text-white text-base">Camera paused</Text>
        </View>
      )}

      {/* Dim mask outside the scan frame */}
      <View style={styles.maskContainer} pointerEvents="none">
        <View style={styles.maskRow} />
        <View style={styles.maskCenterRow}>
          <View style={styles.maskSide} />
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {cameraActive && !verifying && !verifyResult && (
              <Animated.View
                style={[
                  styles.scanLine,
                  { transform: [{ translateY: scanLineTranslate }] },
                ]}
              />
            )}
          </View>
          <View style={styles.maskSide} />
        </View>
        <View style={styles.maskRow} />
      </View>

      {/* Header */}
      <View style={[styles.header, { top: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <AntDesign name="arrow-left" size={22} color="white" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text className="text-white text-xl font-bold">Scan Event QR</Text>
          <Text className="text-slate-300 mt-1">Align QR inside the frame</Text>
        </View>

        <TouchableOpacity
          onPress={() => setTorchOn((prev) => !prev)}
          style={[styles.iconButton, torchOn && styles.iconButtonActive]}
        >
          <AntDesign
            name="thunderbolt"
            size={20}
            color={torchOn ? "#FACC15" : "white"}
          />
        </TouchableOpacity>
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
            <ActivityIndicator size="large" color={ACCENT} />
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
                {verifyResult.success ? (
                  <AntDesign name="check" size={56} color="#16A34A" />
                ) : (
                  <Entypo name="circle-with-cross" size={56} color="#DC2626" />
                )}
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
                  onPress={() =>
                    router.replace(`/event-details/${verifyResult.eventId}`)
                  }
                >
                  <Text className="text-white text-center font-bold">
                    View Event
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-slate-100 rounded-2xl py-4 mt-3"
                  onPress={resetScanner}
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
                  onPress={resetScanner}
                >
                  <Text className="text-white text-center font-bold">
                    Try Again
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-slate-100 rounded-2xl py-4 mt-3"
                  onPress={resetScanner}
                >
                  <Text className="text-center font-semibold text-slate-700">
                    Dismiss
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  centerScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 24,
  },
  permissionIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  pausedCamera: {
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  maskContainer: { ...StyleSheet.absoluteFillObject },
  maskRow: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  maskCenterRow: { height: FRAME_SIZE, flexDirection: "row" },
  maskSide: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    overflow: "hidden",
  },
  corner: {
    position: "absolute",
    width: 36,
    height: 36,
    borderColor: ACCENT,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  scanLine: {
    position: "absolute",
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  header: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitleWrap: { flex: 1, alignItems: "center" },
  iconButton: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonActive: { backgroundColor: "rgba(250,204,21,0.25)" },
});
