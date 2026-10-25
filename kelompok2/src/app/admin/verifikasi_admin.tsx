import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, useWindowDimensions } from "react-native";
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

interface VerificationItem {
  id: string;
  orderReference: string;
  customerName: string;
  transferAmount: string;
  transferTime: string;
  proofPhoto: string;
}

export default function VerifikasiPembayaranScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 360;
  const tabFontSize = isSmallScreen ? 9 : 10;

  const pendingPayments: VerificationItem[] = [
    {
      id: "1",
      orderReference: "#RS-1048",
      customerName: "Nadia Putri",
      transferAmount: "Rp185.000",
      transferTime: "18 Okt 2026, 14.15 WIB",
      proofPhoto: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300",
    },
    {
      id: "2",
      orderReference: "#RS-1049",
      customerName: "Rina Oktaviani",
      transferAmount: "Rp210.000",
      transferTime: "18 Okt 2026, 15.30 WIB",
      proofPhoto: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=300",
    },
  ];

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
            { label: "Kelola\nProduk", route: "/produk_admin" },
            { label: "Kelola\nPesanan", route: "/kelola_pesanan_admin" },
            { label: "Verifikasi", route: "/verifikasi_admin" },
            { label: "Update\nStatus", route: "/status_admin" },
          ].map((tab) => {
            const isActive = tab.route === "/verifikasi_admin";
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
            <Text style={styles.sectionTitle}>Menunggu verifikasi</Text>
            <Text style={styles.sectionContext}>5 bukti pembayaran</Text>
          </View>

          <View style={styles.verificationList}>
            {pendingPayments.map((item) => (
              <View key={item.id} style={styles.verificationCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.customerDetails}>
                    <Text style={styles.orderRef}>{item.orderReference}</Text>
                    <Text style={styles.customerName}>{item.customerName}</Text>
                  </View>
                  <Text style={styles.transferAmount}>{item.transferAmount}</Text>
                </View>

                <View style={styles.proofSection}>
                  <Image source={{ uri: item.proofPhoto }} style={styles.proofThumbnail} />
                  <View style={styles.proofMeta}>
                    <Text style={styles.transferTimeLabel}>Waktu Transfer</Text>
                    <Text style={styles.transferTimeValue}>{item.transferTime}</Text>
                    <TouchableOpacity style={styles.viewProofBtn}>
                      <Ionicons name="eye-outline" size={14} color={COLORS.primary} />
                      <Text style={styles.viewProofText}>Lihat bukti transfer</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity style={styles.rejectBtn}>
                    <Text style={styles.rejectBtnText}>Tolak</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.approveBtn}>
                    <Text style={styles.approveBtnText}>Konfirmasi Pembayaran</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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

          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/produk_admin' as any)}>
            <MaterialCommunityIcons name="flower-outline" size={isSmallScreen ? 17 : 19} color={COLORS.textMuted} />
            <Text style={[styles.navLabel, isSmallScreen && { fontSize: 8 }]}>Produk</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profil_admin' as any)}>
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
  headerDivider: {
    width: "100%",
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
  activeTabBg: {
    backgroundColor: COLORS.accentPink,
  },
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
  workspace: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
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
  verificationList: {
    gap: 12,
  },
  verificationCard: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 18,
    gap: 12,
    shadowColor: "#7E3E55",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerDetails: {
    gap: 1,
  },
  orderRef: {
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
  transferAmount: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 14,
    color: COLORS.primary,
  },
  proofSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.bgApp,
    padding: 10,
    borderRadius: 12,
  },
  proofThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  proofMeta: {
    flex: 1,
    gap: 2,
  },
  transferTimeLabel: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: 9,
    color: COLORS.textMuted,
  },
  transferTimeValue: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: 11,
    color: COLORS.textDark,
  },
  viewProofBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  viewProofText: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: 10,
    color: COLORS.primary,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  rejectBtn: {
    flex: 1,
    height: 38,
    backgroundColor: COLORS.lightPink,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  rejectBtnText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 11,
    color: COLORS.primary,
  },
  approveBtn: {
    flex: 2,
    height: 38,
    backgroundColor: COLORS.accentPink,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  approveBtnText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 11,
    color: COLORS.white,
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