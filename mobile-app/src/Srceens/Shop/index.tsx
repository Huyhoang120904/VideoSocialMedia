import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const categories = [
  { id: 1, icon: 'receipt-outline', label: 'Đơn hàng', hasNotification: false },
  { id: 2, icon: 'pricetag-outline', label: 'Voucher', hasNotification: false },
  { id: 3, icon: 'chatbubble-ellipses-outline', label: 'Tin nhắn', hasNotification: true },
  { id: 4, icon: 'bag-check-outline', label: 'HÀNG VIỆT', hasNotification: false },
  { id: 5, icon: 'location-outline', label: 'Địa chỉ', hasNotification: false },
  { id: 6, icon: 'logo-tiktok', label: 'TikTok F', hasNotification: false },
  { id: 7, icon: 'shield-checkmark-outline', label: 'Bảo hành', hasNotification: false },
  { id: 8, icon: 'gift-outline', label: 'Ưu đãi', hasNotification: false },
];

const shortcuts = [
  { id: 1, label: 'Voucher Xtra', gradient: ['#FF6B9D', '#FF8FAB'], icon: 'pricetag' },
  { id: 2, label: 'Ưu đãi vận chuyển', gradient: ['#4FC3F7', '#81D4FA'], icon: 'car' },
  { id: 3, label: 'Mua sắm qua LIVE', gradient: ['#FF5252', '#FF8A80'], icon: 'videocam' },
  { id: 4, label: 'TikTok Shop Mall', gradient: ['#000', '#424242'], icon: 'storefront' },
  { id: 5, label: 'Hàng mới về', gradient: ['#00BCD4', '#4DD0E1'], icon: 'star' },
];

const tabs = ['Thể thao', 'Quần áo nam', 'Đồ chơi', 'Thời trang nữ', 'Điện tử'];

const products = [
  {
    id: 1,
    image: 'https://picsum.photos/200/300?random=1',
    title: 'Áo thun tay lỡ nam nữ LƯỜI...',
    price: '13.800đ',
    originalPrice: '24.900đ',
    discount: '-45%',
    rating: 4.5,
    sold: '14.0K',
  },
  {
    id: 2,
    image: 'https://picsum.photos/200/300?random=2',
    title: 'Áo Thun Nam Nữ Unisex Tay Lỡ...',
    price: '145.000đ',
    originalPrice: '199.000đ',
    discount: '-27%',
    rating: 5.0,
    sold: '11.2K',
  },
  {
    id: 3,
    image: 'https://picsum.photos/200/300?random=3',
    title: 'Áo thun oversize nam nữ...',
    price: '89.000đ',
    originalPrice: '150.000đ',
    discount: '-37%',
    rating: 4.8,
    sold: '8.5K',
  },
  {
    id: 4,
    image: 'https://picsum.photos/200/300?random=4',
    title: 'Áo sweater basic unisex...',
    price: '120.000đ',
    originalPrice: '220.000đ',
    discount: '-45%',
    rating: 4.7,
    sold: '5.3K',
  },
];

export default function ShopScreen() {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="móc khoá cute"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera-outline" size={18} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchButton}>
              <Text style={styles.searchButtonText}>Tìm kiếm</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.cartButton}>
            <Ionicons name="cart-outline" size={24} color="#000" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>1</Text>
            </View>
          </TouchableOpacity>
        </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScrollView}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryIconWrapper}>
                <Ionicons name={category.icon as any} size={22} color="#000" />
                {category.hasNotification && <View style={styles.notificationDot} />}
              </View>
              <Text style={styles.categoryLabel}>{category.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Shortcuts */}
        <View style={styles.shortcutsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.shortcutsContainer}
            contentContainerStyle={styles.shortcutsContent}
          >
            {shortcuts.map((shortcut) => (
              <TouchableOpacity key={shortcut.id} style={styles.shortcutItem}>
                <LinearGradient
                  colors={shortcut.gradient as any}
                  style={styles.shortcutIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={shortcut.icon as any} size={22} color="#fff" />
                </LinearGradient>
                <Text style={styles.shortcutLabel} numberOfLines={2}>
                  {shortcut.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.indicator}>
            <View style={styles.activeIndicator} />
            <View style={styles.inactiveIndicator} />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
          >
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tab}
                onPress={() => setActiveTab(index)}
              >
                <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>
                  {tab}
                </Text>
                {activeTab === index && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <TouchableOpacity>
              <View style={styles.productImageContainer}>
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                />
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{product.discount}</Text>
                </View>
                {/* Badges at bottom left */}
                <View style={styles.badgesContainer}>
                  {product.id === 1 && (
                    <View style={styles.extraBadge}>
                      <Text style={styles.badgeText}>XTRA</Text>
                      <Text style={styles.badgeText}>Freeship</Text>
                    </View>
                  )}
                  {product.id === 2 && (
                    <>
                      <View style={styles.extraBadge}>
                        <Text style={styles.badgeText}>XTRA</Text>
                        <Text style={styles.badgeText}>Freeship</Text>
                      </View>
                      <View style={styles.extraDiscountBadge}>
                        <Text style={styles.badgeText}>EXTRA</Text>
                        <Text style={styles.badgeText}>lên đến 14%+</Text>
                      </View>
                    </>
                  )}
                  {product.id === 3 && (
                    <View style={styles.officialBadge}>
                      <Text style={styles.badgeText}>WIND OFFICIAL</Text>
                    </View>
                  )}
                </View>
                {product.id === 2 && (
                  <View style={styles.mallBadge}>
                    <Text style={styles.mallText}>Mall</Text>
                  </View>
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={1}>
                  {product.title}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={styles.productPrice}>{product.price}</Text>
                  <Text style={styles.productOriginalPrice}>{product.originalPrice}</Text>
                </View>
                <View style={styles.productTags}>
                  <View style={styles.freeshipTag}>
                    <Ionicons name="bicycle" size={10} color="#00bfa5" />
                    <Text style={styles.tagText}>Freeship</Text>
                  </View>
                  <View style={styles.codTag}>
                    <Text style={styles.tagText}>COD</Text>
                  </View>
                </View>
              </View>
              <View style={styles.productFooter}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.ratingText}>{product.rating}</Text>
                </View>
                <Text style={styles.soldText}>Đã bán {product.sold}</Text>
              </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 35,
    paddingBottom: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 6,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#FE2C55',
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 13,
    color: '#333',
    paddingVertical: 0,
  },
  cameraButton: {
    padding: 2,
    marginRight: 2,
  },
  searchButton: {
    backgroundColor: '#FE2C55',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 18,
    marginLeft: 2,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cartButton: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FE2C55',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  categoriesScrollView: {
    backgroundColor: '#fff',
    flexGrow: 0,
    borderBottomWidth: 6,
    borderBottomColor: '#f5f5f5',
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 18,
    width: 58,
  },
  categoryIconWrapper: {
    position: 'relative',
    marginBottom: 5,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FE2C55',
  },
  categoryLabel: {
    fontSize: 10,
    color: '#000',
    textAlign: 'center',
    lineHeight: 12,
    paddingTop: 2,
  },
  shortcutsWrapper: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderBottomWidth: 6,
    borderBottomColor: '#f5f5f5',
  },
  shortcutsContainer: {
    flexGrow: 0,
  },
  shortcutsContent: {
    paddingHorizontal: 12,
  },
  shortcutItem: {
    alignItems: 'center',
    marginRight: 14,
    width: 72,
  },
  shortcutIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  shortcutLabel: {
    fontSize: 9,
    color: '#000',
    textAlign: 'center',
    lineHeight: 12,
  },
  indicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 5,
  },
  activeIndicator: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FE2C55',
  },
  inactiveIndicator: {
    width: 6,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D0D0',
  },
  tabsWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabsContainer: {
    flexGrow: 0,
  },
  tab: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    marginRight: 4,
    position: 'relative',
  },
  tabText: {
    fontSize: 15,
    color: '#999',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 3,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 3,
    paddingTop: 3,
    backgroundColor: '#f5f5f5',
  },
  productCard: {
    width: '50%',
    backgroundColor: '#fff',
    paddingBottom: 10,
    paddingHorizontal: 3,
    marginBottom: 6,
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    right: 0,
    backgroundColor: '#FE2C55',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  discountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  productInfo: {
    paddingHorizontal: 6,
    paddingTop: 8,
  },
  productTitle: {
    fontSize: 13,
    color: '#000',
    marginBottom: 4,
    lineHeight: 17,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    color: '#FE2C55',
    fontWeight: '700',
  },
  productOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    color: '#000',
    marginLeft: 2,
  },
  soldText: {
    fontSize: 11,
    color: '#999',
  },
  badgesContainer: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    gap: 2,
  },
  extraBadge: {
    backgroundColor: '#00bcd4',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
  },
  extraDiscountBadge: {
    backgroundColor: '#ff1744',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
  },
  officialBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    lineHeight: 10,
  },
  mallBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  mallText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  productTags: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  freeshipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5f3',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    gap: 2,
  },
  codTag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  tagText: {
    fontSize: 9,
    color: '#666',
    fontWeight: '500',
  },
});

