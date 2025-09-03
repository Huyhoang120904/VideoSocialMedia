import React from 'react';
import { Text, View } from 'react-native';

export default function Inbox() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>Hộp thư của bạn</Text>
        </View>
    );
}
