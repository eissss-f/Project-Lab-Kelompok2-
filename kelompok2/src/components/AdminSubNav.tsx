import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { useRouter, usePathname } from "expo-router";

const COLORS = {
  primary: "#A83F68",
  accentPink: "#E8A6BD",
  lightPink: "#FBEAF0",
};

export default function AdminSubNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  
  const isSmallScreen = width < 360;
  const tabFontSize = isSmallScreen ? 9 : 10;

  const tabs = [
    { label: "Kelola\nProduk", route: "/admin/produk_admin" },
    { label: "Kelola\nPesanan", route: "/admin/kelola_pesanan_admin" },
    { label: "Verifikasi", route: "/admin/verifikasi_admin" },
    { label: "Update\nStatus", route: "/admin/status_admin" },
  ];

  return (
    <View style={styles.managementTabs}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.route;
        return (
          <TouchableOpacity
            key={tab.route}
            style={[styles.managementTab, isActive && styles.activeTabBg]}
            onPress={() => router.push(tab.route as any)}
          >
            <Text
              style={[
                styles.tabLabel,
                { fontSize: tabFontSize },
                isActive && styles.activeTabLabel,
              ]}
              numberOfLines={2}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  managementTabs: {
    flexDirection: "row",
    backgroundColor: COLORS.lightPink,
    marginHorizontal: 20,
    padding: 4,
    borderRadius: 14,
    gap: 2,
    minHeight: 54,
  },
  managementTab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 2,
    paddingVertical: 6,
  },
  activeTabBg: {
    backgroundColor: COLORS.accentPink,
  },
  tabLabel: {
    fontFamily: "Poppins",
    fontWeight: "400",
    lineHeight: 14,
    textAlign: "center",
    color: "#986678",
  },
  activeTabLabel: {
    fontFamily: "Poppins",
    fontWeight: "600",
    color: COLORS.primary,
  },
});