import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, useWindowDimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [showAllOrders, setShowAllOrders] = useState<boolean>(false);

  const summaryItems = [
    { value: "48", title: "Jumlah Produk", desc: "Buket & hadiah aktif", icon: "cube-outline" as const, route: "/admin/produk_admin" },
    { value: "12", title: "Pesanan Masuk", desc: "+3 pesanan hari ini", icon: "bag-outline" as const, route: "/admin/kelola_pesanan_admin" },
    { value: "05", title: "Menunggu Verifikasi", desc: "Perlu cek pembayaran", icon: "receipt-outline" as const, route: "/admin/verifikasi_admin" },
    { value: "07", title: "Siap Diambil", desc: "Siap membawa senyum", icon: "gift-outline" as const, route: "/admin/status_admin" },
  ];

  const orderItems = [
    {
      id: "1", customer: "Nadia Putri", product: "Buket Mawar • Pink Romance", date: "19 Okt, 14.00",
      status: "Verifikasi", statusBg: "#FFF2DD", statusColor: "#986E2F",
      photo: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300",
    },
    {
      id: "2", customer: "Alya Rahma", product: "Buket Tulip • Peach Bloom", date: "18 Okt, 16.30",
      status: "Siap diambil", statusBg: "#EAF1E8", statusColor: "#557153",
      photo: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=300",
    },
  ];

  const visibleOrders = showAllOrders ? orderItems : orderItems.slice(0, 3);

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
        <View style={styles.storeOverview}>
          <View style={styles.welcomeSection}>
            <View style={styles.greetingContainer}>
              <Text style={styles.welcomeTitle}>Selamat pagi, Admin</Text>
              <Text style={styles.welcomeMessage}>Hari baru, cerita indah dalam setiap buket.</Text>
            </View>
            <MaterialCommunityIcons name="flower-outline" size={32} color={COLORS.primary} style={{ opacity: 0.65 }} />
          </View>

          <View style={styles.ringkasanSection}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Ringkasan</Text>
              <Text style={styles.reportingDate}>Minggu, 18 Okt 2026</Text>
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricRow}>
                {summaryItems.slice(0, 2).map((item, index) => (
                  <TouchableOpacity key={index} style={styles.summaryCard} onPress={() => router.push(item.route as any)}>
                    <View style={styles.valueAndIcon}>
                      <Text style={styles.metricValue}>{item.value}</Text>
                      <View style={styles.metricSymbol}>
                        <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                      </View>
                    </View>
                    <View style={styles.metricDetails}>
                      <Text style={styles.metricLabel}>{item.title}</Text>
                      <Text style={styles.metricContext}>{item.desc}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.metricRow}>
                {summaryItems.slice(2, 4).map((item, index) => (
                  <TouchableOpacity key={index} style={styles.summaryCard} onPress={() => router.push(item.route as any)}>
                    <View style={styles.valueAndIcon}>
                      <Text style={styles.metricValue}>{item.value}</Text>
                      <View style={styles.metricSymbol}>
                        <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                      </View>
                    </View>
                    <View style={styles.metricDetails}>
                      <Text style={styles.metricLabel}>{item.title}</Text>
                      <Text style={styles.metricContext}>{item.desc}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.recentOrdersSection}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Pesanan Terbaru</Text>
            <TouchableOpacity onPress={() => router.push("/admin/kelola_pesanan_admin" as any)} style={styles.allOrdersBtn}>
              <Text style={styles.viewAllText}>{showAllOrders ? "Tutup" : "Lihat semua"}</Text>
              <Ionicons name="arrow-forward" size={13} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.orderList}>
            {visibleOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <TouchableOpacity style={styles.orderDetails} onPress={() => router.push("/admin/kelola_pesanan_admin" as any)}>
                  <Image source={{ uri: order.photo }} style={styles.bouquetPhoto} />
                  <View style={styles.customerAndBouquet}>
                    <View style={styles.customerHeading}>
                      <Text style={styles.customerName}>{order.customer}</Text>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </View>
                    <Text style={styles.bouquetType}>{order.product}</Text>

                    <View style={styles.pickupAndStatus}>
                      <View style={styles.pickupDate}>
                        <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
                        <Text style={styles.pickupTime}>{order.date}</Text>
                      </View>
                      <TouchableOpacity style={[styles.orderStatus, { backgroundColor: order.statusBg }]} onPress={() => router.push("/admin/status_admin" as any)}>
                        <Text style={[styles.statusLabel, { color: order.statusColor }]}>{order.status}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
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
    width: 40, height: 40, backgroundColor: COLORS.white, borderRadius: 100, justifyContent: "center", alignItems: "center",
    shadowColor: "#7E3E55", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.13, shadowRadius: 10, elevation: 3,
  },
  headerDivider: { width: "100%", height: 1, backgroundColor: COLORS.border },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28, gap: 20 },
  storeOverview: { gap: 16 },
  welcomeSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greetingContainer: { gap: 4 },
  welcomeTitle: { fontFamily: "Playfair Display", fontWeight: "600", fontSize: 22, color: COLORS.textDark },
  welcomeMessage: { fontFamily: "Poppins", fontWeight: "400", fontSize: 12, color: COLORS.textMuted },
  ringkasanSection: { gap: 12 },
  sectionHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontFamily: "Playfair Display", fontWeight: "600", fontSize: 20, color: COLORS.primary },
  reportingDate: { fontFamily: "Poppins", fontWeight: "400", fontSize: 11, color: COLORS.textMuted },
  metricsGrid: { gap: 12 },
  metricRow: { flexDirection: "row", gap: 12 },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.white, padding: 14, borderRadius: 18, gap: 8,
    shadowColor: "#7E3E55", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 2,
  },
  valueAndIcon: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metricValue: { fontFamily: "Poppins", fontWeight: "700", fontSize: 26, color: COLORS.primary },
  metricSymbol: { width: 34, height: 34, backgroundColor: COLORS.lightPink, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  metricDetails: { gap: 2 },
  metricLabel: { fontFamily: "Poppins", fontWeight: "600", fontSize: 12, color: COLORS.primary },
  metricContext: { fontFamily: "Poppins", fontWeight: "400", fontSize: 10, color: COLORS.textMuted },
  recentOrdersSection: { gap: 10, paddingBottom: 24 },
  allOrdersBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewAllText: { fontFamily: "Poppins", fontWeight: "600", fontSize: 11, color: COLORS.primary },
  orderList: { gap: 10 },
  orderCard: {
    backgroundColor: COLORS.white, padding: 14, borderRadius: 18,
    shadowColor: "#7E3E55", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 2,
  },
  orderDetails: { flexDirection: "row", alignItems: "center", gap: 12 },
  bouquetPhoto: { width: 60, height: 64, borderRadius: 12 },
  customerAndBouquet: { flex: 1, gap: 5 },
  customerHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  customerName: { fontFamily: "Poppins", fontWeight: "600", fontSize: 14, color: COLORS.textDark },
  bouquetType: { fontFamily: "Poppins", fontWeight: "400", fontSize: 12, color: COLORS.textMuted },
  pickupAndStatus: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  pickupDate: { flexDirection: "row", alignItems: "center", gap: 5 },
  pickupTime: { fontFamily: "Poppins", fontWeight: "400", fontSize: 11, color: COLORS.textMuted },
  orderStatus: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  statusLabel: { fontFamily: "Poppins", fontWeight: "600", fontSize: 10 },
});