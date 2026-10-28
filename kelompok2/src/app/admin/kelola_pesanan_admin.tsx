
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

interface OrderProduct {
  id: string;
  product_title: string;
  product_photo: string | null;
  size_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  statusBg: string;
  statusColor: string;
  bouquetName: string;
  quantityPrice: string;
  pickupTime: string;
  greetingMessage: string;
  photo: string;
  items: OrderProduct[];
}

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=300";

const STATUS_LABELS: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  menunggu_pembayaran: {
    label: "Menunggu Pembayaran",
    bg: "#FFF2DD",
    color: "#986E2F",
  },
  menunggu_verifikasi: {
    label: "Menunggu Verifikasi",
    bg: "#FFF2DD",
    color: "#986E2F",
  },
  diproses: {
    label: "Diproses",
    bg: "#EAF1E8",
    color: "#557153",
  },
  dikirim: {
    label: "Dikirim",
    bg: "#E8F0FE",
    color: "#315DA8",
  },
  selesai: {
    label: "Selesai",
    bg: "#EAF1E8",
    color: "#557153",
  },
  dibatalkan: {
    label: "Dibatalkan",
    bg: "#FBE4E4",
    color: "#B42318",
  },
};

export default function KelolaPesananScreen() {
  const router = useRouter();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrdersFromSupabase = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          user_id,
          total_price,
          recipient_name,
          recipient_phone,
          shipping_address,
          status,
          notes,
          created_at,
          order_items (
            id,
            product_title,
            product_photo,
            size_name,
            quantity,
            price,
            subtotal
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedOrders: OrderItem[] = (data ?? []).map(
        (item: any) => {
          const products: OrderProduct[] = item.order_items ?? [];

          const statusInfo = STATUS_LABELS[item.status] ?? {
            label: item.status ?? "Status tidak diketahui",
            bg: "#F1E8EC",
            color: "#806A72",
          };

          const productNames = products
            .map(
              (product) =>
                `${product.product_title} (${product.size_name})`
            )
            .join(", ");

          const totalQuantity = products.reduce(
            (sum, product) =>
              sum + Number(product.quantity || 0),
            0
          );

          const totalPrice = Number(item.total_price || 0);

          const formattedPrice = totalPrice.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          });

          return {
            id: item.id,
            orderNumber: item.order_number || `ORD-${item.id}`,
            customerName: item.recipient_name || "Pelanggan",
            status: statusInfo.label,
            statusBg: statusInfo.bg,
            statusColor: statusInfo.color,
            bouquetName: productNames || "Item pesanan",
            quantityPrice: `${totalQuantity} item • ${formattedPrice}`,
            pickupTime: item.created_at
              ? new Date(item.created_at).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "-",
            greetingMessage: item.notes || "Tidak ada catatan pesanan.",
            photo:
              products.find((product) => product.product_photo)
                ?.product_photo || DEFAULT_PHOTO,
            items: products,
          };
        }
      );

      setOrders(formattedOrders);
    } catch (error: any) {
      console.error("Gagal memuat pesanan:", error);

      Alert.alert(
        "Gagal Memuat Pesanan",
        error?.message ?? "Terjadi kesalahan saat mengambil pesanan."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrdersFromSupabase();

    // Pantau pesanan baru atau perubahan pesanan.
    const ordersChannel = supabase
      .channel("admin-orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchOrdersFromSupabase();
        }
      )
      .subscribe();

    // Pantau detail item agar daftar diperbarui ketika item buket masuk.
    const itemsChannel = supabase
      .channel("admin-order-items-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_items",
        },
        () => {
          fetchOrdersFromSupabase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(itemsChannel);
    };
  }, [fetchOrdersFromSupabase]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.brandAndAccount}>
          <Text style={styles.appTitle}>ra_scrafts.id Admin</Text>

          <TouchableOpacity
            style={styles.adminProfile}
            onPress={() => router.push("/admin/profil_admin" as any)}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.headerDivider} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageIntro}>
          <Text style={styles.pageTitle}>Kelola Toko</Text>
          <Text style={styles.pageSubtitle}>
            Kelola Produk & Pesanan
          </Text>
        </View>

        <AdminSubNav />

        <View style={styles.workspace}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Pesanan masuk</Text>
            <Text style={styles.sectionContext}>
              {orders.length} pesanan
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={{ marginTop: 40 }}
            />
          ) : orders.length === 0 ? (
            <Text style={styles.emptyText}>
              Belum ada pesanan masuk dari pelanggan.
            </Text>
          ) : (
            <View style={styles.orderList}>
              {orders.map((order) => (
                <View key={String(order.id)} style={styles.orderCard}>
                  <View style={styles.customerAndStatus}>
                    <View style={styles.customerIdentity}>
                      <Text style={styles.orderNumber}>
                        {order.orderNumber}
                      </Text>

                      <Text style={styles.customerName}>
                        {order.customerName}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: order.statusBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusLabel,
                          { color: order.statusColor },
                        ]}
                      >
                        {order.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderedBouquet}>
                    <Image
                      source={{ uri: order.photo }}
                      style={styles.bouquetPhotograph}
                    />

                    <View style={styles.bouquetDetails}>
                      <Text style={styles.bouquetName}>
                        {order.bouquetName}
                      </Text>

                      <Text style={styles.quantityPrice}>
                        {order.quantityPrice}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.scheduledPickup}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={COLORS.primary}
                    />

                    <View style={styles.pickupDetails}>
                      <Text style={styles.pickupLabel}>
                        Tanggal Pesanan
                      </Text>

                      <Text style={styles.pickupTime}>
                        {order.pickupTime}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.greetingCardMessage}>
                    <Text style={styles.greetingLabel}>
                      Catatan Pesanan
                    </Text>

                    <Text style={styles.customGreeting}>
                      {order.greetingMessage}
                    </Text>
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
  headerDivider: {
    width: "100%",
    height: 1,
    backgroundColor: COLORS.border,
  },
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
  orderList: { gap: 14 },
  orderCard: {
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
  customerAndStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerIdentity: { gap: 2, flex: 1, paddingRight: 8 },
  orderNumber: {
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    maxWidth: "50%",
  },
  statusLabel: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 10,
  },
  orderedBouquet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bouquetPhotograph: { width: 56, height: 56, borderRadius: 12 },
  bouquetDetails: { flex: 1, gap: 4 },
  bouquetName: {
    fontFamily: "Playfair Display",
    fontWeight: "600",
    fontSize: 18,
    color: COLORS.primary,
  },
  quantityPrice: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: 12,
    color: COLORS.textMuted,
  },
  scheduledPickup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pickupDetails: { gap: 2, flex: 1 },
  pickupLabel: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: 11,
    color: COLORS.textMuted,
  },
  pickupTime: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 12,
    color: COLORS.primary,
  },
  greetingCardMessage: {
    backgroundColor: COLORS.lightPink,
    padding: 12,
    borderRadius: 12,
    gap: 5,
  },
  greetingLabel: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 11,
    color: COLORS.primary,
  },
  customGreeting: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textDark,
  },
});
