import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import UserDetailService from "../../Services/UserDetailService";
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import { AuthedStackParamList } from "../../Types/response/navigation.types";
import { getAvatarUrl } from "../../Utils/ImageUrlHelper";

type EditProfileRouteProp = RouteProp<AuthedStackParamList, "EditProfile">;
type EditProfileNavigationProp = StackNavigationProp<
  AuthedStackParamList,
  "EditProfile"
>;

export default function EditProfile() {
  const navigation = useNavigation<EditProfileNavigationProp>();
  const route = useRoute<EditProfileRouteProp>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetailResponse | null>(
    null
  );

  // Form fields
  const [displayName, setDisplayName] = useState("");
  const [shownName, setShownName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<any>(null);

  useEffect(() => {
    fetchUserDetails();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to change your profile picture."
        );
      }
    }
  };

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await UserDetailService.getMyDetails();
      if (response.code === 1000 && response.result) {
        const data = response.result;
        setUserDetails(data);
        setDisplayName(data.displayName || "");
        setShownName(data.shownName || "");
        setBio(data.bio || "");
        // Construct avatar URL using userDetailId and fileName
        const avatarUrl =
          data.avatar?.fileName && data.id
            ? getAvatarUrl(data.id, data.avatar.fileName)
            : null;
        setAvatarUri(avatarUrl);
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to load profile details"
        );
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      Alert.alert("Error", "Something went wrong while loading your profile");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setAvatarUri(asset.uri);

        // Create file object for upload
        const filename = asset.uri.split("/").pop() || "avatar.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        setAvatarFile({
          uri: asset.uri,
          name: filename,
          type: type,
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleSave = async () => {
    // Validation
    if (!displayName.trim()) {
      Alert.alert("Validation Error", "Display name is required");
      return;
    }

    if (!shownName.trim()) {
      Alert.alert("Validation Error", "Username is required");
      return;
    }

    if (!userDetails?.id) {
      Alert.alert("Error", "User details not found");
      return;
    }

    try {
      setSaving(true);

      let response;

      // Check if only avatar has changed
      const isOnlyAvatarChanged =
        avatarFile &&
        displayName.trim() === userDetails.displayName &&
        shownName.trim() === userDetails.shownName &&
        bio.trim() === (userDetails.bio || "");

      if (isOnlyAvatarChanged) {
        // Use the dedicated updateAvatar endpoint for better performance
        response = await UserDetailService.updateAvatar(
          userDetails.id,
          avatarFile
        );
      } else {
        // Create FormData for full update
        const formData = new FormData();
        formData.append("displayName", displayName.trim());
        formData.append("shownName", shownName.trim());
        formData.append("bio", bio.trim());

        // Add avatar if changed
        if (avatarFile) {
          formData.append("avatar", avatarFile as any);
        }

        response = await UserDetailService.updateUserDetail(
          userDetails.id,
          formData
        );
      }

      if (response.code === 1000 && response.result) {
        Alert.alert("Success", "Profile updated successfully!", [
          {
            text: "OK",
            onPress: () => {
              // Pass refresh flag back to Profile screen
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to update profile. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while updating your profile";
      Alert.alert("Error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff0050" />
          <Text className="text-gray-700 mt-4">Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text className="text-gray-900 text-lg font-semibold">
          Edit Profile
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-pink-600 rounded-lg"
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white text-sm font-semibold">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <View className="items-center py-6">
            <TouchableOpacity
              onPress={pickImage}
              className="relative"
              activeOpacity={0.7}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  className="w-24 h-24 rounded-full"
                  style={{ resizeMode: "cover" }}
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-gray-300 justify-center items-center">
                  <Text className="text-gray-700 text-2xl font-bold">
                    {displayName?.charAt(0).toUpperCase() || "?"}
                  </Text>
                </View>
              )}

              {/* Camera Icon Overlay */}
              <View className="absolute bottom-0 right-0 w-8 h-8 bg-pink-600 rounded-full items-center justify-center border-2 border-white">
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text className="text-gray-500 text-sm mt-2">
              Tap to change photo
            </Text>
          </View>

          {/* Form Fields */}
          <View className="px-4 py-2">
            {/* Display Name */}
            <View className="mb-6">
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Display Name
              </Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-4 py-3 text-gray-900"
                placeholder="Enter your display name"
                placeholderTextColor="#9CA3AF"
                value={displayName}
                onChangeText={setDisplayName}
                maxLength={50}
                autoCapitalize="words"
              />
              <Text className="text-gray-500 text-xs mt-1">
                {displayName.length}/50
              </Text>
            </View>

            {/* Username (Shown Name) */}
            <View className="mb-6">
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Username
              </Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-4 py-3 text-gray-900"
                placeholder="Enter your username"
                placeholderTextColor="#9CA3AF"
                value={shownName}
                onChangeText={setShownName}
                maxLength={30}
                autoCapitalize="none"
              />
              <Text className="text-gray-500 text-xs mt-1">
                {shownName.length}/30
              </Text>
            </View>

            {/* Bio */}
            <View className="mb-6">
              <Text className="text-gray-700 text-sm font-semibold mb-2">
                Bio
              </Text>
              <TextInput
                className="bg-gray-100 rounded-lg px-4 py-3 text-gray-900"
                placeholder="Tell us about yourself"
                placeholderTextColor="#9CA3AF"
                value={bio}
                onChangeText={setBio}
                maxLength={150}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ minHeight: 100 }}
              />
              <Text className="text-gray-500 text-xs mt-1">
                {bio.length}/150
              </Text>
            </View>

            {/* Info Section */}
            <View className="bg-blue-50 rounded-lg p-4 mb-6">
              <View className="flex-row items-start">
                <Ionicons
                  name="information-circle"
                  size={20}
                  color="#3B82F6"
                  style={{ marginRight: 8, marginTop: 2 }}
                />
                <View className="flex-1">
                  <Text className="text-blue-900 text-sm font-semibold mb-1">
                    Profile Tips
                  </Text>
                  <Text className="text-blue-700 text-xs leading-5">
                    • Use a clear profile picture{"\n"}• Choose a unique
                    username{"\n"}• Write a bio that describes you
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
