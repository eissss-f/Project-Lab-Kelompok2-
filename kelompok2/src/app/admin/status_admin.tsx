import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
  id: string;
  customerName: string;
  orderDescription: string;
  orderReference: string;
  pickupTime: string;
  completionContext?: string;
  selectedStatus: 'Sedang Dibuat' | 'Siap Diambil' | 'Selesai';
  photo: string;
}

export default function UpdateStatusScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;
  const tabFontSize = isSmallScreen ? 10 : 11;

  const [orders, setOrders] = useState<OrderStatusItem[]>([
    {
      id: '1', customerName: 'Alya Rahma', orderDescription: 'Peach Bloom - 1 buket', orderReference: '#RS-1047',
      pickupTime: '18 Okt, 16.30 WIB', selectedStatus: 'Siap Diambil', photo: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=300',
    },
    {
      id: '2', customerName: 'Dinda Maharani', orderDescription: 'Sweet Lilac - 1 buket', orderReference: '#RS-1046',
      pickupTime: '19 Okt, 10.00 WIB', selectedStatus: 'Sedang Dibuat', photo: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=300',
    },
  ]);

  const handleStatusChange = (id: string, newStatus: 'Sedang Dibuat' | 'Siap Diambil' | 'Selesai') => {
    setOrders((prev) => prev.map((ord) => (ord.id === id ? { ...ord, selectedStatus: newStatus } : ord)));
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
            { label: 'Kelola Produk', route: '/admin/produk_admin' },
            { label: 'Kelola Pesanan', route: '/admin/kelola_pesanan_admin' },
            { label: 'Verifikasi', route: '/admin/verifikasi_admin' },
            { label: 'Update Status', route: '/admin/status_admin' },
          ].map((tab) => {
            const isActive = tab.route === '/admin/status_admin';
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
            <Text style={styles.sectionTitle}>Progres pesanan</Text>
          </View>

          <View style={styles.readyOrdersSummary}>
            <Ionicons name="gift-outline" size={24} color={COLORS.primary} />
            <View style={styles.readyOrdersInformation}>
              <Text style={styles.readyOrderCount}>3 pesanan siap diambil</Text>
              <Text style={styles.statusGuidance}>Perbarui status sesuai progres buket.</Text>
            </View>
          </View>

          <View style={styles.cardList}>
            {orders.map((order) => (
              <View key={order.id} style={styles.orderStatusCard}>
                <View style={styles.orderIdentity}>
                  <Image source={{ uri: order.photo }} style={styles.bouquetPhotograph} />
                  <View style={styles.customerAndBouquet}>
                    <Text style={styles.customerName}>{order.customerName}</Text>
                    <Text style={styles.orderDescription}>{order.orderDescription}</Text>
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
  managementTabs: {
    flexDirection: 'row', backgroundColor: COLORS.lightPink, marginHorizontal: 20, padding: 5, borderRadius: 16, gap: 4, minHeight: 56,
  },
  managementTab: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 12, paddingHorizontal: 4, paddingVertical: 8 },
  activeTabBg: { backgroundColor: COLORS.accentPink },
  tabLabel: { fontFamily: 'Poppins', fontWeight: '500', textAlign: 'center', color: '#986678' },
  activeTabLabel: { fontFamily: 'Poppins', fontWeight: '700', color: COLORS.primary },
  workspace: { paddingHorizontal: 20, paddingTop: 18, gap: 14 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: 'Playfair Display', fontWeight: '600', fontSize: 20, color: COLORS.primary },
  readyOrdersSummary: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: COLORS.lightPink, borderRadius: 16, gap: 12 },
  readyOrdersInformation: { flex: 1, gap: 3 },
  readyOrderCount: { fontFamily: 'Poppins', fontWeight: '700', fontSize: 13, color: COLORS.primary },
  statusGuidance: { fontFamily: 'Poppins', fontWeight: '400', fontSize: 11, color: '#986678' },
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