import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, ShoppingCart, X } from 'lucide-react-native';
import ProductCard from '../../components/ProductCard';

interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  imageUrl: string;
}

const ALL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Buket Matahari Ceria',
    price: 'Rp 165.000',
    category: 'Bunga',
    imageUrl:
      'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    name: 'Buket Bunga Pink',
    price: 'Rp 175.000',
    category: 'Bunga',
    imageUrl:
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    name: 'Buket Daisy Putih',
    price: 'Rp 150.000',
    category: 'Bunga',
    imageUrl:
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    name: 'Buket Uang Biru Elegan',
    price: 'Rp 350.000',
    category: 'Uang',
    imageUrl:
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    name: 'Buket Uang & Mawar Pink',
    price: 'Rp 500.000',
    category: 'Uang',
    imageUrl:
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 6,
    name: 'Buket Snack Sweet Pink',
    price: 'Rp 120.000',
    category: 'Snack',
    imageUrl:
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 7,
    name: 'Buket Cokelat Premium',
    price: 'Rp 185.000',
    category: 'Snack',
    imageUrl:
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 8,
    name: 'Buket Boneka Loopy Pink',
    price: 'Rp 210.000',
    category: 'Boneka',
    imageUrl:
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 9,
    name: 'Buket Boneka LinaBell',
    price: 'Rp 225.000',
    category: 'Boneka',
    imageUrl:
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
  },
];

const CATEGORIES = ['Semua', 'Bunga', 'Uang', 'Snack', 'Boneka'];

export default function Katalog() {
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = ALL_PRODUCTS.filter((product) => {
    const matchesCategory =
      activeCategory === 'Semua' ||
      product.category === activeCategory;

    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim());

    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFF8F0"
      />

      {/* Header Toko */}
      <View style={styles.storeHeader}>
        <Text style={styles.brandTitle}>ra_scrafts.id</Text>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/user/keranjang')}
        >
          <ShoppingCart
            size={20}
            color="#A83F68"
            strokeWidth={1.8}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Intro */}
        <View style={styles.introContainer}>
          <Text style={styles.headline}>
            Untuk setiap rasa.
          </Text>

          <Text style={styles.subheadline}>
            Buket penuh makna, untuk mereka yang istimewa.
          </Text>
        </View>

        {/* Pencarian */}
        <View style={styles.searchContainer}>
          <Search
            size={19}
            color="#A83F68"
            strokeWidth={1.8}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Cari buket impianmu..."
            placeholderTextColor="#A83F6899"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {searchQuery !== '' && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
            >
              <X size={16} color="#A83F68" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Kategori */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;

            return (
              <TouchableOpacity
                key={category}
                onPress={() => setActiveCategory(category)}
                style={[
                  styles.categoryChip,
                  isActive && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Grid Produk menggunakan ProductCard */}
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <ProductCard
              name={item.name}
              price={item.price}
              imageUrl={item.imageUrl}
              onPress={() =>
                router.push({
                  pathname: '/user/DetailProduk',
                  params: {
                    name: item.name,
                    price: item.price,
                    imageUrl: item.imageUrl,
                  },
                })
              }
            />
          )}
          ListEmptyComponent={
            <Text style={styles.boutiqueNote}>
              Produk tidak ditemukan.
            </Text>
          }
        />

        <Text style={styles.boutiqueNote}>
          Dirangkai dengan hati, diberikan dengan cinta.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  storeHeader: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTitle: {
    fontWeight: '600',
    fontSize: 27,
    color: '#A83F68',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EBCBD3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  introContainer: {
    marginTop: 4,
    marginBottom: 12,
  },
  headline: {
    fontSize: 27,
    color: '#A83F68',
  },
  subheadline: {
    fontSize: 11,
    color: '#A83F68',
    marginTop: 2,
  },
  searchContainer: {
    height: 48,
    backgroundColor: '#FFFCF8',
    borderWidth: 1,
    borderColor: '#EBCBD3',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#A83F68',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingVertical: 6,
    gap: 6,
    marginBottom: 14,
  },
  categoryChip: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E8A6BD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#E8A6BD',
  },
  categoryText: {
    fontSize: 12,
    color: '#A83F68',
  },
  categoryTextActive: {
    fontWeight: '600',
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  boutiqueNote: {
    fontSize: 9,
    color: '#A83F68',
    textAlign: 'center',
    marginTop: 20,
  },
});
