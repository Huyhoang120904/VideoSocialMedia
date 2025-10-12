import React, { useState } from "react";
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
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { UnauthedStackParamList } from "../../Types/response/navigation.types";
import { Ionicons } from "@expo/vector-icons";

type RegisterNavigationProp = StackNavigationProp<
  UnauthedStackParamList,
  "Register"
>;

const { width, height } = Dimensions.get('window');

const RegisterScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const navigation = useNavigation<RegisterNavigationProp>();

  // Animation on component mount
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
    <View className="flex-1 bg-white">
      {/* Clean Background with subtle gradient */}
      <LinearGradient
        colors={['#fafafa', '#ffffff', '#f8fafc']}
        className="absolute inset-0"
      />
      
      {/* Minimal decorative elements */}
      <View className="absolute top-20 right-8 w-16 h-16 bg-pink-100 rounded-full opacity-30" />
      <View className="absolute bottom-32 left-6 w-12 h-12 bg-blue-100 rounded-full opacity-20" />
      
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            className="flex-1 justify-center px-6 py-8"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <View className="w-full max-w-sm mx-auto space-y-10">
              {/* Clean Header */}
              <View className="items-center space-y-8">
                {/* TheSocial Logo */}
                <View className="items-center space-y-2">
                  <Text className="text-gray-900 text-3xl font-bold tracking-tight">
                    TheSocial
                  </Text>
                  <View className="w-12 h-0.5 bg-gray-300" />
                </View>
                
                <View className="space-y-2">
                  <Text className="text-gray-900 text-2xl font-light text-center">
                    Create account
                  </Text>
                  <Text className="text-gray-500 text-center text-sm">
                    Join the social community
                  </Text>
                </View>
              </View>

              {/* Clean Form */}
              <View>
                {/* Username Input */}
                <View className="mb-6">
                  <TextInput
                    className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-gray-900 text-base"
                    placeholder="Username"
                    placeholderTextColor="#9ca3af"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="username"
                  />
                </View>

                {/* Email Input */}
                <View className="mb-6">
                  <TextInput
                    className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-gray-900 text-base"
                    placeholder="Email"
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
                <View className="mb-6">
                  <View className="relative">
                    <TextInput
                      className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-gray-900 text-base pr-12"
                      placeholder="Password"
                      placeholderTextColor="#9ca3af"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password-new"
                    />
                    <TouchableOpacity
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#9ca3af" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View className="mb-6">
                  <View className="relative">
                    <TextInput
                      className="w-full bg-gray-50 border-0 rounded-2xl px-6 py-4 text-gray-900 text-base pr-12"
                      placeholder="Confirm password"
                      placeholderTextColor="#9ca3af"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password-new"
                    />
                    <TouchableOpacity
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Ionicons 
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#9ca3af" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Clean Register Button */}
                <TouchableOpacity
                  className={`w-full bg-black rounded-2xl py-4 items-center justify-center ${
                    isLoading ? "opacity-70" : ""
                  }`}
                  onPress={handleRegister}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white font-medium text-base">
                      Sign up
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Minimal Divider */}
                <View className="flex-row items-center gap-4 my-4">
                  <View className="flex-1 h-px bg-gray-200" />
                  <Text className="text-gray-400 text-xs">or</Text>
                  <View className="flex-1 h-px bg-gray-200" />
                </View>

                {/* Clean Google Button */}
                <TouchableOpacity
                  className="w-full bg-white border border-gray-200 rounded-2xl py-4 flex-row items-center justify-center gap-3"
                  onPress={handleGoogleSignup}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-google" size={20} color="#4285f4" />
                  <Text className="text-gray-700 font-medium text-base">
                    Continue with Google
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Clean Sign In Link */}
              <View className="items-center space-y-6">
                <TouchableOpacity onPress={handleSignInNav}>
                  <Text className="text-gray-500 text-sm">
                    Already have an account?{" "}
                    <Text className="text-black font-medium">Sign in</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
export default RegisterScreen;
