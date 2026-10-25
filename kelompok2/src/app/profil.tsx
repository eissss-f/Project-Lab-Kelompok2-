import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Store, ShoppingBag, User } from 'lucide-react-native';

const colors = {
  background: '#FFF8F0',
  berry: '#A83F68',
  pink: '#E8A6BD',
  palePink: '#F7E6E6',
  muted: '#A17B84',
  line: '#EED7D8',
  error: '#A83232',
  success: '#287A4B',
  successBackground: '#E8F5EC',
};

const accountMenu: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail?: string;
  href: '/alamat' | '/keamanan-akun';
}[] = [
  {
    icon: 'location-outline',
    label: 'Alamat tersimpan',
    detail: 'Kelola',
    href: '/alamat',
  },
  {
    icon: 'shield-checkmark-outline',
    label: 'Keamanan akun',
    href: '/keamanan-akun',
  },
];

export default function ProfilScreen() {
  const router = useRouter();
  const [name, setName] = useState('Nadia Aulia');
  const [email, setEmail] = useState('nadia.aulia@gmail.com');
  const [phone, setPhone] = useState('+62 812 3456 7890');
  const [draftName, setDraftName] = useState(name);
  const [draftEmail, setDraftEmail] = useState(email);
  const [draftPhone, setDraftPhone] = useState(phone);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  const openEditProfile = () => {
    setDraftName(name);
    setDraftEmail(email);
    setDraftPhone(phone);
    setEditError('');
    setProfileMessage('');
    setIsEditing(true);
  };

  const saveProfile = () => {
    if (!draftName.trim() || !draftEmail.trim() || !draftPhone.trim()) {
      setEditError('Nama, email, dan nomor telepon wajib diisi.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draftEmail.trim())) {
      setEditError('Format email belum benar.');
      return;
    }

    setName(draftName.trim());
    setEmail(draftEmail.trim());
    setPhone(draftPhone.trim());
    setIsEditing(false);
    setProfileMessage('Profil diperbarui sementara di layar ini.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Profil dengan tombol kembali */}
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Beranda"
            onPress={() => router.replace('/Katalog')}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="arrow-back-outline"
              size={24}
              color={colors.berry}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.heading}>Profil</Text>
            <Text style={styles.subtitle}>
              Ruang kecil untuk cerita indahmu.
            </Text>
          </View>
        </View>

        {/* Informasi akun */}
        <View style={styles.accountCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join('')}
            </Text>
          </View>

          <View style={styles.accountText}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.customerLabel}>
              Pelanggan ra_scrafts.id
            </Text>
          </View>
        </View>

        {/* Informasi kontak */}
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>INFORMASI AKUN</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit profil"
            onPress={openEditProfile}
            style={({ pressed }) => [
              styles.editProfileButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="create-outline" size={16} color={colors.berry} />
            <Text style={styles.editProfileText}>Edit profil</Text>
          </Pressable>
        </View>

        <View style={styles.contactList}>
          <View style={styles.contactRow}>
            <Ionicons
              name="mail-outline"
              size={22}
              color={colors.berry}
            />

            <Text style={styles.contactText}>
              {email}
            </Text>
          </View>

          <View style={styles.contactRow}>
            <Ionicons
              name="call-outline"
              size={22}
              color={colors.berry}
            />

            <Text style={styles.contactText}>
              {phone}
            </Text>
          </View>
        </View>
        {profileMessage ? (
          <Text accessibilityRole="alert" style={styles.profileMessage}>
            {profileMessage}
          </Text>
        ) : null}
        <Text style={styles.dataNote}>
          Data contoh. Perubahan hanya tersimpan sementara di layar ini, belum
          ke database.
        </Text>

        {/* Menu akun */}
        <View style={styles.menuCard}>
          {accountMenu.map((item, index) => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => router.push(item.href)}
              style={[
                styles.menuRow,
                index < accountMenu.length - 1 && styles.menuDivider,
                styles.menuPressable,
              ]}
            >
              <View style={styles.menuLeft}>
                <Ionicons
                  name={item.icon}
                  size={21}
                  color={colors.berry}
                />

                <Text style={styles.menuLabel}>
                  {item.label}
                </Text>
              </View>

              <View style={styles.menuRight}>
                {item.detail ? (
                  <Text style={styles.menuDetail}>
                    {item.detail}
                  </Text>
                ) : null}

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color={colors.berry}
                />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Bantuan pelanggan */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bantuan pelanggan"
          onPress={() => router.push('/bantuan')}
          style={({ pressed }) => [
            styles.supportCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.supportIcon}>
            <Ionicons
              name="chatbubble-outline"
              size={25}
              color={colors.berry}
            />
          </View>

          <View style={styles.supportCopy}>
            <Text style={styles.supportTitle}>
              Ada yang bisa kami bantu?
            </Text>

            <Text style={styles.supportSub}>
              Panduan singkat untuk pesanan dan jadwal pengambilan.
            </Text>
          </View>

          <Ionicons
            name="arrow-forward"
            size={21}
            color={colors.berry}
          />
        </Pressable>

        {/* Tombol keluar akun */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/login')}
          style={({ pressed }) => [
            styles.logout,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="log-out-outline"
            size={21}
            color={colors.berry}
          />

          <Text style={styles.logoutText}>
            Keluar dari akun
          </Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={isEditing}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>Edit profil</Text>
            <Text style={styles.editSubtitle}>
              Perubahan ini hanya berlaku selama aplikasi berjalan.
            </Text>

            <TextInput
              accessibilityLabel="Nama"
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Nama lengkap"
              placeholderTextColor={colors.muted}
              style={styles.editInput}
              autoCapitalize="words"
              returnKeyType="next"
            />
            <TextInput
              accessibilityLabel="Email"
              value={draftEmail}
              onChangeText={setDraftEmail}
              placeholder="Email"
              placeholderTextColor={colors.muted}
              style={styles.editInput}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            <TextInput
              accessibilityLabel="Nomor telepon"
              value={draftPhone}
              onChangeText={setDraftPhone}
              placeholder="Nomor telepon"
              placeholderTextColor={colors.muted}
              style={styles.editInput}
              keyboardType="phone-pad"
              returnKeyType="done"
            />

            {editError ? (
              <Text accessibilityRole="alert" style={styles.editError}>
                {editError}
              </Text>
            ) : null}

            <View style={styles.editActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsEditing(false)}
                style={styles.cancelEditButton}
              >
                <Text style={styles.cancelEditText}>Batal</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={saveProfile}
                style={styles.saveEditButton}
              >
                <Text style={styles.saveEditText}>Simpan</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.navTabs}>
          {/* Beranda / Produk */}
          <Pressable
            style={styles.tabInactive}
            onPress={() => router.replace('/Katalog')}
            accessibilityRole="button"
            accessibilityLabel="Beranda"
          >
            <Store
              size={21}
              color="#999999"
              strokeWidth={1.8}
            />

            <Text style={styles.tabLabelInactive}>
              Produk
            </Text>
          </Pressable>

          {/* Pesanan */}
          <Pressable
            style={styles.tabInactive}
            onPress={() => router.push('/pesanan')}
            accessibilityRole="button"
            accessibilityLabel="Pesanan"
          >
            <ShoppingBag
              size={21}
              color="#999999"
              strokeWidth={1.8}
            />

            <Text style={styles.tabLabelInactive}>
              Pesanan
            </Text>
          </Pressable>

          {/* Profil aktif */}
          <Pressable
            style={styles.tabActive}
            onPress={() => router.replace('/profil')}
            accessibilityRole="button"
            accessibilityLabel="Profil"
          >
            <User
              size={21}
              color={colors.berry}
              strokeWidth={1.8}
            />

            <Text style={styles.tabLabelActive}>
              Profil
            </Text>
          </Pressable>
        </View>

        <View style={styles.homeIndicator} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 110,
  },

  // Header Profil
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 21,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.palePink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  heading: {
    color: colors.berry,
    fontFamily: 'serif',
    fontSize: 31,
    fontWeight: '700',
    lineHeight: 38,
  },

  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },

  // Kartu akun
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

  avatarText: {
    color: colors.background,
    fontFamily: 'serif',
    fontSize: 25,
  },

  accountText: {
    marginLeft: 14,
    flex: 1,
  },

  name: {
    color: colors.berry,
    fontFamily: 'serif',
    fontSize: 21,
    fontWeight: '700',
  },

  customerLabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },

  // Informasi kontak
  sectionTitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.palePink,
  },

  editProfileText: {
    color: colors.berry,
    fontSize: 12,
    fontWeight: '600',
  },

  contactList: {
    marginBottom: 4,
  },

  contactRow: {
    minHeight: 39,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  contactText: {
    color: colors.berry,
    fontSize: 15,
    flex: 1,
  },

  dataNote: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 14,
  },

  profileMessage: {
    color: colors.success,
    backgroundColor: colors.successBackground,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontSize: 12,
    marginBottom: 8,
  },

  // Menu akun
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

  menuPressable: {
    width: '100%',
  },

  menuDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  menuLabel: {
    color: colors.berry,
    fontSize: 13,
    fontWeight: '600',
  },

  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  menuDetail: {
    color: colors.muted,
    fontSize: 12,
  },

  // Bantuan pelanggan
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

  supportCopy: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  supportTitle: {
    color: colors.berry,
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: '700',
  },

  supportSub: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 3,
  },

  // Logout
  logout: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    padding: 8,
  },

  logoutText: {
    color: colors.berry,
    fontSize: 13,
    fontWeight: '600',
  },

  pressed: {
    opacity: 0.7,
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(40, 20, 28, 0.4)',
    padding: 24,
  },

  editCard: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
  },

  editTitle: {
    color: colors.berry,
    fontFamily: 'serif',
    fontSize: 23,
    fontWeight: '700',
  },

  editSubtitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 16,
  },

  editInput: {
    color: colors.berry,
    fontSize: 14,
    backgroundColor: colors.palePink,
    borderWidth: 1,
    borderColor: colors.pink,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 10,
  },

  editError: {
    color: colors.error,
    fontSize: 12,
    marginBottom: 10,
  },

  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },

  cancelEditButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  cancelEditText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },

  saveEditButton: {
    backgroundColor: colors.berry,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  saveEditText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '700',
  },

  // Bottom Navigation
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
    paddingHorizontal: 20,
  },

  navTabs: {
    flexDirection: 'row',
    width: '100%',
    height: 48,
    gap: 16,
  },

  tabActive: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFF0F6',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },

  tabInactive: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },

  tabLabelActive: {
    fontSize: 10,
    color: colors.berry,
    fontWeight: '600',
  },

  tabLabelInactive: {
    fontSize: 10,
    color: '#999999',
  },

  homeIndicator: {
    width: 120,
    height: 4,
    backgroundColor: colors.berry,
    borderRadius: 2,
    marginTop: 12,
  },
});
