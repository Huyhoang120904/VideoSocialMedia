import { Dimensions, StyleSheet } from "react-native";

const { height, width } = Dimensions.get("screen");

const styles = StyleSheet.create({
    container: {
        width,
        backgroundColor: "black",
        position: "relative",
    },
    video: {
        ...StyleSheet.absoluteFillObject,
    },
    touchArea: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
    },

    // RightVideo styles
    rightVideoContainer: {
        position: "absolute",
        right: 10,
        top: 410,
        alignItems: "center",
        zIndex: 10,
    },
    avatarContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 30,
        borderColor: "#fff",
        marginBottom: 5,
    },
    plusIcon: {
        position: "absolute",
        top: 37,
        backgroundColor: "#fff",
        borderRadius: 30,
    },
    iconContainer: {
        alignItems: "center",
        marginBottom: 15,
    },
    iconText: {
        color: "#fff",
        fontSize: 8,
        fontFamily: "TikTokSans-Bold",
        marginTop: 0,
        fontWeight: "500",
    },

    // BottomVideo styles
    bottomVideoContainer: {
        position: "absolute",
        left: 10,
        right: 10,
        flexDirection: "row",
        alignItems: "flex-end",
        zIndex: 10,
    },
    contentLeft: {
        flex: 1,
    },
    title: {
        color: "#fff",
        fontSize: 12,
        marginBottom: 5,
        fontFamily: "TikTokSans-Bold",
    },
    description: {
        color: "#fff",
        fontSize: 12,
        fontFamily: "TikTokSans-Regular",
    },
    musicIcon: {
        width: 40,
        height: 40,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: "#fff",
        marginRight: 5,
    },

    // Top video
    topVideoContainer: {
        position: "absolute",
        top: 40,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
        height: 50,
    },
    titleTop: {
        color: "#aaa",
        fontSize: 8,
        fontFamily: "TikTokSans-Regular",
        paddingHorizontal: 0,
        paddingVertical: 6,
    },
    underlineTopVideo: {
        position: "absolute",
        bottom: 0,
        width: 40,
        height: 3,
        backgroundColor: "#fff",
        borderRadius: 2,
    },

    // Progress Bar Styles - Tối ưu vùng touch
    progressContainer: {
        position: "absolute",
        left: 10,
        right: 10,
        height: 70,
        justifyContent: "flex-end",
        zIndex: 1000,
    },
    timeContainer: {
        alignSelf: "flex-end",
        marginBottom: 10,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    timeText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },

    // Vùng touch lớn (60px height) nhưng thanh progress nhỏ
    progressTouchArea: {
        height: 60, // Vùng touch lớn
        justifyContent: "center",
        width: "100%",
        // backgroundColor: 'rgba(255,0,0,0.1)', // Debug - uncomment để thấy vùng touch
    },

    // Thanh progress thực tế nhỏ, nằm giữa vùng touch
    progressTrack: {
        height: 3, // Thanh progress nhỏ
        justifyContent: "center",
        position: "relative",
        width: "100%",
    },
    progressBackground: {
        height: 3,
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        borderRadius: 1.5,
        width: "100%",
    },
    progressForeground: {
        height: 3,
        backgroundColor: "#fff",
        borderRadius: 1.5,
        position: "absolute",
        top: 0,
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 3,
        elevation: 4,
    },
    progressThumb: {
        position: "absolute",
        top: -5.5, // Center với thanh progress 3px: (3-14)/2 = -5.5
        width: 14,
        height: 14,
        backgroundColor: "#fff",
        borderRadius: 7,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 8,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.9)",
    },
});

export default styles;
