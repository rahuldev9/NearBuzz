import { chatWithAi, getAiChatHistory } from "@/services/aiService";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
interface AssistantChatModalProps {
  visible: boolean;
  onClose: () => void;
  sessionId?: string;
  /** Shown in the "Hello, {userName}!" greeting on the empty state */
  userName?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS: {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { label: "Find events near me", icon: "explore" },
  { label: "Show my bookings", icon: "event-available" },
  { label: "How do I scan a QR code?", icon: "qr-code-scanner" },
  { label: "Plan my weekend", icon: "calendar-today" },
  { label: "What's popular this week", icon: "trending-up" },
  { label: "More", icon: "more-horiz" },
];

/** Renders **bold** segments inside a line as bold <Text> nodes */
function renderInlineBold(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g).filter((p) => p.length > 0);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <Text key={`${keyPrefix}-${i}`} className="font-semibold text-white">
        {part.slice(2, -2)}
      </Text>
    ) : (
      <Text key={`${keyPrefix}-${i}`}>{part}</Text>
    ),
  );
}

/** Light-touch markdown: turns "- " / "* " lines into bullets, keeps **bold** */
function renderMessageContent(content: string) {
  const lines = content.split("\n").filter((line) => line.trim() !== "");

  return lines.map((line, i) => {
    const trimmed = line.trim();
    const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");

    if (isBullet) {
      return (
        <View key={i} className="mt-1.5 flex-row pl-1">
          <Text className="mr-2 dark:text-slate-200">{"\u2022"}</Text>
          <Text className="flex-1 text-[15px] leading-6 dark:text-slate-200">
            {renderInlineBold(trimmed.replace(/^[-*]\s+/, ""), `b${i}`)}
          </Text>
        </View>
      );
    }

    return (
      <Text
        key={i}
        className="mt-1.5 text-[15px] leading-6 dark:text-slate-200"
      >
        {renderInlineBold(trimmed, `t${i}`)}
      </Text>
    );
  });
}

export default function AssistantChatModal({
  visible,
  onClose,
  sessionId = "home-assistant",
  userName = "there",
}: AssistantChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { colorScheme } = useColorScheme();
  useEffect(() => {
    if (!visible) return;

    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const history = await getAiChatHistory(sessionId);
        const normalized: ChatMessage[] = Array.isArray(history)
          ? history.map((item: any) => ({
              role: item.role === "user" ? "user" : "assistant",
              content: item.content || item.message || "",
            }))
          : [];
        setMessages(normalized);
      } catch (error) {
        console.log(error);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [sessionId, visible]);

  useEffect(() => {
    if (!visible) return;
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      120,
    );
  }, [messages, visible, loading]);

  const sendMessage = async (raw: string) => {
    const message = raw.trim();
    if (!message) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);

    try {
      const reply = await chatWithAi({
        message,
        sessionId,
        context: { page: "home" },
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply || "I'm here and ready to help.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble reaching the assistant right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const handleSuggestion = (label: string) => {
    if (label === "More") return; // hook up a sheet of extra actions here if needed
    sendMessage(label);
  };

  const handleVoiceInput = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const SpeechRecognitionCtor =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;

      if (SpeechRecognitionCtor) {
        const recognition = new SpeechRecognitionCtor();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          const transcript = event.results?.[0]?.[0]?.transcript || "";
          if (transcript) {
            setInput(transcript);
          }
        };
        recognition.onerror = () => {
          Alert.alert("Voice Input", "Unable to process speech right now.");
        };
        recognition.start();
        return;
      }
    }

    Alert.alert(
      "Voice Input",
      "Voice input is available on supported web browsers. Please type your message instead.",
    );
  };

  const isEmptyState = messages.length === 0 && !historyLoading;
  const canSend = input.trim().length > 0 && !loading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/70">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="h-[90%] overflow-hidden rounded-t-[32px] dark:bg-neutral-900 bg-white"
        >
          {/* Drag handle */}
          <View className="items-center pb-1 pt-3">
            <View className="h-1.5 w-10 rounded-full bg-blue-100 dark:bg-neutral-800" />
          </View>

          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-blue-100 dark:bg-neutral-700 p-2 "
          >
            <MaterialIcons name="close" size={18} color=" #1e3a8a" />
          </TouchableOpacity>

          {isEmptyState ? (
            // ---------- Empty / greeting state ----------
            <ScrollView>
              <View className="flex-1 items-center justify-center px-6 pt-2">
                <LinearGradient
                  colors={["#3b82f6", "#1d4ed8", "#1e3a8a"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 22,
                  }}
                >
                  <MaterialIcons name="auto-awesome" size={28} color="#fff" />
                </LinearGradient>

                <Text className="text-base dark:text-slate-200">
                  Hello, {userName}!
                </Text>
                <Text className="mt-1 text-[28px] font-bold dark:text-slate-200">
                  How can I help?
                </Text>

                <View className="mt-9 w-full flex-row flex-wrap justify-center gap-2.5">
                  {SUGGESTIONS.map((item) => (
                    <TouchableOpacity
                      key={item.label}
                      onPress={() => handleSuggestion(item.label)}
                      activeOpacity={0.7}
                      className="flex-row items-center gap-1.5 rounded-full border bg-blue-900 border-neutral-700/80 dark:bg-neutral-900 px-4 py-2.5"
                    >
                      <Text className="text-sm font-medium text-white dark:text-slate-200">
                        {item.label}
                      </Text>
                      <MaterialIcons
                        name="arrow-forward"
                        size={14}
                        color="#fff"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          ) : (
            // ---------- Conversation ----------
            <ScrollView
              ref={scrollViewRef}
              className="flex-1 px-4 pt-2"
              contentContainerStyle={{ paddingBottom: 12 }}
              keyboardShouldPersistTaps="handled"
            >
              {historyLoading ? (
                <View className="items-center py-10">
                  <ActivityIndicator size="small" color="#818CF8" />
                </View>
              ) : (
                messages.map((item, index) =>
                  item.role === "assistant" ? (
                    <View
                      key={index}
                      className="mb-5 max-w-[88%] flex-row self-start"
                    >
                      <View className="mr-2.5 mt-0.5 h-7 w-7 items-center justify-center rounded-full bg-blue-800">
                        <MaterialIcons
                          name="auto-awesome"
                          size={14}
                          color="#fff"
                        />
                      </View>
                      <View className="flex-1  dark:text-slate-200">
                        {renderMessageContent(item.content)}
                      </View>
                    </View>
                  ) : (
                    <View
                      key={index}
                      className="mb-5 max-w-[85%] self-end rounded-3xl bg-blue-800 px-4 py-3"
                    >
                      <Text className="text-[15px] leading-6 text-white">
                        {item.content}
                      </Text>
                    </View>
                  ),
                )
              )}

              {loading ? (
                <View className="mb-5 flex-row items-center self-start">
                  <View className="mr-2.5 h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20">
                    <MaterialIcons
                      name="auto-awesome"
                      size={14}
                      color="#818CF8"
                    />
                  </View>
                  <ActivityIndicator size="small" color="#818CF8" />
                </View>
              ) : null}
            </ScrollView>
          )}

          {/* ---------- Input bar ---------- */}
          <View className=" px-4 pb-6 pt-3 bg-white dark:bg-neutral-900">
            <View className="flex-row items-end rounded-3xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 px-2 py-2">
              {/* Add Button */}
              <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full">
                <MaterialIcons
                  name="add"
                  size={22}
                  color={colorScheme === "dark" ? "#A3A3A3" : "#64748B"}
                />
              </TouchableOpacity>

              {/* Input */}
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask anything..."
                placeholderTextColor={
                  colorScheme === "dark" ? "#737373" : "#94A3B8"
                }
                multiline
                className="flex-1 px-2 text-[15px] text-slate-900 dark:text-white outline-none"
                style={{
                  maxHeight: 100,
                  minHeight: 40,
                  paddingTop: 10,
                  paddingBottom: 10,
                }}
                onSubmitEditing={handleSend}
              />

              {/* Voice Button */}
              <TouchableOpacity
                onPress={handleVoiceInput}
                className="h-10 w-10 items-center justify-center rounded-full"
              >
                <MaterialIcons
                  name="mic"
                  size={22}
                  color={colorScheme === "dark" ? "#A3A3A3" : "#64748B"}
                />
              </TouchableOpacity>

              {/* Send Button */}
              <TouchableOpacity
                onPress={handleSend}
                disabled={!canSend}
                className={`ml-1 h-10 w-10 items-center justify-center rounded-full ${
                  canSend ? "bg-blue-600" : "bg-slate-300 dark:bg-neutral-700"
                }`}
              >
                <MaterialIcons name="arrow-upward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
