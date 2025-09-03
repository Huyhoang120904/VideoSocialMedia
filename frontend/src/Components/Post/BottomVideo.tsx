import React from "react";
import { View, Text, Image } from "react-native";
import img from "../../../assets/avatar.png";
import styles from "./styles";
// import { useHeaderHeight } from '@react-navigation/elements';
interface BottomVideoProps {
    title: string;
}

export default function BottomVideo({ title }: BottomVideoProps) {
    const [mainTitle, description] = title.split(" - ");

    return (
        <View style={[styles.bottomVideoContainer, { bottom: 120 }]}>
            <View style={styles.contentLeft}>
                <Text style={styles.title}>{mainTitle || "Default title"}</Text>
                <Text style={styles.description}>{description || "Default description"}</Text>
            </View>
            <View>
                <Image source={img} style={styles.musicIcon} />
            </View>
        </View>
    );
}