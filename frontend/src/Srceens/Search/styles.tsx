import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 12,
        height: 40,
        marginRight: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        paddingVertical: 0,
    },
    clearButton: {
        padding: 4,
    },
    voiceButton: {
        padding: 8,
        marginRight: 8,
    },
    searchButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    searchButtonText: {
        color: '#FE2C55',
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        backgroundColor: '#fff',
    },
    section: {
        paddingVertical: 8,
    },
    recentSearchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    recentSearchText: {
        flex: 1,
        marginLeft: 12,
    },
    recentSearchTitle: {
        fontSize: 16,
        color: '#000',
        fontWeight: '400',
    },
    removeButton: {
        padding: 8,
    },
    showMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginHorizontal: 16,
    },
    showMoreText: {
        fontSize: 14,
        color: '#666',
        marginRight: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    refreshText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    trendingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    trendingDot: {
        width: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    trendingContent: {
        flex: 1,
        marginLeft: 16,
    },
    trendingTitle: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 20,
    },
    trendingSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    trendingImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginLeft: 12,
    },
    searchResults: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    searchResultsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default styles;