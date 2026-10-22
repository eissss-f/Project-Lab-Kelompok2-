import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const colors = { berry: '#A83F68', palePink: '#F7E6E6', muted: '#A17B84' };

export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kembali"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
      >
        <Ionicons name="arrow-back-outline" size={24} color={colors.berry} />
      </Pressable>

      <View style={{ flex: 1 }}>
        <Text style={styles.heading}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 21 },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.palePink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heading: {
    color: colors.berry,
    fontFamily: 'serif',
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 2 },
});