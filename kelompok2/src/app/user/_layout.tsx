import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Slot, useRouter, usePathname } from "expo-router";
import { Store, ShoppingBag, User } from "lucide-react-native";

export default function AppLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const hideBottomNav =
    pathname.includes("/DetailProduk") ||
    pathname.includes("/keranjang") ||
    pathname === "/user/keamanan-akun" ||
    pathname === "/user/bantuan";

  return (
    <View style={styles.container}>
      {/* Slot untuk merender halaman aktif secara dinamis */}
      <View style={styles.contentContainer}>
        <Slot />
      </View>

      {/* Bottom Navigation Kustom dengan Efek Kotak Pink */}
      {!hideBottomNav && (
        <View style={styles.bottomNavContainer}>
          <View style={styles.navTabs}>
            {/* Menu Katalog / Produk */}
            <TouchableOpacity style={pathname === "/user/Katalog" || pathname === "/Katalog" ? styles.tabActive : styles.tabInactive} onPress={() => router.push("/user/Katalog")} activeOpacity={0.8}>
              <Store size={21} color={pathname === "/user/Katalog" || pathname === "/Katalog" ? "#A83F68" : "#999999"} strokeWidth={1.8} />
              <Text style={pathname === "/user/Katalog" || pathname === "/Katalog" ? styles.tabLabelActive : styles.tabLabelInactive}>Produk</Text>
            </TouchableOpacity>

            {/* Menu Pesanan */}
            <TouchableOpacity style={pathname === "/user/pesanan" || pathname === "/pesanan" ? styles.tabActive : styles.tabInactive} onPress={() => router.push("/user/pesanan")} activeOpacity={0.8}>
              <ShoppingBag size={21} color={pathname === "/user/pesanan" || pathname === "/pesanan" ? "#A83F68" : "#999999"} strokeWidth={1.8} />
              <Text style={pathname === "/user/pesanan" || pathname === "/pesanan" ? styles.tabLabelActive : styles.tabLabelInactive}>Pesanan</Text>
            </TouchableOpacity>

            {/* Menu Profil */}
            <TouchableOpacity style={pathname === "/user/profil" || pathname === "/profil" ? styles.tabActive : styles.tabInactive} onPress={() => router.push("/user/profil")} activeOpacity={0.8}>
              <User size={21} color={pathname === "/user/profil" || pathname === "/profil" ? "#A83F68" : "#999999"} strokeWidth={1.8} />
              <Text style={pathname === "/user/profil" || pathname === "/profil" ? styles.tabLabelActive : styles.tabLabelInactive}>Profil</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },
  contentContainer: {
    flex: 1,
  },
  bottomNavContainer: {
    backgroundColor: "#FFF8F0",
    borderTopWidth: 1,
    borderTopColor: "#F1D2DC",
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  navTabs: {
    flexDirection: "row",
    width: "100%",
    height: 48,
    gap: 16,
  },
  tabActive: {
    flex: 1,
    height: 48,
    backgroundColor: "#FFF0F6", // Kotak latar belakang pink muda saat aktif
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
  },
  tabInactive: {
    flex: 1,
    height: 48,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
  },
  tabLabelActive: {
    fontSize: 10,
    color: "#A83F68",
    fontWeight: "600",
  },
  tabLabelInactive: {
    fontSize: 10,
    color: "#999999",
  },
  homeIndicator: {
    width: 128,
    height: 4,
    backgroundColor: "#49343C",
    borderRadius: 100,
    alignSelf: "center",
    marginTop: 10,
  },
});
