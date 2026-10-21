import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch } from "react-native";
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

export default function AkunAdminScreen() {
  const router = useRouter();
  const [isNotificationEnabled, setIsNotificationEnabled] = useState<boolean>(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* APP HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.brandAndAccount}>
          <Text style={styles.appTitle}>ra_scrafts.id Admin</Text>
          <View style={styles.adminProfileHeader}>
            <Ionicons name="person-outline" size={18} color={COLORS.primary} />
          </View>
        </View>
        <View style={styles.headerDivider} />
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Page Introduction */}
        <View style={styles.pageIntro}>
          <Text style={styles.pageTitle}>Akun Admin</Text>
          <Text style={styles.pageSubtitle}>Kelola profil, toko, dan keamanan akun.</Text>
        </View>

        {/* Profil dan Pengaturan Container */}
        <View style={styles.profileAndSettings}>
          <View style={styles.sectionGroup}>
            {/* Kartu Identitas Admin */}
            <View style={styles.adminIdentityCard}>
              <View style={styles.adminInitialBadge}>
                <Text style={styles.initialText}>RA</Text>
              </View>
              <View style={styles.adminProfileInfo}>
                <Text style={styles.adminName}>Euis Fahira</Text>
                <View style={styles.adminRoleBadge}>
                  <Text style={styles.adminRoleText}>admin utama</Text>
                </View>
              </View>
              <TouchableOpacity>
                <Text style={styles.editProfileText}>edit profil</Text>
              </TouchableOpacity>
            </View>

            {/* Informasi Akun & Toko */}
            <View style={styles.subSection}>
              <Text style={styles.sectionHeadingTitle}>Informasi akun & toko</Text>

              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
                  <View style={styles.infoRincian}>
                    <Text style={styles.infoLabel}>Email admin</Text>
                    <Text style={styles.infoValue}>fahira@gmail.com</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={18} color={COLORS.primary} />
                  <View style={styles.infoRincian}>
                    <Text style={styles.infoLabel}>Nomor WhatsApp</Text>
                    <Text style={styles.infoValue}>0812-3456-7890</Text>
                  </View>
                </View>

                <View style={styles.pemisah} />

                <View style={styles.storeInfoRow}>
                  <Ionicons name="storefront-outline" size={18} color={COLORS.primary} />
                  <View style={styles.storeRincian}>
                    <Text style={styles.storeName}>ra_scrafts.id</Text>
                    <Text style={styles.storeAddress}>Jl. Ampel Desa Cipeujeuh Wetan, Cirebon</Text>
                    <Text style={styles.storeOperational}>Senin–Sabtu · 09.00–17.00 WIB</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </View>
              </View>
            </View>
          </View>

          {/* PENGATURAN DAN SESI */}
          <View style={styles.sectionGroup}>
            <View style={styles.subSection}>
              <Text style={styles.sectionHeadingTitle}>Pengaturan akun</Text>

              <View style={styles.settingsCard}>
                <TouchableOpacity style={styles.settingItem}>
                  <View style={styles.settingSymbolBg}>
                    <Ionicons name="lock-closed-outline" size={17} color={COLORS.primary} />
                  </View>
                  <View style={styles.settingKeterangan}>
                    <Text style={styles.settingName}>Ubah kata sandi</Text>
                    <Text style={styles.settingDesc}>Terakhir diubah 15 Des 2025</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>

                <View style={styles.pemisah} />

                <View style={styles.settingItem}>
                  <View style={styles.settingSymbolBg}>
                    <Ionicons name="notifications-outline" size={17} color={COLORS.primary} />
                  </View>
                  <View style={styles.settingKeterangan}>
                    <Text style={styles.settingName}>Notifikasi pesanan</Text>
                    <Text style={styles.settingDesc}>Pesanan baru & pembayaran</Text>
                  </View>
                  <Switch
                    trackColor={{ false: '#F2E4E5', true: COLORS.accentPink }}
                    thumbColor={'#FFFFFF'}
                    ios_backgroundColor="#F2E4E5"
                    onValueChange={() => setIsNotificationEnabled(!isNotificationEnabled)}
                    value={isNotificationEnabled}
                  />
                </View>

                <View style={styles.pemisah} />

                <TouchableOpacity style={styles.settingItem}>
                  <View style={styles.settingSymbolBg}>
                    <Ionicons name="shield-checkmark-outline" size={17} color={COLORS.primary} />
                  </View>
                  <View style={styles.settingKeteranganSingle}>
                    <Text style={styles.settingName}>Privasi & keamanan</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={() => router.push("/" as any)}>
              <Ionicons name="log-out-outline" size={17} color={COLORS.primary} />
              <Text style={styles.logoutLabel}>Keluar dari akun</Text>
            </TouchableOpacity>

            <Text style={styles.appVersionText}>ra_scrafts.id · Versi 2.0.0</Text>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNavigation}>
        <View style={styles.navigationItems}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/" as any)}>
            <Ionicons name="grid-outline" size={19} color={COLORS.textMuted} />
            <Text style={styles.navLabel}>Beranda</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/pesanan" as any)}>
            <Ionicons name="bag-outline" size={19} color={COLORS.textMuted} />
            <Text style={styles.navLabel}>Pesanan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/produk" as any)}>
            <MaterialCommunityIcons name="flower-outline" size={19} color={COLORS.textMuted} />
            <Text style={styles.navLabel}>Produk</Text>
          </TouchableOpacity>

          <View style={styles.activeNavItem}>
            <Ionicons name="person-outline" size={18} color={COLORS.primary} />
            <Text style={styles.activeNavLabel}>Akun</Text>
          </View>
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
  adminProfileHeader: {
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
    fontFamily: 'Playfair Display',
    fontWeight: "600",
    fontSize: 28,
    lineHeight: 35,
    color: COLORS.primary,
  },
  pageSubtitle: {
    fontFamily: 'Poppins',
    fontWeight: "400",
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textMuted,
  },
  profileAndSettings: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 16,
  },
  sectionGroup: {
    gap: 14,
  },
  adminIdentityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 18,
    gap: 12,
    shadowColor: "#7E3E55",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  adminInitialBadge: {
    width: 54,
    height: 54,
    backgroundColor: COLORS.lightPink,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: {
    fontFamily: 'Playfair Display',
    fontWeight: "600",
    fontSize: 23,
    color: COLORS.primary,
  },
  adminProfileInfo: {
    flex: 1,
    gap: 4,
  },
  adminName: {
    fontFamily: 'Poppins',
    fontWeight: "600",
    fontSize: 14,
    color: COLORS.textDark,
  },
  adminRoleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLORS.lightPink,
    borderRadius: 100,
    alignSelf: "flex-start",
  },
  adminRoleText: {
    fontFamily: 'Poppins',
    fontWeight: "500",
    fontSize: 10,
    color: COLORS.primary,
  },
  editProfileText: {
    fontFamily: 'Poppins',
    fontWeight: "500",
    fontSize: 11,
    color: COLORS.primary,
  },
  subSection: {
    gap: 8,
  },
  sectionHeadingTitle: {
    fontFamily: 'Playfair Display',
    fontWeight: "500",
    fontSize: 20,
    color: COLORS.primary,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 18,
    gap: 10,
    shadowColor: "#7E3E55",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoRincian: {
    flex: 1,
    gap: 1,
  },
  infoLabel: {
    fontFamily: 'Poppins',
    fontWeight: "400",
    fontSize: 10,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontFamily: 'Poppins',
    fontWeight: "500",
    fontSize: 12,
    color: COLORS.textDark,
  },
  pemisah: {
    width: "100%",
    height: 1,
    backgroundColor: COLORS.border,
  },
  storeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  storeRincian: {
    flex: 1,
    gap: 2,
  },
  storeName: {
    fontFamily: 'Playfair Display',
    fontWeight: "500",
    fontSize: 14,
    color: COLORS.primary,
  },
  storeAddress: {
    fontFamily: 'Poppins',
    fontWeight: "400",
    fontSize: 11,
    color: COLORS.textMuted,
  },
  storeOperational: {
    fontFamily: 'Poppins',
    fontWeight: "400",
    fontSize: 10,
    color: COLORS.textMuted,
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 18,
    shadowColor: "#7E3E55",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    gap: 10,
  },
  settingSymbolBg: {
    width: 30,
    height: 30,
    backgroundColor: COLORS.lightPink,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  settingKeterangan: {
    flex: 1,
    gap: 1,
  },
  settingKeteranganSingle: {
    flex: 1,
  },
  settingName: {
    fontFamily: 'Poppins',
    fontWeight: "500",
    fontSize: 12,
    color: COLORS.textDark,
  },
  settingDesc: {
    fontFamily: 'Poppins',
    fontWeight: "400",
    fontSize: 10,
    color: COLORS.textMuted,
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 44,
    backgroundColor: COLORS.lightPink,
    borderWidth: 1,
    borderColor: COLORS.accentPink,
    borderRadius: 14,
    gap: 8,
  },
  logoutLabel: {
    fontFamily: 'Poppins',
    fontWeight: "600",
    fontSize: 12,
    color: COLORS.primary,
  },
  appVersionText: {
    fontFamily: 'Poppins',
    fontWeight: "400",
    fontSize: 10,
    textAlign: "center",
    color: COLORS.textMuted,
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