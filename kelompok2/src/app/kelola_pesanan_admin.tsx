import React from "react";
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
  textMuted: "#958189",
  white: "#FFFFFF",
};

interface OrderItem {
  id: string;
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
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 360;
  const tabFontSize = isSmallScreen ? 9 : 10;

  const orders: OrderItem[] = [
    {
      id: "1",
      orderNumber: "#RS-1048",
      customerName: "Nadia Putri",
      status: "Verifikasi",
      statusBg: "#FFF2DD",
      statusColor: "#986E2F",
      bouquetName: "Pink Romance",
      quantityPrice: "1 buket · Rp185.000",
      pickupTime: "18 Okt 2026 - 14.00 WIB",
      greetingMessage: "“Selamat ulang tahun, Mama. Terima kasih untuk cinta yang tak pernah habis. 🤍”",
      photo: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300",
    },
    {
      id: "2",
      orderNumber: "#RS-1047",
      customerName: "Alya Rahma",
      status: "Siap diambil",
      statusBg: "#EAF1E8",
      statusColor: "#557153",
      bouquetName: "Peach Bloom",
      quantityPrice: "1 buket · Rp165.000",
      pickupTime: "18 Okt 2026 - 16.30 WIB",
      greetingMessage: "“Untuk hari istimewamu. Semoga bahagia selalu, sahabat terbaikkul”",
      photo: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=300",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* APP HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.brandAndAccount}>
          <Text style={styles.appTitle}>ra_scrafts.id Admin</Text>
          <TouchableOpacity style={styles.adminProfile} onPress={() => router.push("/profil_admin" as any)}>
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
            { label: "Kelola\nProduk", route: "/produk_admin" },
            { label: "Kelola\nPesanan", route: "/kelola_pesanan_admin" },
            { label: "Verifikasi", route: "/verifikasi_admin" },
            { label: "Update\nStatus", route: "/status_admin" },
          ].map((tab) => {
            const isActive = tab.route === "/kelola_pesanan_admin";
            return (
              <TouchableOpacity key={tab.route} style={[styles.managementTab, isActive && styles.activeTabBg]} onPress={() => router.push(tab.route as any)}>
                <Text style={[styles.tabLabel, { fontSize: tabFontSize }, isActive && styles.activeTabLabel]} numberOfLines={2}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Workspace Content */}
        <View style={styles.workspace}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Pesanan masuk</Text>
            <Text style={styles.sectionContext}>12 pesanan</Text>
          </View>

          <View style={styles.orderList}>
            {orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
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
                  <Ionicons name="calendar-outline" size={17} color={COLORS.primary} />
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
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR RESPONSIVE */}
      <View style={styles.bottomNavigation}>
        <View style={styles.navigationItems}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/index_admin" as any)}>
            <Ionicons name="grid-outline" size={isSmallScreen ? 17 : 19} color={COLORS.textMuted} />
            <Text style={[styles.navLabel, isSmallScreen && { fontSize: 8 }]}>Beranda</Text>
          </TouchableOpacity>

          <View style={styles.activeNavigationItem}>
            <Ionicons name="bag-outline" size={18} color={COLORS.primary} />
            <Text style={styles.activeNavigationLabel}>Pesanan</Text>
          </View>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/produk_admin" as any)}>
            <MaterialCommunityIcons name="flower-outline" size={isSmallScreen ? 17 : 19} color={COLORS.textMuted} />
            <Text style={[styles.navLabel, isSmallScreen && { fontSize: 8 }]}>Produk</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/profil_admin" as any)}>
            <Ionicons name="person-outline" size={isSmallScreen ? 17 : 19} color={COLORS.textMuted} />
            <Text style={[styles.navLabel, isSmallScreen && { fontSize: 8 }]}>Akun</Text>
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
  container: { flex: 1, backgroundColor: COLORS.bgApp },
  headerContainer: { width: "100%", backgroundColor: COLORS.bgApp },
  brandAndAccount: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 68,
  },
  appTitle: {
    fontFamily: "Playfair Display",
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
  headerDivider: { width: "100%", height: 1, backgroundColor: COLORS.border },
  scrollContent: { paddingBottom: 30 },
  pageIntro: { paddingHorizontal: 20, paddingVertical: 10, gap: 3 },
  pageTitle: {
    fontFamily: "Playfair Display",
    fontWeight: "600",
    fontSize: 28,
    lineHeight: 35,
    color: COLORS.primary,
  },
  pageSubtitle: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textMuted,
  },
  managementTabs: {
    flexDirection: "row",
    backgroundColor: COLORS.lightPink,
    marginHorizontal: 20,
    padding: 4,
    borderRadius: 14,
    gap: 2,
    minHeight: 54,
  },
  managementTab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 2,
    paddingVertical: 6,
  },
  activeTabBg: { backgroundColor: COLORS.accentPink },
  tabLabel: {
    fontFamily: "Poppins",
    fontWeight: "400",
    lineHeight: 14,
    textAlign: "center",
    color: "#986678",
  },
  activeTabLabel: {
    fontFamily: "Poppins",
    fontWeight: "600",
    color: COLORS.primary,
  },
  workspace: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 28,
  },
  sectionTitle: {
    fontFamily: "Playfair Display",
    fontWeight: "500",
    fontSize: 20,
    color: COLORS.primary,
  },
  sectionContext: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: 11,
    color: COLORS.textMuted,
  },
  orderList: { gap: 12 },
  orderCard: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 18,
    gap: 9,
    shadowColor: "#7E3E55",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  customerAndStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerIdentity: { gap: 1 },
  orderNumber: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: 10,
    color: COLORS.textMuted,
  },
  customerName: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 13,
    color: COLORS.textDark,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  statusLabel: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: 8,
  },
  orderedBouquet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bouquetPhotograph: { width: 48, height: 48, borderRadius: 10 },
  bouquetDetails: { flex: 1, gap: 3 },
  bouquetName: {
    fontFamily: "Playfair Display",
    fontWeight: "500",
    fontSize: 18,
    color: COLORS.primary,
  },
  quantityPrice: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: 11,
    color: COLORS.textMuted,
  },
  scheduledPickup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pickupDetails: { gap: 1 },
  pickupLabel: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: 10,
    color: COLORS.textMuted,
  },
  pickupTime: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: 11,
    color: COLORS.primary,
  },
  greetingCardMessage: {
    backgroundColor: COLORS.lightPink,
    padding: 10,
    borderRadius: 10,
    gap: 4,
  },
  greetingLabel: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 10,
    color: COLORS.primary,
  },
  customGreeting: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: 11,
    lineHeight: 15,
    color: COLORS.textDark,
  },
  bottomNavigation: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    shadowColor: "#71384C",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  navigationItems: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  navLabel: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: 9,
    color: COLORS.textMuted,
  },
  activeNavigationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.accentPink,
    borderRadius: 100,
    gap: 7,
  },
  activeNavigationLabel: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 12,
    color: COLORS.primary,
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