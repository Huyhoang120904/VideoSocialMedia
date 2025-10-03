import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("screen");

export default StyleSheet.create({

    flatList: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        width,
        height,
    },
    videoContainer: {
        width,
        height,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
    },
    retryText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '600',
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    }
});