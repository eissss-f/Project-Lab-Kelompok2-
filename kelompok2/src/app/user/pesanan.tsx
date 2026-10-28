import { useEffect, useState, useMemo, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import PageHeader from "@/components/PageHeader";
import { supabase } from "../../../lib/supabase";

const colors = {
  background: "#FFF8F0",
  berry: "#A83F68",
  pink: "#E8A6BD",
  palePink: "#F7E6E6",
  muted: "#A17B84",
  line: "#EED7D8",
};

type Order = {
  id: string | number;
  product: string;
  price: string;
  pickupDate: string;
  paymentStatus: string;
  workStatus: string;
  note?: string;
  completed: boolean;
  highlightPaymentStatus?: boolean;
  highlightWorkStatus?: boolean;
  image: string;
};

const filters = ["Semua", "Aktif", "Selesai"] as const;
type Filter = (typeof filters)[number];

export default function PesananScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<Filter>("Semua");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedOrders: Order[] = data.map((item: any) => {
          const isCompleted = item.status === "Selesai" || item.work_status === "Selesai";
          return {
            id: item.order_number || `RA-${item.id}`,
            product: item.bouquet_name || "Buket Bunga",
            price: item.quantity_price || `Rp ${Number(item.total_price || 0).toLocaleString("id-ID")}`,
            pickupDate: `${item.delivery_date || ""} (${item.delivery_time || ""})`,
            paymentStatus: item.status === "Verifikasi" ? "Menunggu Verifikasi" : "Sudah Dibayar",
            workStatus: item.status || "Belum diproses",
            note: item.card_message ? `Pesan: "${item.card_message}"` : undefined,
            completed: isCompleted,
            highlightPaymentStatus: item.status !== "Verifikasi",
            highlightWorkStatus: isCompleted,
            image: item.photo || "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300",
          };
        });
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error("Gagal memuat pesanan user:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  const counts = useMemo(
    () => ({
      Semua: orders.length,
      Aktif: orders.filter((order) => !order.completed).length,
      Selesai: orders.filter((order) => order.completed).length,
    }),
    [orders]
  );

  const visibleOrders = useMemo(
    () =>
      orders.filter((order) => {
        if (activeFilter === "Aktif") return !order.completed;
        if (activeFilter === "Selesai") return order.completed;
        return true;
      }),
    [orders, activeFilter]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PageHeader
          title="Pesanan Saya"
          subtitle="Setiap pesanan, dirangkai dengan hati."
          onBack={() => router.replace("/user/Katalog")}
          backAccessibilityLabel="Kembali ke Katalog"
        />

        <View style={styles.filters}>
          {filters.map((filter) => {
            const selected = activeFilter === filter;
            return (
              <Pressable key={filter} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setActiveFilter(filter)} style={[styles.filter, selected && styles.filterSelected]}>
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                  {filter} ({counts[filter]})
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.berry} style={{ marginTop: 40 }} />
        ) : visibleOrders.length ? (
          visibleOrders.map((order) => <OrderCard key={String(order.id)} order={order} />)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="flower-outline" size={34} color={colors.pink} />
            <Text style={styles.emptyTitle}>Belum ada pesanan</Text>
            <Text style={styles.emptyCopy}>Pesanan yang kamu buat akan muncul di sini.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderTop}>
        <Text style={styles.orderId}>#{order.id}</Text>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded((value) => !value)} style={styles.detailButton}>
          <Text style={styles.detailButtonText}>{expanded ? "Tutup detail" : "Lihat detail"}</Text>
          <Ionicons name={expanded ? "chevron-up" : "chevron-forward"} size={17} color={colors.berry} />
        </Pressable>
      </View>

      <View style={styles.productRow}>
        <Image
          source={{ uri: typeof order.image === "string" ? order.image : "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300" }}
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
      <StatusRow label="Pembayaran" status={order.paymentStatus} filled={order.highlightPaymentStatus} />
      <StatusRow label="Pengerjaan" status={order.workStatus} filled={order.highlightWorkStatus} />
      {order.note ? <Text style={styles.orderNote}>{order.note}</Text> : null}

      {expanded ? (
        <View style={styles.detailPanel}>
          <Text style={styles.detailText}>Nomor pesanan: {order.id}</Text>
          <Text style={styles.detailText}>{order.completed ? "Pesanan telah selesai. Terima kasih sudah berbelanja!" : `Pesanan dijadwalkan untuk diambil sesuai jadwal.`}</Text>
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
  filters: { flexDirection: "row", gap: 8, marginBottom: 18 },
  filter: {
    minHeight: 34,
    paddingHorizontal: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: "center",
    alignItems: "center",
  },
  filterSelected: { backgroundColor: colors.berry, borderColor: colors.berry },
  filterText: { color: colors.muted, fontSize: 12, fontWeight: "500" },
  filterTextSelected: { color: colors.background, fontWeight: "700" },
  orderCard: {
    borderWidth: 1,
    borderColor: colors.pink,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 14,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  orderTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderId: { color: colors.berry, fontSize: 13, fontWeight: "700" },
  detailButton: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 3 },
  detailButtonText: { color: colors.muted, fontSize: 11 },
  productRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  productImage: {
    width: 82,
    height: 92,
    borderRadius: 12,
    backgroundColor: colors.palePink,
  },
  productInfo: { flex: 1, paddingLeft: 12, justifyContent: "center" },
  productName: { color: colors.berry, fontSize: 16, lineHeight: 21, fontWeight: "700" },
  price: { color: colors.berry, fontSize: 14, marginTop: 3, fontWeight: "600" },
  pickupLabel: { color: colors.muted, fontSize: 11, marginTop: 7 },
  pickupDate: { color: colors.berry, fontSize: 13, marginTop: 1 },
  divider: { height: 1, backgroundColor: colors.line, marginTop: 12, marginBottom: 10 },
  statusRow: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  statusLabel: { color: colors.muted, fontSize: 12 },
  statusBadge: {
    maxWidth: "72%",
    borderWidth: 1,
    borderColor: colors.berry,
    borderRadius: 17,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  statusBadgeFilled: { backgroundColor: colors.pink, borderColor: colors.pink },
  statusText: { color: colors.berry, fontSize: 10, fontWeight: "600", textAlign: "center" },
  statusTextFilled: { color: colors.berry },
  orderNote: { color: colors.muted, fontSize: 11, marginTop: 5 },
  detailPanel: { backgroundColor: colors.palePink, padding: 10, borderRadius: 10, gap: 4, marginTop: 10 },
  detailText: { color: colors.berry, fontSize: 11, lineHeight: 16 },
  emptyState: { alignItems: "center", padding: 36, gap: 8 },
  emptyTitle: { color: colors.berry, fontSize: 16, fontWeight: "700" },
  emptyCopy: { color: colors.muted, fontSize: 12, textAlign: "center" },
});