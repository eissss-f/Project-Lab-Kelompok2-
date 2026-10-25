
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

type TabName = 'Produk' | 'Pesanan' | 'Profil';

interface AppTabsProps {
  activeTab: TabName;
}

const tabs: { label: TabName; path: string }[] = [
  { label: 'Produk', path: '/Katalog' },
  { label: 'Pesanan', path: '/pesanan' },
  { label: 'Profil', path: '/profil' },
];

export default function AppTabs({ activeTab }: AppTabsProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = tab.label === activeTab;

        return (
          <TouchableOpacity
            key={tab.label}
            style={styles.tab}
            onPress={() => router.replace(tab.path as any)}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EBCBD3',
    paddingVertical: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    color: '#777777',
    fontSize: 13,
  },
  activeLabel: {
    color: '#A83F68',
    fontWeight: 'bold',
  },
});
