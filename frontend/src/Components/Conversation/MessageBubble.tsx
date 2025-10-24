import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ChatMessageResponse } from "../../Types/response/ChatMessageResponse";

interface MessageBubbleProps {
  message: ChatMessageResponse;
  isMyMessage: boolean;
  isEditing: boolean;
  editText: string;
  onEditTextChange: (text: string) => void;
  onStartEditing: (message: ChatMessageResponse) => void;
  onCancelEditing: () => void;
  onSaveEdit: () => void;
  onDeleteMessage: (messageId: string) => void;
  isLoading: boolean;
}

export default function MessageBubble({
  message,
  isMyMessage,
  isEditing,
  editText,
  onEditTextChange,
  onStartEditing,
  onCancelEditing,
  onSaveEdit,
  onDeleteMessage,
  isLoading,
}: MessageBubbleProps) {
  if (isEditing) {
    return (
      <View className="mb-2 items-end">
        <View className="px-3 py-2 bg-gray-100 rounded-xl">
          <TextInput
            value={editText}
            onChangeText={onEditTextChange}
            className="bg-white rounded-lg px-2 py-1.5 mb-2 text-sm"
            multiline
            autoFocus
            maxLength={500}
          />
          <View className="flex-row justify-end space-x-1">
            <TouchableOpacity
              onPress={onCancelEditing}
              className="px-2 py-1 bg-gray-300 rounded-md"
            >
              <Text className="text-gray-700 text-xs">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSaveEdit}
              className="px-2 py-1 bg-pink-600 rounded-md"
              disabled={!editText.trim()}
            >
              <Text className="text-white text-xs">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={`mb-2 ${isMyMessage ? "items-end" : "items-start"}`}>
      <View
        className={`px-4 py-3 max-w-[85%] ${
          isMyMessage
            ? "bg-black rounded-2xl rounded-br-sm"
            : "bg-gray-100 rounded-2xl rounded-bl-sm"
        }`}
        style={
          isMyMessage
            ? {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 6,
              }
            : {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }
        }
      >
        <Text
          className={`text-sm leading-5 ${
            isMyMessage ? "text-white font-medium" : "text-gray-900 font-medium"
          }`}
        >
          {message.message}
        </Text>
        <View className="flex-row justify-between items-center mt-2">
          <Text
            className={`text-xs ${
              isMyMessage ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {new Date(message.createdAt as string).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>

          {isMyMessage && (
            <View className="flex-row space-x-1">
              <TouchableOpacity
                onPress={() => onStartEditing(message)}
                className="p-1.5 bg-white/20 rounded-full"
                activeOpacity={0.6}
              >
                <Ionicons name="create-outline" size={14} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDeleteMessage(message.id)}
                className="p-1.5 bg-white/20 rounded-full"
                activeOpacity={0.6}
              >
                <Ionicons name="trash-outline" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
