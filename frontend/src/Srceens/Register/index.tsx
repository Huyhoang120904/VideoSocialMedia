import React, { useState } from "react";
import {
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { UnauthedStackParamList } from "../../Types/response/navigation.types";

type RegisterNavigationProp = StackNavigationProp<
  UnauthedStackParamList,
  "Register"
>;

const { width, height } = Dimensions.get("window");

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
        colors={["#fafafa", "#ffffff", "#f8fafc"]}
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
              transform: [{ translateY: slideAnim }],
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
                    mode="outlined"
                    label="Username"
                    placeholder="Enter your username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="username"
                    style={{ backgroundColor: "#f9fafb" }}
                    outlineStyle={{ borderRadius: 16, borderColor: "#e5e7eb" }}
                    theme={{
                      colors: {
                        primary: "#000000",
                        onSurfaceVariant: "#9ca3af",
                      },
                    }}
                  />
                </View>

                {/* Email Input */}
                <View className="mb-6">
                  <TextInput
                    mode="outlined"
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    keyboardType="email-address"
                    style={{ backgroundColor: "#f9fafb" }}
                    outlineStyle={{ borderRadius: 16, borderColor: "#e5e7eb" }}
                    theme={{
                      colors: {
                        primary: "#000000",
                        onSurfaceVariant: "#9ca3af",
                      },
                    }}
                  />
                </View>

                {/* Password Input */}
                <View className="mb-6">
                  <TextInput
                    mode="outlined"
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password-new"
                    right={
                      <TextInput.Icon
                        icon={showPassword ? "eye-off" : "eye"}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    style={{ backgroundColor: "#f9fafb" }}
                    outlineStyle={{ borderRadius: 16, borderColor: "#e5e7eb" }}
                    theme={{
                      colors: {
                        primary: "#000000",
                        onSurfaceVariant: "#9ca3af",
                      },
                    }}
                  />
                </View>

                {/* Confirm Password Input */}
                <View className="mb-6">
                  <TextInput
                    mode="outlined"
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password-new"
                    right={
                      <TextInput.Icon
                        icon={showConfirmPassword ? "eye-off" : "eye"}
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      />
                    }
                    style={{ backgroundColor: "#f9fafb" }}
                    outlineStyle={{ borderRadius: 16, borderColor: "#e5e7eb" }}
                    theme={{
                      colors: {
                        primary: "#000000",
                        onSurfaceVariant: "#9ca3af",
                      },
                    }}
                  />
                </View>

                {/* Clean Register Button */}
                <Button
                  mode="contained"
                  onPress={handleRegister}
                  disabled={isLoading}
                  loading={isLoading}
                  style={{
                    borderRadius: 16,
                    paddingVertical: 8,
                    backgroundColor: "#000000",
                  }}
                  labelStyle={{
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                  contentStyle={{ paddingVertical: 4 }}
                >
                  Sign up
                </Button>

                {/* Minimal Divider */}
                <View className="flex-row items-center gap-4 my-4">
                  <View className="flex-1 h-px bg-gray-200" />
                  <Text variant="labelSmall" style={{ color: "#9ca3af" }}>
                    or
                  </Text>
                  <View className="flex-1 h-px bg-gray-200" />
                </View>

                {/* Clean Google Button */}
                <Button
                  mode="outlined"
                  onPress={handleGoogleSignup}
                  icon="google"
                  style={{
                    borderRadius: 16,
                    borderColor: "#e5e7eb",
                    paddingVertical: 8,
                  }}
                  labelStyle={{
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                  contentStyle={{ paddingVertical: 4 }}
                  textColor="#374151"
                >
                  Continue with Google
                </Button>
              </View>

              {/* Clean Sign In Link */}
              <View className="items-center space-y-6">
                <Button
                  mode="text"
                  onPress={handleSignInNav}
                  labelStyle={{ fontSize: 14 }}
                >
                  <Text variant="bodyMedium" style={{ color: "#6b7280" }}>
                    Already have an account?{" "}
                    <Text style={{ color: "#000000", fontWeight: "500" }}>
                      Sign in
                    </Text>
                  </Text>
                </Button>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
export default RegisterScreen;
