
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
} from 'lucide-react-native';

import { supabase } from '../../../lib/supabase';
import CustomButton from '../../components/CustomButton';

const CART_STORAGE_KEY = '@ra_scrafts_cart';

type ProductVariant = {
  id: string | number;
  product_id: string;
  size_name: string;
  price: number | string;
  stock: number | string;
};

export default function DetailProduk() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    price?: string;
    imageUrl?: string;
  }>();

  // ID produk dipertahankan sebagai string karena dapat berupa UUID.
  const productId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const name = Array.isArray(params.name)
    ? params.name[0]
    : params.name;

  const imageUrl = Array.isArray(params.imageUrl)
    ? params.imageUrl[0]
    : params.imageUrl;

  const [productDescription, setProductDescription] = useState('');
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [selectedSize, setSelectedSize] = useState('S');
  const [quantity, setQuantity] = useState(1);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const displayName = name || 'Buket Mawar Premium';

  const displayImage =
    imageUrl ||
    'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80';

  // Mengambil deskripsi dan varian langsung dari Supabase.
  useEffect(() => {
    let isMounted = true;

    const fetchProductDetail = async () => {
      setLoadingProduct(true);

      try {
        if (!productId) {
          throw new Error('ID produk tidak ditemukan.');
        }

        // Ambil deskripsi produk.
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('description')
          .eq('id', productId)
          .single();

        if (productError) throw productError;

        // Ambil harga dan stok untuk setiap ukuran.
        const { data: variants, error: variantsError } = await supabase
          .from('product_variants')
          .select('id, product_id, size_name, price, stock')
          .eq('product_id', productId);

        if (variantsError) throw variantsError;

        if (!isMounted) return;

        const availableVariants: ProductVariant[] = (variants ?? [])
          .filter((variant) => variant.size_name)
          .sort((a, b) => {
            const order = ['S', 'M', 'L', 'XL', 'XXL'];
            const indexA = order.indexOf(
              String(a.size_name).trim().toUpperCase()
            );
            const indexB = order.indexOf(
              String(b.size_name).trim().toUpperCase()
            );

            return (
              (indexA === -1 ? 999 : indexA) -
              (indexB === -1 ? 999 : indexB)
            );
          });

        setProductDescription(product?.description ?? '');
        setProductVariants(availableVariants);

        // Pilih S jika tersedia, jika tidak pilih varian pertama.
        const initialVariant =
          availableVariants.find(
            (variant) =>
              String(variant.size_name).trim().toUpperCase() === 'S'
          ) ?? availableVariants[0];

        if (initialVariant) {
          setSelectedSize(initialVariant.size_name);
        }

        setQuantity(1);
      } catch (error) {
        console.error('Gagal mengambil detail produk:', error);

        if (isMounted) {
          Alert.alert(
            'Gagal Memuat Produk',
            'Data produk tidak berhasil diambil. Periksa ID produk dan koneksi Supabase.'
          );
        }
      } finally {
        if (isMounted) {
          setLoadingProduct(false);
        }
      }
    };

    fetchProductDetail();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Mencari harga dan stok berdasarkan ukuran yang dipilih.
  const selectedVariant = productVariants.find(
    (variant) =>
      String(variant.size_name).trim().toUpperCase() ===
      selectedSize.trim().toUpperCase()
  );

  // Hanya gunakan harga dari varian database, bukan harga dari parameter katalog.
  const numericPrice = Number(selectedVariant?.price ?? 0);
  const selectedStock = Math.max(
    0,
    Number(selectedVariant?.stock ?? 0)
  );

  const sizes = productVariants.length
    ? productVariants.map((variant) => variant.size_name)
    : ['S', 'M', 'L', 'XL'];

  const formatPrice = (value: number) =>
    `Rp ${value.toLocaleString('id-ID')}`;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/user/Katalog');
    }
  };

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    setQuantity(1);
  };

  const canOrder =
    !loadingProduct &&
    !!selectedVariant &&
    selectedStock > 0 &&
    numericPrice >= 0;

  const handleAddToCart = async () => {
    if (!canOrder || !selectedVariant) {
      Alert.alert(
        'Produk Tidak Tersedia',
        'Ukuran ini belum tersedia atau stoknya habis.'
      );
      return;
    }

    if (quantity > selectedStock) {
      Alert.alert(
        'Stok Tidak Cukup',
        `Stok ukuran ${selectedSize} hanya ${selectedStock}.`
      );
      return;
    }

    try {
      const newItem = {
        id: productId,
        variantId: selectedVariant.id,
        name: displayName,
        variant: `${selectedSize} · ra_scrafts`,
        price: numericPrice,
        quantity,
        image: displayImage,
        selected: true,
      };

      const existingCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      const cartArray = existingCart ? JSON.parse(existingCart) : [];

      const existingIndex = cartArray.findIndex(
        (item: any) =>
          String(item.id) === String(newItem.id) &&
          String(item.variant).toUpperCase() ===
            newItem.variant.toUpperCase()
      );

      if (existingIndex > -1) {
        const nextQuantity =
          Number(cartArray[existingIndex].quantity) + quantity;

        if (nextQuantity > selectedStock) {
          Alert.alert(
            'Stok Tidak Cukup',
            `Total stok ukuran ${selectedSize} yang tersedia adalah ${selectedStock}.`
          );
          return;
        }

        cartArray[existingIndex].quantity = nextQuantity;
        cartArray[existingIndex].price = numericPrice;
        cartArray[existingIndex].variantId = selectedVariant.id;
      } else {
        cartArray.push(newItem);
      }

      await AsyncStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartArray)
      );

      Alert.alert(
        'Berhasil',
        'Produk berhasil dimasukkan ke keranjang!',
        [
          {
            text: 'Lihat Keranjang',
            onPress: () => router.push('/user/keranjang'),
          },
          { text: 'Lanjut Belanja', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Gagal tambah ke keranjang:', error);
      Alert.alert(
        'Kesalahan',
        'Gagal menyimpan produk ke keranjang.'
      );
    }
  };

  const handleBuyNow = () => {
    if (!canOrder || !selectedVariant) {
      Alert.alert(
        'Produk Tidak Tersedia',
        'Ukuran ini belum tersedia atau stoknya habis.'
      );
      return;
    }

    if (quantity > selectedStock) {
      Alert.alert(
        'Stok Tidak Cukup',
        `Stok ukuran ${selectedSize} hanya ${selectedStock}.`
      );
      return;
    }

    const singleCheckoutItem = [
      {
        id: productId,
        variantId: selectedVariant.id,
        name: displayName,
        variant: `${selectedSize} · ra_scrafts`,
        price: numericPrice,
        quantity,
        image: displayImage,
        selected: true,
      },
    ];

    router.push({
      pathname: '/user/checkout',
      params: {
        cartItems: JSON.stringify(singleCheckoutItem),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFF8F0"
      />

      {/* Header Detail Produk */}
      <View style={styles.detailHeader}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={handleBack}
        >
          <ArrowLeft size={20} color="#A83F68" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Detail Produk</Text>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push('/user/keranjang')}
        >
          <ShoppingCart size={20} color="#A83F68" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Foto Produk */}
        <Image
          source={{ uri: displayImage }}
          style={styles.largeProductImage}
          resizeMode="cover"
        />

        {/* Nama dan Harga */}
        <Text style={styles.productTitle}>
          {displayName}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>
            {loadingProduct
              ? 'Memuat harga...'
              : selectedVariant
                ? formatPrice(numericPrice)
                : 'Harga tidak tersedia'}
          </Text>

          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>
              Stok tersedia: {loadingProduct ? '...' : selectedStock}
            </Text>
          </View>
        </View>

        {/* Deskripsi dari database */}
        <Text style={styles.descriptionText}>
          {loadingProduct
            ? 'Memuat deskripsi produk...'
            : productDescription || 'Belum ada deskripsi produk.'}
        </Text>

        {/* Pilihan Ukuran */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Ukuran</Text>

          <View style={styles.sizeGroup}>
            {sizes.map((size) => {
              const isActive =
                selectedSize.toUpperCase() === size.toUpperCase();

              const variant = productVariants.find(
                (item) =>
                  item.size_name.trim().toUpperCase() ===
                  size.trim().toUpperCase()
              );

              const outOfStock =
                !variant || Number(variant.stock) <= 0;

              return (
                <TouchableOpacity
                  key={size}
                  onPress={() => handleSelectSize(size)}
                  disabled={loadingProduct}
                  style={[
                    styles.sizeChip,
                    isActive && styles.sizeChipActive,
                    outOfStock && styles.sizeChipDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      isActive && styles.sizeTextActive,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Jumlah Produk */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Jumlah</Text>

          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepperBtn}
              disabled={quantity <= 1 || !canOrder}
              onPress={() =>
                setQuantity(Math.max(1, quantity - 1))
              }
            >
              <Minus size={14} color="#A83F68" />
            </TouchableOpacity>

            <Text style={styles.stepperValue}>
              {quantity}
            </Text>

            <TouchableOpacity
              style={styles.stepperBtn}
              disabled={!canOrder || quantity >= selectedStock}
              onPress={() =>
                setQuantity(
                  Math.min(selectedStock, quantity + 1)
                )
              }
            >
              <Plus size={14} color="#A83F68" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Total Harga */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Total Harga</Text>
          <Text style={styles.productPrice}>
            {formatPrice(numericPrice * quantity)}
          </Text>
        </View>

        {/* Tombol Masukkan ke Keranjang */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAddToCart}
            disabled={!canOrder}
            style={{ width: '100%', opacity: canOrder ? 1 : 0.6 }}
          >
            <CustomButton
              title={
                loadingProduct
                  ? 'Memuat Produk...'
                  : 'Masukkan ke Keranjang'
              }
              onPress={handleAddToCart}
            />
          </TouchableOpacity>
        </View>

        {/* Tombol Pesan Sekarang */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleBuyNow}
            disabled={!canOrder}
            style={{ width: '100%', opacity: canOrder ? 1 : 0.6 }}
          >
            <CustomButton
              title="Pesan Sekarang"
              onPress={handleBuyNow}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  detailHeader: {
    height: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#A83F68',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  largeProductImage: {
    width: '100%',
    height: 260,
    borderRadius: 20,
    marginVertical: 12,
    backgroundColor: '#EBCBD3',
  },
  productTitle: {
    fontWeight: '600',
    fontSize: 20,
    color: '#A83F68',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  productPrice: {
    fontWeight: '700',
    fontSize: 18,
    color: '#A83F68',
  },
  stockBadge: {
    backgroundColor: '#E8A6BD40',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  stockText: {
    fontSize: 10,
    color: '#A83F68',
  },
  descriptionText: {
    fontSize: 11,
    color: '#A83F68',
    lineHeight: 16,
    marginBottom: 16,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#A83F68',
  },
  sizeGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8A6BD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeChipActive: {
    backgroundColor: '#E8A6BD',
  },
  sizeChipDisabled: {
    opacity: 0.45,
  },
  sizeText: {
    fontSize: 12,
    color: '#A83F68',
  },
  sizeTextActive: {
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8A6BD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A83F68',
  },
  buttonWrapper: {
    marginTop: 10,
  },
});
