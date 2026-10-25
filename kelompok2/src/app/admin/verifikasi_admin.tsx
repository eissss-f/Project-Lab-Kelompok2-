import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, TextInput, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';

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

type VerificationStatus = "Valid" | "Ditolak" | "Diperbaiki";

interface VerificationItem {
  id: string;
  orderReference: string;
  customerName: string;
  transferAmount: string;
  transferTime: string;
  proofPhoto: string;
  selectedStatus?: VerificationStatus;
  note: string;
}

export default function VerifikasiPembayaranScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;
  const tabFontSize = isSmallScreen ? 10 : 11;

  const [pendingPayments, setPendingPayments] = useState<VerificationItem[]>([
    {
      id: "1", orderReference: "#RS-1048", customerName: "Nadia Putri",
      transferAmount: "Rp185.000", transferTime: "18 Okt 2026, 14.15 WIB",
      proofPhoto: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300",
      selectedStatus: "Valid", note: "Belum",
    },
    {
      id: "2", orderReference: "#RS-1049", customerName: "Rina Oktaviani",
      transferAmount: "Rp210.000", transferTime: "18 Okt 2026, 15.30 WIB",
      proofPhoto: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=300",
      selectedStatus: "Diperbaiki", note: "Nominal transfer kurang jelas, mohon unggah ulang foto bukti.",
    },
  ]);

  const handleStatusChange = (id: string, status: VerificationStatus) => {
    setPendingPayments((prev) => prev.map((item) => (item.id === id ? { ...item, selectedStatus: status } : item)));
  };

  const handleNoteChange = (id: string, text: string) => {
    setPendingPayments((prev) => prev.map((item) => (item.id === id ? { ...item, note: text } : item)));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.brandAndAccount}>
          <Text style={styles.appTitle}>ra_scrafts.id Admin</Text>
          <TouchableOpacity style={styles.adminProfile} onPress={() => router.push('/admin/profil_admin' as any)}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerDivider} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pageIntro}>
          <Text style={styles.pageTitle}>Kelola Toko</Text>
          <Text style={styles.pageSubtitle}>Kelola Produk & Pesanan</Text>
        </View>

        <View style={styles.managementTabs}>
          {[
            { label: "Kelola Produk", route: "/admin/produk_admin" },
            { label: "Kelola Pesanan", route: "/admin/kelola_pesanan_admin" },
            { label: "Verifikasi", route: "/admin/verifikasi_admin" },
            { label: "Update Status", route: "/admin/status_admin" },
          ].map((tab) => {
            const isActive = tab.route === "/admin/verifikasi_admin";
            return (
              <TouchableOpacity key={tab.route} style={[styles.managementTab, isActive && styles.activeTabBg]} onPress={() => router.push(tab.route as any)}>
                <Text style={[styles.tabLabel, { fontSize: tabFontSize }, isActive && styles.activeTabLabel]} numberOfLines={2}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.workspace}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Menunggu verifikasi</Text>
            <Text style={styles.sectionContext}>5 bukti pembayaran</Text>
          </View>

          <View style={styles.verificationList}>
            {pendingPayments.map((item) => (
              <View key={item.id} style={styles.verificationCard}>
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
                    <Text style={styles.transferTimeLabel}>Waktu Transfer</Text>
                    <Text style={styles.transferTimeValue}>{item.transferTime}</Text>
                    <TouchableOpacity style={styles.viewProofBtn}>
                      <Ionicons name="eye-outline" size={15} color={COLORS.primary} />
                      <Text style={styles.viewProofText}>Lihat bukti transfer</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.statusSection}>
                  <Text style={styles.fieldLabel}>Status Verifikasi</Text>
                  <View style={styles.statusOptionsRow}>
                    {(["Valid", "Ditolak", "Diperbaiki"] as VerificationStatus[]).map((statusOpt) => {
                      const isSelected = item.selectedStatus === statusOpt;
                      return (
                        <TouchableOpacity
                          key={statusOpt}
                          style={[styles.statusChip, isSelected && styles.statusChipActive]}
                          onPress={() => handleStatusChange(item.id, statusOpt)}
                        >
                          <Text style={[styles.statusChipText, isSelected && styles.statusChipTextActive]}>
                            {statusOpt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.noteSection}>
                  <Text style={styles.fieldLabel}>Keterangan Alasan (Perbaikan / Penolakan)</Text>
                  <TextInput
                    style={styles.textInputNote}
                    value={item.note}
                    onChangeText={(text) => handleNoteChange(item.id, text)}
                    placeholder="Contoh: Belum atau alasan perbaikan..."
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity style={styles.approveBtn}>
                    <Text style={styles.approveBtnText}>Simpan & Kirim ke Pengguna</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgApp },
  headerContainer: { width: "100%", backgroundColor: COLORS.bgApp },
  brandAndAccount: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, height: 72 },
  appTitle: { fontFamily: "Playfair Display", fontWeight: "700", fontSize: 26, color: COLORS.primary },
  adminProfile: {
    width: 40, height: 40, backgroundColor: COLORS.white, borderRadius: 100, justifyContent: "center", alignItems: "center",
    shadowColor: "#7E3E55", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.13, shadowRadius: 10, elevation: 3,
  },
  headerDivider: { width: "100%", height: 1, backgroundColor: COLORS.border },
  scrollContent: { paddingBottom: 35 },
  pageIntro: { paddingHorizontal: 20, paddingVertical: 12, gap: 4 },
  pageTitle: { fontFamily: "Playfair Display", fontWeight: "700", fontSize: 28, color: COLORS.primary },
  pageSubtitle: { fontFamily: "Poppins", fontWeight: "400", fontSize: 12, color: COLORS.textMuted },
  managementTabs: {
    flexDirection: "row", backgroundColor: COLORS.lightPink, marginHorizontal: 20, padding: 5, borderRadius: 16, gap: 4, minHeight: 56,
  },
  managementTab: { flex: 1, justifyContent: "center", alignItems: "center", borderRadius: 12, paddingHorizontal: 4, paddingVertical: 8 },
  activeTabBg: { backgroundColor: COLORS.accentPink },
  tabLabel: { fontFamily: "Poppins", fontWeight: "500", textAlign: "center", color: "#986678" },
  activeTabLabel: { fontFamily: "Poppins", fontWeight: "700", color: COLORS.primary },
  workspace: { paddingHorizontal: 20, paddingTop: 18, gap: 14 },
  sectionHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontFamily: "Playfair Display", fontWeight: "600", fontSize: 20, color: COLORS.primary },
  sectionContext: { fontFamily: "Poppins", fontWeight: "400", fontSize: 12, color: COLORS.textMuted },
  verificationList: { gap: 14 },
  verificationCard: {
    backgroundColor: COLORS.white, padding: 16, borderRadius: 18, gap: 14,
    shadowColor: "#7E3E55", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  customerDetails: { gap: 2 },
  orderRef: { fontFamily: "Poppins", fontWeight: "400", fontSize: 11, color: COLORS.textMuted },
  customerName: { fontFamily: "Poppins", fontWeight: "600", fontSize: 14, color: COLORS.textDark },
  transferAmount: { fontFamily: "Poppins", fontWeight: "700", fontSize: 15, color: COLORS.primary },
  proofSection: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: COLORS.bgApp, padding: 12, borderRadius: 14 },
  proofThumbnail: { width: 56, height: 56, borderRadius: 10 },
  proofMeta: { flex: 1, gap: 3 },
  transferTimeLabel: { fontFamily: "Poppins", fontWeight: "400", fontSize: 10, color: COLORS.textMuted },
  transferTimeValue: { fontFamily: "Poppins", fontWeight: "600", fontSize: 12, color: COLORS.textDark },
  viewProofBtn: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  viewProofText: { fontFamily: "Poppins", fontWeight: "600", fontSize: 11, color: COLORS.primary },
  statusSection: { gap: 8 },
  fieldLabel: { fontFamily: "Poppins", fontWeight: "600", fontSize: 12, color: COLORS.primary },
  statusOptionsRow: { flexDirection: "row", gap: 8 },
  statusChip: { flex: 1, height: 36, borderWidth: 1, borderColor: COLORS.border, borderRadius: 100, justifyContent: "center", alignItems: "center" },
  statusChipActive: { backgroundColor: COLORS.accentPink, borderColor: COLORS.accentPink },
  statusChipText: { fontFamily: "Poppins", fontWeight: "400", fontSize: 11, color: "#986678" },
  statusChipTextActive: { fontFamily: "Poppins", fontWeight: "700", fontSize: 11, color: COLORS.primary },
  noteSection: { gap: 6 },
  textInputNote: {
    height: 44, backgroundColor: COLORS.bgApp, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingHorizontal: 12, fontFamily: "Poppins", fontSize: 12, color: COLORS.textDark,
  },
  actionButtonsRow: { flexDirection: "row", marginTop: 4 },
  approveBtn: { flex: 1, height: 42, backgroundColor: COLORS.accentPink, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  approveBtnText: { fontFamily: "Poppins", fontWeight: "700", fontSize: 12, color: COLORS.primary },
});