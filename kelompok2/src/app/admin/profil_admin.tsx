import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
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
};

export default function ProfilAdminScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 360;

  return (
    <SafeAreaView style={styles.container}>
      {/* APP HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.brandAndAccount}>
          <Text style={styles.appTitle}>ra_scrafts.id Admin</Text>
          <View style={styles.adminProfile}>
            <Ionicons name="person-outline" size={18} color={COLORS.primary} />
          </View>
        </View>
        <View style={styles.headerDivider} />
      </View>

      {/* SCROLLABLE CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card Header (Tanpa Foto) */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarIconContainer}>
            <Ionicons name="person" size={28} color={COLORS.primary} />
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.adminName}>Euis Fahira Yuningsih</Text>
            <Text style={styles.adminRole}>Owner & Manager • ra_scrafts.id</Text>
            <View style={styles.statusBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.statusText}>Sistem Toko Aktif</Text>
            </View>
          </View>
        </View>

        {/* Quick Menu Options */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Akses Cepat Admin</Text>
          
          <View style={styles.menuCard}>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => router.push('/kelola_pesanan_admin' as any)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="bag-handle-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuLabel}>Kelola Pesanan Masuk</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => router.push('/produk_admin' as any)}
            >
              <View style={styles.menuIconContainer}>
                <MaterialCommunityIcons name="flower-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuLabel}>Kelola Koleksi Buket</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => router.push('/verifikasi_admin' as any)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuLabel}>Verifikasi Pembayaran</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => router.push('/status_admin' as any)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="gift-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuLabel}>Update Progres Buket</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button: Keluar / Logout */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => router.replace('/login' as any)}
        >
          <Ionicons name="log-out-outline" size={18} color={COLORS.primary} />
          <Text style={styles.logoutText}>Keluar dari Mode Admin</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR RESPONSIVE */}
      <View style={styles.bottomNavigation}>
        <View style={styles.navigationItems}>
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/index_admin' as any)}
          >
            <Ionicons name="grid-outline" size={isSmallScreen ? 17 : 19} color={COLORS.textMuted} />
            <Text style={[styles.navLabel, isSmallScreen && { fontSize: 8 }]}>Beranda</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/kelola_pesanan_admin' as any)}
          >
            <Ionicons name="bag-outline" size={isSmallScreen ? 17 : 19} color={COLORS.textMuted} />
            <Text style={[styles.navLabel, isSmallScreen && { fontSize: 8 }]}>Pesanan</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => router.push('/produk_admin' as any)}
          >
            <MaterialCommunityIcons name="flower-outline" size={isSmallScreen ? 17 : 19} color={COLORS.textMuted} />
            <Text style={[styles.navLabel, isSmallScreen && { fontSize: 8 }]}>Produk</Text>
          </TouchableOpacity>

          <View style={styles.activeNavigationItem}>
            <Ionicons name="person-outline" size={18} color={COLORS.primary} />
            <Text style={styles.activeNavigationLabel}>Akun</Text>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    gap: 20,
  },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    gap: 14,
    shadowColor: '#7E3E55',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  avatarIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 100,
    backgroundColor: COLORS.lightPink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileMeta: {
    flex: 1,
    gap: 3,
  },
  adminName: {
    fontFamily: 'Playfair Display',
    fontWeight: '600',
    fontSize: 18,
    color: COLORS.textDark,
  },
  adminRole: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 11,
    color: COLORS.textMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  activeDot: {
    width: 7,
    height: 7,
    backgroundColor: '#557153',
    borderRadius: 100,
  },
  statusText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 10,
    color: '#557153',
  },
  menuSection: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: 'Playfair Display',
    fontWeight: '500',
    fontSize: 18,
    color: COLORS.primary,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingVertical: 4,
    shadowColor: '#7E3E55',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.lightPink,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 12,
    color: COLORS.textDark,
  },
  itemDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: COLORS.lightPink,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logoutText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 12,
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
});