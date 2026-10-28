import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase'; 

const COLORS = {
  bgApp: '#FFF8F0',
  primary: '#A83F68',
  accentPink: '#E8A6BD',
  lightPink: '#FBEAF0',
  border: '#F2E4E5',
  textDark: '#49343C',
  textMuted: '#806A72',
  white: '#FFFFFF',
};

export default function ProfilAdminScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminName, setAdminName] = useState<string>('Admin ra_scrafts.id');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // 1. Ambil data user yang sedang login dari Supabase Auth
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;

      if (user) {
        setAdminEmail(user.email || '');
        
        // (Opsional) Jika kamu menyimpan nama lengkap di metadata auth atau tabel profil database:
        // Contoh dari user_metadata: user.user_metadata?.full_name
        if (user.user_metadata?.full_name) {
          setAdminName(user.user_metadata.full_name);
        } else if (user.email) {
          // Jadikan bagian depan email sebagai nama jika metadata kosong
          const nameFromEmail = user.email.split('@')[0];
          setAdminName(nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1));
        }
      }
    } catch (error) {
      console.error('Gagal memuat profil admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/login' as any);
    } catch (error) {
      console.error('Gagal keluar:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerLoading]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.brandAndAccount}>
          <Text style={styles.appTitle}>ra_scrafts.id Admin</Text>
          <View style={styles.adminProfile}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary} />
          </View>
        </View>
        <View style={styles.headerDivider} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarIconContainer}>
            <Ionicons name="person" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.adminName}>{adminName}</Text>
            {/* Menampilkan email yang sedang login secara dinamis */}
            <Text style={styles.adminRole}>{adminEmail || 'Owner & Manager • ra_scrafts.id'}</Text>
            <View style={styles.statusBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.statusText}>Sistem Toko Aktif</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Akses Cepat Admin</Text>
          
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/kelola_pesanan_admin' as any)}>
              <View style={styles.menuIconContainer}><Ionicons name="bag-handle-outline" size={21} color={COLORS.primary} /></View>
              <Text style={styles.menuLabel}>Kelola Pesanan Masuk</Text>
              <Ionicons name="chevron-forward" size={17} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/produk_admin' as any)}>
              <View style={styles.menuIconContainer}><MaterialCommunityIcons name="flower-outline" size={21} color={COLORS.primary} /></View>
              <Text style={styles.menuLabel}>Kelola Koleksi Buket</Text>
              <Ionicons name="chevron-forward" size={17} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/verifikasi_admin' as any)}>
              <View style={styles.menuIconContainer}><Ionicons name="receipt-outline" size={21} color={COLORS.primary} /></View>
              <Text style={styles.menuLabel}>Verifikasi Pembayaran</Text>
              <Ionicons name="chevron-forward" size={17} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/admin/status_admin' as any)}>
              <View style={styles.menuIconContainer}><Ionicons name="gift-outline" size={21} color={COLORS.primary} /></View>
              <Text style={styles.menuLabel}>Update Progres Buket</Text>
              <Ionicons name="chevron-forward" size={17} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.primary} />
          <Text style={styles.logoutText}>Keluar dari Mode Admin</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgApp },
  centerLoading: { justifyContent: 'center', alignItems: 'center' },
  headerContainer: { width: '100%', backgroundColor: COLORS.bgApp },
  brandAndAccount: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 72 },
  appTitle: { fontFamily: 'Playfair Display', fontWeight: '700', fontSize: 26, color: COLORS.primary },
  adminProfile: {
    width: 40, height: 40, backgroundColor: COLORS.white, borderRadius: 100, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#7E3E55', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.13, shadowRadius: 10, elevation: 3,
  },
  headerDivider: { width: '100%', height: 1, backgroundColor: COLORS.border },
  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 35, gap: 22 },
  profileHeaderCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 18, borderRadius: 20, gap: 16,
    shadowColor: '#7E3E55', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 2,
  },
  avatarIconContainer: { width: 60, height: 60, borderRadius: 100, backgroundColor: COLORS.lightPink, justifyContent: 'center', alignItems: 'center' },
  profileMeta: { flex: 1, gap: 4 },
  adminName: { fontFamily: 'Playfair Display', fontWeight: '700', fontSize: 19, color: COLORS.textDark },
  adminRole: { fontFamily: 'Poppins', fontWeight: '400', fontSize: 12, color: COLORS.textMuted },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  activeDot: { width: 8, height: 8, backgroundColor: '#557153', borderRadius: 100 },
  statusText: { fontFamily: 'Poppins', fontWeight: '600', fontSize: 11, color: '#557153' },
  menuSection: { gap: 12 },
  sectionTitle: { fontFamily: 'Playfair Display', fontWeight: '600', fontSize: 19, color: COLORS.primary },
  menuCard: {
    backgroundColor: COLORS.white, borderRadius: 18, paddingVertical: 6,
    shadowColor: '#7E3E55', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 2,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 14 },
  menuIconContainer: { width: 40, height: 40, backgroundColor: COLORS.lightPink, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontFamily: 'Poppins', fontWeight: '500', fontSize: 13, color: COLORS.textDark },
  itemDivider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 },
  logoutButton: {
    flexDirection: 'row', height: 50, backgroundColor: COLORS.lightPink, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  logoutText: { fontFamily: 'Poppins', fontWeight: '700', fontSize: 13, color: COLORS.primary },
});