import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Modal, TextInput, useWindowDimensions, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

const COLORS = {
  bgApp: "#FFF8F0",
  primary: "#A83F68",
  accentPink: "#E8A6BD",
  lightPink: "#FBEAF0",
  border: "#F2E4E5",
  textDark: "#49343C",
  textMuted: "#806A72",
  white: "#FFFFFF",
  overlay: "rgba(73, 52, 60, 0.4)",
};

interface SizeDetail {
  price: string;
  stock: string;
}

interface ProductItem {
  id: string;
  category: string;
  title: string;
  photo: string;
  sizes: {
    S: SizeDetail;
    M: SizeDetail;
    XL: SizeDetail;
  };
}

const CATEGORY_OPTIONS = ["Buket Uang", "Buket Bunga", "Buket Boneka", "Buket Snack"];

export default function KelolaProdukScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false);
  
  const isSmallScreen = width < 360;
  const tabFontSize = isSmallScreen ? 10 : 11;

  // Form States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bouquetTitle, setBouquetTitle] = useState<string>("");
  const [bouquetCategory, setBouquetCategory] = useState<string>("");
  const [bouquetPhoto, setBouquetPhoto] = useState<string>("https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300");

  // States Harga & Stok per Ukuran (S, M, XL)
  const [sizeS, setSizeS] = useState<SizeDetail>({ price: "", stock: "" });
  const [sizeM, setSizeM] = useState<SizeDetail>({ price: "", stock: "" });
  const [sizeXL, setSizeXL] = useState<SizeDetail>({ price: "", stock: "" });

  // Daftar Produk Utama
  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: "1",
      category: "Buket Bunga",
      title: "Pink Romance",
      photo: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300",
      sizes: {
        S: { price: "120.000", stock: "10" },
        M: { price: "185.000", stock: "12" },
        XL: { price: "250.000", stock: "5" },
      },
    },
    {
      id: "2",
      category: "Buket Bunga",
      title: "Peach Bloom",
      photo: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=300",
      sizes: {
        S: { price: "110.000", stock: "8" },
        M: { price: "165.000", stock: "8" },
        XL: { price: "220.000", stock: "3" },
      },
    },
  ]);

  // Fungsi Pilih Foto dari HP
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Izin Ditolak", "Izin akses galeri dibutuhkan untuk memilih foto buket.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setBouquetPhoto(result.assets[0].uri);
    }
  };

  // Buka Modal (Tambah Baru / Edit)
  const handleOpenModal = (item?: ProductItem) => {
    setIsCategoryDropdownOpen(false);
    if (item) {
      setEditingId(item.id);
      setBouquetTitle(item.title);
      setBouquetCategory(item.category);
      setBouquetPhoto(item.photo);
      setSizeS(item.sizes.S);
      setSizeM(item.sizes.M);
      setSizeXL(item.sizes.XL);
    } else {
      setEditingId(null);
      setBouquetTitle("");
      setBouquetCategory(""); // Dikosongkan agar placeholder muncul
      setBouquetPhoto("https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300");
      setSizeS({ price: "", stock: "" });
      setSizeM({ price: "", stock: "" });
      setSizeXL({ price: "", stock: "" });
    }
    setIsModalVisible(true);
  };

  // Simpan Produk
  const handleSaveProduct = () => {
    if (!bouquetTitle.trim()) {
      Alert.alert("Peringatan", "Nama buket harus diisi.");
      return;
    }

    if (editingId) {
      // Edit Produk
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                title: bouquetTitle,
                category: bouquetCategory || "Buket Bunga",
                photo: bouquetPhoto,
                sizes: { S: sizeS, M: sizeM, XL: sizeXL },
              }
            : p
        )
      );
    } else {
      // Tambah Produk Baru
      const newProduct: ProductItem = {
        id: Date.now().toString(),
        category: bouquetCategory || "Buket Bunga",
        title: bouquetTitle,
        photo: bouquetPhoto,
        sizes: { S: sizeS, M: sizeM, XL: sizeXL },
      };
      setProducts((prev) => [newProduct, ...prev]);
    }

    setIsModalVisible(false);
  };

  // Hapus Produk
  const handleDeleteProduct = (id: string) => {
    Alert.alert("Konfirmasi", "Apakah kamu yakin ingin menghapus buket ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => setProducts((prev) => prev.filter((p) => p.id !== id)),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.brandAndAccount}>
          <Text style={styles.appTitle}>ra_scrafts.id Admin</Text>
          <TouchableOpacity style={styles.adminProfile} onPress={() => router.push("/admin/profil_admin" as any)}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerDivider} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* PAGE INTRO */}
        <View style={styles.pageIntro}>
          <Text style={styles.pageTitle}>Kelola Toko</Text>
          <Text style={styles.pageSubtitle}>Kelola Produk & Pesanan</Text>
        </View>

        {/* MANAGEMENT TABS */}
        <View style={styles.managementTabs}>
          {[
            { label: "Kelola Produk", route: "/admin/produk_admin" },
            { label: "Kelola Pesanan", route: "/admin/kelola_pesanan_admin" },
            { label: "Verifikasi", route: "/admin/verifikasi_admin" },
            { label: "Update Status", route: "/admin/status_admin" },
          ].map((tab) => {
            const isActive = tab.route === "/admin/produk_admin";
            return (
              <TouchableOpacity key={tab.route} style={[styles.managementTab, isActive && styles.activeTabBg]} onPress={() => router.push(tab.route as any)}>
                <Text style={[styles.tabLabel, { fontSize: tabFontSize }, isActive && styles.activeTabLabel]} numberOfLines={2}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* WORKSPACE */}
        <View style={styles.workspace}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenModal()}>
            <Text style={styles.buttonLabel}>+ Tambah Buket Baru</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Koleksi buket</Text>
            <Text style={styles.sectionContext}>{products.length} produk aktif</Text>
          </View>

          <View style={styles.bouquetCollection}>
            {products.map((item) => (
              <View key={item.id} style={styles.bouquetProduct}>
                <Image source={{ uri: item.photo }} style={styles.bouquetPhotograph} />
                <View style={styles.productDetails}>
                  <Text style={styles.bouquetCategory}>{item.category}</Text>
                  <Text style={styles.bouquetTitle}>{item.title}</Text>

                  {/* Tampilan Varian Ukuran */}
                  <View style={styles.sizeBadgesContainer}>
                    <Text style={styles.sizeBadgeText}>
                      S: Rp{item.sizes.S.price || "0"} (Stok: {item.sizes.S.stock || "0"})
                    </Text>
                    <Text style={styles.sizeBadgeText}>
                      M: Rp{item.sizes.M.price || "0"} (Stok: {item.sizes.M.stock || "0"})
                    </Text>
                    <Text style={styles.sizeBadgeText}>
                      XL: Rp{item.sizes.XL.price || "0"} (Stok: {item.sizes.XL.stock || "0"})
                    </Text>
                  </View>

                  <View style={styles.stockAndActions}>
                    <View style={styles.quickActions}>
                      <TouchableOpacity style={styles.editProduct} onPress={() => handleOpenModal(item)}>
                        <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteProduct} onPress={() => handleDeleteProduct(item.id)}>
                        <Ionicons name="trash-outline" size={18} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* MODAL TAMBAH / EDIT BUKET */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={() => setIsModalVisible(false)} />
          <View style={styles.bottomSheetContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.sheetHandleArea}>
                <View style={styles.dragHandle} />
              </View>

              <View style={styles.formIntro}>
                <View style={styles.formHeading}>
                  <Text style={styles.modalTitle}>{editingId ? "Edit Buket" : "Tambah Buket Baru"}</Text>
                  <Text style={styles.formDescription}>Lengkapi detail foto, kategori, harga, dan stok.</Text>
                </View>
                <TouchableOpacity style={styles.closeModalBtn} onPress={() => setIsModalVisible(false)}>
                  <Ionicons name="close" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              {/* UNGGAH FOTO BUKET */}
              <View style={styles.photoFieldContainer}>
                <Text style={styles.fieldLabel}>Foto Buket</Text>
                <View style={styles.photoDropzone}>
                  <Image source={{ uri: bouquetPhoto }} style={styles.currentBouquetPhoto} />
                  <View style={styles.uploadGuidance}>
                    <TouchableOpacity style={styles.uploadAction} onPress={handlePickImage}>
                      <Ionicons name="cloud-upload-outline" size={20} color={COLORS.primary} />
                      <Text style={styles.uploadLabel}>Pilih / Ganti Foto dari Galeri</Text>
                    </TouchableOpacity>
                    <Text style={styles.fileRequirements}>Format JPG, PNG (Ukuran disarankan 1:1)</Text>
                  </View>
                </View>
              </View>

              {/* NAMA BUKET */}
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Nama Buket</Text>
                <View style={styles.fieldInput}>
                  <TextInput style={styles.textInput} value={bouquetTitle} onChangeText={setBouquetTitle} placeholder="Contoh: Pink Romance" placeholderTextColor={COLORS.textMuted} />
                </View>
              </View>

              {/* DROPDOWN KATEGORI BUKET */}
              <View style={[styles.inputGroup, { zIndex: 10 }]}>
                <Text style={styles.fieldLabel}>Kategori Buket</Text>
                <TouchableOpacity style={styles.dropdownSelector} onPress={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}>
                  <Text style={[styles.textInput, !bouquetCategory && { color: COLORS.textMuted }]}>
                    {bouquetCategory || "Pilih kategori buket..."}
                  </Text>
                  <Ionicons name={isCategoryDropdownOpen ? "chevron-up" : "chevron-down"} size={18} color={COLORS.primary} />
                </TouchableOpacity>

                {isCategoryDropdownOpen && (
                  <View style={styles.dropdownListContainer}>
                    {CATEGORY_OPTIONS.map((cat, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setBouquetCategory(cat);
                          setIsCategoryDropdownOpen(false);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, bouquetCategory === cat && styles.dropdownItemTextActive]}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* HARGA & STOK PER UKURAN */}
              <Text style={[styles.fieldLabel, { marginTop: 12, fontSize: 14, color: COLORS.primary }]}>Harga & Stok Per Ukuran</Text>

              {/* UKURAN S */}
              <View style={styles.sizeBoxContainer}>
                <Text style={styles.sizeTitleBadge}>Ukuran S</Text>
                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.smallFieldLabel}>Harga S (Rp)</Text>
                    <View style={styles.fieldInputSmall}>
                      <TextInput style={styles.textInput} value={sizeS.price} onChangeText={(val) => setSizeS({ ...sizeS, price: val })} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textMuted} />
                    </View>
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.smallFieldLabel}>Stok S</Text>
                    <View style={styles.fieldInputSmall}>
                      <TextInput style={styles.textInput} value={sizeS.stock} onChangeText={(val) => setSizeS({ ...sizeS, stock: val })} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textMuted} />
                    </View>
                  </View>
                </View>
              </View>

              {/* UKURAN M */}
              <View style={styles.sizeBoxContainer}>
                <Text style={styles.sizeTitleBadge}>Ukuran M</Text>
                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.smallFieldLabel}>Harga M (Rp)</Text>
                    <View style={styles.fieldInputSmall}>
                      <TextInput style={styles.textInput} value={sizeM.price} onChangeText={(val) => setSizeM({ ...sizeM, price: val })} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textMuted} />
                    </View>
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.smallFieldLabel}>Stok M</Text>
                    <View style={styles.fieldInputSmall}>
                      <TextInput style={styles.textInput} value={sizeM.stock} onChangeText={(val) => setSizeM({ ...sizeM, stock: val })} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textMuted} />
                    </View>
                  </View>
                </View>
              </View>

              {/* UKURAN XL */}
              <View style={styles.sizeBoxContainer}>
                <Text style={styles.sizeTitleBadge}>Ukuran XL</Text>
                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.smallFieldLabel}>Harga XL (Rp)</Text>
                    <View style={styles.fieldInputSmall}>
                      <TextInput style={styles.textInput} value={sizeXL.price} onChangeText={(val) => setSizeXL({ ...sizeXL, price: val })} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textMuted} />
                    </View>
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.smallFieldLabel}>Stok XL</Text>
                    <View style={styles.fieldInputSmall}>
                      <TextInput style={styles.textInput} value={sizeXL.stock} onChangeText={(val) => setSizeXL({ ...sizeXL, stock: val })} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textMuted} />
                    </View>
                  </View>
                </View>
              </View>

              {/* TOMBOL SIMPAN */}
              <TouchableOpacity style={styles.saveProductButton} onPress={handleSaveProduct}>
                <Text style={styles.saveButtonText}>Simpan Buket</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgApp },
  headerContainer: { width: "100%", backgroundColor: COLORS.bgApp },
  brandAndAccount: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, height: 72 },
  appTitle: { fontFamily: "Playfair Display", fontWeight: "700", fontSize: 26, color: COLORS.primary },
  adminProfile: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.white,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7E3E55",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 3,
  },
  headerDivider: { width: "100%", height: 1, backgroundColor: COLORS.border },
  scrollContent: { paddingBottom: 35 },
  pageIntro: { paddingHorizontal: 20, paddingVertical: 12, gap: 4 },
  pageTitle: { fontFamily: "Playfair Display", fontWeight: "700", fontSize: 28, color: COLORS.primary },
  pageSubtitle: { fontFamily: "Poppins", fontWeight: "400", fontSize: 12, color: COLORS.textMuted },
  managementTabs: {
    flexDirection: "row",
    backgroundColor: COLORS.lightPink,
    marginHorizontal: 20,
    padding: 5,
    borderRadius: 16,
    gap: 4,
    minHeight: 56,
  },
  managementTab: { flex: 1, justifyContent: "center", alignItems: "center", borderRadius: 12, paddingHorizontal: 4, paddingVertical: 8 },
  activeTabBg: { backgroundColor: COLORS.accentPink },
  tabLabel: { fontFamily: "Poppins", fontWeight: "500", textAlign: "center", color: "#986678" },
  activeTabLabel: { fontFamily: "Poppins", fontWeight: "700", color: COLORS.primary },
  workspace: { paddingHorizontal: 20, paddingTop: 18, gap: 14 },
  actionButton: { backgroundColor: COLORS.accentPink, height: 50, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  buttonLabel: { fontFamily: "Poppins", fontWeight: "600", fontSize: 14, color: COLORS.white },
  sectionHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontFamily: "Playfair Display", fontWeight: "600", fontSize: 20, color: COLORS.primary },
  sectionContext: { fontFamily: "Poppins", fontWeight: "400", fontSize: 12, color: COLORS.textMuted },
  bouquetCollection: { gap: 14 },
  bouquetProduct: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 18,
    gap: 14,
    shadowColor: "#7E3E55",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  bouquetPhotograph: { width: 92, height: 110, borderRadius: 12 },
  productDetails: { flex: 1, gap: 4 },
  bouquetCategory: { fontFamily: "Poppins", fontWeight: "400", fontSize: 11, color: COLORS.textMuted },
  bouquetTitle: { fontFamily: "Playfair Display", fontWeight: "600", fontSize: 18, color: COLORS.primary },
  sizeBadgesContainer: { gap: 2, marginTop: 2 },
  sizeBadgeText: { fontFamily: "Poppins", fontWeight: "500", fontSize: 11, color: COLORS.textDark },
  stockAndActions: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 6 },
  quickActions: { flexDirection: "row", gap: 8 },
  editProduct: { width: 34, height: 34, backgroundColor: COLORS.lightPink, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  deleteProduct: { width: 34, height: 34, backgroundColor: COLORS.lightPink, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  
  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: "flex-end" },
  overlayTouchable: { flex: 0.2 },
  bottomSheetContainer: {
    maxHeight: "85%",
    backgroundColor: COLORS.bgApp,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
    gap: 12,
  },
  sheetHandleArea: { alignItems: "center", marginBottom: 6 },
  dragHandle: { width: 44, height: 5, backgroundColor: COLORS.border, borderRadius: 100 },
  formIntro: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  formHeading: { flex: 1, gap: 4 },
  modalTitle: { fontFamily: "Playfair Display", fontWeight: "700", fontSize: 24, color: COLORS.primary },
  formDescription: { fontFamily: "Poppins", fontWeight: "400", fontSize: 12, color: COLORS.textMuted },
  closeModalBtn: { width: 34, height: 34, backgroundColor: COLORS.lightPink, borderRadius: 100, justifyContent: "center", alignItems: "center" },
  photoFieldContainer: { gap: 8, marginBottom: 12 },
  photoDropzone: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.accentPink, borderStyle: "dashed", borderRadius: 14, padding: 12, gap: 14 },
  currentBouquetPhoto: { width: 80, height: 80, borderRadius: 12 },
  uploadGuidance: { flex: 1, gap: 4 },
  uploadAction: { flexDirection: "row", alignItems: "center", gap: 6 },
  uploadLabel: { fontFamily: "Poppins", fontWeight: "600", fontSize: 12, color: COLORS.primary },
  fileRequirements: { fontFamily: "Poppins", fontWeight: "400", fontSize: 10, color: COLORS.textMuted },
  inputGroup: { gap: 6, marginBottom: 10 },
  fieldLabel: { fontFamily: "Poppins", fontWeight: "600", fontSize: 13, color: COLORS.primary },
  smallFieldLabel: { fontFamily: "Poppins", fontWeight: "500", fontSize: 11, color: COLORS.textDark },
  fieldInput: { height: 48, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, justifyContent: "center" },
  fieldInputSmall: { height: 44, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, justifyContent: "center" },
  textInput: { fontFamily: "Poppins", fontWeight: "400", fontSize: 13, color: COLORS.textDark },
  
  // DROPDOWN STYLES
  dropdownSelector: {
    height: 48,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownListContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginTop: 4,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#7E3E55",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemText: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: 13,
    color: COLORS.textDark,
  },
  dropdownItemTextActive: {
    fontWeight: "700",
    color: COLORS.primary,
  },

  sizeBoxContainer: { backgroundColor: COLORS.white, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10, gap: 6 },
  sizeTitleBadge: { fontFamily: "Poppins", fontWeight: "700", fontSize: 12, color: COLORS.primary },
  rowInputs: { flexDirection: "row", gap: 10 },
  saveProductButton: { height: 50, backgroundColor: COLORS.accentPink, borderRadius: 14, justifyContent: "center", alignItems: "center", marginTop: 12, marginBottom: 20 },
  saveButtonText: { fontFamily: "Poppins", fontWeight: "700", fontSize: 14, color: COLORS.white },
});