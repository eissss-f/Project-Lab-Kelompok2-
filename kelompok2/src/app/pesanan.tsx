import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ShoppingBag, Store, User } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = {
  background: '#FFF8F0',
  berry: '#A83F68',
  pink: '#E8A6BD',
  palePink: '#F7E6E6',
  muted: '#A17B84',
  line: '#EED7D8',
};

type Order = {
  id: string;
  product: string;
  price: string;
  pickupDate: string;
  paymentStatus: string;
  workStatus: string;
  note?: string;
  completed: boolean;
  highlightPaymentStatus?: boolean;
  highlightWorkStatus?: boolean;
  image: number;
};

const orders: Order[] = [
  {
    id: 'RA-0012',
    product: 'Blush Rose Bouquet',
    price: 'Rp185.000',
    pickupDate: '24 Okt 2026',
    paymentStatus: 'Menunggu Pembayaran',
    workStatus: 'Belum diproses',
    completed: false,
    image: 0,
  },
  {
    id: 'RA-0011',
    product: 'Sweet Peony',
    price: 'Rp250.000',
    pickupDate: '23 Okt 2026',
    paymentStatus: 'Menunggu Verifikasi',
    workStatus: 'Sedang Dibuat',
    note: 'DP diterima · pelunasan ditinjau',
    completed: false,
    highlightWorkStatus: true,
    image: 1,
  },
  {
    id: 'RA-0010',
    product: 'Lili Putih',
    price: 'Rp210.000',
    pickupDate: '22 Okt 2026',
    paymentStatus: 'Sudah Dibayar',
    workStatus: 'Siap Diambil',
    completed: false,
    image: 0,
  },
  {
    id: 'RA-0009',
    product: 'Buket Mawar Merah',
    price: 'Rp195.000',
    pickupDate: '20 Okt 2026',
    paymentStatus: 'Lunas',
    workStatus: 'Selesai',
    completed: true,
    highlightPaymentStatus: true,
    highlightWorkStatus: true,
    image: 0,
  },
];

const filters = ['Semua', 'Aktif', 'Selesai'] as const;
type Filter = (typeof filters)[number];

export default function PesananScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<Filter>('Semua');
  const counts = useMemo(
    () => ({
      Semua: orders.length,
      Aktif: orders.filter((order) => !order.completed).length,
      Selesai: orders.filter((order) => order.completed).length,
    }),
    [],
  );
  const visibleOrders = useMemo(
    () =>
      orders.filter((order) => {
        if (activeFilter === 'Aktif') return !order.completed;
        if (activeFilter === 'Selesai') return order.completed;
        return true;
      }),
    [activeFilter],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Pesanan Saya</Text>
        <Text style={styles.subtitle}>Setiap pesanan, dirangkai dengan hati.</Text>

        <View style={styles.filters}>
          {filters.map((filter) => {
            const selected = activeFilter === filter;
            return (
              <Pressable
                key={filter}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setActiveFilter(filter)}
                style={[styles.filter, selected && styles.filterSelected]}>
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                  {filter} ({counts[filter]})
                </Text>
              </Pressable>
            );
          })}
        </View>

        {visibleOrders.length ? (
          visibleOrders.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="flower-outline" size={34} color={colors.pink} />
            <Text style={styles.emptyTitle}>Belum ada pesanan</Text>
            <Text style={styles.emptyCopy}>Pesanan dengan status ini akan muncul di sini.</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Nav yang Responsif dan Terhubung */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.navTabs}>
          {/* Menu Produk / Katalog */}
          <Pressable 
            style={styles.tabInactive}
            onPress={() => router.push('/Katalog')}
          >
            <Store size={21} color="#999999" strokeWidth={1.8} />
            <Text style={styles.tabLabelInactive}>Produk</Text>
          </Pressable>

          {/* Menu Pesanan (Aktif saat ini) */}
          <Pressable 
            style={styles.tabActive}
            onPress={() => router.push('/pesanan')}
          >
            <ShoppingBag size={21} color={colors.berry} strokeWidth={1.8} />
            <Text style={styles.tabLabelActive}>Pesanan</Text>
          </Pressable>

          {/* Menu Profil */}
          <Pressable 
            style={styles.tabInactive}
            onPress={() => router.push('/profil')}
          >
            <User size={21} color="#999999" strokeWidth={1.8} />
            <Text style={styles.tabLabelInactive}>Profil</Text>
          </Pressable>
        </View>
        <View style={styles.homeIndicator} />
      </View>
    </SafeAreaView>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderTop}>
        <Text style={styles.orderId}>#{order.id}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          onPress={() => setExpanded((value) => !value)}
          style={styles.detailButton}>
          <Text style={styles.detailButtonText}>{expanded ? 'Tutup detail' : 'Lihat detail'}</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-forward'}
            size={17}
            color={colors.berry}
          />
        </Pressable>
      </View>

      <View style={styles.productRow}>
        <Image
          source={
            order.image === 0
              ? require('../../assets/images/order-photo-1.jpg')
              : require('../../assets/images/order-photo-2.jpg')
          }
          style={styles.productImage}
          resizeMode="cover"
          accessibilityLabel={`Foto ${order.product}`}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{order.product}</Text>
          <Text style={styles.price}>{order.price}</Text>
          <Text style={styles.pickupLabel}>Jadwal ambil</Text>
          <Text style={styles.pickupDate}>{order.pickupDate}</Text>
        </View>
      </View>

      <View style={styles.divider} />
      <StatusRow
        label="Pembayaran"
        status={order.paymentStatus}
        filled={order.highlightPaymentStatus}
      />
      <StatusRow
        label="Pengerjaan"
        status={order.workStatus}
        filled={order.highlightWorkStatus}
      />
      {order.note ? <Text style={styles.orderNote}>{order.note}</Text> : null}

      {expanded ? (
        <View style={styles.detailPanel}>
          <Text style={styles.detailText}>Nomor pesanan: {order.id}</Text>
          <Text style={styles.detailText}>
            {order.completed
              ? 'Pesanan telah selesai. Terima kasih sudah berbelanja!'
              : `Pesanan dijadwalkan untuk diambil pada ${order.pickupDate}.`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function StatusRow({ label, status, filled = false }: { label: string; status: string; filled?: boolean }) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <View style={[styles.statusBadge, filled && styles.statusBadgeFilled]}>
        <Text style={[styles.statusText, filled && styles.statusTextFilled]}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 23, paddingTop: 18, paddingBottom: 100 },
  heading: {
    color: colors.berry,
    fontFamily: 'serif',
    fontSize: 29,
    fontWeight: '700',
    lineHeight: 38,
  },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 2, marginBottom: 19 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  filter: {
    minHeight: 34,
    paddingHorizontal: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSelected: { backgroundColor: colors.berry, borderColor: colors.berry },
  filterText: { color: colors.muted, fontSize: 12, fontWeight: '500' },
  filterTextSelected: { color: colors.background, fontWeight: '700' },
  orderCard: {
    borderWidth: 1,
    borderColor: colors.pink,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 14,
    marginBottom: 14,
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { color: colors.berry, fontSize: 13, fontWeight: '700' },
  detailButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3 },
  detailButtonText: { color: colors.muted, fontSize: 11 },
  productRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  productImage: {
    width: 82,
    height: 92,
    borderRadius: 12,
    backgroundColor: colors.palePink,
  },
  productInfo: { flex: 1, paddingLeft: 12, justifyContent: 'center' },
  productName: { color: colors.berry, fontFamily: 'serif', fontSize: 18, lineHeight: 23, fontWeight: '700' },
  price: { color: colors.berry, fontSize: 14, marginTop: 3 },
  pickupLabel: { color: colors.muted, fontSize: 11, marginTop: 7 },
  pickupDate: { color: colors.berry, fontSize: 14, marginTop: 1 },
  divider: { height: 1, backgroundColor: colors.line, marginTop: 12, marginBottom: 10 },
  statusRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusLabel: { color: colors.muted, fontSize: 12 },
  statusBadge: {
    maxWidth: '72%',
    borderWidth: 1,
    borderColor: colors.berry,
    borderRadius: 17,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statusBadgeFilled: { backgroundColor: colors.pink, borderColor: colors.pink },
  statusText: { color: colors.berry, fontSize: 10, fontWeight: '600', textAlign: 'center' },
  statusTextFilled: { color: colors.berry },
  orderNote: { color: colors.muted, fontSize: 11, marginTop: 5 },
  detailPanel: { backgroundColor: colors.palePink, padding: 10, borderRadius: 10, gap: 4, marginTop: 10 },
  detailText: { color: colors.berry, fontSize: 11, lineHeight: 16 },
  emptyState: { alignItems: 'center', padding: 36, gap: 8 },
  emptyTitle: { color: colors.berry, fontSize: 16, fontWeight: '700' },
  emptyCopy: { color: colors.muted, fontSize: 12, textAlign: 'center' },
  // Style untuk Bottom Navigation
  bottomNavContainer: { 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 84, 
    borderTopWidth: 1, 
    borderTopColor: '#F1D2DC', 
    backgroundColor: '#FFF8F0', 
    alignItems: 'center', 
    paddingTop: 8, 
    paddingHorizontal: 20 
  },
  navTabs: { flexDirection: 'row', width: '100%', height: 48, gap: 16 },
  tabActive: { flex: 1, height: 48, backgroundColor: '#FFF0F6', borderRadius: 4, justifyContent: 'center', alignItems: 'center', gap: 3 },
  tabInactive: { flex: 1, height: 48, justifyContent: 'center', alignItems: 'center', gap: 3 },
  tabLabelActive: { fontSize: 10, color: colors.berry, fontWeight: '600' },
  tabLabelInactive: { fontSize: 10, color: '#999999' },
  homeIndicator: { width: 120, height: 4, backgroundColor: colors.berry, borderRadius: 2, marginTop: 12 },
});