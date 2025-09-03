import React, { useState } from "react";
import { View, Image, Text, Pressable } from "react-native";
import { useDispatch } from "react-redux";
import { updateVideo } from "../../store/videoSlice";
import AntDesign from "react-native-vector-icons/AntDesign";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import img from "../../../assets/avatar.png";
import styles from "./styles";

const ICON_SIZE = 32;

interface RightVideoProps {
    id: string;
    likes: number;
    comments: number;
    shares: number;
    outstanding: number;
}

interface IconWithCountProps {
    icon: React.ReactNode;
    count: number;
    onPress?: () => void;
}

const IconWithCount: React.FC<IconWithCountProps> = ({ icon, count, onPress }) => (
    <Pressable style={styles.iconContainer} onPress={onPress}>
        {icon}
        <Text style={styles.iconText}>{count}</Text>
    </Pressable>
);

export default function RightVideo({ id, likes, comments, shares, outstanding }: RightVideoProps) {
    const dispatch = useDispatch();
    const [liked, setLiked] = useState(false);

    const handleLike = () => {
        setLiked(!liked);
        dispatch(updateVideo({ id, updates: { likes: liked ? likes - 1 : likes + 1 } }));
    };

    return (
        <View style={styles.rightVideoContainer}>
            {/* Avatar với dấu cộng */}
            <View style={styles.avatarContainer}>
                <Image style={styles.avatar} source={img} />
                <MaterialCommunityIcons
                    name="plus-circle"
                    size={26}
                    color="#ff2d55"
                    style={styles.plusIcon}
                />
            </View>

            {/* Like */}
            <IconWithCount
                icon={
                    <AntDesign
                        name="heart"
                        size={ICON_SIZE}
                        color={liked ? "#ff2d55" : "#fff"}
                    />
                }
                count={likes}
                onPress={handleLike}
            />

            {/* Comment */}
            <IconWithCount
                icon={<Ionicons name="chatbubble-ellipses" size={ICON_SIZE} color="#fff" />}
                count={comments}
            />

            {/* Outstanding (bookmark Ionicons) */}
            <IconWithCount
                icon={
                    <MaterialCommunityIcons
                        name="bookmark-multiple"
                        size={ICON_SIZE}
                        color="#fff"
                    />
                }
                count={outstanding}
            />

            {/* Share */}
            <IconWithCount
                icon={<MaterialCommunityIcons name="share-variant" style={{ marginRight: 5, marginTop: -5 }} size={ICON_SIZE} color="#fff" />}
                count={shares}
            />
        </View>
    );
}
