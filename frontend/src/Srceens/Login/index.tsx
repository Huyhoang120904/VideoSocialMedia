import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../Context/AuthProvider";
import { useConversations } from "../../Context/ConversationProvider";

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigation = useNavigation();
  const { login, isLoading } = useAuth();
  const handleSignUpNav = () => {
    (navigation as any).navigate("Register");
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      await login(username, password);
    } catch (error: any) {
      console.error("Login Error:", error);
      console.log("Error details:", JSON.stringify(error, null, 2));

      // Safely access error properties
      if (error instanceof Error) {
        console.log("Error name:", error.name);
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);
        Alert.alert("Login Error", `Failed to login: ${error.message}`);
      } else {
        console.log("Unknown error type:", typeof error);
        Alert.alert("Login Error", "An unexpected error occurred during login");
      }
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert("Info", "Google login integration would go here");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-8">
          <View className="w-full max-w-sm mx-auto space-y-8">
            {/* Header */}
            <View className="items-center space-y-6">
              <View className="w-fit h-16 bg-pink-600  items-center justify-center px-3">
                <Text className="text-white text-2xl font-black">
                  The Social
                </Text>
              </View>
              <View className="space-y-2">
                <Text className="text-gray-600 text-center text-xl">
                  Sign in to your account to continue
                </Text>
              </View>
            </View>

            {/* Login Form */}
            <View className="space-y-6">
              {/* Username Input */}
              <View className="space-y-2">
                <Text className="text-gray-600 font-medium text-sm">
                  Username
                </Text>
                <TextInput
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-4 text-gray-600 text-base"
                  placeholder="Enter your username"
                  placeholderTextColor="#9ca3af"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                />
              </View>

              {/* Password Input */}
              <View className="space-y-2">
                <Text className="text-gray-600 font-medium text-sm">
                  Password
                </Text>
                <TextInput
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-4 text-gray-600 text-base"
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                />
              </View>

              {/* Forgot Password */}
              <View className="items-end">
                <TouchableOpacity>
                  <Text className="text-pink-600 text-sm font-medium">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                className={`w-full bg-pink-600 rounded-lg py-4 items-center justify-center ${
                  isLoading ? "opacity-70" : ""
                }`}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center gap-4">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="text-gray-500 text-sm">or</Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>

              {/* Google Login Button */}
              <TouchableOpacity
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-4 flex-row items-center justify-center gap-3"
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#ef4444", "#f59e42", "#3b82f6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: 20, height: 20, borderRadius: 10 }}
                />
                <Text className="text-gray-600 font-medium text-base">
                  Continue with{" "}
                  <Text className="text-pink-600 font-medium text-base">
                    Google
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View className="items-center">
              <Text
                className="text-gray-500 text-sm"
                onPress={() => handleSignUpNav()}
              >
                Don't have an account?{" "}
                <Text className="text-pink-600 font-medium">Sign Up</Text>
              </Text>

              {/* Debug Info - Remove in production */}
              <Text className="text-gray-400 text-xs mt-8">
                If you're having connection issues, make sure your backend
                server is running and accessible from your device's network.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
