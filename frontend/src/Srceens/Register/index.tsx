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
import { StackNavigationProp } from "@react-navigation/stack";
import { UnauthedStackParamList } from "../../Types/response/navigation.types";

type RegisterNavigationProp = StackNavigationProp<
  UnauthedStackParamList,
  "Register"
>;

const RegisterScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<RegisterNavigationProp>();

  const handleSignInNav = () => {
    navigation.navigate("Login");
  };

  const handleRegister = async () => {
    // Form validation
    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    // Simulate registration process
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Success", "Registration successful! You can now login.");
      // Here you would navigate to the login screen in a real app
    }, 2000);
  };

  const handleGoogleSignup = () => {
    Alert.alert("Info", "Google signup integration would go here");
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
              <View className="w-fit h-16 bg-pink-600 items-center justify-center px-3">
                <Text className="text-white text-2xl font-black">
                  The Social
                </Text>
              </View>
              <View className="space-y-2">
                <Text className="text-gray-600 text-center text-xl">
                  Create your account to get started
                </Text>
              </View>
            </View>

            {/* Registration Form */}
            <View className="space-y-6">
              {/* Username Input */}
              <View className="space-y-2">
                <Text className="text-gray-600 font-medium text-sm">
                  Username
                </Text>
                <TextInput
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-4 text-gray-600 text-base"
                  placeholder="Choose a username"
                  placeholderTextColor="#9ca3af"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                />
              </View>

              {/* Email Input */}
              <View className="space-y-2">
                <Text className="text-gray-600 font-medium text-sm">
                  Email Address
                </Text>
                <TextInput
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-4 text-gray-600 text-base"
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                />
              </View>

              {/* Password Input */}
              <View className="space-y-2">
                <Text className="text-gray-600 font-medium text-sm">
                  Password
                </Text>
                <TextInput
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-4 text-gray-600 text-base"
                  placeholder="Create a password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password-new"
                />
              </View>

              {/* Confirm Password Input */}
              <View className="space-y-2">
                <Text className="text-gray-600 font-medium text-sm">
                  Confirm Password
                </Text>
                <TextInput
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-4 text-gray-600 text-base"
                  placeholder="Confirm your password"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password-new"
                />
              </View>

              {/* Register Button */}
              <TouchableOpacity
                className={`w-full bg-pink-600 rounded-lg py-4 items-center justify-center space-y-2 ${
                  isLoading ? "opacity-70" : ""
                }`}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Sign Up
                  </Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center gap-4">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="text-gray-500 text-sm">or</Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>

              {/* Google Signup Button */}
              <TouchableOpacity
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-4 flex-row items-center justify-center gap-3"
                onPress={handleGoogleSignup}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#ef4444", "#f59e42", "#3b82f6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: 20, height: 20, borderRadius: 10 }}
                />
                <Text className="text-gray-600 font-medium text-base">
                  Sign up with{" "}
                  <Text className="text-pink-600 font-medium text-base">
                    Google
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Link */}
            <View className="items-center">
              <Text
                className="text-gray-500 text-sm"
                onPress={() => handleSignInNav()}
              >
                Already have an account?{" "}
                <Text className="text-pink-600 font-medium">Sign In</Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default RegisterScreen;
