import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Modal,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const COLORS = {
  bgApp: '#FFF8F0',
  primary: '#A83F68',
  accentPink: '#E8A6BD',
  lightPink: '#FBEAF0',
  border: '#F2E4E5',
  textDark: '#49343C',
  textMuted: '#958189',
  white: '#FFFFFF',
  overlay: 'rgba(73, 52, 60, 0.4)',
};

interface ProductItem {
  id: string;
  category: string;
  title: string;
  price: string;
  stock: number;
  photo: string;
}

export default function KelolaProdukScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const isSmallScreen = width < 360;
  const tabFontSize = isSmallScreen ? 9 : 10;

  const [bouquetTitle, setBouquetTitle] = useState<string>('Pink Romance');
  const [bouquetPrice, setBouquetPrice] = useState<string>('Rp185.000');
  const [bouquetStock, setBouquetStock] = useState<string>('12');
  const [bouquetPhoto, setBouquetPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300'
  );

  const products: ProductItem[] = [
    {
      id: '1',
      category: 'Buket Mawar',
      title: 'Pink Romance',
      price: 'Rp185.000',
      stock: 12,
      photo: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300',
    },
    {
      id: '2',
      category: 'Buket Tulip',
      title: 'Peach Bloom',
      price: 'Rp165.000',
      stock: 8,
      photo: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=300',
    },
    {
      id: '3',
      category: 'Buket Wisuda',
      title: 'Sweet Lilac',
      price: 'Rp150.000',
      stock: 5,
      photo: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=300',
    },
  ];

  const handleOpenModal = (item?: ProductItem) => {
    if (item) {
      setBouquetTitle(item.title);
      setBouquetPrice(item.price);
      setBouquetStock(item.stock.toString());
      setBouquetPhoto(item.photo);
    } else {
      setBouquetTitle('');
      setBouquetPrice('');
      setBouquetStock('');
      setBouquetPhoto('https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300');
    }
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* APP HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.brandAndAccount}>
          <Text style={styles.appTitle}>ra_scrafts.id Admin</Text>
          <TouchableOpacity style={styles.adminProfile} onPress={() => router.push('/profil_admin' as any)}>
            <Ionicons name="person-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerDivider} />
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Page Introduction */}
        <View style={styles.pageIntro}>
          <Text style={styles.pageTitle}>Kelola Toko</Text>
          <Text style={styles.pageSubtitle}>Kelola Produk & Pesanan</Text>
        </View>

        {/* MANAGEMENT TABS RESPONSIVE */}
        <View style={styles.managementTabs}>
          {[
            { label: 'Kelola\nProduk', route: '/produk_admin' },
            { label: 'Kelola\nPesanan', route: '/kelola_pesanan_admin' },
            { label: 'Verifikasi', route: '/verifikasi_admin' },
            { label: 'Update\nStatus', route: '/status_admin' },
          ].map((tab) => {
            const isActive = tab.route === '/produk_admin';
            return (
              <TouchableOpacity
                key={tab.route}
                style={[styles.managementTab, isActive && styles.activeTabBg]}
                onPress={() => router.push(tab.route as any)}
              >
                <Text style={[styles.tabLabel, { fontSize: tabFontSize }, isActive && styles.activeTabLabel]} numberOfLines={2}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Workspace Content */}
        <View style={styles.workspace}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleOpenModal()}
          >
            <Text style={styles.buttonLabel}>+ Tambah Buket Baru</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Koleksi buket</Text>
            <Text style={styles.sectionContext}>48 produk aktif</Text>
          </View>

          <View style={styles.bouquetCollection}>
            {products.map((item) => (
              <View key={item.id} style={styles.bouquetProduct}>
                <Image source={{ uri: item.photo }} style={styles.bouquetPhotograph} />
                
                <View style={styles.productDetails}>
                  <Text style={styles.bouquetCategory}>{item.category}</Text>
                  <Text style={styles.bouquetTitle}>{item.title}</Text>
                  <Text style={styles.productPrice}>{item.price}</Text>

                  <View style={styles.stockAndActions}>
                    <Text style={styles.stockLevel}>Stok: {item.stock}</Text>
                    <View style={styles.quickActions}>
                      <TouchableOpacity 
                        style={styles.editProduct}
                        onPress={() => handleOpenModal(item)}
                      >
                        <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteProduct}>
                        <Ionicons name="trash-outline" size={17} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.collectionPagination}>
            <Text style={styles.visibleProductCount}>Menampilkan 3 dari 48 produk</Text>
            <TouchableOpacity>
              <Text style={styles.loadMore}>Lihat lainnya →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR RESPONSIVE */}
      <View style={styles.bottomNavigation}>
        <View style={styles.navigationItems}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/index_admin' as any)}>
            <Ionicons name="grid-outline" size={isSmallScreen ? 17 : 19} color={COLORS.textMuted} />
            <Text style={[styles.navLabel, isSmallScreen && { fontSize: 8 }]}>Beranda</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/kelola_pesanan_admin' as any)}>
            <Ionicons name="bag-outline" size={isSmallScreen ? 17 : 19} color={COLORS.textMuted} />
            <Text style={[styles.navLabel, isSmallScreen && { fontSize: 8 }]}>Pesanan</Text>
          </TouchableOpacity>

          <View style={styles.activeNavigationItem}>
            <MaterialCommunityIcons name="flower-outline" size={18} color={COLORS.primary} />
            <Text style={styles.activeNavigationLabel}>Produk</Text>
          </View>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profil_admin' as any)}>
            <Ionicons name="person-outline" size={isSmallScreen ? 17 : 19} color={COLORS.textMuted} />
            <Text style={[styles.navLabel, isSmallScreen && { fontSize: 8 }]}>Akun</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.homeIndicatorArea}>
          <View style={styles.homeIndicator} />
        </View>
      </View>

      {/* BOTTOM SHEET MODAL */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.overlayTouchable} 
            activeOpacity={1} 
            onPress={() => setIsModalVisible(false)} 
          />
          
          <View style={styles.bottomSheetContainer}>
            <View style={styles.sheetHandleArea}>
              <View style={styles.dragHandle} />
            </View>

            <View style={styles.formIntro}>
              <View style={styles.formHeading}>
                <Text style={styles.modalTitle}>Tambah / Edit Buket</Text>
                <Text style={styles.formDescription}>Detail kecil, kesan yang istimewa.</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeModalBtn}
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons name="close" size={17} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.photoFieldContainer}>
              <Text style={styles.photoLabel}>Foto Buket</Text>
              <View style={styles.photoDropzone}>
                <Image source={{ uri: bouquetPhoto }} style={styles.currentBouquetPhoto} />
                <View style={styles.uploadGuidance}>
                  <TouchableOpacity style={styles.uploadAction}>
                    <Ionicons name="cloud-upload-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.uploadLabel}>Unggah / ganti foto</Text>
                  </TouchableOpacity>
                  <Text style={styles.fileRequirements}>JPG, PNG · maks. 5 MB</Text>
                  <Text style={styles.photoSuggestion}>Gunakan foto buket yang jelas.</Text>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Nama Buket</Text>
              <View style={styles.fieldInput}>
                <TextInput
                  style={styles.textInput}
                  value={bouquetTitle}
                  onChangeText={setBouquetTitle}
                  placeholder="Masukkan nama buket"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Harga</Text>
                <View style={styles.fieldInput}>
                  <TextInput
                    style={styles.textInput}
                    value={bouquetPrice}
                    onChangeText={setBouquetPrice}
                    placeholder="Rp0"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Stok</Text>
                <View style={styles.fieldInput}>
                  <TextInput
                    style={styles.textInput}
                    value={bouquetStock}
                    onChangeText={setBouquetStock}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.saveGuidanceNotice}>
              Pastikan harga dan stok sudah sesuai sebelum disimpan.
            </Text>

            <TouchableOpacity 
              style={styles.saveProductButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.saveButtonText}>Simpan Produk</Text>
            </TouchableOpacity>

            <View style={styles.modalHomeIndicatorArea}>
              <View style={styles.homeIndicator} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgApp,
  },
  headerContainer: {
    width: '100%',
    backgroundColor: COLORS.bgApp,
  },
  brandAndAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 68,
  },
  appTitle: {
    fontFamily: 'Playfair Display',
    fontWeight: '600',
    fontSize: 26,
    color: COLORS.primary,
  },
  adminProfile: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.white,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7E3E55',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 3,
  },
  headerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.border,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  pageIntro: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 3,
  },
  pageTitle: {
    fontFamily: 'Playfair Display',
    fontWeight: '600',
    fontSize: 28,
    lineHeight: 35,
    color: COLORS.primary,
  },
  pageSubtitle: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textMuted,
  },
  managementTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightPink,
    marginHorizontal: 20,
    padding: 4,
    borderRadius: 14,
    gap: 2,
    minHeight: 54,
  },
  managementTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 2,
    paddingVertical: 6,
  },
  activeTabBg: {
    backgroundColor: COLORS.accentPink,
  },
  tabLabel: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    lineHeight: 14,
    textAlign: 'center',
    color: '#986678',
  },
  activeTabLabel: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: COLORS.primary,
  },
  workspace: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  actionButton: {
    backgroundColor: COLORS.accentPink,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLabel: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 13,
    color: COLORS.white,
  },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 28,
  },
  sectionTitle: {
    fontFamily: 'Playfair Display',
    fontWeight: '500',
    fontSize: 20,
    color: COLORS.primary,
  },
  sectionContext: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 11,
    color: COLORS.textMuted,
  },
  bouquetCollection: {
    gap: 12,
  },
  bouquetProduct: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 18,
    gap: 12,
    shadowColor: '#7E3E55',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  bouquetPhotograph: {
    width: 88,
    height: 100,
    borderRadius: 10,
  },
  productDetails: {
    flex: 1,
    gap: 5,
  },
  bouquetCategory: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 10,
    color: COLORS.textMuted,
  },
  bouquetTitle: {
    fontFamily: 'Playfair Display',
    fontWeight: '500',
    fontSize: 18,
    color: COLORS.primary,
  },
  productPrice: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 14,
    color: COLORS.primary,
  },
  stockAndActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockLevel: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    color: COLORS.primary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 6,
  },
  editProduct: {
    width: 30,
    height: 30,
    backgroundColor: COLORS.lightPink,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteProduct: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionPagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  visibleProductCount: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 10,
    color: COLORS.textMuted,
  },
  loadMore: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 10,
    color: COLORS.primary,
  },
  bottomNavigation: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    shadowColor: '#71384C',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  navigationItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  navLabel: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 9,
    color: COLORS.textMuted,
  },
  activeNavigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.accentPink,
    borderRadius: 100,
    gap: 7,
  },
  activeNavigationLabel: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 12,
    color: COLORS.primary,
  },
  homeIndicatorArea: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  homeIndicator: {
    width: 128,
    height: 4,
    backgroundColor: COLORS.textDark,
    borderRadius: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  bottomSheetContainer: {
    backgroundColor: COLORS.bgApp,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 12,
  },
  sheetHandleArea: {
    alignItems: 'center',
    height: 4,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 100,
  },
  formIntro: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  formHeading: {
    flex: 1,
    gap: 4,
  },
  modalTitle: {
    fontFamily: 'Playfair Display',
    fontWeight: '600',
    fontSize: 28,
    color: COLORS.primary,
  },
  formDescription: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 11,
    color: COLORS.textMuted,
  },
  closeModalBtn: {
    width: 30,
    height: 30,
    backgroundColor: COLORS.lightPink,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoFieldContainer: {
    gap: 8,
  },
  photoLabel: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 12,
    color: COLORS.primary,
  },
  photoDropzone: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.accentPink,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 12,
    gap: 14,
  },
  currentBouquetPhoto: {
    width: 78,
    height: 80,
    borderRadius: 10,
  },
  uploadGuidance: {
    flex: 1,
    gap: 4,
  },
  uploadAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uploadLabel: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 12,
    color: COLORS.primary,
  },
  fileRequirements: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 10,
    color: COLORS.textMuted,
  },
  photoSuggestion: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 10,
    color: COLORS.textMuted,
  },
  inputGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 12,
    color: COLORS.primary,
  },
  fieldInput: {
    height: 48,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  textInput: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 13,
    color: COLORS.textDark,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  saveGuidanceNotice: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  saveProductButton: {
    height: 48,
    backgroundColor: COLORS.accentPink,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 13,
    color: COLORS.white,
  },
  modalHomeIndicatorArea: {
    alignItems: 'center',
    paddingTop: 8,
  },
});