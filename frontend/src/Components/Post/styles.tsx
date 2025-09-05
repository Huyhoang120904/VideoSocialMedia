import { Dimensions, StyleSheet } from "react-native";

const { height, width } = Dimensions.get("screen");

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#000',

    },
    video: {
        backgroundColor: '#000',
    },
    videoContainer: {
        width: '100%',
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        position: "relative"
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
        bottom: 0,
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
        zIndex: 100,
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


});

export default styles;
