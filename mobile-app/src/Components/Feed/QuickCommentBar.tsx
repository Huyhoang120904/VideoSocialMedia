import React, { useState } from "react";
import {
    Image,
    Keyboard,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GifPicker from "../Comment/GifPicker";

interface QuickCommentBarProps {
    onSendComment: (text: string) => void;
    onSendGif?: (gifUrl: string) => void;
    onPressInput?: () => void;
    placeholder?: string;
    avatarUrl?: string;
}

export default function QuickCommentBar({
    onSendComment,
    onSendGif,
    onPressInput,
    placeholder = "Thêm bình luận...",
    avatarUrl,
}: QuickCommentBarProps) {
    const [text, setText] = useState("");
    const [gifPickerVisible, setGifPickerVisible] = useState(false);
    const insets = useSafeAreaInsets();

    const handleSend = () => {
        if (text.trim().length === 0) return;
        onSendComment(text);
        setText("");
        Keyboard.dismiss();
    };

    return (
        <View
            style={[
                styles.container,
                { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
        >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
                {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Ionicons name="person" size={16} color="#999" />
                    </View>
                )}
            </View>

            {/* Input Field */}
            <TouchableOpacity
                style={styles.inputContainer}
                onPress={onPressInput}
                activeOpacity={1}
            >
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#999"
                    value={text}
                    onChangeText={setText}
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                    editable={!onPressInput}
                />

                {/* Icons inside input */}
                <View style={styles.inputIcons}>
                    <TouchableOpacity onPress={() => onSendComment("😍")} style={styles.iconButton}>
                        <Text style={{ fontSize: 16 }}>😍</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onSendComment("🔥")} style={styles.iconButton}>
                        <Text style={{ fontSize: 16 }}>🔥</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onSendComment("😂")} style={styles.iconButton}>
                        <Text style={{ fontSize: 16 }}>😂</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.iconButton, styles.gifButton]}
                        onPress={() => setGifPickerVisible(true)}
                    >
                        <Text style={styles.gifButtonText}>GIF</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>

            {/* Send Button */}
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                <Ionicons name="send" size={24} color={text.trim().length > 0 ? "#EC4899" : "#666"} />
            </TouchableOpacity>

            <GifPicker
                visible={gifPickerVisible}
                onClose={() => setGifPickerVisible(false)}
                onSelect={(gifUrl) => {
                    setGifPickerVisible(false);
                    onSendGif?.(gifUrl);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "rgba(0, 0, 0, 0.85)", // Semi-transparent background
        paddingTop: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        borderTopWidth: 0, // Remove border for cleaner look
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#333",
    },
    avatarPlaceholder: {
        justifyContent: "center",
        alignItems: "center",
    },
    inputContainer: {
        flex: 1,
        backgroundColor: "#1F2937", // Dark gray for input background
        borderRadius: 20,
        paddingLeft: 16,
        paddingRight: 8,
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    input: {
        flex: 1,
        color: "#fff",
        fontSize: 12,
        padding: 0,
        height: "100%",
    },
    inputIcons: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconButton: {
        padding: 4,
        marginLeft: 4,
    },
    gifButton: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#fff",
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    gifButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    sendButton: {
        marginLeft: 12,
        padding: 4,
    },
});
