import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AdminSubNav from '../../components/AdminSubNav'; 
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

interface OrderStatusItem {
  id: number | string;
  customerName: string;
  orderDescription: string;
  orderReference: string;
  pickupTime: string;
  completionContext?: string;
  selectedStatus: 'Sedang Dibuat' | 'Siap Diambil' | 'Selesai';
  photo: string;
}

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=300';

export default function UpdateStatusScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderStatusItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil data pesanan dari Supabase yang sudah diverifikasi (menggunakan created_at agar aman dari error kolom)
  const fetchActiveOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          recipient_name,
          status,
          payment_proof,
          created_at,
          order_items (
            product_title,
            size_name,
            product_photo,
            quantity
          )
        `)
        .in("status", ["Sedang Dibuat", "Siap Diambil", "Selesai"])
        .order("id", { ascending: false });

      if (error) throw error;

      if (data) {
        const formatted: OrderStatusItem[] = data.map((item: any) => {
          const products = item.order_items ?? [];
          const firstPhoto = products.find((p: any) => p.product_photo)?.product_photo || item.payment_proof || DEFAULT_PHOTO;
          
          // Menggabungkan nama produk dari tabel order_items
          const bouquetInfo = products
            .map((p: any) => `${p.product_title || 'Buket'} (${p.size_name || 'S'}) x${p.quantity || 1}`)
            .join(", ") || "Buket Bunga";

          // Format tanggal pesanan menggunakan created_at
          const formattedDate = item.created_at 
            ? new Date(item.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) 
            : "-";

          return {
            id: item.id,
            customerName: item.recipient_name || "Pelanggan",
            orderDescription: bouquetInfo,
            orderReference: item.order_number || `#RA-${item.id}`,
            pickupTime: `Dipesan: ${formattedDate}`,
            selectedStatus: item.status || "Sedang Dibuat",
            photo: firstPhoto,
          };
        });
        setOrders(formatted);
      }
    } catch (error: any) {
      console.error("Gagal memuat status pesanan:", error);
      Alert.alert("Gagal", error?.message || "Gagal memuat daftar pesanan aktif.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveOrders();

    const channel = supabase
      .channel("admin-status-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchActiveOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActiveOrders]);

  // Fungsi untuk mengubah status pesanan langsung di database Supabase
  const handleStatusChange = async (id: number | string, newStatus: 'Sedang Dibuat' | 'Siap Diambil' | 'Selesai') => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus } as any)
        .eq("id", id);

      if (error) throw error;

      setOrders((prev) => prev.map((ord) => (ord.id === id ? { ...ord, selectedStatus: newStatus } : ord)));
    } catch (error: any) {
      Alert.alert("Gagal", error?.message || "Gagal memperbarui status pesanan.");
    }
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

        <AdminSubNav />

        <View style={styles.workspace}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Progres pesanan</Text>
          </View>

          <View style={styles.readyOrdersSummary}>
            <Ionicons name="gift-outline" size={24} color={COLORS.primary} />
            <View style={styles.readyOrdersInformation}>
              <Text style={styles.readyOrderCount}>{orders.length} pesanan aktif</Text>
              <Text style={styles.statusGuidance}>Perbarui status sesuai progres buket.</Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : orders.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada pesanan yang diterima/aktif.</Text>
          ) : (
            <View style={styles.cardList}>
              {orders.map((order) => (
                <View key={String(order.id)} style={styles.orderStatusCard}>
                  <View style={styles.orderIdentity}>
                    <Image source={{ uri: order.photo }} style={styles.bouquetPhotograph} />
                    <View style={styles.customerAndBouquet}>
                      <Text style={styles.customerName}>{order.customerName}</Text>
                      <Text style={styles.orderDescription} numberOfLines={2}>{order.orderDescription}</Text>
                    </View>
                    <Text style={styles.orderReference}>{order.orderReference}</Text>
                  </View>

                  <View style={styles.pickupSchedule}>
                    <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
                    <Text style={styles.pickupTime}>{order.pickupTime}</Text>
                    {order.completionContext && <Text style={styles.completionContext}>{order.completionContext}</Text>}
                  </View>

                  <View style={styles.statusChoices}>
                    {(['Sedang Dibuat', 'Siap Diambil', 'Selesai'] as const).map((statusOption) => {
                      const isSelected = order.selectedStatus === statusOption;
                      return (
                        <TouchableOpacity
                          key={statusOption}
                          style={[styles.statusChoiceChip, isSelected && styles.statusChoiceChipActive]}
                          onPress={() => handleStatusChange(order.id, statusOption)}
                        >
                          <Text style={[styles.statusChoiceLabel, isSelected && styles.statusChoiceLabelActive]}>
                            {statusOption}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgApp },
  headerContainer: { width: '100%', backgroundColor: COLORS.bgApp },
  brandAndAccount: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 72 },
  appTitle: { fontFamily: 'Playfair Display', fontWeight: '700', fontSize: 26, color: COLORS.primary },
  adminProfile: {
    width: 40, height: 40, backgroundColor: COLORS.white, borderRadius: 100, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#7E3E55', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.13, shadowRadius: 10, elevation: 3,
  },
  headerDivider: { width: '100%', height: 1, backgroundColor: COLORS.border },
  scrollContent: { paddingBottom: 35 },
  pageIntro: { paddingHorizontal: 20, paddingVertical: 12, gap: 4 },
  pageTitle: { fontFamily: 'Playfair Display', fontWeight: '700', fontSize: 28, color: COLORS.primary },
  pageSubtitle: { fontFamily: 'Poppins', fontWeight: '400', fontSize: 12, color: COLORS.textMuted },
  workspace: { paddingHorizontal: 20, paddingTop: 18, gap: 14 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: 'Playfair Display', fontWeight: '600', fontSize: 20, color: COLORS.primary },
  readyOrdersSummary: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: COLORS.lightPink, borderRadius: 16, gap: 12 },
  readyOrdersInformation: { flex: 1, gap: 3 },
  readyOrderCount: { fontFamily: 'Poppins', fontWeight: '700', fontSize: 13, color: COLORS.primary },
  statusGuidance: { fontFamily: 'Poppins', fontWeight: '400', fontSize: 11, color: '#986678' },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: 30, fontFamily: 'Poppins' },
  cardList: { gap: 14 },
  orderStatusCard: {
    backgroundColor: COLORS.white, padding: 16, borderRadius: 18, gap: 10,
    shadowColor: '#7E3E55', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 2,
  },
  orderIdentity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bouquetPhotograph: { width: 48, height: 50, borderRadius: 10 },
  customerAndBouquet: { flex: 1, gap: 3 },
  customerName: { fontFamily: 'Poppins', fontWeight: '600', fontSize: 14, color: COLORS.textDark },
  orderDescription: { fontFamily: 'Poppins', fontWeight: '400', fontSize: 11, color: COLORS.textMuted },
  orderReference: { fontFamily: 'Poppins', fontWeight: '400', fontSize: 11, color: COLORS.textMuted },
  pickupSchedule: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pickupTime: { fontFamily: 'Poppins', fontWeight: '400', fontSize: 11, color: COLORS.textMuted },
  completionContext: { fontFamily: 'Poppins', fontWeight: '600', fontSize: 11, color: '#557153' },
  statusChoices: { flexDirection: 'row', gap: 8, marginTop: 4 },
  statusChoiceChip: { flex: 1, height: 36, borderWidth: 1, borderColor: COLORS.border, borderRadius: 100, justifyContent: 'center', alignItems: 'center' },
  statusChoiceChipActive: { backgroundColor: COLORS.accentPink, borderColor: COLORS.accentPink },
  statusChoiceLabel: { fontFamily: 'Poppins', fontWeight: '400', fontSize: 11, color: '#986678' },
  statusChoiceLabelActive: { fontFamily: 'Poppins', fontWeight: '700', fontSize: 11, color: COLORS.primary },
});