import { Dimensions, StyleSheet, PixelRatio } from "react-native";

const { height, width } = Dimensions.get("screen");
const { height: windowHeight, width: windowWidth } = Dimensions.get("window");

// Function để tính responsive font size với nhiều phương pháp
const getResponsiveFontSize = (baseFontSize: number) => {
    // Phương pháp 1: Dựa trên window width (more accurate for mobile)
    const widthScale = windowWidth / 375; // iPhone X standard

    // Phương pháp 2: Dựa trên PixelRatio và density
    const pixelRatio = PixelRatio.get();
    const densityScale = pixelRatio > 2 ? 1.0 : pixelRatio > 1.5 ? 0.95 : 0.9;

    // Phương pháp 3: Dựa trên aspect ratio
    const aspectRatio = windowHeight / windowWidth;
    const aspectScale = aspectRatio > 2 ? 0.95 : aspectRatio > 1.8 ? 1.0 : 1.05;

    // Kết hợp cả ba phương pháp
    let finalScale = widthScale * densityScale * aspectScale;

    // Giới hạn scale 
    const minScale = 0.85;
    const maxScale = 1.2;
    finalScale = Math.max(minScale, Math.min(maxScale, finalScale));

    const finalSize = Math.round(baseFontSize * finalScale);

    return finalSize;
};

// Function để tính responsive bottom position dựa trên navigation bar height
const getResponsiveBottomPosition = () => {
    // Tính toán dựa trên chiều cao màn hình thực tế
    const screenHeight = windowHeight;

    // Chiều cao navigation bar thực tế (thường là 60-80px)
    let navHeight = 60; // Base height

    // Điều chỉnh dựa trên kích thước màn hình
    if (screenHeight < 700) {
        navHeight = 50; // Màn hình nhỏ
    } else if (screenHeight > 900) {
        navHeight = 70; // Màn hình lớn - giảm từ 80 xuống 70
    } else {
        navHeight = 60; // Màn hình trung bình
    }

    // Khoảng cách nhỏ phía trên navigation bar - giảm để sát hơn
    const spacing = 2; // Giảm từ 4px xuống 2px

    // Tính bottom position
    const bottomPosition = navHeight + spacing;

    console.log(`Screen height: ${screenHeight}, Nav height: ${navHeight}, Bottom position: ${bottomPosition}`);

    return bottomPosition;
};

// 🎯 GIẢI PHÁP TỰ ĐỘNG: Không cần truyền giá trị!
const AutoFontSizes = {
    // Tự động tính toán dựa trên màn hình - optimized for TikTok-like UI
    get small() { return getResponsiveFontSize(9); },     // Icon text
    get medium() { return getResponsiveFontSize(11); },   // Description
    get large() { return getResponsiveFontSize(13); },    // Title
    get xlarge() { return getResponsiveFontSize(15); },   // Large title

    // Specific use cases
    get titleTop() { return getResponsiveFontSize(10); },
    get iconText() { return getResponsiveFontSize(8); },
    get description() { return getResponsiveFontSize(10); },
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
    rightVideoContainer: {
        position: "absolute",
        right: windowWidth > 400 ? 6 : 4, // Giảm margin để sát bên phải hơn (từ 16/8 xuống 8/4)
        bottom: getResponsiveBottomPosition(), // Dynamic bottom position - same as bottomVideoContainer
        alignItems: "center",
        zIndex: 40,
        justifyContent: "flex-end",
    },
    avatarContainer: {
        alignItems: "center",
        marginBottom: 8, // 8px spacing between avatar and heart icon
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: "#fff",
    },
    plusIcon: {
        position: "absolute",
        backgroundColor: "#fff",
        borderRadius: 12,
        bottom: -8,
        alignSelf: "center",
    },
    iconContainer: {
        alignItems: "center",
        marginBottom: 12, // Reduced spacing for tighter layout
        minWidth: 40, // Ensure consistent width
    },
    likeIconContainer: {
        alignItems: "center",
        marginTop: 12, // Increased spacing to 12px from avatarContainer
        marginBottom: 12, // Keep spacing to next icon
        minWidth: 40, // Ensure consistent width
    },
    iconText: {
        color: "#fff",
        fontSize: AutoFontSizes.small,
        fontFamily: "TikTokSans-Bold",
        marginTop: 2,
        fontWeight: "600",
        textAlign: "center",
        minWidth: 20,
    },

    // BottomVideo styles - TikTok-like positioning with responsive adjustments
    bottomVideoContainer: {
        position: "absolute",
        left: windowWidth > 400 ? 16 : 12, // Responsive left margin
        right: 80, // Tăng right margin để tránh đụng RightVideo icons (từ 16 lên 80)
        bottom: getResponsiveBottomPosition(), // Dynamic bottom position based on navigation bar height
        flexDirection: "row",
        alignItems: "flex-end",
        zIndex: 100, // Tăng từ 10 lên 100 để cao hơn centerTapArea
        elevation: 100, // For Android
    },
    contentLeft: {
        flex: 1,
        marginRight: 8, // Reduced margin to bring avatar closer
        paddingRight: 12, // Thêm padding để text không đụng icons bên phải
    },
    username: {
        color: "#fff",
        fontSize: AutoFontSizes.large,
        fontFamily: "TikTokSans-Bold",
        fontWeight: "700",
        marginBottom: 2,
    },
    title: {
        color: "#fff",
        fontSize: AutoFontSizes.large, // Tăng từ medium lên large
        marginBottom: 4,
        fontFamily: "TikTokSans-Regular",
        lineHeight: 20, // Tăng lineHeight để phù hợp với font size lớn hơn
        flexWrap: "wrap",
    },
    description: {
        color: "#fff",
        fontSize: AutoFontSizes.medium,
        fontFamily: "TikTokSans-Regular",
        opacity: 0.9,
        lineHeight: 16,
        marginBottom: 6,
    },
    seeMore: {
        color: "#fff",
        fontSize: AutoFontSizes.medium,
        fontFamily: "TikTokSans-Bold",
        opacity: 0.7,
    },
    hashtag: {
        color: "#00F5FF",
        fontSize: AutoFontSizes.medium,
        fontFamily: "TikTokSans-Bold",
        marginRight: 8,
        marginBottom: 4,
        textShadowColor: "rgba(0, 245, 255, 0.5)",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 4,
    },
    musicContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
        backgroundColor: "rgba(0,0,0,0.3)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
        maxWidth: "80%",
    },
    musicText: {
        color: "#fff",
        fontSize: AutoFontSizes.small,
        fontFamily: "TikTokSans-Regular",
        marginLeft: 4,
        opacity: 0.9,
        flex: 1,
    },
    musicIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: "#fff",
    },

    // Top video
    topVideoContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingTop: 50, // Safe area for status bar
        paddingBottom: 10,
    },
    topGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 120,
        zIndex: -1,
    },
    searchIcon: {
        position: "absolute",
        top: 55,
        right: 16,
        zIndex: 101,
        padding: 8,
    },
    tabsWrapper: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    titleTop: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 10, // Giảm xuống 10px để nhỏ hơn
        fontFamily: "TikTokSans-SemiBold",
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
        height: 2,
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
