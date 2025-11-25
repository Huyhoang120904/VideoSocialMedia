import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
  InteractionManager,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface MessageInputProps {
  message: string;
  onMessageChange: (text: string) => void;
  onSend: () => void;
  onImagePick: () => Promise<void> | void;
  onVideoPick: () => Promise<void> | void;
  editingMessage: any;
  editText: string;
  onEditTextChange: (text: string) => void;
  onCancelEditing: () => void;
  onSaveEdit: () => void;
  isLoading: boolean;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
}

export default function MessageInput({
  message,
  onMessageChange,
  onSend,
  onImagePick,
  onVideoPick,
  editingMessage,
  editText,
  onEditTextChange,
  onCancelEditing,
  onSaveEdit,
  isLoading,
  fadeAnim,
  slideAnim,
}: MessageInputProps) {
  const [isAttachmentModalVisible, setAttachmentModalVisible] = useState(false);

  const handleAttachmentAction = (action: () => Promise<void> | void) => {
    setAttachmentModalVisible(false);
    // Wait for the modal close animation to finish before invoking native pickers
    InteractionManager.runAfterInteractions(() => {
      action();
    });
  };

  const QuickAttachmentButton = ({
    label,
    icon,
    onPress,
  }: {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      className="flex-row items-center bg-white border border-gray-200 rounded-full px-3 py-1.5"
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Ionicons name={icon} size={16} color="#EC4899" />
      <Text className="text-xs text-gray-600 font-semibold ml-1.5">
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      className="bg-white border-t border-gray-100"
      style={styles.container}
    >
      <Animated.View
        className="px-4 py-3"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {editingMessage ? (
          // Edit Mode Layout
          <View className="flex-row items-center space-x-3">
            <Text className="text-sm text-gray-600 font-medium">Edit:</Text>
            <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
              <TextInput
                className="text-sm text-gray-900"
                placeholder="Edit message..."
                placeholderTextColor="#9CA3AF"
                value={editText}
                onChangeText={onEditTextChange}
                multiline
                maxLength={500}
                returnKeyType="default"
                blurOnSubmit={false}
                style={{
                  minHeight: 36,
                  maxHeight: 80,
                }}
              />
            </View>
            <TouchableOpacity
              onPress={onCancelEditing}
              className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={16} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              className={`w-8 h-8 rounded-full items-center justify-center ${
                editText.trim() ? "bg-pink-500" : "bg-gray-300"
              }`}
              onPress={onSaveEdit}
              disabled={!editText.trim() || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          // Normal Message Input Layout
          <View className="flex-col">
            <View className="flex-row items-center space-x-3">
              <TouchableOpacity
                onPress={() => setAttachmentModalVisible(true)}
                className="w-11 h-11 bg-gray-100 rounded-full items-center justify-center border border-gray-200"
                activeOpacity={0.8}
              >
                <Feather name="plus" size={18} color="#6B7280" />
              </TouchableOpacity>

              <View className="flex-1 bg-gray-50 rounded-3xl px-4 py-2 border border-gray-200">
                <TextInput
                  className="text-sm text-gray-900"
                  placeholder="Type a message..."
                  placeholderTextColor="#9CA3AF"
                  value={message}
                  onChangeText={onMessageChange}
                  multiline
                  maxLength={500}
                  returnKeyType="send"
                  blurOnSubmit={false}
                  enablesReturnKeyAutomatically={true}
                  style={{
                    minHeight: 36,
                    maxHeight: 100,
                  }}
                  onSubmitEditing={() => {
                    if (message.trim()) {
                      onSend();
                    }
                  }}
                />
              </View>

              <TouchableOpacity
                className={`w-11 h-11 rounded-full items-center justify-center ${
                  message.trim() ? "bg-pink-500" : "bg-gray-300"
                } shadow-md`}
                onPress={onSend}
                disabled={!message.trim() || isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="send" size={18} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAttachmentModalVisible}
        onRequestClose={() => {
          setAttachmentModalVisible(!isAttachmentModalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.sheet}>
            <View style={styles.dragHandle} />
            <Text className="text-gray-900 text-base font-semibold mb-4 self-start">
              Add to your message
            </Text>

            <View className="w-full space-y-3">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleAttachmentAction(onImagePick)}
                style={styles.attachmentAction}
              >
                <LinearGradient
                  colors={["#FDE68A", "#F97316"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.attachmentIcon}
                >
                  <MaterialIcons name="photo-library" size={22} color="white" />
                </LinearGradient>
                <View style={styles.attachmentCopy}>
                  <Text style={styles.attachmentLabel}>Photo Library</Text>
                  <Text style={styles.attachmentDescription}>
                    Share crisp images up to 10MB
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleAttachmentAction(onVideoPick)}
                style={styles.attachmentAction}
              >
                <LinearGradient
                  colors={["#A78BFA", "#7C3AED"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.attachmentIcon}
                >
                  <MaterialIcons name="videocam" size={22} color="white" />
                </LinearGradient>
                <View style={styles.attachmentCopy}>
                  <Text style={styles.attachmentLabel}>Video Library</Text>
                  <Text style={styles.attachmentDescription}>
                    Send HD clips with thumbnails
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="w-full mt-5 border border-gray-200 rounded-2xl py-3 items-center"
              activeOpacity={0.7}
              onPress={() => setAttachmentModalVisible(false)}
            >
              <Text className="text-gray-700 font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 32,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  dragHandle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 16,
  },
  attachmentAction: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 22,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 0,
  },
  attachmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  attachmentCopy: {
    flex: 1,
  },
  attachmentLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  attachmentDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
});
