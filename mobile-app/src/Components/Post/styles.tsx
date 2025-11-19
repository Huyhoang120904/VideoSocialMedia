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
        // bottom is calculated dynamically in the component to use the
        // actual tab bar height + safe area insets. Do not set a static
        // bottom here (it was computed at import time and caused mismatches).
        alignItems: "center",
        zIndex: 50, // Tăng zIndex để đảm bảo luôn ở trên contentLeft
        justifyContent: "flex-end",
    },
    avatarContainer: {
        alignItems: "center",
        marginBottom: 20, // Tăng từ 8px lên 16px (thêm 8px khoảng cách với heart icon)
        marginTop: -8, // Nhích avatar lên trên 8px
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 0, // Xóa outline của avatar
        borderColor: "transparent",
    },
    avatarInitial: {
        backgroundColor: "#E5E7EB",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarInitialText: {
        color: "#111827",
        fontSize: AutoFontSizes.large,
        fontFamily: "TikTokSans-Bold",
        fontWeight: "700",
    },
    plusIcon: {
        position: "absolute",
        backgroundColor: "#fff",
        borderRadius: 12,
        bottom: -12, // Di chuyển xuống dưới hơn (từ -8 xuống -12)
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
    // Note: bottom position được tính động trong component bằng useBottomTabBarHeight() + safeAreaBottom
    bottomVideoContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        zIndex: 100,
        padding: 8,
        elevation: 100, // For Android
        backgroundColor: "transparent",
    },
    contentLeft: {
        marginBottom: 20, // Khoảng cách giữa content và search bar
        paddingBottom: 8, // Remove large internal padding; search bar is absolutely positioned
        paddingRight: 70, // Tránh đè lên RightVideo (khoảng 60-70px cho icons bên phải)
        backgroundColor: "transparent",
        borderRadius: 4,
        maxWidth: "100%", // Giới hạn width tối đa để tránh đè lên RightVideo
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
        flexWrap: "wrap", // Đảm bảo text wrap đúng cách
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
    searchBarContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 101,
        backgroundColor: "transparent",
        paddingTop: 8, // Khoảng cách phía trên search bar
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(32,32,32,0.85)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 0,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    searchText: {
        color: "#fff",
        fontSize: AutoFontSizes.medium,
        fontFamily: "TikTokSans-Regular",
        flex: 1,
        opacity: 0.9,
    },
    musicContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        backgroundColor: "rgba(24,24,24,0.9)",
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 999,
        alignSelf: "flex-start",
        maxWidth: "90%",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
    },
    musicText: {
        color: "#fff",
        fontSize: AutoFontSizes.small,
        fontFamily: "TikTokSans-Medium",
        marginLeft: 2,
        marginRight: 6,
        opacity: 0.92,
        flex: 1,
    },
    musicIcon: {
        width: 40,
        height: 40,
        borderRadius: 100,
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
        paddingBottom: 12,
    },
    topGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 140,
        zIndex: -1,
    },
    liveButton: {
        position: "absolute",
        left: 8,
        top: 50,
        padding: 8,
        zIndex: 101,
    },
    searchButtonContainer: {
        position: "absolute",
        right: 8,
        top: 50,
        alignItems: "center",
        zIndex: 101,
    },
    searchButton: {
        padding: 8,
    },
    imageCounter: {
        marginTop: 4,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        minWidth: 40,
        alignItems: "center",
    },
    imageCounterText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "600",
        fontFamily: "TikTokSans-Medium",
        letterSpacing: 0.3,
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
        paddingHorizontal: 12,
    },
    tabsContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
    },
    tabButton: {
        paddingHorizontal: 6,
        paddingVertical: 6,
    },
    titleTop: {
        color: "rgba(255,255,255,0.65)",
        fontSize: 10,
        fontFamily: "TikTokSans-Medium",
        paddingHorizontal: 0,
        paddingVertical: 4,
        letterSpacing: -0.5,
    },
    titleTopActive: {
        fontWeight: "700",
        color: "#fff",
        fontSize: 10,
        fontFamily: "TikTokSans-Bold",
    },
    underline: {
        position: "absolute",
        bottom: 4,
        height: 3,
        backgroundColor: "#fff",
        borderRadius: 100,
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 3,
        elevation: 4,
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
