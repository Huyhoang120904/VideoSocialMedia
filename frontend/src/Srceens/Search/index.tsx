import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    FlatList,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles';

interface SearchSuggestion {
    id: string;
    text: string;
    type: 'recent' | 'trending' | 'suggestion';
    image?: string;
}

interface TrendingItem {
    id: string;
    title: string;
    subtitle?: string;
    image: string;
    isRed?: boolean;
}

const SearchScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(true);

    const recentSearches: SearchSuggestion[] = [
        { id: '1', text: 'tất tần tật các tổng thống mỹ', type: 'recent' },
        { id: '2', text: 'lịch sử nước Mỹ', type: 'recent' },
        { id: '3', text: 'lịch sử châu mỹ', type: 'recent' },
    ];

    const trendingSuggestions: TrendingItem[] = [
        {
            id: '1',
            title: 'valorant esports vietnam',
            image: 'https://picsum.photos/60/60?random=1',
            isRed: true
        },
        {
            id: '2',
            title: 'valorant sports',
            image: 'https://picsum.photos/60/60?random=2',
            isRed: true
        },
        {
            id: '3',
            title: 'lineup brim ascent',
            image: 'https://picsum.photos/60/60?random=3'
        },
        {
            id: '4',
            title: 'thịt ba chỉ kho',
            subtitle: 'Tìm kiếm gần đây',
            image: 'https://picsum.photos/60/60?random=4'
        },
        {
            id: '5',
            title: 'lineup brim haven',
            image: 'https://picsum.photos/60/60?random=5'
        },
        {
            id: '6',
            title: 'tổng thống mỹ',
            image: 'https://picsum.photos/60/60?random=6'
        },
        {
            id: '7',
            title: 'valorant console',
            image: 'https://picsum.photos/60/60?random=7'
        },
        {
            id: '8',
            title: 'sova lineup ascent',
            image: 'https://picsum.photos/60/60?random=8'
        },
        {
            id: '9',
            title: 'valorant chứ nhau',
            image: 'https://picsum.photos/60/60?random=9'
        },
        {
            id: '10',
            title: 'heretics valorant',
            image: 'https://picsum.photos/60/60?random=10'
        },
    ];

    const handleSearchFocus = () => {
        setShowSuggestions(true);
    };

    const handleSuggestionPress = (suggestion: string) => {
        setSearchQuery(suggestion);
        setShowSuggestions(false);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setShowSuggestions(true);
    };

    const renderRecentSearch = ({ item }: { item: SearchSuggestion }) => (
        <View style={styles.recentSearchItem}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <TouchableOpacity
                style={styles.recentSearchText}
                onPress={() => handleSuggestionPress(item.text)}
            >
                <Text style={styles.recentSearchTitle}>{item.text}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.removeButton}
            >
                <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
        </View>
    );

    const renderTrendingItem = ({ item }: { item: TrendingItem }) => (
        <TouchableOpacity
            style={styles.trendingItem}
            onPress={() => handleSuggestionPress(item.title)}
        >
            <View style={styles.trendingDot}>
                <View style={[
                    styles.dot,
                    { backgroundColor: item.isRed ? '#FF0000' : '#666' }
                ]} />
            </View>
            <View style={styles.trendingContent}>
                <Text style={[
                    styles.trendingTitle,
                    { color: item.isRed ? '#FF0000' : '#000' }
                ]}>
                    {item.title}
                </Text>
                {item.subtitle && (
                    <Text style={styles.trendingSubtitle}>{item.subtitle}</Text>
                )}
            </View>
            <Image source={{ uri: item.image }} style={styles.trendingImage} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="valorant esports vietnam"
                        placeholderTextColor="#666"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={handleSearchFocus}
                        returnKeyType="search"
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity style={styles.voiceButton}>
                    <Ionicons name="mic" size={24} color="#000" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.searchButton} >
                    <Text style={styles.searchButtonText}>Tìm kiếm</Text>
                </TouchableOpacity>
            </View>

            {showSuggestions && (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {recentSearches.length > 0 && (
                        <View style={styles.section}>
                            <FlatList
                                data={recentSearches}
                                renderItem={renderRecentSearch}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                            />

                            <TouchableOpacity style={styles.showMoreButton}>
                                <Text style={styles.showMoreText}>Xem thêm</Text>
                                <Ionicons name="chevron-down" size={16} color="#666" />
                            </TouchableOpacity>
                        </View>
                    )}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Bạn có thể thích</Text>
                            <TouchableOpacity style={styles.refreshButton}>
                                <Ionicons name="refresh" size={16} color="#666" />
                                <Text style={styles.refreshText}>Làm mới</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={trendingSuggestions}
                            renderItem={renderTrendingItem}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                        />
                    </View>
                </ScrollView>
            )}

            {!showSuggestions && (
                <View style={styles.searchResults}>
                    <Text style={styles.searchResultsText}>
                        Kết quả tìm kiếm cho: "{searchQuery}"
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
};

export default SearchScreen;