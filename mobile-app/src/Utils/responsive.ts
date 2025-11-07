/**
 * Responsive Utilities for TikTok-like Video Feed
 * Automatically scales dimensions, fonts, and spacing based on screen size
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 12/13 - 390 x 844)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/**
 * Scale a value based on screen width
 * @param size Base size
 * @returns Scaled size
 */
export const scaleWidth = (size: number): number => {
    return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scale a value based on screen height
 * @param size Base size
 * @returns Scaled size
 */
export const scaleHeight = (size: number): number => {
    return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Scale font size based on screen size and pixel density
 * Uses a moderate scale factor to avoid text being too large on big screens
 * @param size Base font size
 * @returns Scaled font size
 */
export const scaleFontSize = (size: number): number => {
    const scale = SCREEN_WIDTH / BASE_WIDTH;
    const newSize = size * scale;

    // Use PixelRatio.roundToNearestPixel to ensure sharp text rendering
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Moderate scale - scales less aggressively than scaleWidth
 * Good for paddings, margins, and icon sizes
 * @param size Base size
 * @param factor Scale factor (0-1, default 0.5)
 * @returns Moderately scaled size
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
    const scale = scaleWidth(size);
    return size + (scale - size) * factor;
};

/**
 * Get responsive spacing (margins, paddings)
 */
export const spacing = {
    tiny: moderateScale(4),
    small: moderateScale(8),
    medium: moderateScale(12),
    large: moderateScale(16),
    xlarge: moderateScale(24),
    xxlarge: moderateScale(32),
    xxxlarge: moderateScale(48),
};

/**
 * Get responsive font sizes
 */
export const fontSizes = {
    tiny: scaleFontSize(10),
    small: scaleFontSize(12),
    medium: scaleFontSize(14),
    large: scaleFontSize(16),
    xlarge: scaleFontSize(18),
    xxlarge: scaleFontSize(24),
    xxxlarge: scaleFontSize(32),
};

/**
 * Get responsive icon sizes
 */
export const iconSizes = {
    tiny: moderateScale(16),
    small: moderateScale(20),
    medium: moderateScale(24),
    large: moderateScale(32),
    xlarge: moderateScale(40),
    xxlarge: moderateScale(48),
};

/**
 * Get bottom tab bar height based on screen size and platform
 */
export const getTabBarHeight = (): number => {
    if (Platform.OS === 'ios') {
        // iOS has taller tab bars, especially on newer devices with home indicator
        return SCREEN_HEIGHT > 800 ? 90 : 80;
    }
    // Android
    return SCREEN_HEIGHT > 800 ? 70 : 60;
};

/**
 * Get safe area insets estimation (use with react-native-safe-area-context for accuracy)
 */
export const getSafeAreaInsets = () => {
    // These are estimates - use useSafeAreaInsets() hook in components for accuracy
    const isIPhoneX = Platform.OS === 'ios' && SCREEN_HEIGHT >= 812;

    return {
        top: isIPhoneX ? 44 : 20,
        bottom: isIPhoneX ? 34 : 0,
        left: 0,
        right: 0,
    };
};

/**
 * Calculate dynamic bottom position for interaction bar and user info
 * Accounts for tab bar height and safe area
 */
export const getBottomPosition = (): number => {
    const tabBarHeight = getTabBarHeight();
    const safeArea = getSafeAreaInsets();
    return tabBarHeight + spacing.small;
};

/**
 * Get device type
 */
export const getDeviceType = (): 'small' | 'medium' | 'large' => {
    if (SCREEN_WIDTH < 375) return 'small';
    if (SCREEN_WIDTH < 430) return 'medium';
    return 'large';
};

/**
 * Check if device has notch/dynamic island
 */
export const hasNotch = (): boolean => {
    return Platform.OS === 'ios' && SCREEN_HEIGHT >= 812;
};

/**
 * Get responsive dimensions for common UI elements
 */
export const dimensions = {
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,

    // Video dimensions (9:16 aspect ratio)
    videoWidth: SCREEN_WIDTH,
    videoHeight: SCREEN_HEIGHT,

    // Avatar sizes
    avatarSmall: moderateScale(32),
    avatarMedium: moderateScale(48),
    avatarLarge: moderateScale(64),

    // Icon container sizes
    iconContainer: moderateScale(48),

    // Border radius
    borderRadiusSmall: moderateScale(8),
    borderRadiusMedium: moderateScale(12),
    borderRadiusLarge: moderateScale(16),
    borderRadiusCircle: 999,

    // Border width
    borderWidthThin: 1,
    borderWidthMedium: 2,
    borderWidthThick: 3,
};

/**
 * Animation duration constants
 */
export const animations = {
    fast: 150,
    normal: 250,
    slow: 400,
    verySlow: 600,
};

export default {
    scaleWidth,
    scaleHeight,
    scaleFontSize,
    moderateScale,
    spacing,
    fontSizes,
    iconSizes,
    dimensions,
    animations,
    getTabBarHeight,
    getBottomPosition,
    getDeviceType,
    hasNotch,
    getSafeAreaInsets,
};
