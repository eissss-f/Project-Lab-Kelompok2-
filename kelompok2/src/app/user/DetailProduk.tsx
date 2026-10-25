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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
  Store,
  ShoppingBag,
  User,
} from 'lucide-react-native';

export default function DetailProduk() {
  const router = useRouter();
  // Menangkap data yang dikirim dari halaman Katalog
  const { name, price, imageUrl } = useLocalSearchParams<{ name: string, price: string, imageUrl: string }>();
  
  const [selectedSize, setSelectedSize] = useState<string>('S');
  const [quantity, setQuantity] = useState<number>(1);
  const sizes = ['S', 'M', 'L'];

  // Nilai default jika diakses langsung tanpa klik produk
  const displayImage = imageUrl || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80';
  const displayName = name || 'Buket Mawar Premium';
  const displayPrice = price || 'Rp 150.000';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

      {/* Header Detail Produk */}
      <View style={styles.detailHeader}>
        {/* Tombol Kembali (Back) */}
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#A83F68" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Produk</Text>
        
        {/* Ikon Keranjang Header terhubung ke halaman keranjang */}
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/keranjang')}>
          <ShoppingCart size={20} color="#A83F68" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Foto Dinamis dari Produk yang Diklik */}
        <Image
          source={{ uri: displayImage }}
          style={styles.largeProductImage}
          resizeMode="cover"
        />

        {/* Nama & Harga Dinamis */}
        <Text style={styles.productTitle}>{displayName}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{displayPrice}</Text>
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>Stok tersedia: 12</Text>
          </View>
        </View>

        <Text style={styles.descriptionText}>
          Dirangkai dengan cinta dan balutan elegan untuk menyatakan momen istimewamu bersama orang tersayang.
        </Text>

        {/* Ukuran */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Ukuran</Text>
          <View style={styles.sizeGroup}>
            {sizes.map((size) => {
              const isActive = selectedSize === size;
              return (
                <TouchableOpacity
                  key={size}
                  onPress={() => setSelectedSize(size)}
                  style={[styles.sizeChip, isActive && styles.sizeChipActive]}
                >
                  <Text style={[styles.sizeText, isActive && styles.sizeTextActive]}>{size}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Jumlah */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Jumlah</Text>
          <View style={styles.stepperContainer}>
            <TouchableOpacity style={styles.stepperBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
              <Minus size={14} color="#A83F68" />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{quantity}</Text>
            <TouchableOpacity style={styles.stepperBtn} onPress={() => setQuantity(quantity + 1)}>
              <Plus size={14} color="#A83F68" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tombol Masukkan ke Keranjang -> Diarahkan ke halaman /keranjang */}
        <TouchableOpacity 
          style={styles.cartOutlineBtn}
          onPress={() => router.push('/keranjang')}
        >
          <ShoppingCart size={16} color="#A83F68" />
          <Text style={styles.cartOutlineText}>Masukkan ke Keranjang</Text>
        </TouchableOpacity>

        {/* Tombol Pesan Sekarang -> Diarahkan ke halaman /checkout */}
        <TouchableOpacity 
          style={styles.buySolidBtn}
          onPress={() => router.push('/checkout')}
        >
          <Text style={styles.buySolidText}>Pesan Sekarang</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.navTabs}>
          {/* Menu Produk / Katalog */}
          <TouchableOpacity 
            style={styles.tabActive}
            onPress={() => router.push('/Katalog')}
          >
            <Store size={21} color="#A83F68" strokeWidth={1.8} />
            <Text style={styles.tabLabelActive}>Produk</Text>
          </TouchableOpacity>

          {/* Menu Pesanan */}
          <TouchableOpacity 
            style={styles.tabInactive}
            onPress={() => router.push('/pesanan')}
          >
            <ShoppingBag size={21} color="#999999" strokeWidth={1.8} />
            <Text style={styles.tabLabelInactive}>Pesanan</Text>
          </TouchableOpacity>

          {/* Menu Profil */}
          <TouchableOpacity 
            style={styles.tabInactive}
            onPress={() => router.push('/profil')}
          >
            <User size={21} color="#999999" strokeWidth={1.8} />
            <Text style={styles.tabLabelInactive}>Profil</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.homeIndicator} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  detailHeader: { height: 50, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontWeight: '600', fontSize: 16, color: '#A83F68' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  largeProductImage: { width: '100%', height: 260, borderRadius: 20, marginVertical: 12, backgroundColor: '#EBCBD3' },
  productTitle: { fontWeight: '600', fontSize: 20, color: '#A83F68' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  productPrice: { fontWeight: '700', fontSize: 18, color: '#A83F68' },
  stockBadge: { backgroundColor: '#E8A6BD40', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  stockText: { fontSize: 10, color: '#A83F68' },
  descriptionText: { fontSize: 11, color: '#A83F68', lineHeight: 16, marginBottom: 16 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionLabel: { fontSize: 12, color: '#A83F68' },
  sizeGroup: { flexDirection: 'row', gap: 8 },
  sizeChip: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#E8A6BD', justifyContent: 'center', alignItems: 'center' },
  sizeChipActive: { backgroundColor: '#E8A6BD' },
  sizeText: { fontSize: 12, color: '#A83F68' },
  sizeTextActive: { fontWeight: '600' },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepperBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#E8A6BD', justifyContent: 'center', alignItems: 'center' },
  stepperValue: { fontSize: 12, fontWeight: '600', color: '#A83F68' },
  cartOutlineBtn: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#A83F68', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 10, marginBottom: 10 },
  cartOutlineText: { fontSize: 12, fontWeight: '500', color: '#A83F68' },
  buySolidBtn: { height: 44, borderRadius: 12, backgroundColor: '#A83F68', justifyContent: 'center', alignItems: 'center' },
  buySolidText: { fontSize: 12, fontWeight: '600', color: '#FFF8F0' },
  bottomNavContainer: { height: 84, borderTopWidth: 1, borderTopColor: '#F1D2DC', backgroundColor: '#FFF8F0', alignItems: 'center', paddingTop: 8, paddingHorizontal: 20 },
  navTabs: { flexDirection: 'row', width: '100%', height: 48, gap: 16 },
  tabActive: { flex: 1, height: 48, backgroundColor: '#FFF0F6', borderRadius: 4, justifyContent: 'center', alignItems: 'center', gap: 3 },
  tabInactive: { flex: 1, height: 48, justifyContent: 'center', alignItems: 'center', gap: 3 },
  tabLabelActive: { fontSize: 10, color: '#A83F68', fontWeight: '600' },
  tabLabelInactive: { fontSize: 10, color: '#999999' },
  homeIndicator: { width: 120, height: 4, backgroundColor: '#A83F68', borderRadius: 2, marginTop: 12 },
});