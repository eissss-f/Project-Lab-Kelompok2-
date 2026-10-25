import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '@/components/PageHeader';

const colors = {
  background: '#FFF8F0',
  berry: '#A83F68',
  pink: '#E8A6BD',
  muted: '#A17B84',
  line: '#EED7D8',
};

const items = [
  { key: 'status', label: 'Status pesanan', desc: 'Info pembayaran & pengerjaan' },
  { key: 'promo', label: 'Promo & diskon', desc: 'Penawaran buket terbaru' },
  { key: 'pengingat', label: 'Pengingat ambil', desc: 'Sebelum jadwal pengambilan' },
] as const;

type SettingKey = (typeof items)[number]['key'];

export default function NotifikasiScreen() {
  const [settings, setSettings] = useState<Record<SettingKey, boolean>>({
    status: true,
    promo: false,
    pengingat: true,
  });

  const toggle = (key: SettingKey) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <PageHeader title="Notifikasi" subtitle="Atur pemberitahuan yang kamu mau." />

        {items.map((item) => (
          <View key={item.key} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
            </View>
            <Switch
              value={settings[item.key]}
              onValueChange={() => toggle(item.key)}
              trackColor={{ true: colors.pink, false: '#dddddd' }}
              thumbColor={colors.berry}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  label: { color: colors.berry, fontSize: 14, fontWeight: '600' },
  desc: { color: colors.muted, fontSize: 12, marginTop: 2 },
});