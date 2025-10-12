import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Animated } from "react-native";

interface MessageInputProps {
  message: string;
  onMessageChange: (text: string) => void;
  onSend: () => void;
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
  editingMessage,
  editText,
  onEditTextChange,
  onCancelEditing,
  onSaveEdit,
  isLoading,
  fadeAnim,
  slideAnim,
}: MessageInputProps) {
  return (
    <View className="bg-white border-t border-gray-200">
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
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
              <Feather name="plus" size={18} color="#6B7280" />
            </TouchableOpacity>

            <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
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
              className={`w-10 h-10 rounded-full items-center justify-center ${
                message.trim() ? "bg-pink-500" : "bg-gray-300"
              }`}
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
        )}
      </Animated.View>
    </View>
  );
}
