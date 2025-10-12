import { Dimensions, StyleSheet, PixelRatio } from "react-native";

const { height, width } = Dimensions.get("screen");
const { height: windowHeight, width: windowWidth } = Dimensions.get("window");

// Function để tính responsive font size với nhiều phương pháp
const getResponsiveFontSize = (baseFontSize: number) => {
    // Phương pháp 1: Dựa trên window width (more accurate for mobile)
    const widthScale = windowWidth / 375; // iPhone X standard

    // Phương pháp 2: Dựa trên PixelRatio và density
    const pixelRatio = PixelRatio.get();
    const densityScale = pixelRatio > 2 ? 1.1 : pixelRatio > 1.5 ? 1.05 : 1.0;

    // Phương pháp 3: Dựa trên aspect ratio
    const aspectRatio = windowHeight / windowWidth;
    const aspectScale = aspectRatio > 2 ? 0.9 : aspectRatio > 1.8 ? 1.0 : 1.1;

    // Kết hợp cả ba phương pháp
    let finalScale = widthScale * densityScale * aspectScale;

    // Giới hạn scale 
    const minScale = 0.8;
    const maxScale = 1.5;
    finalScale = Math.max(minScale, Math.min(maxScale, finalScale));

    const finalSize = Math.round(baseFontSize * finalScale);

    return finalSize;
};

// 🎯 GIẢI PHÁP TỰ ĐỘNG: Không cần truyền giá trị!
const AutoFontSizes = {
    // Tự động tính toán dựa trên màn hình (giảm một chút)
    get small() { return getResponsiveFontSize(10); },    // 12 -> 10
    get medium() { return getResponsiveFontSize(12); },   // 14 -> 12
    get large() { return getResponsiveFontSize(14); },    // 16 -> 14
    get xlarge() { return getResponsiveFontSize(16); },   // 18 -> 16

    // Hoặc tự động theo category (giảm một chút)
    get titleTop() { return getResponsiveFontSize(12); }, // 14 -> 12
    get iconText() { return getResponsiveFontSize(7); },  // 8 -> 7
    get description() { return getResponsiveFontSize(10); }, // 12 -> 10
}; const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#000',
        flex: 1,
    },
    video: {
        backgroundColor: '#000',
        flex: 1,
    },
    videoContainer: {
        width: '100%',
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        position: "relative",
        flex: 1,
    },
    touchArea: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    // playButton: {
    //     backgroundColor: 'rgba(0,0,0,0.5)',
    //     borderRadius: 50,
    //     width: 60,
    //     height: 60,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     marginLeft: 10,
    // },
    // RightVideo styles
    rightVideoContainer: {
        position: "absolute",
        right: 10,
        top: '50%',
        transform: [{ translateY: -120 }], // Center vertically with offset
        alignItems: "center",
        zIndex: 40, // Higher than video player controls
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
        fontSize: AutoFontSizes.small, // Tăng lên để dễ đọc hơn
        fontFamily: "TikTokSans-Bold",
        marginTop: 0,
        fontWeight: "500",
    },

    // BottomVideo styles
    bottomVideoContainer: {
        position: "absolute",
        left: 10,
        right: 80, // Leave space for right side buttons
        flexDirection: "row",
        alignItems: "flex-end",
        zIndex: 10,
        bottom: 0,
       
    },
    contentLeft: {
        flex: 1,
        marginRight: 10, // Thêm khoảng cách với music icon
    },
    title: {
        color: "#fff",
        fontSize: AutoFontSizes.large, // Tăng lên lớn hơn nữa
        marginBottom: 5,
        fontFamily: "TikTokSans-Bold",
    },
    description: {
        color: "#fff",
        fontSize: AutoFontSizes.medium, // Tăng lên cho dễ đọc
        fontFamily: "TikTokSans-Regular",
    },
    musicIcon: {
        width: 40,
        height: 40,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: "#fff",
        marginRight: 0,
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
        zIndex: 100,
        height: 50,
    },
    titleTop: {
        color: "#aaa",
        fontSize: 12,
        // fontSize: AutoFontSizes.titleTop,
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

    // TikTok-style Progress Bar và Controls
    progressContainer: {
        position: "absolute",
        bottom: 90, // Cao hơn để tránh bottom navigation
        left: 10,
        right: 10,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        zIndex: 15,
    },
    timeText: {
        color: "#fff",
        fontSize: AutoFontSizes.iconText,
        fontFamily: "TikTokSans-Regular",
        minWidth: 35,
        textAlign: "center",
    },
    progressBarContainer: {
        flex: 1,
        height: 20,
        marginHorizontal: 10,
        justifyContent: "center",
        position: "relative",
    },
    progressBarBackground: {
        height: 3,
        backgroundColor: "rgba(255,255,255,0.3)",
        borderRadius: 2,
    },
    progressBarFill: {
        position: "absolute",
        height: 3,
        backgroundColor: "#fff",
        borderRadius: 2,
    },
    progressThumb: {
        position: "absolute",
        width: 12,
        height: 12,
        backgroundColor: "#fff",
        borderRadius: 6,
        top: -4.5,
        marginLeft: -6,
    },
    speedIndicator: {
        position: "absolute",
        top: 50,
        right: 20,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: 15,
        paddingHorizontal: 8,
        paddingVertical: 4,
        zIndex: 20,
    },
    speedText: {
        color: "#fff",
        fontSize: AutoFontSizes.small,
        fontFamily: "TikTokSans-Bold",
    },


});

export default styles;
