import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '@/components/PageHeader';

const colors = {
  background: '#FFF8F0',
  berry: '#A83F68',
  palePink: '#F7E6E6',
  muted: '#A17B84',
  line: '#EED7D8',
  white: '#FFFFFF',
};

const helpItems = [
  {
    icon: 'bag-handle-outline',
    title: 'Melihat status pesanan',
    description:
      'Buka menu Pesanan untuk melihat status pembayaran dan proses pembuatan buket.',
  },
  {
    icon: 'create-outline',
    title: 'Mengubah pesanan',
    description:
      'Hubungi admin atau toko secepatnya. Perubahan mungkin tidak bisa dilakukan setelah buket mulai dibuat.',
  },
  {
    icon: 'calendar-outline',
    title: 'Jadwal pengambilan',
    description:
      'Periksa tanggal pengambilan pada detail pesananmu dan hubungi admin jika ada kendala.',
  },
] as const;

export default function BantuanScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Bantuan"
          subtitle="Jawaban singkat seputar pesananmu."
        />

        <View style={styles.card}>
          {helpItems.map((item, index) => (
            <View
              key={item.title}
              style={[
                styles.helpItem,
                index < helpItems.length - 1 && styles.divider,
              ]}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={colors.berry}
                />
              </View>
              <View style={styles.copy}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/user/pesanan')}
          style={({ pressed }) => [
            styles.ordersButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.ordersButtonText}>Lihat pesanan saya</Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={colors.background}
          />
        </Pressable>

        <Text style={styles.note}>
          Kontak toko belum tersedia di aplikasi. Untuk bantuan lebih lanjut,
          silakan hubungi admin toko secara langsung.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    paddingHorizontal: 14,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 15,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.palePink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  copy: {
    flex: 1,
  },
  itemTitle: {
    color: colors.berry,
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  ordersButton: {
    minHeight: 48,
    backgroundColor: colors.berry,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
  },
  ordersButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  note: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 14,
  },
  pressed: {
    opacity: 0.75,
  },
});
