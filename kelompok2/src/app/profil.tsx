import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Store, ShoppingBag, User } from 'lucide-react-native';

const colors = {
  background: '#FFF8F0',
  berry: '#A83F68',
  pink: '#E8A6BD',
  palePink: '#F7E6E6',
  muted: '#A17B84',
  line: '#EED7D8',
};

const accountMenu: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail?: string;
}[] = [
  { icon: 'location-outline', label: 'Alamat tersimpan', detail: '2 alamat' },
  { icon: 'heart-outline', label: 'Buket favorit', detail: '5 buket' },
  { icon: 'notifications-outline', label: 'Notifikasi' },
  { icon: 'shield-checkmark-outline', label: 'Keamanan akun' },
];

export default function ProfilScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Profil</Text>
        <Text style={styles.subtitle}>Ruang kecil untuk cerita indahmu.</Text>

        <View style={styles.accountCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>NA</Text>
          </View>
          <View style={styles.accountText}>
            <Text style={styles.name}>Nadia Aulia</Text>
            <Text style={styles.customerLabel}>Pelanggan ra_scrafts.id</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>INFORMASI AKUN</Text>
        <View style={styles.contactList}>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={22} color={colors.berry} />
            <Text style={styles.contactText}>nadia.aulia@gmail.com</Text>
            <Ionicons
              name="checkmark-circle"
              size={19}
              color={colors.berry}
              accessibilityLabel="Email terverifikasi"
            />
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={22} color={colors.berry} />
            <Text style={styles.contactText}>+62 812 3456 7890</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          {accountMenu.map((item, index) => (
            <View
              key={item.label}
              style={[styles.menuRow, index < accountMenu.length - 1 && styles.menuDivider]}>
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon} size={21} color={colors.berry} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <View style={styles.menuRight}>
                {item.detail ? <Text style={styles.menuDetail}>{item.detail}</Text> : null}
                <Ionicons name="chevron-forward" size={19} color={colors.berry} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.supportCard}>
          <View style={styles.supportIcon}>
            <Ionicons name="chatbubble-outline" size={25} color={colors.berry} />
          </View>
          <View style={styles.supportCopy}>
            <Text style={styles.supportTitle}>Ada yang bisa kami bantu?</Text>
            <Text style={styles.supportSub}>Tanya buket atau pesanan via WhatsApp.</Text>
          </View>
          <Ionicons name="arrow-forward" size={21} color={colors.berry} />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/login')}
          style={({ pressed }) => [styles.logout, pressed && styles.pressed]}>
          <Ionicons name="log-out-outline" size={21} color={colors.berry} />
          <Text style={styles.logoutText}>Keluar dari akun</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom Nav yang Responsif dan Terhubung */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.navTabs}>
          {/* Menu Produk / Katalog */}
          <Pressable 
            style={styles.tabInactive}
            onPress={() => router.push('/Katalog')}
          >
            <Store size={21} color="#999999" strokeWidth={1.8} />
            <Text style={styles.tabLabelInactive}>Produk</Text>
          </Pressable>

          {/* Menu Pesanan */}
          <Pressable 
            style={styles.tabInactive}
            onPress={() => router.push('/pesanan')}
          >
            <ShoppingBag size={21} color="#999999" strokeWidth={1.8} />
            <Text style={styles.tabLabelInactive}>Pesanan</Text>
          </Pressable>

          {/* Menu Profil (Aktif saat ini) */}
          <Pressable 
            style={styles.tabActive}
            onPress={() => router.push('/profil')}
          >
            <User size={21} color={colors.berry} strokeWidth={1.8} />
            <Text style={styles.tabLabelActive}>Profil</Text>
          </Pressable>
        </View>
        <View style={styles.homeIndicator} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 110 },
  heading: {
    color: colors.berry,
    fontFamily: 'serif',
    fontSize: 31,
    fontWeight: '700',
    lineHeight: 38,
  },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 2, marginBottom: 21 },
  accountCard: {
    minHeight: 94,
    borderRadius: 20,
    backgroundColor: colors.palePink,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.background, fontFamily: 'serif', fontSize: 25 },
  accountText: { marginLeft: 14, flex: 1 },
  name: { color: colors.berry, fontFamily: 'serif', fontSize: 21, fontWeight: '700' },
  customerLabel: { color: colors.muted, fontSize: 12, marginTop: 4 },
  sectionTitle: { color: colors.muted, fontSize: 11, fontWeight: '700', marginBottom: 8 },
  contactList: { marginBottom: 14 },
  contactRow: { minHeight: 39, flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactText: { color: colors.berry, fontSize: 15, flex: 1 },
  menuCard: {
    borderWidth: 1,
    borderColor: colors.pink,
    borderRadius: 19,
    paddingHorizontal: 15,
    paddingVertical: 2,
  },
  menuRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { color: colors.berry, fontSize: 13, fontWeight: '600' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuDetail: { color: colors.muted, fontSize: 12 },
  supportCard: {
    minHeight: 72,
    backgroundColor: colors.palePink,
    borderRadius: 19,
    marginTop: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportIcon: {
    height: 40,
    width: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.berry,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportCopy: { flex: 1, marginLeft: 12, marginRight: 8 },
  supportTitle: { color: colors.berry, fontFamily: 'serif', fontSize: 16, fontWeight: '700' },
  supportSub: { color: colors.muted, fontSize: 10, marginTop: 3 },
  logout: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    padding: 8,
  },
  logoutText: { color: colors.berry, fontSize: 13, fontWeight: '600' },
  pressed: { opacity: 0.7 },
  // Style untuk Bottom Navigation
  bottomNavContainer: { 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 84, 
    borderTopWidth: 1, 
    borderTopColor: '#F1D2DC', 
    backgroundColor: '#FFF8F0', 
    alignItems: 'center', 
    paddingTop: 8, 
    paddingHorizontal: 20 
  },
  navTabs: { flexDirection: 'row', width: '100%', height: 48, gap: 16 },
  tabActive: { flex: 1, height: 48, backgroundColor: '#FFF0F6', borderRadius: 4, justifyContent: 'center', alignItems: 'center', gap: 3 },
  tabInactive: { flex: 1, height: 48, justifyContent: 'center', alignItems: 'center', gap: 3 },
  tabLabelActive: { fontSize: 10, color: colors.berry, fontWeight: '600' },
  tabLabelInactive: { fontSize: 10, color: '#999999' },
  homeIndicator: { width: 120, height: 4, backgroundColor: colors.berry, borderRadius: 2, marginTop: 12 },
});