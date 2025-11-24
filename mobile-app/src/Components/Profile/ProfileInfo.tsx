import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import { getAvatarUrl, UNKNOWN_AVATAR } from "../../Utils/ImageUrlHelper";
import { ProfileStats } from "./ProfileStats";

interface ProfileInfoProps {
  userDetails: UserDetailResponse;
  totalFeedItems: number;
  onEditProfile: () => void;
  onFollowingPress?: () => void;
  onFollowersPress?: () => void;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({
  userDetails,
  totalFeedItems,
  onEditProfile,
  onFollowingPress,
  onFollowersPress,
}) => {
  const avatarUrl =
    userDetails?.avatar?.fileName && userDetails.id
      ? getAvatarUrl(userDetails.id, userDetails.avatar.fileName)
      : null;
  const avatarSource = avatarUrl ? { uri: avatarUrl } : UNKNOWN_AVATAR;

  return (
    <View className="items-center px-6 py-6">
      {/* Avatar */}
      <View className="mb-4">
        <Image
          source={avatarSource}
          className="w-24 h-24 rounded-full"
          style={{ resizeMode: "cover" }}
        />
      </View>

      {/* Display Name */}
      <Text className="text-gray-900 text-xl font-bold mb-1">
        {userDetails?.displayName || "Unknown User"}
      </Text>

      {/* Shown Name */}
      {userDetails?.shownName && (
        <Text className="text-gray-600 text-base mb-4">
          @{userDetails.shownName}
        </Text>
      )}

      {/* Stats */}
      <ProfileStats
        followingCount={userDetails?.followingCount || 0}
        followerCount={userDetails?.followerCount || 0}
        feedItemCount={totalFeedItems}
        onFollowingPress={onFollowingPress}
        onFollowersPress={onFollowersPress}
      />

      {/* Bio */}
      {userDetails?.bio && (
        <View className="w-full mb-6">
          <Text className="text-gray-700 text-center text-sm leading-5">
            {userDetails.bio}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row w-full gap-3 mb-6">
        <TouchableOpacity
          className="flex-1 bg-gray-900 rounded-lg py-3"
          onPress={onEditProfile}
          activeOpacity={0.7}
        >
          <Text className="text-white text-center font-semibold">
            Edit Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 bg-gray-200 rounded-lg py-3">
          <Text className="text-gray-800 text-center font-semibold">
            Share Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

