
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { useRouter, useFocusEffect } from 'expo-router';
import { Search, ShoppingCart, X } from 'lucide-react-native';
import ProductCard from '../../components/ProductCard';
import { supabase } from '../../../lib/supabase';

const VARIANT_TABLE = 'product_variants';

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  imageUrl: string;
}

interface SupabaseProduct {
  id: string | number;
  title: string;
  category: string;
  photo: string | null;
  description: string | null;
  price: number | string | null;
  stock: number | null;
}

interface SupabaseVariant {
  product_id: string | number;
  size_name: string;
  price: number | string;
  stock: number;
}

const CATEGORIES = ['Semua', 'Bunga', 'Uang', 'Snack', 'Boneka'];

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80';

const formatRupiah = (value: number) => {
  return `Rp ${value.toLocaleString('id-ID')}`;
};

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function Katalog() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      // 1. Ambil produk dari tabel produk
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id, title, category, photo, description, price, stock')
        .order('id', { ascending: false });

      if (productError) {
        throw productError;
      }

      const rows = (productData ?? []) as SupabaseProduct[];

      // Jika belum ada produk, tidak perlu mengambil varian
      if (rows.length === 0) {
        setProducts([]);
        return;
      }

      // 2. Ambil semua varian harga produk
      const { data: variantData, error: variantError } = await supabase
        .from(VARIANT_TABLE)
        .select('product_id, size_name, price, stock');

      if (variantError) {
        throw variantError;
      }

      const variants = (variantData ?? []) as SupabaseVariant[];

      // 3. Gabungkan produk dengan harga varian termurah
      const formattedProducts: Product[] = rows.map((item) => {
        const productVariants = variants.filter(
          (variant) => String(variant.product_id) === String(item.id)
        );

        const variantPrices = productVariants
          .map((variant) => toNumber(variant.price))
          .filter((price) => price > 0);

        const basePrice = toNumber(item.price);

        const lowestPrice =
          variantPrices.length > 0
            ? Math.min(...variantPrices)
            : basePrice;

        return {
          id: String(item.id),
          name: item.title,
          price:
            lowestPrice > 0
              ? formatRupiah(lowestPrice)
              : 'Harga belum tersedia',
          category: item.category,
          imageUrl: item.photo || FALLBACK_IMAGE,
        };
      });

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Gagal mengambil produk:', error);

      setErrorMessage(
        'Produk gagal dimuat. Periksa nama tabel, kolom database, dan koneksi Supabase.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Muat produk saat halaman pertama kali dibuka
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Muat ulang ketika pengguna kembali ke halaman katalog
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === 'Semua' ||
      product.category.toLowerCase() === activeCategory.toLowerCase();

    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim());

    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

      {/* Header Toko */}
      <View style={styles.storeHeader}>
        <Text style={styles.brandTitle}>ra_scrafts.id</Text>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/user/keranjang')}
        >
          <ShoppingCart size={20} color="#A83F68" strokeWidth={1.8} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Intro */}
        <View style={styles.introContainer}>
          <Text style={styles.headline}>Untuk setiap rasa.</Text>
          <Text style={styles.subheadline}>
            Buket penuh makna, untuk mereka yang istimewa.
          </Text>
        </View>

        {/* Pencarian */}
        <View style={styles.searchContainer}>
          <Search size={19} color="#A83F68" strokeWidth={1.8} />

          <TextInput
            style={styles.searchInput}
            placeholder="Cari buket impianmu..."
            placeholderTextColor="#A83F6899"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
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

        {/* Daftar Produk dari Supabase */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A83F68" />
            <Text style={styles.statusText}>Memuat katalog...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.statusText}>{errorMessage}</Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchProducts}
            >
              <Text style={styles.retryText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
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
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      imageUrl: item.imageUrl,
                      category: item.category,
                    },
                  })
                }
              />
            )}
            ListEmptyComponent={
              <Text style={styles.boutiqueNote}>
                {products.length === 0
                  ? 'Belum ada produk yang tersedia.'
                  : 'Produk tidak ditemukan.'}
              </Text>
            }
          />
        )}

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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 35,
    gap: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#A83F68',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#E8A6BD',
    borderRadius: 10,
  },
  retryText: {
    color: '#71304A',
    fontSize: 12,
    fontWeight: '600',
  },
  boutiqueNote: {
    fontSize: 9,
    color: '#A83F68',
    textAlign: 'center',
    marginTop: 20,
  },
});
