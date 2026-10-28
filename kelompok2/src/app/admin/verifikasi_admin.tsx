import React, { useCallback, useEffect, useState } from "react";
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
  textMuted: "#806A72",
  white: "#FFFFFF",
};

interface VerificationItem {
  id: string | number;
  orderReference: string;
  customerName: string;
  transferAmount: string;
  transferTime: string;
  proofPhoto: string;
  status: string;
  notes?: string;
}

const DEFAULT_PHOTO = "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300";

export default function VerifikasiPembayaranScreen() {
  const router = useRouter();
  const [pendingPayments, setPendingPayments] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState<{ [key: string]: "Valid" | "Diperbaiki" | "Ditolak" }>({});
  const [actionNotes, setActionNotes] = useState<{ [key: string]: string }>({});

  const fetchPendingVerifications = useCallback(async () => {
    try {
      setLoading(true);
      // Mengambil semua pesanan untuk memastikan data masuk, lalu difilter manual atau via query fleksibel
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          total_price,
          recipient_name,
          status,
          notes,
          payment_proof,
          created_at,
          order_items (
            product_title,
            size_name,
            quantity,
            product_photo
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        // Filter fleksibel di sisi client agar tidak terlewat karena perbedaan format status
        const filteredData = data.filter((item: any) => {
          const st = (item.status || "").toLowerCase();
          return st.includes("verifikasi") || st === "verifikasi" || st === "menunggu verifikasi";
        });

        const formatted: VerificationItem[] = filteredData.map((item: any) => {
          const products = item.order_items ?? [];
          const totalPrice = Number(item.total_price || 0);

          const formattedPrice = totalPrice.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          });

          const firstPhoto = products.find((p: any) => p.product_photo)?.product_photo || item.payment_proof || DEFAULT_PHOTO;

          return {
            id: item.id,
            orderReference: item.order_number || `#RA-${item.id}`,
            customerName: item.recipient_name || "Pelanggan",
            transferAmount: formattedPrice,
            transferTime: item.created_at ? new Date(item.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "Baru saja",
            proofPhoto: firstPhoto,
            status: item.status || "Verifikasi",
            notes: item.notes || "",
          };
        });

        setPendingPayments(formatted);
      }
    } catch (error: any) {
      console.error("Gagal memuat data verifikasi:", error);
      Alert.alert("Gagal", error?.message ?? "Terjadi kesalahan saat memuat data verifikasi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingVerifications();

    const channel = supabase
      .channel("admin-verification-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchPendingVerifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPendingVerifications]);

  const handleSubmitAction = async (item: VerificationItem) => {
    const currentStatus = selectedStatus[item.id] || "Valid";
    const currentNote = actionNotes[item.id] || "";

    if ((currentStatus === "Ditolak" || currentStatus === "Diperbaiki") && !currentNote.trim()) {
      Alert.alert("Perhatian", `Harap masukkan keterangan alasan ${currentStatus.toLowerCase()} pesanan.`);
      return;
    }

    try {
      // Pastikan string status sama persis dengan yang dipanggil di status_admin.tsx (yaitu "Sedang Dibuat")
      let dbStatus = "Sedang Dibuat"; 
      if (currentStatus === "Ditolak") dbStatus = "Dibatalkan";
      if (currentStatus === "Diperbaiki") dbStatus = "Perbaikan Pembayaran";

      const { error } = await supabase
        .from("orders")
        .update({ 
          status: dbStatus, 
          notes: currentNote ? `[${currentStatus}] ${currentNote}` : item.notes 
        } as any)
        .eq("id", item.id);

      if (error) throw error;

      Alert.alert("Berhasil", `Keputusan disimpan. Status pesanan menjadi: ${dbStatus}`);
      
      // Langsung hapus dari state lokal agar card langsung hilang tanpa menunggu reload
      setPendingPayments((prev) => prev.filter((p) => p.id !== item.id));
    } catch (error: any) {
      Alert.alert("Gagal", error?.message || "Terjadi kesalahan saat memperbarui status.");
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
                        <Text style={styles.transferTimeLabel}>Waktu Pesan / Transfer</Text>
                        <Text style={styles.transferTimeValue}>{item.transferTime}</Text>
                        <TouchableOpacity style={styles.viewProofBtn}>
                          <Ionicons name="eye-outline" size={14} color={COLORS.primary} />
                          <Text style={styles.viewProofText}>Lihat bukti pembayaran</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* PILIHAN STATUS (Valid, Diperbaiki, Ditolak) */}
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
  container: { flex: 1, backgroundColor: COLORS.bgApp },
  headerContainer: { width: "100%", backgroundColor: COLORS.bgApp },
  brandAndAccount: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 72,
  },
  appTitle: {
    fontFamily: "Playfair Display",
    fontWeight: "700",
    fontSize: 26,
    color: COLORS.primary,
  },
  adminProfile: {
    width: 40,
    height: 40,
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
  headerDivider: { width: "100%", height: 1, backgroundColor: COLORS.border },
  scrollContent: { paddingBottom: 35 },
  pageIntro: { paddingHorizontal: 20, paddingVertical: 12, gap: 4 },
  pageTitle: {
    fontFamily: "Playfair Display",
    fontWeight: "700",
    fontSize: 28,
    color: COLORS.primary,
  },
  pageSubtitle: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: 12,
    color: COLORS.textMuted,
  },
  workspace: { paddingHorizontal: 20, paddingTop: 18, gap: 14 },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontFamily: "Playfair Display",
    fontWeight: "600",
    fontSize: 20,
    color: COLORS.primary,
  },
  sectionContext: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: 12,
    color: COLORS.textMuted,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textMuted,
    marginTop: 30,
    fontFamily: "Poppins",
  },
  verificationList: { gap: 14 },
  verificationCard: {
    backgroundColor: COLORS.white,
    padding: 16,
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
  customerDetails: { gap: 2 },
  orderRef: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: 11,
    color: COLORS.textMuted,
  },
  customerName: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 14,
    color: COLORS.textDark,
  },
  transferAmount: {
    fontFamily: "Poppins",
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
  proofThumbnail: { width: 56, height: 56, borderRadius: 10 },
  proofMeta: { flex: 1, gap: 2 },
  transferTimeLabel: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: 10,
    color: COLORS.textMuted,
  },
  transferTimeValue: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: 12,
    color: COLORS.textDark,
  },
  viewProofBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  viewProofText: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: 11,
    color: COLORS.primary,
  },
  statusChoiceContainer: { gap: 6, marginTop: 4 },
  choiceLabel: {
    fontFamily: "Poppins",
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  statusButtonsRow: { flexDirection: "row", gap: 8 },
  statusChip: {
    flex: 1,
    paddingVertical: 9,
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
    fontFamily: "Poppins",
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  statusChipTextActive: { color: COLORS.white },
  noteInputContainer: { gap: 4 },
  noteLabel: {
    fontFamily: "Poppins",
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primary,
  },
  textInputNote: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: COLORS.textDark,
    backgroundColor: COLORS.bgApp,
    minHeight: 60,
    textAlignVertical: "top",
    fontFamily: "Poppins",
  },
  submitActionBtn: {
    height: 44,
    backgroundColor: COLORS.accentPink,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  submitActionText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 12,
    color: COLORS.white,
  },
});