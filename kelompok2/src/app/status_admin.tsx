import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

const COLORS = {
  bgApp: '#FFF8F0',
  primary: '#A83F68',
  accentPink: '#E8A6BD',
  lightPink: '#FBEAF0',
  border: '#F2E4E5',
  textDark: '#49343C',
  textMuted: '#958189',
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
  const tabFontSize = isSmallScreen ? 9 : 10;

  const [orders, setOrders] = useState<OrderStatusItem[]>([
    {
      id: '1',
      customerName: 'Alya Rahma',
      orderDescription: 'Peach Bloom - 1 buket',
      orderReference: '#RS-1047',
      pickupTime: '18 Okt, 16.30 WIB',
      selectedStatus: 'Siap Diambil',
      photo: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=300',
    },
    {
      id: '2',
      customerName: 'Dinda Maharani',
      orderDescription: 'Sweet Lilac - 1 buket',
      orderReference: '#RS-1046',
      pickupTime: '19 Okt, 10.00 WIB',
      selectedStatus: 'Sedang Dibuat',
      photo: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=300',
    },
    {
      id: '3',
      customerName: 'Rani Safitri',
      orderDescription: 'Pink Romance - 1 buket',
      orderReference: '#RS-1045',
      pickupTime: '18 Okt, 09.00 WIB',
      completionContext: '· Sudah diambil',
      selectedStatus: 'Selesai',
      photo: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300',
    },
  ]);

  const handleStatusChange = (id: string, newStatus: 'Sedang Dibuat' | 'Siap Diambil' | 'Selesai') => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, selectedStatus: newStatus } : order
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* APP HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.brandAndAccount}>
          <Text style={styles.appTitle}>ra_scrafts.id Admin</Text>
          <TouchableOpacity style={styles.adminProfile} onPress={() => router.push('/profil_admin' as any)}>
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

        {/* MANAGEMENT TABS RESPONSIVE */}
        <View style={styles.managementTabs}>
          {[
            { label: 'Kelola\nProduk', route: '/produk_admin' },
            { label: 'Kelola\nPesanan', route: '/kelola_pesanan_admin' },
            { label: 'Verifikasi', route: '/verifikasi_admin' },
            { label: 'Update\nStatus', route: '/status_admin' },
          ].map((tab) => {
            const isActive = tab.route === '/status_admin';
            return (
              <TouchableOpacity
                key={tab.route}
                style={[styles.managementTab, isActive && styles.activeTabBg]}
                onPress={() => router.push(tab.route as any)}
              >
                <Text style={[styles.tabLabel, { fontSize: tabFontSize }, isActive && styles.activeTabLabel]} numberOfLines={2}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Workspace Content */}
        <View style={styles.workspace}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Progres pesanan</Text>
          </View>

          <View style={styles.readyOrdersSummary}>
            <Ionicons name="gift-outline" size={23} color={COLORS.primary} />
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
                  <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
                  <Text style={styles.pickupTime}>{order.pickupTime}</Text>
                  {order.completionContext && (
                    <Text style={styles.completionContext}>{order.completionContext}</Text>
                  )}
                </View>

                <View style={styles.statusChoices}>
                  {(['Sedang Dibuat', 'Siap Diambil', 'Selesai'] as const).map((statusOption) => {
                    const isSelected = order.selectedStatus === statusOption;
                    return (
                      <TouchableOpacity
                        key={statusOption}
                        style={[
                          styles.statusChoiceChip,
                          isSelected && styles.statusChoiceChipActive,
                        ]}
                        onPress={() => handleStatusChange(order.id, statusOption)}
                      >
                        <Text
                          style={[
                            styles.statusChoiceLabel,
                            isSelected && styles.statusChoiceLabelActive,
                          ]}
                        >
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

      {/* BOTTOM NAVIGATION BAR RESPONSIVE */}
      <View style={styles.bottomNavigation}>
        <View style={styles.navigationItems}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/index_admin' as any)}>
            <Ionicons name="grid-outline" size={isSmallScreen ? 17 : 19} color={COLORS.textMuted} />
            <Text style={[styles.navLabel, isSmallScreen && { fontSize: 8 }]}>Beranda</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/kelola_pesanan_admin' as any)}>
            <Ionicons name="bag-outline" size={isSmallScreen ? 17 : 19} color={COLORS.textMuted} />
            <Text style={[styles.navLabel, isSmallScreen && { fontSize: 8 }]}>Pesanan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/produk_admin' as any)}>
            <MaterialCommunityIcons name="flower-outline" size={isSmallScreen ? 17 : 19} color={COLORS.textMuted} />
            <Text style={[styles.navLabel, isSmallScreen && { fontSize: 8 }]}>Produk</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profil_admin' as any)}>
            <Ionicons name="person-outline" size={isSmallScreen ? 17 : 19} color={COLORS.textMuted} />
            <Text style={[styles.navLabel, isSmallScreen && { fontSize: 8 }]}>Akun</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.homeIndicatorArea}>
          <View style={styles.homeIndicator} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgApp,
  },
  headerContainer: {
    width: '100%',
    backgroundColor: COLORS.bgApp,
  },
  brandAndAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 68,
  },
  appTitle: {
    fontFamily: 'Playfair Display',
    fontWeight: '600',
    fontSize: 26,
    color: COLORS.primary,
  },
  adminProfile: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.white,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7E3E55',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 3,
  },
  headerDivider: {
    width: '100%',
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
    fontFamily: 'Playfair Display',
    fontWeight: '600',
    fontSize: 28,
    lineHeight: 35,
    color: COLORS.primary,
  },
  pageSubtitle: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textMuted,
  },
  managementTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightPink,
    marginHorizontal: 20,
    padding: 4,
    borderRadius: 14,
    gap: 2,
    minHeight: 54,
  },
  managementTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 2,
    paddingVertical: 6,
  },
  activeTabBg: {
    backgroundColor: COLORS.accentPink,
  },
  tabLabel: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    lineHeight: 14,
    textAlign: 'center',
    color: '#986678',
  },
  activeTabLabel: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: COLORS.primary,
  },
  workspace: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 28,
  },
  sectionTitle: {
    fontFamily: 'Playfair Display',
    fontWeight: '500',
    fontSize: 20,
    color: COLORS.primary,
  },
  readyOrdersSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.lightPink,
    borderRadius: 14,
    gap: 10,
  },
  readyOrdersInformation: {
    flex: 1,
    gap: 2,
  },
  readyOrderCount: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 12,
    color: COLORS.primary,
  },
  statusGuidance: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 10,
    color: '#986678',
  },
  cardList: {
    gap: 12,
  },
  orderStatusCard: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 18,
    gap: 9,
    shadowColor: '#7E3E55',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  orderIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bouquetPhotograph: {
    width: 42,
    height: 44,
    borderRadius: 10,
  },
  customerAndBouquet: {
    flex: 1,
    gap: 2,
  },
  customerName: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 13,
    color: COLORS.textDark,
  },
  orderDescription: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 10,
    color: COLORS.textMuted,
  },
  orderReference: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 10,
    color: COLORS.textMuted,
  },
  pickupSchedule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pickupTime: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 10,
    color: COLORS.textMuted,
  },
  completionContext: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 10,
    color: '#557153',
  },
  statusChoices: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  statusChoiceChip: {
    flex: 1,
    height: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusChoiceChipActive: {
    backgroundColor: COLORS.accentPink,
    borderColor: COLORS.accentPink,
  },
  statusChoiceLabel: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 10,
    color: '#986678',
  },
  statusChoiceLabelActive: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 10,
    color: COLORS.primary,
  },
  bottomNavigation: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    shadowColor: '#71384C',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  navigationItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  navLabel: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 9,
    color: COLORS.textMuted,
  },
  activeNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.accentPink,
    borderRadius: 100,
    gap: 7,
  },
  activeNavLabel: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 12,
    color: COLORS.primary,
  },
  homeIndicatorArea: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  homeIndicator: {
    width: 128,
    height: 4,
    backgroundColor: COLORS.textDark,
    borderRadius: 100,
  },
});