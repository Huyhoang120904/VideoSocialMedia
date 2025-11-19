/**
 * Theme Constants for TikTok-like Video Feed
 * Supports light and dark modes
 */

import { spacing, fontSizes, iconSizes, dimensions, animations } from '../Utils/responsive';

/**
 * Color palette
 */
export const colors = {
    // Primary colors
    primary: '#FF0050',
    primaryLight: '#FF2D6A',
    primaryDark: '#E5004A',

    // Background colors
    background: {
        dark: '#000000',
        light: '#FFFFFF',
        overlay: 'rgba(0, 0, 0, 0.3)',
        overlayLight: 'rgba(0, 0, 0, 0.1)',
        overlayDark: 'rgba(0, 0, 0, 0.7)',
    },

    // Text colors
    text: {
        primary: '#FFFFFF',
        secondary: 'rgba(255, 255, 255, 0.85)',
        tertiary: 'rgba(255, 255, 255, 0.65)',
        dark: '#000000',
        darkSecondary: 'rgba(0, 0, 0, 0.7)',
    },

    // Icon colors
    icon: {
        default: '#FFFFFF',
        active: '#FF0050',
        inactive: 'rgba(255, 255, 255, 0.7)',
    },

    // Status colors
    success: '#20D489',
    warning: '#FFB800',
    error: '#FF3B30',
    info: '#007AFF',

    // Social colors
    like: '#FF2D55',
    comment: '#FFFFFF',
    share: '#FFFFFF',
    bookmark: '#FFD700',

    // Progress bar
    progressBar: {
        background: 'rgba(255, 255, 255, 0.3)',
        fill: '#FFFFFF',
        thumb: '#FFFFFF',
    },

    // Border colors
    border: {
        default: 'rgba(255, 255, 255, 0.2)',
        active: '#FFFFFF',
    },
};

/**
 * Typography system
 */
export const typography = {
    // Font families (TikTok uses custom fonts, fallback to system)
    fontFamily: {
        regular: 'TikTokSans-Regular',
        medium: 'TikTokSans-Medium',
        semiBold: 'TikTokSans-SemiBold',
        bold: 'TikTokSans-Bold',
        fallbackRegular: 'System',
        fallbackBold: 'System',
    },

    // Font sizes (from responsive.ts)
    fontSize: fontSizes,

    // Line heights
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },

    // Font weights
    fontWeight: {
        regular: '400' as const,
        medium: '500' as const,
        semiBold: '600' as const,
        bold: '700' as const,
    },
};

/**
 * Layout constants
 */
export const layout = {
    // Spacing from responsive.ts
    spacing,

    // Dimensions from responsive.ts
    dimensions,

    // Border radius
    borderRadius: {
        small: dimensions.borderRadiusSmall,
        medium: dimensions.borderRadiusMedium,
        large: dimensions.borderRadiusLarge,
        circle: dimensions.borderRadiusCircle,
    },

    // Shadows (iOS style)
    shadow: {
        small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.18,
            shadowRadius: 1.0,
            elevation: 1,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.23,
            shadowRadius: 2.62,
            elevation: 4,
        },
        large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.30,
            shadowRadius: 4.65,
            elevation: 8,
        },
    },

    // Z-index layers
    zIndex: {
        background: 0,
        content: 10,
        overlay: 20,
        controls: 30,
        interaction: 40,
        modal: 50,
        toast: 100,
    },
};

/**
 * Component-specific sizes
 */
export const componentSizes = {
    // Avatar sizes
    avatar: {
        small: dimensions.avatarSmall,
        medium: dimensions.avatarMedium,
        large: dimensions.avatarLarge,
        border: dimensions.borderWidthMedium,
    },

    // Icon sizes
    icon: iconSizes,

    // Button sizes
    button: {
        small: {
            height: 32,
            paddingHorizontal: spacing.medium,
        },
        medium: {
            height: 44,
            paddingHorizontal: spacing.large,
        },
        large: {
            height: 56,
            paddingHorizontal: spacing.xlarge,
        },
    },

    // Progress bar
    progressBar: {
        height: 3,
        thumbSize: 8, // Giảm từ 12 xuống 8 để nhỏ gọn và đẹp hơn
        touchableHeight: 30,
    },

    // Music disc
    musicDisc: {
        size: 40,
        border: 2,
    },

    // Plus icon
    plusIcon: {
        size: 24,
        containerSize: 26,
    },
};

/**
 * Animation timings
 */
export const animationTimings = {
    duration: animations,

    // Easing functions (for Animated API)
    easing: {
        linear: 'linear' as const,
        easeIn: 'ease-in' as const,
        easeOut: 'ease-out' as const,
        easeInOut: 'ease-in-out' as const,
    },

    // Spring configs (for spring animations)
    spring: {
        gentle: {
            tension: 50,
            friction: 7,
        },
        standard: {
            tension: 100,
            friction: 10,
        },
        bouncy: {
            tension: 150,
            friction: 7,
        },
    },
};

/**
 * Opacity levels
 */
export const opacity = {
    disabled: 0.3,
    inactive: 0.5,
    semiVisible: 0.7,
    mostlyVisible: 0.9,
    visible: 1.0,
};

/**
 * Theme object (can be extended for dark/light modes)
 */
export const theme = {
    colors,
    typography,
    layout,
    componentSizes,
    animationTimings,
    opacity,
};

/**
 * Dark mode theme (same as default for TikTok-like app)
 */
export const darkTheme = theme;

/**
 * Light mode theme (if needed in the future)
 */
export const lightTheme = {
    ...theme,
    colors: {
        ...theme.colors,
        background: {
            dark: '#FFFFFF',
            light: '#F5F5F5',
            overlay: 'rgba(0, 0, 0, 0.1)',
            overlayLight: 'rgba(0, 0, 0, 0.05)',
            overlayDark: 'rgba(0, 0, 0, 0.3)',
        },
        text: {
            primary: '#000000',
            secondary: 'rgba(0, 0, 0, 0.85)',
            tertiary: 'rgba(0, 0, 0, 0.65)',
            dark: '#000000',
            darkSecondary: 'rgba(0, 0, 0, 0.7)',
        },
    },
};

export default theme;
