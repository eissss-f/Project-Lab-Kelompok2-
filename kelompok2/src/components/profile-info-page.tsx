import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
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
  palePink: '#F7E6E6',
  muted: '#A17B84',
  line: '#EED7D8',
  white: '#FFFFFF',
};

type InfoItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

type ProfileInfoPageProps = {
  title: string;
  subtitle: string;
  items: InfoItem[];
};

export function ProfileInfoPage({
  title,
  subtitle,
  items,
}: ProfileInfoPageProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Profil"
            onPress={() => router.replace('/user/profil')}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="arrow-back-outline" size={23} color={colors.berry} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>

        <View style={styles.itemsCard}>
          {items.map((item, index) => (
            <View
              key={item.title}
              style={[
                styles.item,
                index < items.length - 1 && styles.itemDivider,
              ]}
            >
              <View style={styles.itemIcon}>
                <Ionicons name={item.icon} size={21} color={colors.berry} />
              </View>
              <View style={styles.itemCopy}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.palePink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: colors.berry,
    fontFamily: 'serif',
    fontSize: 27,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
  },
  itemsCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 19,
    paddingHorizontal: 16,
  },
  item: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  itemDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.palePink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemCopy: {
    flex: 1,
  },
  itemTitle: {
    color: colors.berry,
    fontSize: 14,
    fontWeight: '700',
  },
  itemDescription: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  pressed: {
    opacity: 0.7,
  },
});
