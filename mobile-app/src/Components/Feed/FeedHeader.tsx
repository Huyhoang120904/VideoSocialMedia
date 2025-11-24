import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

interface FeedHeaderProps {
    onBack?: () => void;
    onSearchPress?: () => void;
    placeholder?: string;
}

export default function FeedHeader({
    onBack,
    onSearchPress,
    placeholder = "Search...",
}: FeedHeaderProps) {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigation.goBack();
        }
    };

    const handleSearch = () => {
        if (onSearchPress) {
            onSearchPress();
        } else {
            // Navigate to Search screen
            // @ts-ignore
            navigation.navigate("Search");
        }
    };

    return (
        <LinearGradient
            colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0)"]}
            style={[styles.container, { paddingTop: insets.top + 10 }]}
        >
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleSearch}
                style={styles.searchBar}
                activeOpacity={0.8}
            >
                <Ionicons
                    name="search"
                    size={20}
                    color="rgba(255,255,255,0.7)"
                    style={styles.searchIcon}
                />
                <Text style={styles.searchText}>{placeholder}</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 20,
        paddingHorizontal: 16,
        zIndex: 100,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
        // Removed background color for cleaner look with gradient
    },
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.15)", // More subtle glass effect
        borderRadius: 8, // Slightly less rounded for a modern look
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    searchIcon: {
        marginRight: 8,
    },
    searchText: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 14,
        fontWeight: "500",
    },
});
