import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, Pressable, Dimensions, StyleSheet } from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import RightVideo from "./RightVideo";
import BottomVideo from "./BottomVideo";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import styles from "./styles";
const { height: screenHeight, width } = Dimensions.get("window");
import { Slider } from 'react-native-elements';

// Định nghĩa kiểu dữ liệu video
interface VideoData {
    id: string;
    uri: string;
    title: string;
    likes: number;
    comments: number;
    outstanding: number;
    shares: number;
}

// Props nhận vào cho component Post
interface PostProps {
    video: VideoData;
    isActive: boolean; // Kiểm tra xem video có đang active (được hiển thị) hay không
    itemHeight?: number; // Chiều cao của video item, mặc định bằng chiều cao màn hình
}

export default function Post({ video, isActive, itemHeight = screenHeight }: PostProps) {
    const videoRef = useRef<Video>(null); // Tham chiếu tới component Video
    const [isPlaying, setIsPlaying] = useState(false); // Trạng thái đang phát video
    const [isBuffering, setIsBuffering] = useState(true); // Trạng thái đang tải video
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [isSeeking, setIsSeeking] = useState(false)

    // Tính chiều cao video chính xác
    const videoHeight = itemHeight - useBottomTabBarHeight(); // Chiều cao thực tế của video

    // Reset trạng thái video khi thay đổi video hoặc video không còn active
    useEffect(() => {
        if (!isActive) {
            setIsPlaying(false);
            setIsBuffering(true);
            videoRef.current?.pauseAsync().catch(() => { });
        }
    }, [isActive, video.uri]);

    // Cập nhật trạng thái playback
    const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setIsBuffering(false);
            setIsPlaying(status.isPlaying);

            // Tự động lặp lại video khi kết thúc
            if (status.didJustFinish && isActive) {
                videoRef.current?.replayAsync().catch(() => { });
            }
        } else {
            setIsBuffering(true);
            setIsPlaying(false);
        }
    }, [isActive]);

    // Bật/Tắt video khi nhấn vào overlay
    const handleTogglePlay = useCallback(async () => {
        if (!videoRef.current) return;

        try {
            if (isPlaying) {
                await videoRef.current.pauseAsync();
            } else {
                await videoRef.current.playAsync();
            }
        } catch (error) {
            console.log("Toggle play error:", error);
        }
    }, [isPlaying]);

    return (
        <View style={[styles.container, { height: itemHeight }]}>
            {/* Container video với chiều cao chính xác */}
            <View style={[styles.videoContainer, { height: videoHeight }]}>
                <Video
                    ref={videoRef}
                    style={[styles.video, { height: videoHeight, width }]}
                    source={{ uri: video.uri }}
                    shouldPlay={isActive} // Chỉ phát khi item active
                    isLooping={true} // Lặp video
                    resizeMode={ResizeMode.COVER} // Hiển thị video theo tỉ lệ, giống TikTok
                    isMuted={false}
                    onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                    useNativeControls={false} // Không hiển thị controls mặc định
                    onError={(error) => console.log("Video error:", error)}
                />

                {/* Overlay để Play/Pause video */}
                <Pressable style={styles.overlay} onPress={handleTogglePlay}>
                    {(!isPlaying || isBuffering) && (
                        <View style={{}}>
                            {isBuffering ? (
                                <FontAwesome6 name="spinner" size={50} color="#fff" />
                            ) : (
                                <FontAwesome6 name="play" size={50} color="#fff" />
                            )}
                        </View>
                    )}
                </Pressable>
            </View>

            {/* Các nút tương tác ở bên phải */}
            <RightVideo
                id={video.id}
                likes={video.likes}
                comments={video.comments}
                shares={video.shares}
                outstanding={video.outstanding}
            />

            {/* Thông tin video ở dưới */}
            <BottomVideo title={video.title} />
        </View>
    );
}
