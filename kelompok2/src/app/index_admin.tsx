import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';

const COLORS = {
  bgApp: "#FFF8F0",
  primary: "#A83F68",
  accentPink: "#E8A6BD",
  lightPink: "#FBEAF0",
  border: "#F2E4E5",
  textDark: "#49343C",
  textMuted: "#958189",
  white: "#FFFFFF",
};

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface SummaryItem {
  value: string;
  title: string;
  desc: string;
  icon: IoniconsName;
  route: string;
}

interface OrderItem {
  id: string;
  customer: string;
  product: string;
  date: string;
  status: string;
  statusBg: string;
  statusColor: string;
  photo: string;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [showAllOrders, setShowAllOrders] = useState<boolean>(false);

  // Kartu Ringkasan yang terhubung ke masing-masing halaman admin
  const summaryItems: SummaryItem[] = [
    { value: "48", title: "Jumlah Produk", desc: "Buket & hadiah aktif", icon: "cube-outline", route: "/produk_admin" },
    { value: "12", title: "Pesanan Masuk", desc: "+3 pesanan hari ini", icon: "bag-outline", route: "/kelola_pesanan_admin" },
    { value: "05", title: "Menunggu Verifikasi", desc: "Perlu cek pembayaran", icon: "receipt-outline", route: "/verifikasi_admin" },
    { value: "07", title: "Siap Diambil", desc: "Siap membawa senyum", icon: "gift-outline", route: "/status_admin" },
  ];

  const orderItems: OrderItem[] = [
    {
      id: "1",
      customer: "Nadia Putri",
      product: "Buket Mawar • Pink Romance",
      date: "19 Okt, 14.00",
      status: "Verifikasi",
      statusBg: "#FFF2DD",
      statusColor: "#986E2F",
      photo: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300",
    },
    {
      id: "2",
      customer: "Alya Rahma",
      product: "Buket Tulip • Peach Bloom",
      date: "18 Okt, 16.30",
      status: "Siap diambil",
      statusBg: "#EAF1E8",
      statusColor: "#557153",
      photo: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=300",
    },
    {
      id: "3",
      customer: "Dinda Maharani",
      product: "Buket Wisuda • Sweet Lilac",
      date: "19 Okt, 10.00",
      status: "Diproses",
      statusBg: "#FBEAF0",
      statusColor: "#A83F68",
      photo: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=300",
    },
  ];

  const visibleOrders = showAllOrders ? orderItems : orderItems.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      {/* APP HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.brandAndAccount}>
          <Text style={styles.appTitle}>ra_scrafts.id Admin</Text>
          <TouchableOpacity 
            style={styles.adminProfile}
            onPress={() => router.push('/profil_admin' as any)}
          >
            <Ionicons name="person-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerDivider} />
      </View>

      {/* SCROLLABLE DASHBOARD */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Store Overview */}
        <View style={styles.storeOverview}>
          <View style={styles.welcomeSection}>
            <View style={styles.greetingContainer}>
              <Text style={styles.welcomeTitle}>Selamat pagi, Admin</Text>
              <Text style={styles.welcomeMessage}>Hari baru, cerita indah dalam setiap buket.</Text>
            </View>
            <MaterialCommunityIcons name="flower-outline" size={28} color={COLORS.primary} style={{ opacity: 0.65 }} />
          </View>

          {/* Ringkasan */}
          <View style={styles.ringkasanSection}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Ringkasan</Text>
              <Text style={styles.reportingDate}>Minggu, 18 Okt 2026</Text>
            </View>

            {/* Metrics Grid yang Bisa Dipencet */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricRow}>
                {summaryItems.slice(0, 2).map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.summaryCard}
                    onPress={() => router.push(item.route as any)}
                  >
                    <View style={styles.valueAndIcon}>
                      <Text style={styles.metricValue}>{item.value}</Text>
                      <View style={styles.metricSymbol}>
                        <Ionicons name={item.icon} size={18} color={COLORS.primary} />
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
                  <TouchableOpacity 
                    key={index} 
                    style={styles.summaryCard}
                    onPress={() => router.push(item.route as any)}
                  >
                    <View style={styles.valueAndIcon}>
                      <Text style={styles.metricValue}>{item.value}</Text>
                      <View style={styles.metricSymbol}>
                        <Ionicons name={item.icon} size={18} color={COLORS.primary} />
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

        {/* Pesanan Terbaru */}
        <View style={styles.recentOrdersSection}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Pesanan Terbaru</Text>
            <TouchableOpacity onPress={() => router.push('/kelola_pesanan_admin' as any)} style={styles.allOrdersBtn}>
              <Text style={styles.viewAllText}>{showAllOrders ? "Tutup" : "Lihat semua"}</Text>
              <Ionicons name="arrow-forward" size={12} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.orderList}>
            {visibleOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <TouchableOpacity 
                  style={styles.orderDetails}
                  onPress={() => router.push('/kelola_pesanan_admin' as any)}
                >
                  <Image source={{ uri: order.photo }} style={styles.bouquetPhoto} />
                  <View style={styles.customerAndBouquet}>
                    <View style={styles.customerHeading}>
                      <Text style={styles.customerName}>{order.customer}</Text>
                      <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                    </View>
                    <Text style={styles.bouquetType}>{order.product}</Text>

                    <View style={styles.pickupAndStatus}>
                      <View style={styles.pickupDate}>
                        <Ionicons name="calendar-outline" size={11} color={COLORS.textMuted} />
                        <Text style={styles.pickupTime}>{order.date}</Text>
                      </View>
                      <TouchableOpacity 
                        style={[styles.orderStatus, { backgroundColor: order.statusBg }]}
                        onPress={() => router.push('/status_admin' as any)}
                      >
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

      {/* BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNavigation}>
        <View style={styles.navigationItems}>
          <TouchableOpacity 
            style={styles.activeNavItem}
            onPress={() => router.push('/index_admin' as any)}
          >
            <Ionicons name="grid-outline" size={18} color={COLORS.primary} />
            <Text style={styles.activeNavLabel}>Beranda</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/kelola_pesanan_admin' as any)}>
            <Ionicons name="bag-outline" size={19} color={COLORS.textMuted} />
            <Text style={styles.navLabel}>Pesanan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/produk_admin' as any)}>
            <MaterialCommunityIcons name="flower-outline" size={19} color={COLORS.textMuted} />
            <Text style={styles.navLabel}>Produk</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profil_admin' as any)}>
            <Ionicons name="person-outline" size={19} color={COLORS.textMuted} />
            <Text style={styles.navLabel}>Akun</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.homeIndicatorArea}>
          <View style={styles.homeIndicator} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgApp,
  },
  headerContainer: {
    width: "100%",
    backgroundColor: COLORS.bgApp,
  },
  brandAndAccount: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 68,
  },
  appTitle: {
    fontFamily: 'Playfair Display',
    fontWeight: "600",
    fontSize: 26,
    color: COLORS.primary,
  },
  adminProfile: {
    width: 36,
    height: 36,
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
  headerDivider: {
    width: "100%",
    height: 1,
    backgroundColor: COLORS.border,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 20,
  },
  storeOverview: {
    gap: 16,
  },
  welcomeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 50,
  },
  greetingContainer: {
    gap: 3,
  },
  welcomeTitle: {
    fontFamily: 'Playfair Display',
    fontWeight: "500",
    fontSize: 24,
    color: COLORS.textDark,
  },
  welcomeMessage: {
    fontFamily: 'Poppins',
    fontWeight: "400",
    fontSize: 10,
    color: COLORS.textMuted,
  },
  ringkasanSection: {
    gap: 12,
  },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 27,
  },
  sectionTitle: {
    fontFamily: 'Playfair Display',
    fontWeight: "500",
    fontSize: 20,
    color: COLORS.primary,
  },
  reportingDate: {
    fontFamily: 'Poppins',
    fontWeight: "400",
    fontSize: 10,
    color: COLORS.textMuted,
  },
  metricsGrid: {
    gap: 12,
  },
  metricRow: {
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    height: 101,
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 18,
    gap: 7,
    shadowColor: "#7E3E55",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  valueAndIcon: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricValue: {
    fontFamily: 'Poppins',
    fontWeight: "600",
    fontSize: 28,
    color: COLORS.primary,
  },
  metricSymbol: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.lightPink,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  metricDetails: {
    gap: 2,
  },
  metricLabel: {
    fontFamily: 'Poppins',
    fontWeight: "500",
    fontSize: 11,
    color: COLORS.primary,
  },
  metricContext: {
    fontFamily: 'Poppins',
    fontWeight: "400",
    fontSize: 9,
    color: COLORS.textMuted,
  },
  recentOrdersSection: {
    gap: 10,
    paddingBottom: 24,
  },
  allOrdersBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  viewAllText: {
    fontFamily: 'Poppins',
    fontWeight: "500",
    fontSize: 10,
    color: COLORS.primary,
  },
  orderList: {
    gap: 8,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 18,
    shadowColor: "#7E3E55",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  orderDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bouquetPhoto: {
    width: 54,
    height: 58,
    borderRadius: 12,
  },
  customerAndBouquet: {
    flex: 1,
    gap: 4,
  },
  customerHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerName: {
    fontFamily: 'Poppins',
    fontWeight: "600",
    fontSize: 12,
    color: COLORS.textDark,
  },
  bouquetType: {
    fontFamily: 'Poppins',
    fontWeight: "400",
    fontSize: 10,
    color: COLORS.textMuted,
  },
  pickupAndStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickupDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pickupTime: {
    fontFamily: 'Poppins',
    fontWeight: "400",
    fontSize: 9,
    color: COLORS.textMuted,
  },
  orderStatus: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusLabel: {
    fontFamily: 'Poppins',
    fontWeight: "500",
    fontSize: 8,
  },
  bottomNavigation: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    shadowColor: "#71384C",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  navigationItems: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activeNavItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.accentPink,
    borderRadius: 100,
    gap: 7,
  },
  activeNavLabel: {
    fontFamily: 'Poppins',
    fontWeight: "600",
    fontSize: 12,
    color: COLORS.primary,
  },
  navItem: {
    alignItems: "center",
    gap: 3,
    paddingVertical: 4,
  },
  navLabel: {
    fontFamily: 'Poppins',
    fontWeight: "500",
    fontSize: 9,
    color: COLORS.textMuted,
  },
  homeIndicatorArea: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  homeIndicator: {
    width: 128,
    height: 4,
    backgroundColor: COLORS.textDark,
    borderRadius: 100,
  },
});