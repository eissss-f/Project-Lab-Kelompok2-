import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Slot, usePathname, useRouter } from "expo-router";
import { Store, ShoppingBag, User, Home } from "lucide-react-native";

const COLORS = {
  bgApp: "#FFF8F0",
  primary: "#A83F68",
  accentPink: "#FFF0F6",
  textMuted: "#999999",
  textDark: "#49343C",
  white: "#FFFFFF",
  border: "#F1D2DC",
};

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const isBeranda = pathname.includes("index_admin");
  const isPesanan = pathname.includes("kelola_pesanan_admin");
  const isProduk = pathname.includes("produk_admin");
  const isProfil = pathname.includes("profil_admin");
  pathname.includes("produk_admin") || 
    pathname.includes("verifikasi_admin") || 
    pathname.includes("status_admin");

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Slot />
      </View>

      <View style={styles.bottomNavContainer}>
        <View style={styles.navTabs}>
          <TouchableOpacity style={isBeranda ? styles.tabActive : styles.tabInactive} onPress={() => router.push("/admin/index_admin" as any)}>
            <Home size={23} color={isBeranda ? COLORS.primary : COLORS.textMuted} />
            {isBeranda && <Text style={styles.tabLabelActive}>Beranda</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={isPesanan ? styles.tabActive : styles.tabInactive} onPress={() => router.push("/admin/kelola_pesanan_admin" as any)}>
            <ShoppingBag size={23} color={isPesanan ? COLORS.primary : COLORS.textMuted} />
            {isPesanan && <Text style={styles.tabLabelActive}>Pesanan</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={isProduk ? styles.tabActive : styles.tabInactive} onPress={() => router.push("/admin/produk_admin" as any)}>
            <Store size={23} color={isProduk ? COLORS.primary : COLORS.textMuted} />
            {isProduk && <Text style={styles.tabLabelActive}>Produk</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={isProfil ? styles.tabActive : styles.tabInactive} onPress={() => router.push("/admin/profil_admin" as any)}>
            <User size={23} color={isProfil ? COLORS.primary : COLORS.textMuted} />
            {isProfil && <Text style={styles.tabLabelActive}>Akun</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgApp },
  contentContainer: { flex: 1 },
  bottomNavContainer: {
    height: 88,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bgApp,
    alignItems: "center",
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  navTabs: { flexDirection: "row", width: "100%", height: 50, gap: 6 },
  tabActive: {
    flex: 1.4,
    height: 50,
    backgroundColor: COLORS.accentPink,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  tabInactive: { flex: 1, height: 50, justifyContent: "center", alignItems: "center", gap: 3 },
  tabLabelActive: { fontSize: 11, color: COLORS.primary, fontWeight: "600", fontFamily: "Poppins" },
});
