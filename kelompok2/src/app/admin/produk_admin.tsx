import React, { useCallback, useEffect, useState } from "react";
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
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../lib/supabase";
import AdminSubNav from "../../components/AdminSubNav"; 

const COLORS = {
  bgApp: "#FFF8F0",
  primary: "#A83F68",
  accentPink: "#E8A6BD",
  lightPink: "#FBEAF0",
  border: "#F2E4E5",
  textDark: "#49343C",
  textMuted: "#806A72",
  white: "#FFFFFF",
  dark: "#49343C",
  muted: "#806A72",
  pink: "#E8A6BD",
  bg: "#FFF8F0",
};

const VARIANTS = ["S", "M", "XL"] as const;
type SizeName = (typeof VARIANTS)[number];

interface SizeDetail {
  price: string;
  stock: string;
}

interface ProductItem {
  id: number;
  title: string;
  category: string;
  photo: string;
  description: string;
  price: number;
  stock: number;
  sizes: Record<SizeName, SizeDetail>;
}

const EMPTY_SIZES: Record<SizeName, SizeDetail> = {
  S: { price: "", stock: "" },
  M: { price: "", stock: "" },
  XL: { price: "", stock: "" },
};

const CATEGORIES = [
  "Buket Uang",
  "Buket Bunga",
  "Buket Boneka",
  "Buket Snack",
];

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600";

const PRODUCT_TABLE = "products";
const VARIANT_TABLE = "product_variants";

const showMessage = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const rupiah = (value: number | string) =>
  "Rp" + Number(value || 0).toLocaleString("id-ID");

const emptyProduct = () => ({
  title: "",
  category: CATEGORIES[1],
  photo: DEFAULT_PHOTO,
  description: "",
  sizes: {
    S: { ...EMPTY_SIZES.S },
    M: { ...EMPTY_SIZES.M },
    XL: { ...EMPTY_SIZES.XL },
  },
});

export default function KelolaProdukScreen() {
  const router = useRouter();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [photo, setPhoto] = useState(DEFAULT_PHOTO);
  const [description, setDescription] = useState("");
  const [sizes, setSizes] =
    useState<Record<SizeName, SizeDetail>>(EMPTY_SIZES);

  const loadProducts = useCallback(async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from(PRODUCT_TABLE)
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;

      const productRows = data ?? [];

      const ids = productRows.map((p: any) => p.id);
      let variantRows: any[] = [];

      if (ids.length > 0) {
        const { data: variants, error: variantError } = await supabase
          .from(VARIANT_TABLE)
          .select("*")
          .in("product_id", ids);

        if (variantError) throw variantError;
        variantRows = variants ?? [];
      }

      const result: ProductItem[] = productRows.map((p: any) => {
        const productVariants = variantRows.filter(
          (v: any) => String(v.product_id) === String(p.id)
        );

        const productSizes = {
          S: { ...EMPTY_SIZES.S },
          M: { ...EMPTY_SIZES.M },
          XL: { ...EMPTY_SIZES.XL },
        };

        productVariants.forEach((v: any) => {
          const normalized = String(v.size_name).trim().toUpperCase();

          if (VARIANTS.includes(normalized as SizeName)) {
            productSizes[normalized as SizeName] = {
              price: String(v.price ?? ""),
              stock: String(v.stock ?? ""),
            };
          }
        });

        return {
          id: p.id,
          title: p.title ?? "",
          category: p.category ?? CATEGORIES[1],
          photo: p.photo || DEFAULT_PHOTO,
          description: p.description ?? "",
          price: Number(p.price ?? 0),
          stock: Number(p.stock ?? 0),
          sizes: productSizes,
        };
      });

      setProducts(result);
    } catch (error: any) {
      Alert.alert(
        "Gagal Memuat Produk",
        error?.message ?? "Periksa koneksi Supabase dan nama tabel."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openModal = (product?: ProductItem) => {
    setDropdownOpen(false);

    if (product) {
      setEditingId(product.id);
      setTitle(product.title);
      setCategory(product.category);
      setPhoto(product.photo);
      setDescription(product.description);
      setSizes({
        S: { ...product.sizes.S },
        M: { ...product.sizes.M },
        XL: { ...product.sizes.XL },
      });
    } else {
      setEditingId(null);
      const empty = emptyProduct();
      setTitle(empty.title);
      setCategory(empty.category);
      setPhoto(empty.photo);
      setDescription(empty.description);
      setSizes(empty.sizes);
    }

    setModalVisible(true);
  };

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Izin Dibutuhkan",
          "Izinkan akses galeri untuk memilih foto."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert("Gagal Memilih Foto", error?.message);
    }
  };

  const updateSize = (
    sizeName: SizeName,
    field: keyof SizeDetail,
    value: string
  ) => {
    setSizes((previous) => ({
      ...previous,
      [sizeName]: {
        ...previous[sizeName],
        [field]: value,
      },
    }));
  };

  const saveProduct = async () => {
    if (!title.trim()) {
      showMessage("Peringatan", "Nama buket wajib diisi.");
      return;
    }

    if (!category) {
      showMessage("Peringatan", "Pilih kategori buket.");
      return;
    }

    for (const sizeName of VARIANTS) {
      const variant = sizes[sizeName];

      if (
        variant.price.trim() !== "" &&
        (!Number.isFinite(Number(variant.price)) ||
          Number(variant.price) < 0)
      ) {
        showMessage(
          "Peringatan",
          `Harga ukuran ${sizeName} tidak valid.`
        );
        return;
      }

      if (
        variant.stock.trim() !== "" &&
        (!Number.isInteger(Number(variant.stock)) ||
          Number(variant.stock) < 0)
      ) {
        showMessage(
          "Peringatan",
          `Stok ukuran ${sizeName} tidak valid.`
        );
        return;
      }
    }

    const validVariants = VARIANTS.filter(
      (s) =>
        sizes[s].price.trim() !== "" ||
        sizes[s].stock.trim() !== ""
    );

    if (validVariants.length === 0) {
      showMessage(
        "Peringatan",
        "Isi harga dan stok minimal satu ukuran buket."
      );
      return;
    }

    for (const s of validVariants) {
      if (
        sizes[s].price.trim() === "" ||
        sizes[s].stock.trim() === ""
      ) {
        showMessage(
          "Peringatan",
          `Isi harga dan stok ukuran ${s}, atau kosongkan keduanya.`
        );
        return;
      }
    }

    const totalStock = validVariants.reduce(
      (sum, s) => sum + Number(sizes[s].stock || 0),
      0
    );

    const prices = validVariants.map(
      (s) => Number(sizes[s].price)
    );

    const basePrice = Math.min(...prices);

    setSaving(true);

    try {
      const productPayload = {
        title: title.trim(),
        category,
        photo,
        description: description.trim(),
        price: basePrice,
        stock: totalStock,
      };

      let productId = editingId;

      if (editingId !== null) {
        const { data, error } = await supabase
          .from(PRODUCT_TABLE)
          .update(productPayload)
          .eq("id", editingId)
          .select("id")
          .single();

        if (error) throw error;
        productId = data.id;
      } else {
        const { data, error } = await supabase
          .from(PRODUCT_TABLE)
          .insert(productPayload)
          .select("id")
          .single();

        if (error) throw error;
        productId = data.id;
      }

      if (productId === null) {
        throw new Error("ID produk tidak ditemukan setelah disimpan.");
      }

      const { error: deleteVariantError } = await supabase
        .from(VARIANT_TABLE)
        .delete()
        .eq("product_id", productId);

      if (deleteVariantError) throw deleteVariantError;

      const variantPayload = validVariants.map((s) => ({
        product_id: productId,
        size_name: s,
        price: Number(sizes[s].price),
        stock: Number(sizes[s].stock),
      }));

      const { error: insertVariantError } = await supabase
        .from(VARIANT_TABLE)
        .insert(variantPayload);

      if (insertVariantError) {
        throw new Error(
          "Produk utama tersimpan, tetapi varian gagal disimpan: " +
            insertVariantError.message
        );
      }

      setModalVisible(false);
      await loadProducts();

      showMessage(
        "Berhasil",
        editingId !== null
          ? "Produk berhasil diperbarui."
          : "Produk baru berhasil ditambahkan."
      );
    } catch (error: any) {
      console.error("Gagal menyimpan produk:", error);

      showMessage(
        "Gagal Menyimpan",
        error?.message ?? "Terjadi kesalahan saat menyimpan produk."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = (product: ProductItem) => {
    Alert.alert(
      "Hapus Produk",
      `Yakin ingin menghapus "${product.title}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              const { error: variantError } = await supabase
                .from(VARIANT_TABLE)
                .delete()
                .eq("product_id", product.id);

              if (variantError) throw variantError;

              const { error } = await supabase
                .from(PRODUCT_TABLE)
                .delete()
                .eq("id", product.id);

              if (error) throw error;

              await loadProducts();
              Alert.alert("Berhasil", "Produk berhasil dihapus.");
            } catch (error: any) {
              Alert.alert(
                "Gagal Menghapus",
                error?.message ?? "Produk tidak bisa dihapus."
              );
            }
          },
        },
      ]
    );
  };

  const renderSizeForm = (sizeName: SizeName) => (
    <View style={styles.sizeBox} key={sizeName}>
      <Text style={styles.sizeHeading}>Ukuran {sizeName}</Text>

      <View style={styles.inputRow}>
        <View style={styles.flex}>
          <Text style={styles.smallLabel}>Harga (Rp)</Text>
          <TextInput
            style={styles.smallInput}
            value={sizes[sizeName].price}
            onChangeText={(v) => updateSize(sizeName, "price", v)}
            keyboardType="numeric"
            placeholder="Contoh: 120000"
            placeholderTextColor={COLORS.muted}
          />
        </View>

        <View style={styles.flex}>
          <Text style={styles.smallLabel}>Stok</Text>
          <TextInput
            style={styles.smallInput}
            value={sizes[sizeName].stock}
            onChangeText={(v) => updateSize(sizeName, "stock", v)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={COLORS.muted}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.brandAndAccount}>
          <Text style={styles.appTitle}>ra_scrafts.id Admin</Text>
          <TouchableOpacity
            style={styles.adminProfile}
            onPress={() => router.push("/admin/profil_admin" as any)}
          >
            <Ionicons name="person-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerDivider} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pageIntro}>
          <Text style={styles.pageTitle}>Kelola Toko</Text>
          <Text style={styles.pageSubtitle}>Kelola Produk & Pesanan</Text>
        </View>

        {/* PANGGILAN ADMIN SUB-NAV */}
        <AdminSubNav />

        <View style={styles.workspace}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openModal()}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
            <Text style={styles.addButtonText}>Tambah Buket Baru</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Koleksi Buket</Text>
            <Text style={styles.sectionContext}>{products.length} produk</Text>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={{ marginTop: 30 }}
            />
          ) : products.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada produk di database.</Text>
          ) : (
            products.map((item) => (
              <View key={String(item.id)} style={styles.productCard}>
                <Image
                  source={{ uri: item.photo || DEFAULT_PHOTO }}
                  style={styles.productImage}
                />

                <View style={styles.productInfo}>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={styles.productTitle}>{item.title}</Text>
                  <Text style={styles.priceText}>
                    Mulai {rupiah(item.price)}
                  </Text>

                  {VARIANTS.map((s) => (
                    <Text style={styles.stockText} key={s}>
                      {s}: {rupiah(item.sizes[s].price)} · Stok{" "}
                      {item.sizes[s].stock || "0"}
                    </Text>
                  ))}

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => openModal(item)}
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => deleteProduct(item)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !saving && setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <View style={styles.flex}>
                <Text style={styles.modalTitle}>
                  {editingId !== null ? "Edit Buket" : "Tambah Buket"}
                </Text>
                <Text style={styles.subtitle}>
                  Isi detail produk dan varian.
                </Text>
              </View>

              <TouchableOpacity
                disabled={saving}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={25} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>Foto Buket</Text>
              <TouchableOpacity
                style={styles.photoPicker}
                onPress={pickImage}
                disabled={saving}
              >
                <Image source={{ uri: photo }} style={styles.preview} />
                <View style={styles.flex}>
                  <Text style={styles.pinkText}>Pilih Foto dari Galeri</Text>
                  <Text style={styles.subtitle}>
                    Tekan untuk memilih foto.
                  </Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.label}>Nama Buket</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Contoh: Pink Romance"
                placeholderTextColor={COLORS.muted}
              />

              <Text style={styles.label}>Kategori</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setDropdownOpen(!dropdownOpen)}
              >
                <Text style={styles.inputText}>{category}</Text>
                <Ionicons
                  name={dropdownOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={COLORS.primary}
                />
              </TouchableOpacity>

              {dropdownOpen &&
                CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCategory(c);
                      setDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.inputText}>{c}</Text>
                  </TouchableOpacity>
                ))}

              <Text style={styles.label}>Deskripsi</Text>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="Deskripsi buket (opsional)"
                multiline
                placeholderTextColor={COLORS.muted}
              />

              <Text style={styles.sectionTitle}>Harga & Stok Varian</Text>
              {VARIANTS.map(renderSizeForm)}

              <TouchableOpacity
                style={[styles.saveButton, saving && { opacity: 0.6 }]}
                onPress={saveProduct}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingId !== null ? "Simpan Perubahan" : "Simpan Buket"}
                  </Text>
                )}
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
  brandAndAccount: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 72,
  },
  appTitle: {
    fontFamily: "Playfair Display",
    fontWeight: "700",
    fontSize: 26,
    color: COLORS.primary,
  },
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
  pageTitle: {
    fontFamily: "Playfair Display",
    fontWeight: "700",
    fontSize: 28,
    color: COLORS.primary,
  },
  pageSubtitle: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: 12,
    color: COLORS.textMuted,
  },
  subtitle: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: 12,
    color: COLORS.textMuted,
  },
  workspace: { paddingHorizontal: 20, paddingTop: 18, gap: 14 },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontFamily: "Playfair Display",
    fontWeight: "600",
    fontSize: 20,
    color: COLORS.primary,
  },
  sectionContext: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: 12,
    color: COLORS.textMuted,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  addButtonText: { color: COLORS.white, fontWeight: "700" },
  emptyText: { color: COLORS.muted, textAlign: "center", marginTop: 30 },
  productCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
    gap: 12,
  },
  productImage: { width: 100, height: 125, borderRadius: 12 },
  productInfo: { flex: 1, gap: 4 },
  category: { fontSize: 11, color: COLORS.muted },
  productTitle: { fontSize: 17, fontWeight: "700", color: COLORS.primary },
  priceText: { fontSize: 12, fontWeight: "700", color: COLORS.dark },
  stockText: { fontSize: 10, color: COLORS.dark },
  actions: { flexDirection: "row", gap: 8, marginTop: 6 },
  iconButton: {
    backgroundColor: COLORS.lightPink,
    width: 36,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modal: {
    maxHeight: "90%",
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 23, fontWeight: "700", color: COLORS.primary },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 12,
    marginBottom: 7,
  },
  photoPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 10,
  },
  preview: { width: 75, height: 75, borderRadius: 10 },
  pinkText: { color: COLORS.primary, fontWeight: "700", fontSize: 13 },
  input: {
    minHeight: 46,
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.dark,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputText: { color: COLORS.dark, fontSize: 13 },
  descriptionInput: { minHeight: 75, textAlignVertical: "top" },
  dropdownItem: {
    backgroundColor: COLORS.white,
    padding: 13,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  sizeBox: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sizeHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 10,
  },
  inputRow: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
  smallLabel: { fontSize: 11, color: COLORS.dark, marginBottom: 5 },
  smallInput: {
    height: 43,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 9,
    paddingHorizontal: 9,
    color: COLORS.dark,
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    minHeight: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  saveButtonText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },
});