import React from "react";
import { View, Text, TouchableOpacity, Modal, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ConversationOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  conversationType: string;
  onViewProfile: () => void;
  onAddMember: () => void;
  onViewMembers: () => void;
  onRemoveMember: () => void;
  onUpdateConversation: () => void;
  onDeleteConversation: () => void;
}

export default function ConversationOptionsModal({
  visible,
  onClose,
  conversationType,
  onViewProfile,
  onAddMember,
  onViewMembers,
  onRemoveMember,
  onUpdateConversation,
  onDeleteConversation,
}: ConversationOptionsModalProps) {
  const handleRemoveMember = () => {
    Alert.alert(
      "Remove Member",
      "Select a member to remove from this conversation.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Select Member",
          onPress: () => {
            console.log("Show member selection");
            onClose();
          },
        },
      ]
    );
  };

  const handleUpdateConversation = () => {
    Alert.alert("Update Conversation", "Update conversation name or avatar.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Update",
        onPress: () => {
          console.log("Update conversation");
          onClose();
        },
      },
    ]);
  };

  const handleDeleteConversation = () => {
    Alert.alert(
      "Delete Conversation",
      "This conversation will be permanently deleted. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            console.log("Deleting conversation");
            onDeleteConversation();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/40 justify-end"
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="bg-white rounded-t-3xl p-6 shadow-2xl">
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-8" />

          <Text className="text-xl font-bold text-gray-900 mb-8 text-center">
            {conversationType === "GROUP" ? "Group Options" : "Chat Options"}
          </Text>

          <View className="space-y-2">
            {/* View Profile */}
            <TouchableOpacity
              className="flex-row items-center py-4 px-4 rounded-2xl bg-gray-50"
              onPress={onViewProfile}
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 bg-pink-100 rounded-full items-center justify-center mr-4">
                <Ionicons name="person-outline" size={20} color="#EC4899" />
              </View>
              <Text className="text-gray-900 text-base font-medium flex-1">
                View Profile
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Direct conversation specific options */}
            {conversationType === "DIRECT" && (
              <>
                <TouchableOpacity
                  className="flex-row items-center py-4 px-4 rounded-2xl bg-gray-50"
                  onPress={() => {
                    console.log("Start video call");
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-4">
                    <Ionicons
                      name="videocam-outline"
                      size={20}
                      color="#10B981"
                    />
                  </View>
                  <Text className="text-gray-900 text-base font-medium flex-1">
                    Video Call
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center py-4 px-4 rounded-2xl bg-gray-50"
                  onPress={() => {
                    console.log("Start voice call");
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-4">
                    <Ionicons name="call-outline" size={20} color="#3B82F6" />
                  </View>
                  <Text className="text-gray-900 text-base font-medium flex-1">
                    Voice Call
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </>
            )}

            {/* Group-specific options */}
            {conversationType === "GROUP" && (
              <>
                <TouchableOpacity
                  className="flex-row items-center py-4 px-4 rounded-2xl bg-gray-50"
                  onPress={onAddMember}
                  activeOpacity={0.7}
                >
                  <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-4">
                    <Ionicons
                      name="person-add-outline"
                      size={20}
                      color="#3B82F6"
                    />
                  </View>
                  <Text className="text-gray-900 text-base font-medium flex-1">
                    Add Member
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center py-4 px-4 rounded-2xl bg-gray-50"
                  onPress={onViewMembers}
                  activeOpacity={0.7}
                >
                  <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-4">
                    <Ionicons name="people-outline" size={20} color="#8B5CF6" />
                  </View>
                  <Text className="text-gray-900 text-base font-medium flex-1">
                    View Members
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center py-4 px-4 rounded-2xl bg-gray-50"
                  onPress={handleRemoveMember}
                  activeOpacity={0.7}
                >
                  <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-4">
                    <Ionicons
                      name="person-remove-outline"
                      size={20}
                      color="#F59E0B"
                    />
                  </View>
                  <Text className="text-gray-900 text-base font-medium flex-1">
                    Remove Member
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </>
            )}

            {/* Update conversation */}
            <TouchableOpacity
              className="flex-row items-center py-4 px-4 rounded-2xl bg-gray-50"
              onPress={handleUpdateConversation}
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-4">
                <Ionicons name="create-outline" size={20} color="#8B5CF6" />
              </View>
              <Text className="text-gray-900 text-base font-medium flex-1">
                {conversationType === "GROUP" ? "Update Group" : "Update Chat"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Delete conversation */}
            <TouchableOpacity
              className="flex-row items-center py-4 px-4 rounded-2xl bg-red-50"
              onPress={handleDeleteConversation}
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-4">
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </View>
              <Text className="text-red-600 text-base font-medium flex-1">
                {conversationType === "GROUP" ? "Delete Group" : "Delete Chat"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            className="mt-8 py-4 bg-gray-100 rounded-2xl"
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text className="text-gray-700 text-base font-semibold text-center">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
