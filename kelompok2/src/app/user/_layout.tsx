
import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { Slot, useRouter, usePathname } from "expo-router";
import {
  Store,
  ShoppingBag,
  User,
} from "lucide-react-native";

export default function AppLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname.toLowerCase();

  const hideBottomNav =
    currentPath.includes("/detailproduk") ||
    currentPath.includes("/keranjang") ||
    currentPath.includes("/checkout") ||
    currentPath === "/user/keamanan-akun" ||
    currentPath === "/user/bantuan";

  const isKatalog =
    currentPath === "/user/katalog" ||
    currentPath === "/katalog";

  const isPesanan =
    currentPath === "/user/pesanan" ||
    currentPath === "/pesanan";

  const isProfil =
    currentPath === "/user/profil" ||
    currentPath === "/profil";

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Slot />
      </View>

      {!hideBottomNav && (
        <View style={styles.bottomNavContainer}>
          <View style={styles.navTabs}>
            {/* Menu Produk */}
            <TouchableOpacity
              style={
                isKatalog
                  ? styles.tabActive
                  : styles.tabInactive
              }
              onPress={() =>
                router.replace("/user/Katalog")
              }
              activeOpacity={0.8}
            >
              <Store
                size={21}
                color={isKatalog ? "#A83F68" : "#999999"}
                strokeWidth={1.8}
              />
              <Text
                style={
                  isKatalog
                    ? styles.tabLabelActive
                    : styles.tabLabelInactive
                }
              >
                Produk
              </Text>
            </TouchableOpacity>

            {/* Menu Pesanan */}
            <TouchableOpacity
              style={
                isPesanan
                  ? styles.tabActive
                  : styles.tabInactive
              }
              onPress={() =>
                router.replace("/user/pesanan")
              }
              activeOpacity={0.8}
            >
              <ShoppingBag
                size={21}
                color={isPesanan ? "#A83F68" : "#999999"}
                strokeWidth={1.8}
              />
              <Text
                style={
                  isPesanan
                    ? styles.tabLabelActive
                    : styles.tabLabelInactive
                }
              >
                Pesanan
              </Text>
            </TouchableOpacity>

            {/* Menu Profil Pengguna */}
            <TouchableOpacity
              style={
                isProfil
                  ? styles.tabActive
                  : styles.tabInactive
              }
              onPress={() =>
                router.replace("/user/profil")
              }
              activeOpacity={0.8}
            >
              <User
                size={21}
                color={isProfil ? "#A83F68" : "#999999"}
                strokeWidth={1.8}
              />
              <Text
                style={
                  isProfil
                    ? styles.tabLabelActive
                    : styles.tabLabelInactive
                }
              >
                Profil
              </Text>
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
    backgroundColor: "#FFF0F6",
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
});
