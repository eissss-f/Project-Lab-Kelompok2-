import { useState } from 'react';
import {
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
  error: '#A83232',
  errorBackground: '#FCE8E6',
  success: '#287A4B',
  successBackground: '#E8F5EC',
};

type Address = { id: string; label: string; text: string };

export default function AlamatScreen() {
  const [addresses, setAddresses] = useState<Address[]>([
    { id: '1', label: 'Rumah', text: 'Jl. Contoh No. 12, Cirebon, Jawa Barat' },
    { id: '2', label: 'Kantor', text: 'Jl. Sample No. 5, Cirebon, Jawa Barat' },
  ]);
  const [label, setLabel] = useState('');
  const [text, setText] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  const addAddress = () => {
    if (!label.trim() || !text.trim()) {
      setFeedback({
        type: 'error',
        message: 'Isi nama alamat dan alamat lengkap terlebih dahulu.',
      });
      return;
    }
    setAddresses((prev) => [
      ...prev,
      { id: Date.now().toString(), label: label.trim(), text: text.trim() },
    ]);
    setLabel('');
    setText('');
    setFeedback({ type: 'success', message: 'Alamat berhasil ditambahkan.' });
  };

  const removeAddress = (id: string) => {
    setAddresses((prev) => prev.filter((address) => address.id !== id));
    setPendingDeleteId(null);
    setFeedback({ type: 'success', message: 'Alamat berhasil dihapus.' });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <PageHeader title="Alamat Tersimpan" subtitle="Alamat untuk pengiriman buketmu." />

        <Text style={styles.dataNote}>
          Data contoh. Perubahan alamat belum tersimpan permanen dan akan hilang
          saat halaman dimuat ulang.
        </Text>

        {feedback ? (
          <View
            accessibilityRole="alert"
            style={[
              styles.feedback,
              feedback.type === 'error'
                ? styles.feedbackError
                : styles.feedbackSuccess,
            ]}
          >
            <Ionicons
              name={
                feedback.type === 'error'
                  ? 'alert-circle-outline'
                  : 'checkmark-circle-outline'
              }
              size={19}
              color={feedback.type === 'error' ? colors.error : colors.success}
            />
            <Text
              style={[
                styles.feedbackText,
                feedback.type === 'error'
                  ? styles.feedbackErrorText
                  : styles.feedbackSuccessText,
              ]}
            >
              {feedback.message}
            </Text>
          </View>
        ) : null}

        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={30} color={colors.pink} />
            <Text style={styles.emptyTitle}>Belum ada alamat tersimpan</Text>
            <Text style={styles.empty}>
              Tambahkan alamat agar mudah dipilih saat memesan buket.
            </Text>
          </View>
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
                onPress={() => {
                  setPendingDeleteId(a.id);
                  setFeedback(null);
                }}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={20} color={colors.berry} />
              </Pressable>
              {pendingDeleteId === a.id ? (
                <View style={styles.confirmDelete}>
                  <Text style={styles.confirmText}>Hapus alamat ini?</Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setPendingDeleteId(null)}
                    style={styles.cancelDeleteButton}
                  >
                    <Text style={styles.cancelDeleteText}>Batal</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => removeAddress(a.id)}
                    style={styles.confirmDeleteButton}
                  >
                    <Text style={styles.confirmDeleteText}>Hapus</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ))
        )}

        <Text style={styles.section}>TAMBAH ALAMAT</Text>
        <TextInput
          accessibilityLabel="Nama alamat"
          value={label}
          onChangeText={(value) => {
            setLabel(value);
            setFeedback(null);
          }}
          placeholder="Nama alamat (contoh: Rumah)"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <TextInput
          accessibilityLabel="Alamat lengkap"
          value={text}
          onChangeText={(value) => {
            setText(value);
            setFeedback(null);
          }}
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
    flexWrap: 'wrap',
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
  dataNote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  feedbackError: { backgroundColor: colors.errorBackground },
  feedbackSuccess: { backgroundColor: colors.successBackground },
  feedbackText: { flex: 1, fontSize: 13, lineHeight: 18 },
  feedbackErrorText: { color: colors.error },
  feedbackSuccessText: { color: colors.success },
  emptyState: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.pink,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  emptyTitle: {
    color: colors.berry,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  empty: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 4,
  },
  confirmDelete: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.pink,
    paddingTop: 10,
    marginTop: 10,
  },
  confirmText: { flex: 1, color: colors.muted, fontSize: 12 },
  cancelDeleteButton: { paddingHorizontal: 10, paddingVertical: 8 },
  cancelDeleteText: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  confirmDeleteButton: {
    backgroundColor: colors.berry,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  confirmDeleteText: { color: colors.background, fontSize: 12, fontWeight: '700' },
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
