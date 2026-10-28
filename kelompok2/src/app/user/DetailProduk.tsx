import React, { useState } from 'react';
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

import CustomButton from '../../components/CustomButton';

const CART_STORAGE_KEY = '@ra_scrafts_cart';

export default function DetailProduk() {
  const router = useRouter();

  const { id, name, price, imageUrl } = useLocalSearchParams<{
    id?: string;
    name: string;
    price: string;
    imageUrl: string;
  }>();

  const [selectedSize, setSelectedSize] = useState('S');
  const [quantity, setQuantity] = useState(1);

  const sizes = ['S', 'M', 'L'];

  const displayImage =
    imageUrl ||
    'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80';

  const displayName = name || 'Buket Mawar Premium';
  
  // Membersihkan format harga string (misal: "Rp 150.000" jadi angka 150000)
  const parsePrice = (priceStr: string) => {
    if (!priceStr) return 150000;
    const numeric = Number(priceStr.replace(/[^0-9]/g, ''));
    return isNaN(numeric) ? 150000 : numeric;
  };

  const numericPrice = parsePrice(price);

  // Fungsi untuk kembali ke halaman sebelumnya atau ke katalog
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/user/Katalog');
    }
  };

  // 1. Fungsi untuk Memasukkan ke Keranjang
  const handleAddToCart = async () => {
    try {
      const newItem = {
        id: id ? Number(id) : Date.now(),
        name: displayName,
        variant: `${selectedSize} · ra_scrafts`,
        price: numericPrice,
        quantity: quantity,
        image: displayImage,
        selected: true,
      };

      // Ambil data keranjang sebelumnya
      const existingCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
      let cartArray = existingCart ? JSON.parse(existingCart) : [];

      // Cek apakah produk dengan ukuran yang sama sudah ada di keranjang
      const existingIndex = cartArray.findIndex(
        (item: any) => item.name === newItem.name && item.variant === newItem.variant
      );

      if (existingIndex > -1) {
        cartArray[existingIndex].quantity += quantity;
      } else {
        cartArray.push(newItem);
      }

      // Simpan kembali ke AsyncStorage
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartArray));

      Alert.alert('Berhasil', 'Produk berhasil dimasukkan ke keranjang!', [
        { text: 'Lihat Keranjang', onPress: () => router.push('/user/keranjang') },
        { text: 'Lanjut Belanja', style: 'cancel' },
      ]);
    } catch (error) {
      console.error('Gagal tambah ke keranjang:', error);
      Alert.alert('Kesalahan', 'Gagal menyimpan produk ke keranjang.');
    }
  };

  // 2. Fungsi untuk Pesan Sekarang (Langsung ke Checkout)
  const handleBuyNow = () => {
    const singleCheckoutItem = [
      {
        id: id ? Number(id) : Date.now(),
        name: displayName,
        variant: `${selectedSize} · ra_scrafts`,
        price: numericPrice,
        quantity: quantity,
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

        <Text style={styles.headerTitle}>
          Detail Produk
        </Text>

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
            {price || `Rp ${numericPrice.toLocaleString('id-ID')}`}
          </Text>

          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>
              Stok tersedia: 12
            </Text>
          </View>
        </View>

        <Text style={styles.descriptionText}>
          Dirangkai dengan cinta dan balutan elegan untuk
          menyatakan momen istimewamu bersama orang tersayang.
        </Text>

        {/* Pilihan Ukuran */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Ukuran</Text>

          <View style={styles.sizeGroup}>
            {sizes.map((size) => {
              const isActive = selectedSize === size;

              return (
                <TouchableOpacity
                  key={size}
                  onPress={() => setSelectedSize(size)}
                  style={[
                    styles.sizeChip,
                    isActive && styles.sizeChipActive,
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
              onPress={() =>
                setQuantity(Math.min(12, quantity + 1))
              }
            >
              <Plus size={14} color="#A83F68" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tombol Masukkan ke Keranjang */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity activeOpacity={0.8} onPress={handleAddToCart} style={{ width: '100%' }}>
            <CustomButton
              title="Masukkan ke Keranjang"
              onPress={handleAddToCart}
            />
          </TouchableOpacity>
        </View>

        {/* Tombol Pesan Sekarang */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity activeOpacity={0.8} onPress={handleBuyNow} style={{ width: '100%' }}>
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