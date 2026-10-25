import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
} from 'react-native';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.tabSlot} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon="storefront-outline">Produk</TabButton>
          </TabTrigger>
          <TabTrigger name="pesanan" href="/user/pesanan" asChild>
            <TabButton icon="bag-handle-outline">Pesanan</TabButton>
          </TabTrigger>
          <TabTrigger name="profil" href="/user/profil" asChild>
            <TabButton icon="person-outline">Profil</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({
  children,
  isFocused,
  icon,
  ...props
}: TabTriggerSlotProps & { icon: keyof typeof Ionicons.glyphMap }) {
  const focused = isFocused ?? false;
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.tabButton,
        focused && styles.tabButtonFocused,
        pressed && styles.pressed,
      ]}>
      <Ionicons name={icon} size={36} color={focused ? '#B13D70' : '#999999'} />
      <TextLabel focused={focused}>{children}</TextLabel>
      {focused ? <View style={styles.activeIndicator} /> : null}
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={styles.tabsRow}>{props.children}</View>
    </View>
  );
}

function TextLabel({ children, focused }: { children: ReactNode; focused: boolean }) {
  return (
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 198,
    alignSelf: 'center',
    paddingHorizontal: '5.2%',
    paddingTop: 12,
    paddingBottom: 0,
    backgroundColor: '#FFF8F0',
    borderTopWidth: 1,
    borderTopColor: '#F2D8E0',
  },
  tabsRow: {
    height: 110,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabSlot: { height: '100%', paddingBottom: 198 },
  tabButton: {
    width: '30.3%',
    height: 92,
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    position: 'relative',
  },
  tabButtonFocused: { backgroundColor: '#FFF1F6' },
  tabLabel: { color: '#999999', fontSize: 20, fontWeight: '700' },
  tabLabelFocused: { color: '#B13D70', fontWeight: '500' },
  activeIndicator: {
    position: 'absolute',
    bottom: -72,
    left: 0,
    right: 0,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B13D70',
  },
  pressed: { opacity: 0.7 },
});
