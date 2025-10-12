import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthedStackParamList } from "../../Types/response/navigation.types";

type CallNavigationProp = StackNavigationProp<AuthedStackParamList, "Call">;

interface CallRouteParams {
  callType: "video" | "voice";
  userId: string;
  userName: string;
  userAvatar?: string;
}

const CallScreen = () => {
  const navigation = useNavigation<CallNavigationProp>();
  const route = useRoute();

  const [callStatus, setCallStatus] = useState<
    "connecting" | "ringing" | "connected" | "ended"
  >("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  // Get params from navigation
  const params = route.params as CallRouteParams;
  const { callType, userId, userName, userAvatar } = params;

  useEffect(() => {
    // Simulate call connection process
    const timer = setTimeout(() => {
      setCallStatus("ringing");
    }, 1000);

    const ringingTimer = setTimeout(() => {
      setCallStatus("connected");
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(ringingTimer);
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const handleEndCall = () => {
    setCallStatus("ended");
    Alert.alert("Call Ended", "The call has been ended", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleVideoToggle = () => {
    if (callType === "video") {
      setIsVideoOn(!isVideoOn);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusText = () => {
    switch (callStatus) {
      case "connecting":
        return "Connecting...";
      case "ringing":
        return "Ringing...";
      case "connected":
        return formatDuration(callDuration);
      case "ended":
        return "Call Ended";
      default:
        return "";
    }
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case "connecting":
        return "#F59E0B";
      case "ringing":
        return "#3B82F6";
      case "connected":
        return "#10B981";
      case "ended":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={["#1f2937", "#111827", "#000000"]}
        className="absolute inset-0"
      />

      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold">
            {callType === "video" ? "Video Call" : "Voice Call"}
          </Text>
          <View className="w-6" />
        </View>

        {/* Main Content */}
        <View className="flex-1 items-center justify-center px-6">
          {/* User Avatar/Info */}
          <View className="items-center mb-8">
            <Image
              source={
                userAvatar
                  ? { uri: userAvatar }
                  : require("../../../assets/avatar.png")
              }
              className={`w-32 h-32 rounded-full mb-4 ${
                callStatus === "connected" ? "border-4 border-green-500" : ""
              }`}
              resizeMode="cover"
            />

            <Text className="text-white text-2xl font-bold mb-2">
              {userName}
            </Text>

            <Text
              className="text-lg font-medium"
              style={{ color: getStatusColor() }}
            >
              {getStatusText()}
            </Text>
          </View>

          {/* Call Status Indicator */}
          {callStatus === "ringing" && (
            <View className="items-center mb-8">
              <View className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
            </View>
          )}

          {/* Video Preview (for video calls) */}
          {callType === "video" && callStatus === "connected" && (
            <View className="w-full h-64 bg-gray-800 rounded-2xl mb-8 items-center justify-center">
              {isVideoOn ? (
                <Text className="text-white text-lg">Your Video</Text>
              ) : (
                <View className="items-center">
                  <Ionicons name="videocam-off" size={48} color="#6B7280" />
                  <Text className="text-gray-400 mt-2">Video Off</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Call Controls */}
        <View className="px-6 pb-8">
          <View className="flex-row justify-center items-center space-x-6">
            {/* Mute Button */}
            <TouchableOpacity
              onPress={handleMuteToggle}
              className={`w-16 h-16 rounded-full items-center justify-center ${
                isMuted ? "bg-red-500" : "bg-gray-600"
              }`}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isMuted ? "mic-off" : "mic"}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            {/* Video Toggle (for video calls) */}
            {callType === "video" && (
              <TouchableOpacity
                onPress={handleVideoToggle}
                className={`w-16 h-16 rounded-full items-center justify-center ${
                  isVideoOn ? "bg-gray-600" : "bg-red-500"
                }`}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isVideoOn ? "videocam" : "videocam-off"}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            )}

            {/* End Call Button */}
            <TouchableOpacity
              onPress={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-500 items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Additional Controls */}
          {callStatus === "connected" && (
            <View className="mt-6 flex-row justify-center space-x-4">
              <TouchableOpacity className="px-4 py-2 bg-gray-700 rounded-full">
                <Text className="text-white text-sm">Speaker</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-2 bg-gray-700 rounded-full">
                <Text className="text-white text-sm">Add Call</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default CallScreen;
