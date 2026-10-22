import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';

const colors = {
  background: '#FFF8F0',
  berry: '#A83F68',
  pink: '#E8A6BD',
  palePink: '#F7E6E6',
  muted: '#A17B84',
};

type Address = { id: string; label: string; text: string };

export default function AlamatScreen() {
  const [addresses, setAddresses] = useState<Address[]>([
    { id: '1', label: 'Rumah', text: 'Jl. Contoh No. 12, Cirebon, Jawa Barat' },
    { id: '2', label: 'Kantor', text: 'Jl. Sample No. 5, Cirebon, Jawa Barat' },
  ]);
  const [label, setLabel] = useState('');
  const [text, setText] = useState('');

  const addAddress = () => {
    if (!label.trim() || !text.trim()) {
      Alert.alert('Data belum lengkap', 'Isi nama alamat dan alamat lengkap.');
      return;
    }
    setAddresses((prev) => [...prev, { id: Date.now().toString(), label: label.trim(), text: text.trim() }]);
    setLabel('');
    setText('');
  };

  const removeAddress = (id: string) => {
    Alert.alert('Hapus alamat', 'Yakin mau menghapus alamat ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => setAddresses((prev) => prev.filter((a) => a.id !== id)) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <PageHeader
          title="Alamat tersimpan"
          subtitle="Alamat untuk pengiriman buketmu."
        />

        {addresses.length === 0 ? (
          <Text style={styles.empty}>Belum ada alamat tersimpan.</Text>
        ) : (
          addresses.map((a) => (
            <View key={a.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{a.label}</Text>
                <Text style={styles.text}>{a.text}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Hapus alamat ${a.label}`}
                onPress={() => removeAddress(a.id)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={20} color={colors.berry} />
              </Pressable>
            </View>
          ))
        )}

        <Text style={styles.section}>TAMBAH ALAMAT</Text>
        <TextInput
          value={label}
          onChangeText={setLabel}
          placeholder="Nama alamat (contoh: Rumah)"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Alamat lengkap"
          placeholderTextColor={colors.muted}
          multiline
          style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]}
        />
        <Pressable
          accessibilityRole="button"
          onPress={addAddress}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.addBtnText}>Simpan alamat</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.pink,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  label: { color: colors.berry, fontFamily: 'serif', fontSize: 16, fontWeight: '700' },
  text: { color: colors.muted, fontSize: 13, marginTop: 4 },
  deleteBtn: { padding: 8 },
  empty: { color: colors.muted, textAlign: 'center', marginVertical: 24 },
  section: { color: colors.muted, fontSize: 11, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.pink,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.berry,
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: colors.palePink,
  },
  addBtn: {
    backgroundColor: colors.berry,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: { color: colors.background, fontSize: 14, fontWeight: '700' },
});
