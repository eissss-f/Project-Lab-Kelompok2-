import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AdminSubNav from "../../components/AdminSubNav";
import { supabase } from "../../../lib/supabase"; // Sesuaikan path file supabase kamu

const COLORS = {
  bgApp: "#FFF8F0",
  primary: "#A83F68",
  accentPink: "#E8A6BD",
  lightPink: "#FBEAF0",
  border: "#F2E4E5",
  textDark: "#49343C",
  textMuted: "#806A72",
  white: "#FFFFFF",
};

interface OrderItem {
  id: number | string;
  orderNumber: string;
  customerName: string;
  status: string;
  statusBg: string;
  statusColor: string;
  bouquetName: string;
  quantityPrice: string;
  pickupTime: string;
  greetingMessage: string;
  photo: string;
}

export default function KelolaPesananScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil data pesanan dari database Supabase saat halaman dibuka
  useEffect(() => {
    fetchOrdersFromSupabase();
  }, []);

  const fetchOrdersFromSupabase = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders") // Pastikan tabel ini sudah dibuat di Supabase
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedOrders = data.map((item: any) => ({
          id: item.id,
          orderNumber: item.order_number || `#RS-${item.id}`,
          customerName: item.recipient_name || "Pelanggan",
          status: item.status || "Verifikasi",
          statusBg: item.status === "Siap diambil" ? "#EAF1E8" : "#FFF2DD",
          statusColor: item.status === "Siap diambil" ? "#557153" : "#986E2F",
          bouquetName: item.bouquet_name || "Buket Bunga",
          quantityPrice: item.quantity_price || "1 buket",
          pickupTime: `${item.delivery_date || ""} - ${item.delivery_time || ""}`,
          greetingMessage: item.card_message || "Tidak ada pesan khusus.",
          photo: item.photo || "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300",
        }));
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error("Gagal memuat pesanan:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <View style={styles.pageIntro}>
          <Text style={styles.pageTitle}>Kelola Toko</Text>
          <Text style={styles.pageSubtitle}>Kelola Produk & Pesanan</Text>
        </View>

        <AdminSubNav />

        <View style={styles.workspace}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Pesanan masuk</Text>
            <Text style={styles.sectionContext}>{orders.length} pesanan</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : orders.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada pesanan masuk dari pelanggan.</Text>
          ) : (
            <View style={styles.orderList}>
              {orders.map((order) => (
                <View key={String(order.id)} style={styles.orderCard}>
                  <View style={styles.customerAndStatus}>
                    <View style={styles.customerIdentity}>
                      <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                      <Text style={styles.customerName}>{order.customerName}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: order.statusBg }]}>
                      <Text style={[styles.statusLabel, { color: order.statusColor }]}>{order.status}</Text>
                    </View>
                  </View>

                  <View style={styles.orderedBouquet}>
                    <Image source={{ uri: order.photo }} style={styles.bouquetPhotograph} />
                    <View style={styles.bouquetDetails}>
                      <Text style={styles.bouquetName}>{order.bouquetName}</Text>
                      <Text style={styles.quantityPrice}>{order.quantityPrice}</Text>
                    </View>
                  </View>

                  <View style={styles.scheduledPickup}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                    <View style={styles.pickupDetails}>
                      <Text style={styles.pickupLabel}>Jadwal Pengambilan</Text>
                      <Text style={styles.pickupTime}>{order.pickupTime}</Text>
                    </View>
                  </View>

                  <View style={styles.greetingCardMessage}>
                    <Text style={styles.greetingLabel}>Pesan Kartu Ucapan</Text>
                    <Text style={styles.customGreeting}>{order.greetingMessage}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  workspace: { paddingHorizontal: 20, paddingTop: 18, gap: 14 },
  sectionHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontFamily: "Playfair Display", fontWeight: "600", fontSize: 20, color: COLORS.primary },
  sectionContext: { fontFamily: "Poppins", fontWeight: "400", fontSize: 12, color: COLORS.textMuted },
  emptyText: { textAlign: "center", color: COLORS.textMuted, marginTop: 30, fontFamily: "Poppins" },
  orderList: { gap: 14 },
  orderCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 18,
    gap: 12,
    shadowColor: "#7E3E55",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  customerAndStatus: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  customerIdentity: { gap: 2 },
  orderNumber: { fontFamily: "Poppins", fontWeight: "400", fontSize: 11, color: COLORS.textMuted },
  customerName: { fontFamily: "Poppins", fontWeight: "600", fontSize: 14, color: COLORS.textDark },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  statusLabel: { fontFamily: "Poppins", fontWeight: "600", fontSize: 10 },
  orderedBouquet: { flexDirection: "row", alignItems: "center", gap: 12 },
  bouquetPhotograph: { width: 56, height: 56, borderRadius: 12 },
  bouquetDetails: { flex: 1, gap: 4 },
  bouquetName: { fontFamily: "Playfair Display", fontWeight: "600", fontSize: 18, color: COLORS.primary },
  quantityPrice: { fontFamily: "Poppins", fontWeight: "400", fontSize: 12, color: COLORS.textMuted },
  scheduledPickup: { flexDirection: "row", alignItems: "center", gap: 10 },
  pickupDetails: { gap: 2 },
  pickupLabel: { fontFamily: "Poppins", fontWeight: "400", fontSize: 11, color: COLORS.textMuted },
  pickupTime: { fontFamily: "Poppins", fontWeight: "600", fontSize: 12, color: COLORS.primary },
  greetingCardMessage: { backgroundColor: COLORS.lightPink, padding: 12, borderRadius: 12, gap: 5 },
  greetingLabel: { fontFamily: "Poppins", fontWeight: "600", fontSize: 11, color: COLORS.primary },
  customGreeting: { fontFamily: "Poppins", fontWeight: "400", fontSize: 12, lineHeight: 17, color: COLORS.textDark },
});