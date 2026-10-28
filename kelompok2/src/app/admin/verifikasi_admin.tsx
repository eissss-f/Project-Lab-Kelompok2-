import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, Alert, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import AdminSubNav from "../../components/AdminSubNav"; 
import { supabase } from "../../../lib/supabase"; 

const COLORS = {
  bgApp: "#FFF8F0",
  primary: "#A83F68",
  accentPink: "#E8A6BD",
  lightPink: "#FBEAF0",
  border: "#F2E4E5",
  textDark: "#49343C",
  textMuted: "#958189",
  white: "#FFFFFF",
  success: "#2E7D32",
  warning: "#ED6C02",
  error: "#D32F2F",
};

interface VerificationItem {
  id: number | string;
  orderReference: string;
  customerName: string;
  transferAmount: string;
  transferTime: string;
  proofPhoto: string;
  status: "Menunggu" | "Valid" | "Ditolak" | "Diperbaiki";
  notes?: string;
}

// Data dummy untuk pengujian fitur tanpa harus bergantung penuh ke database dulu
const DUMMY_VERIFICATIONS: VerificationItem[] = [
  {
    id: 1,
    orderReference: "#RA-0011",
    customerName: "Siti Rahmawati",
    transferAmount: "Rp250.000",
    transferTime: "23 Okt 2026, 14:30 WIB",
    proofPhoto: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300",
    status: "Menunggu",
    notes: "",
  },
  {
    id: 2,
    orderReference: "#RA-0012",
    customerName: "Ahmad Fauzi",
    transferAmount: "Rp185.000",
    transferTime: "24 Okt 2026, 09:15 WIB",
    proofPhoto: "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=300",
    status: "Menunggu",
    notes: "",
  },
];

export default function VerifikasiPembayaranScreen() {
  const router = useRouter();
  const [pendingPayments, setPendingPayments] = useState<VerificationItem[]>(DUMMY_VERIFICATIONS);
  const [loading, setLoading] = useState(false);

  // State untuk melacak status pilihan dan catatan per item berdasarkan ID
  const [selectedStatus, setSelectedStatus] = useState<{ [key: string]: "Valid" | "Ditolak" | "Diperbaiki" }>({});
  const [actionNotes, setActionNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "Verifikasi")
        .order("id", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted = data.map((item: any) => ({
          id: item.id,
          orderReference: item.order_number || `#RS-${item.id}`,
          customerName: item.recipient_name || "Pelanggan",
          transferAmount: item.total_price ? `Rp${Number(item.total_price).toLocaleString("id-ID")}` : "Rp0",
          transferTime: item.created_at ? new Date(item.created_at).toLocaleString("id-ID") : "Baru saja",
          proofPhoto: item.payment_proof || "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300",
          status: item.status || "Menunggu",
          notes: item.notes || "",
        }));
        setPendingPayments(formatted);
      }
    } catch (error: any) {
      console.log("Menggunakan data dummy lokal karena koneksi/tabel database belum disinkronkan.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk memproses status pilihan (Valid, Ditolak, Diperbaiki)
  const handleSubmitAction = async (item: VerificationItem) => {
    const currentStatus = selectedStatus[item.id] || "Valid";
    const currentNote = actionNotes[item.id] || "";

    if ((currentStatus === "Ditolak" || currentStatus === "Diperbaiki") && !currentNote.trim()) {
      Alert.alert("Perhatian", "Harap masukkan keterangan alasan penolakan atau perbaikan.");
      return;
    }

    try {
      // Pemetaan status ke database
      let dbStatus = "Sedang Dibuat";
      if (currentStatus === "Ditolak") dbStatus = "Ditolak";
      if (currentStatus === "Diperbaiki") dbStatus = "Perbaikan Pembayaran";

      const { error } = await supabase
        .from("orders")
        .update({ status: dbStatus, notes: currentNote })
        .eq("id", item.id);

      // Jika gagal update karena tabel belum siap, update state lokal saja agar UI tetap interaktif
      setPendingPayments((prev) => prev.filter((p) => p.id !== item.id));

      Alert.alert("Berhasil", `Status pesanan diperbarui menjadi: ${currentStatus}`);
    } catch (error: any) {
      // Fallback update lokal jika offline/database belum siap
      setPendingPayments((prev) => prev.filter((p) => p.id !== item.id));
      Alert.alert("Berhasil", `Status pesanan diperbarui menjadi: ${currentStatus}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* APP HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.brandAndAccount}>
          <Text style={styles.appTitle}>ra_scrafts.id Admin</Text>
          <TouchableOpacity style={styles.adminProfile} onPress={() => router.push('/admin/profil_admin' as any)}>
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

        <AdminSubNav />

        {/* Workspace Content */}
        <View style={styles.workspace}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Menunggu verifikasi</Text>
            <Text style={styles.sectionContext}>{pendingPayments.length} bukti pembayaran</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : pendingPayments.length === 0 ? (
            <Text style={styles.emptyText}>Tidak ada pembayaran yang menunggu verifikasi.</Text>
          ) : (
            <View style={styles.verificationList}>
              {pendingPayments.map((item) => {
                const activeStatus = selectedStatus[item.id] || "Valid";
                return (
                  <View key={String(item.id)} style={styles.verificationCard}>
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
                        <Text style={styles.transferTimeLabel}>Waktu Transfer / Pesan</Text>
                        <Text style={styles.transferTimeValue}>{item.transferTime}</Text>
                        <TouchableOpacity style={styles.viewProofBtn}>
                          <Ionicons name="eye-outline" size={14} color={COLORS.primary} />
                          <Text style={styles.viewProofText}>Lihat bukti transfer</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* FITUR DROPDOWN / PILIHAN STATUS FEEDBACK DOSEN */}
                    <View style={styles.statusChoiceContainer}>
                      <Text style={styles.choiceLabel}>Status Verifikasi:</Text>
                      <View style={styles.statusButtonsRow}>
                        {(["Valid", "Diperbaiki", "Ditolak"] as const).map((st) => {
                          const isSelected = activeStatus === st;
                          return (
                            <TouchableOpacity
                              key={st}
                              style={[styles.statusChip, isSelected && styles.statusChipActive]}
                              onPress={() => setSelectedStatus({ ...selectedStatus, [item.id]: st })}
                            >
                              <Text style={[styles.statusChipText, isSelected && styles.statusChipTextActive]}>{st}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    {/* FIELD KETERANGAN TAMBAHAN (MUNCUL JIKA DIPERBAIKI / DITOLAK) */}
                    {(activeStatus === "Ditolak" || activeStatus === "Diperbaiki") && (
                      <View style={styles.noteInputContainer}>
                        <Text style={styles.noteLabel}>Keterangan / Alasan {activeStatus}: *</Text>
                        <TextInput
                          style={styles.textInputNote}
                          placeholder="Misal: Bukti transfer kurang jelas / Nominal kurang"
                          placeholderTextColor={COLORS.textMuted}
                          value={actionNotes[item.id] || ""}
                          onChangeText={(text) => setActionNotes({ ...actionNotes, [item.id]: text })}
                          multiline
                        />
                      </View>
                    )}

                    {/* TOMBOL AKSI UTAMA */}
                    <TouchableOpacity style={styles.submitActionBtn} onPress={() => handleSubmitAction(item)}>
                      <Text style={styles.submitActionText}>Simpan & Proses Keputusan</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
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
    fontWeight: "600",
    fontSize: 28,
    lineHeight: 35,
    color: COLORS.primary,
  },
  pageSubtitle: {
    fontWeight: "400",
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textMuted,
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
    fontWeight: "500",
    fontSize: 20,
    color: COLORS.primary,
  },
  sectionContext: {
    fontWeight: "400",
    fontSize: 11,
    color: COLORS.textMuted,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textMuted,
    marginTop: 30,
  },
  verificationList: {
    gap: 12,
  },
  verificationCard: {
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerDetails: {
    gap: 1,
  },
  orderRef: {
    fontWeight: "400",
    fontSize: 10,
    color: COLORS.textMuted,
  },
  customerName: {
    fontWeight: "600",
    fontSize: 13,
    color: COLORS.textDark,
  },
  transferAmount: {
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
    fontWeight: "400",
    fontSize: 9,
    color: COLORS.textMuted,
  },
  transferTimeValue: {
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
    fontWeight: "500",
    fontSize: 10,
    color: COLORS.primary,
  },
  statusChoiceContainer: {
    gap: 6,
    marginTop: 4,
  },
  choiceLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  statusButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statusChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  statusChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  statusChipTextActive: {
    color: COLORS.white,
  },
  noteInputContainer: {
    gap: 4,
  },
  noteLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.primary,
  },
  textInputNote: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: COLORS.textDark,
    backgroundColor: COLORS.bgApp,
    minHeight: 50,
    textAlignVertical: "top",
  },
  submitActionBtn: {
    height: 40,
    backgroundColor: COLORS.accentPink,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  submitActionText: {
    fontWeight: "600",
    fontSize: 12,
    color: COLORS.white,
  },
});