import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ConfirmDialog from "../../../Components/ConfirmDialog";
import EmptyNotification from "../../../Components/EmptyNotification";
import NotificationCard from "../../../Components/NotificationCard";
import NotificationSkeleton from "../../../Components/NotificationSkeleton";

import { SafeAreaView } from "react-native-safe-area-context";
import {
  deleteAllNotifications,
  deleteNotification,
  getNotifications,
  markAllAsRead,
  markAsRead,
  Notification,
} from "../../../services/notificationService";
export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [deleteAllVisible, setDeleteAllVisible] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const [deleteVisible, setDeleteVisible] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const loadNotifications = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const data = await getNotifications();

      setNotifications(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications(false);
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications(false);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        })),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteNotification = async () => {
    if (!selectedNotification) return;

    try {
      setDeleting(true);

      await deleteNotification(selectedNotification._id);

      setNotifications((prev) =>
        prev.filter((n) => n._id !== selectedNotification._id),
      );

      setDeleteVisible(false);
      setSelectedNotification(null);
    } catch (err) {
      console.log(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setProcessing(true);

      await deleteAllNotifications();

      setNotifications([]);

      setDeleteAllVisible(false);
    } catch (err) {
      console.log(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <ScrollView className="flex-1 ">
        <View className="px-5 py-5">
          <Text className="text-3xl font-bold">Notifications</Text>
        </View>

        {Array.from({ length: 6 }).map((_, i) => (
          <NotificationSkeleton key={i} />
        ))}
      </ScrollView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1 px-3 bg-white"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View className="px-5 pt-5 pb-3 ">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-3xl font-bold">Notifications</Text>

              <Text className="text-slate-500 mt-1">{unreadCount} unread</Text>
            </View>

            {/* {notifications.length > 0 && (
            <TouchableOpacity onPress={() => setDeleteAllVisible(true)}>
              <MaterialIcons name="delete-outline" size={26} color="#ef4444" />
            </TouchableOpacity>
          )} */}
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              className="self-start mt-4 bg-blue-600 px-4 py-2 rounded-full"
            >
              <Text className="text-white font-semibold">Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>
        {notifications.length === 0 ? (
          <EmptyNotification onRefresh={onRefresh} />
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: 24,
            }}
            renderItem={({ item }) => (
              <NotificationCard
                notification={item}
                onPress={async () => {
                  if (!item.isRead) {
                    try {
                      await markAsRead(item._id);

                      setNotifications((prev) =>
                        prev.map((notification) =>
                          notification._id === item._id
                            ? {
                                ...notification,
                                isRead: true,
                              }
                            : notification,
                        ),
                      );
                    } catch (err) {
                      console.log(err);
                    }
                  }
                }}
                onDelete={() => {
                  setSelectedNotification(item);
                  setDeleteVisible(true);
                }}
              />
            )}
            ItemSeparatorComponent={() => <View className="h-1" />}
          />
        )}
        <ConfirmDialog
          visible={deleteVisible}
          title="Delete Notification"
          message="Are you sure you want to delete this notification?"
          loading={deleting}
          confirmText="Delete"
          cancelText="Cancel"
          onCancel={() => {
            setDeleteVisible(false);
            setSelectedNotification(null);
          }}
          onConfirm={handleDeleteNotification}
        />
        <ConfirmDialog
          visible={deleteAllVisible}
          title="Delete Notifications"
          message="Are you sure you want to delete all notifications? This action cannot be undone."
          loading={processing}
          confirmText="Delete"
          cancelText="Cancel"
          onCancel={() => setDeleteAllVisible(false)}
          onConfirm={handleDeleteAll}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
