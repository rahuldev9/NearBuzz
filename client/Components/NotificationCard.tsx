import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

import { Notification } from "../services/notificationService";

type Props = {
  notification: Notification;
  onPress?: () => void;
  onDelete?: () => void;
};

const formatTime = (date: string) => {
  const now = new Date();
  const created = new Date(date);

  const diff = Math.floor((now.getTime() - created.getTime()) / 1000);

  if (diff < 60) return "Just now";

  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;

  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;

  if (diff < 172800) return "Yesterday";

  return created.toLocaleDateString();
};

const getIcon = (type: Notification["type"]) => {
  switch (type) {
    case "booking":
      return (
        <MaterialIcons name="confirmation-number" size={24} color="#2563eb" />
      );

    case "event":
      return <MaterialIcons name="event" size={24} color="#8b5cf6" />;

    case "checkin":
      return <Ionicons name="checkmark-circle" size={24} color="#10b981" />;

    case "announcement":
      return <Ionicons name="megaphone" size={24} color="#f59e0b" />;

    case "reminder":
      return <MaterialIcons name="alarm" size={24} color="#ef4444" />;

    default:
      return <FontAwesome5 name="bell" size={20} color="#64748b" />;
  }
};

export default function NotificationCard({
  notification,
  onPress,
  onDelete,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{
        color: "#e2e8f0",
      }}
      className={`mx-4 mb-3 rounded-2xl p-4 border-b ${
        notification.isRead ? "bg-white" : "bg-blue-50"
      }`}
    >
      <View className="flex-row">
        {/* Icon */}

        <View className="mr-4 mt-1">{getIcon(notification.type)}</View>

        {/* Content */}

        <View className="flex-1">
          <View className="flex-row items-start">
            <View className="flex-1">
              <Text
                className={`text-base ${
                  notification.isRead ? "font-medium" : "font-bold"
                } text-slate-900`}
              >
                {notification.title}
              </Text>
            </View>

            <View className="flex-row items-center">
              {!notification.isRead && (
                <View className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-3" />
              )}

              <TouchableOpacity
                onPress={onDelete}
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
              >
                <MaterialIcons
                  name="delete-outline"
                  size={22}
                  color="#ef4444"
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text className="text-slate-600 mt-2 leading-6">
            {notification.message}
          </Text>

          {notification.eventId?.title && (
            <View className="mt-3 self-start bg-slate-100 rounded-full px-3 py-1">
              <Text className="text-xs font-medium text-slate-700">
                {notification.eventId.title}
              </Text>
            </View>
          )}

          <View className="flex-row items-center justify-between mt-4">
            <Text className="text-xs text-slate-400">
              {formatTime(notification.createdAt)}
            </Text>

            {!notification.isRead && (
              <Text className="text-xs font-semibold text-blue-600">New</Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
