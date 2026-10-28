import * as React from "react";
import { useMemo, useState, useEffect } from "react";
// @ts-ignore
import { Alert, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft, CalendarDays, Clock3, Upload, X } from "lucide-react-native";
import { supabase } from "../../../lib/supabase"; // Sesuaikan path file supabase kamu

interface CartItem {
  id: number | string;
  name: string;
  variant?: string;
  price: number;
  quantity: number;
  image?: string;
  selected?: boolean;
}

const ROSE = "#A83F68";
const PINK = "#E8A6BD";
const CREAM = "#FFF8F0";
const BORDER = "#F0CED9";

interface SectionProps {
  title: string;
  children?: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const rupiah = (value: number) => {
  const num = Number.isFinite(value) ? Math.round(value) : 0;
  return `Rp ${num.toLocaleString("id-ID")}`;
};

const PAYMENT_METHODS = [
  {
    id: "transfer",
    name: "Transfer Bank",
    description: "BCA · 1234567890",
    accountName: "a.n. Ra S Crafts",
  },
  {
    id: "ewallet",
    name: "E-Wallet",
    description: "DANA · 081234567890",
    accountName: "a.n. Ra S Crafts",
  },
  {
    id: "cod",
    name: "Bayar di Tempat",
    description: "Pembayaran saat pesanan diterima",
    accountName: "",
  },
];

export default function CheckoutPage() {
  const router = useRouter();

  const { cartItems: cartItemsParam } = useLocalSearchParams<{
    cartItems?: string | string[];
  }>();

  const selectedCartItems = useMemo<CartItem[]>(() => {
    try {
      const raw = Array.isArray(cartItemsParam) ? cartItemsParam[0] : cartItemsParam;

      if (!raw) return [];

      const parsed: unknown = JSON.parse(raw);

      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter((item): item is Record<string, any> => item !== null && typeof item === "object" && "id" in item && "name" in item)
        .map((item) => {
          const price = Number(item.price);
          const quantity = Number(item.quantity);

          return {
            id: item.id,
            name: String(item.name || ""),
            variant: typeof item.variant === "string" ? item.variant : "",
            price: Number.isFinite(price) && price >= 0 ? price : 0,
            quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
            image: typeof item.image === "string" ? item.image : "",
            selected: Boolean(item.selected),
          };
        });
    } catch {
      return [];
    }
  }, [cartItemsParam]);

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [cardMessage, setCardMessage] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("transfer");
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Otomatis ambil data user yang sedang login saat halaman dimuat
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        // Jika ada nama di metadata akun, gunakan itu. Jika tidak, gunakan nama dari depan email.
        const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "";
        setRecipientName(fullName);

        // Jika nomor telepon tersimpan di metadata auth
        if (user.user_metadata?.phone) {
          setRecipientPhone(user.user_metadata.phone);
        }
      }
    } catch (error) {
      console.error("Gagal memuat profil pengguna:", error);
    }
  };

  const subtotal = selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const formatDate = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);

    if (digits.length <= 2) return digits;
    if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const choosePaymentProof = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Izin diperlukan", "Izinkan akses galeri untuk memilih bukti pembayaran.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions ? ImagePicker.MediaTypeOptions.Images : ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setPaymentProof(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Gagal membuka galeri", "Silakan coba kembali.");
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/user/keranjang");
    }
  };

  const handlePlaceOrder = () => {
    if (selectedCartItems.length === 0) {
      Alert.alert("Keranjang kosong", "Silakan kembali ke keranjang dan pilih produk terlebih dahulu.", [
        {
          text: "Kembali ke Keranjang",
          onPress: () => router.replace("/user/keranjang"),
        },
        {
          text: "Tutup",
          style: "cancel",
        },
      ]);
      return;
    }

    if (!recipientName.trim()) {
      Alert.alert("Data belum lengkap", "Masukkan nama pemesan.");
      return;
    }

    if (!recipientPhone.trim()) {
      Alert.alert("Data belum lengkap", "Masukkan nomor telepon.");
      return;
    }

    if (!deliveryDate.trim()) {
      Alert.alert("Data belum lengkap", "Masukkan tanggal pengambilan.");
      return;
    }

    if (!deliveryTime.trim()) {
      Alert.alert("Data belum lengkap", "Masukkan waktu pengambilan.");
      return;
    }

    if (selectedPayment !== "cod" && !paymentProof) {
      Alert.alert("Bukti pembayaran belum ada", "Pilih gambar bukti pembayaran terlebih dahulu.");
      return;
    }

    setShowSuccess(true);
  };

  
const handleFinish = async () => {
  setShowSuccess(false);

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;

    if (!user) {
      Alert.alert("Login diperlukan", "Silakan login kembali sebelum membuat pesanan.");
      return;
    }

    // Pastikan semua varian sesuai constraint tabel order_items
    const itemsToSave = selectedCartItems.map((item) => {
      const rawVariant = String(item.variant || "").trim().toUpperCase();

const size = ["S", "M", "XL"].includes(rawVariant)
  ? rawVariant
  : "M";

      const rawId = String(item.id);
      const productId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)
        ? rawId
        : null;

      return {
        product_id: productId,
        product_title: item.name,
        product_photo: item.image || null,
        size_name: size,
        quantity: item.quantity,
        price: item.price,
      };
    });

    const notes = [
      `Tanggal pengambilan: ${deliveryDate}`,
      `Waktu pengambilan: ${deliveryTime}`,
      cardMessage.trim() ? `Pesan kartu: ${cardMessage.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    // Simpan data utama pesanan
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_price: total,
        shipping_address: "Ambil langsung di toko ra_scrafts.id",
        recipient_name: recipientName.trim(),
        recipient_phone: recipientPhone.trim(),
        payment_method: selectedPayment,
        payment_proof: paymentProof,
        status:
          selectedPayment === "cod"
            ? "menunggu_pembayaran"
            : "menunggu_verifikasi",
        notes,
      })
      .select("id, order_number")
      .single();

    if (orderError) throw orderError;

    // Simpan semua produk yang dipesan
    const orderItems = itemsToSave.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      // Hindari meninggalkan pesanan utama tanpa detail produk
      await supabase.from("orders").delete().eq("id", order.id);
      throw itemsError;
    }

    Alert.alert(
  "Pesanan Berhasil Dibuat",
  `Nomor pesanan: ${order.order_number}`,
  [
    {
      text: "OK",
      onPress: () => router.back(),
    },
  ]
);
  } catch (error: any) {
    console.error("Gagal menyimpan pesanan:", error);

    Alert.alert(
      "Gagal Membuat Pesanan",
      error?.message || "Terjadi kesalahan saat menyimpan pesanan."
    );
  }
};

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Kembali ke keranjang" onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={22} color={ROSE} />
          </Pressable>

          <Text style={styles.headerTitle}>Checkout</Text>
          <Text style={styles.brand}>ra_scrafts.id</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Section title="Ringkasan Pesanan">
            {selectedCartItems.map((item, index) => (
              <View key={`${item.id}-${item.variant || index}`} style={styles.productRow}>
                <Image source={item.image ? { uri: item.image } : undefined} style={styles.productImage} resizeMode="cover" />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  {item.variant ? <Text style={styles.variant}>{item.variant}</Text> : null}
                  <Text style={styles.quantityText}>Jumlah: {item.quantity}</Text>
                  <Text style={styles.productPrice}>{rupiah(item.price * item.quantity)}</Text>
                </View>
              </View>
            ))}
          </Section>

          <Section title="Informasi Pemesan">
            <Text style={styles.label}>Nama Pemesan</Text>
            <TextInput 
              value={recipientName} 
              editable={false} 
              style={[styles.input, styles.disabledInput]} 
            />

            <Text style={styles.label}>Nomor Telepon</Text>
            <TextInput 
              value={recipientPhone} 
              editable={false} 
              style={[styles.input, styles.disabledInput]} 
            />
          </Section>

          <Section title="Jadwal Pengambilan ke Toko">
            <Text style={styles.label}>Tanggal Pengambilan *</Text>
            <View style={styles.iconInputContainer}>
              <CalendarDays size={18} color={ROSE} />
              <TextInput value={deliveryDate} onChangeText={(value: string) => setDeliveryDate(formatDate(value))} placeholder="DD/MM/YYYY" placeholderTextColor="#B58B9B" keyboardType="number-pad" style={styles.iconInput} maxLength={10} />
            </View>

            <Text style={styles.label}>Waktu Pengambilan *</Text>
            <View style={styles.iconInputContainer}>
              <Clock3 size={18} color={ROSE} />
              <TextInput value={deliveryTime} onChangeText={setDeliveryTime} placeholder="Contoh: 14:00 - 16:00 WIB" placeholderTextColor="#B58B9B" style={styles.iconInput} maxLength={30} />
            </View>
          </Section>

          <Section title="Pesan pada Kartu (Opsional)">
            <TextInput value={cardMessage} onChangeText={setCardMessage} placeholder="Tuliskan pesan untuk penerima..." placeholderTextColor="#B58B9B" multiline numberOfLines={3} textAlignVertical="top" style={[styles.input, styles.multilineInput]} maxLength={300} />
          </Section>

          <Section title="Metode Pembayaran">
            {PAYMENT_METHODS.map((method) => {
              const selected = selectedPayment === method.id;
              return (
                <Pressable
                  key={method.id}
                  onPress={() => {
                    setSelectedPayment(method.id);
                    if (method.id === "cod") setPaymentProof(null);
                  }}
                  style={[styles.paymentOption, selected && styles.paymentOptionSelected]}
                >
                  <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>{selected && <View style={styles.radioInner} />}</View>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentName}>{method.name}</Text>
                    <Text style={styles.paymentDescription}>{method.description}</Text>
                    {method.accountName ? <Text style={styles.accountName}>{method.accountName}</Text> : null}
                  </View>
                </Pressable>
              );
            })}
          </Section>

          {selectedPayment !== "cod" && (
            <Section title="Bukti Pembayaran">
              <Text style={styles.muted}>Pilih gambar bukti transfer dari galeri HP.</Text>
              {paymentProof ? (
                <View style={styles.proofPreviewContainer}>
                  <Image source={{ uri: paymentProof }} style={styles.proofPreview} resizeMode="cover" />
                  <Pressable onPress={() => setPaymentProof(null)} style={styles.removeProofButton}>
                    <X size={18} color="#FFFFFF" />
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={choosePaymentProof} style={styles.uploadButton}>
                  <Upload size={20} color={ROSE} />
                  <Text style={styles.uploadText}>Pilih Bukti Pembayaran</Text>
                </Pressable>
              )}
            </Section>
          )}

          <Section title="Rincian Pembayaran">
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>{rupiah(subtotal)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{rupiah(total)}</Text>
            </View>
          </Section>

          <Pressable onPress={handlePlaceOrder} style={[styles.orderButton, selectedCartItems.length === 0 && styles.disabledButton]}>
            <Text style={styles.orderButtonText}>Buat Pesanan · {rupiah(total)}</Text>
          </Pressable>
        </ScrollView>

        <Modal visible={showSuccess} transparent animationType="fade" onRequestClose={() => setShowSuccess(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.successIcon}>
                <Text style={styles.successCheck}>✓</Text>
              </View>
              <Text style={styles.modalTitle}>Pesanan Siap Dikonfirmasi!</Text>
              <Text style={styles.modalMessage}>Total pembayaran kamu {rupiah(total)}. Pastikan semua informasi sudah benar.</Text>
              <Pressable onPress={handleFinish} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Lanjutkan</Text>
              </Pressable>
              <Pressable onPress={() => setShowSuccess(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Periksa Kembali</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  page: { flex: 1, backgroundColor: CREAM },
  header: { alignItems: "center", justifyContent: "center", paddingTop: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
  backButton: { position: "absolute", left: 16, top: 14, width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: PINK, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: ROSE, fontSize: 25, fontWeight: "700" },
  brand: { color: ROSE, fontSize: 12, marginTop: 2 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 30, gap: 14 },
  section: { padding: 14, borderRadius: 16, borderWidth: 1, borderColor: BORDER, backgroundColor: "#FFFFFF", gap: 10 },
  sectionTitle: { color: ROSE, fontSize: 17, fontWeight: "700", marginBottom: 2 },
  productRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F8E8ED", gap: 12 },
  productImage: { width: 76, height: 88, borderRadius: 10, backgroundColor: "#F7E6E6" },
  productInfo: { flex: 1, gap: 3 },
  productName: { color: ROSE, fontSize: 14, fontWeight: "700" },
  variant: { color: "#966579", fontSize: 11 },
  quantityText: { color: "#966579", fontSize: 11 },
  productPrice: { color: ROSE, fontSize: 14, fontWeight: "800", marginTop: 3 },
  label: { color: ROSE, fontSize: 12, fontWeight: "600", marginTop: 2 },
  input: { minHeight: 44, borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: "#50313D", fontSize: 13, backgroundColor: "#FFFCFA" },
  multilineInput: { minHeight: 86, textAlignVertical: "top" },
  iconInputContainer: { minHeight: 46, borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFCFA" },
  iconInput: { flex: 1, paddingVertical: 10, color: "#50313D", fontSize: 13 },
  paymentOption: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: BORDER, gap: 10 },
  paymentOptionSelected: { borderColor: ROSE, backgroundColor: "#FFF5F8" },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: PINK, alignItems: "center", justifyContent: "center" },
  radioOuterSelected: { borderColor: ROSE },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: ROSE },
  paymentInfo: { flex: 1, gap: 3 },
  paymentName: { color: ROSE, fontSize: 13, fontWeight: "700" },
  paymentDescription: { color: "#966579", fontSize: 11 },
  accountName: { color: "#966579", fontSize: 10 },
  muted: { color: "#966579", fontSize: 11, lineHeight: 17 },
  uploadButton: { minHeight: 54, borderWidth: 1, borderStyle: "dashed", borderColor: ROSE, borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 9, backgroundColor: "#FFF8FA" },
  uploadText: { color: ROSE, fontSize: 12, fontWeight: "700" },
  proofPreviewContainer: { position: "relative", alignSelf: "flex-start" },
  proofPreview: { width: 190, height: 150, borderRadius: 12, backgroundColor: "#F7E6E6" },
  removeProofButton: { position: "absolute", top: 6, right: 6, width: 30, height: 30, borderRadius: 15, backgroundColor: ROSE, alignItems: "center", justifyContent: "center" },
  changeProofButton: { alignSelf: "flex-start", paddingVertical: 6 },
  changeProofText: { color: ROSE, fontSize: 12, fontWeight: "700" },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  priceLabel: { color: "#966579", fontSize: 12 },
  priceValue: { color: ROSE, fontSize: 12, fontWeight: "600" },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 3 },
  totalLabel: { color: ROSE, fontSize: 15, fontWeight: "800" },
  totalValue: { color: ROSE, fontSize: 18, fontWeight: "800" },
  orderButton: { minHeight: 50, borderRadius: 13, backgroundColor: ROSE, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  disabledButton: { opacity: 0.55 },
  orderButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  disclaimer: { color: "#966579", fontSize: 10, lineHeight: 16, textAlign: "center", paddingHorizontal: 8 },
  emptyCard: { alignItems: "center", paddingVertical: 14, gap: 10 },
  emptyTitle: { color: ROSE, fontSize: 14, fontWeight: "700", textAlign: "center" },
  primaryButton: { width: "100%", minHeight: 44, borderRadius: 11, backgroundColor: ROSE, alignItems: "center", justifyContent: "center", paddingHorizontal: 14, marginTop: 4 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  cancelButton: { paddingVertical: 10, alignItems: "center" },
  cancelButtonText: { color: ROSE, fontSize: 12, fontWeight: "600" },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(45, 20, 32, 0.45)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: { width: "100%", maxWidth: 360, padding: 22, borderRadius: 20, backgroundColor: CREAM, alignItems: "center", gap: 12 },
  successIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: "#F5DCE5", alignItems: "center", justifyContent: "center" },
  successCheck: { color: ROSE, fontSize: 32, fontWeight: "800" },
  modalTitle: { color: ROSE, fontSize: 18, fontWeight: "800", textAlign: "center" },
  modalMessage: { color: "#966579", fontSize: 12, lineHeight: 19, textAlign: "center" },
  disabledInput: {
    backgroundColor: "#F2E4E5",
    color: "#806A72",
  },
});