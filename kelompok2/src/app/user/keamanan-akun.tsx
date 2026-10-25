import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PageHeader from "@/components/PageHeader";

const colors = {
  background: "#FFF8F0",
  berry: "#A83F68",
  pink: "#E8A6BD",
  muted: "#A17B84",
  line: "#EED7D8",
};

export default function KeamananAkunScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PageHeader
          title="Keamanan akun"
          subtitle="Informasi untuk menjaga akunmu tetap aman."
          onBack={() => router.replace("/user/profil")}
          backAccessibilityLabel="Kembali ke Profil"
        />

        {/* Kotak Informasi Keamanan */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="mail-outline" size={22} color={colors.berry} />
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Email akun</Text>
              <Text style={styles.itemDesc}>Gunakan email yang bisa kamu akses untuk menerima informasi akun.</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Ionicons name="lock-closed-outline" size={22} color={colors.berry} />
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Kata sandi</Text>
              <Text style={styles.itemDesc}>Gunakan kata sandi yang kuat dan jangan membagikannya kepada orang lain.</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Ionicons name="shield-checkmark-outline" size={22} color={colors.berry} />
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>Privasi akun</Text>
              <Text style={styles.itemDesc}>Informasi akun digunakan untuk membantu pengelolaan pesananmu.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  content: { 
    paddingHorizontal: 24, 
    paddingTop: 18, 
    paddingBottom: 40 
  },
  card: {
    borderWidth: 1,
    borderColor: colors.pink,
    borderRadius: 19,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  row: { 
    flexDirection: "row", 
    alignItems: "flex-start", 
    gap: 12, 
    paddingVertical: 12 
  },
  textContainer: { 
    flex: 1 
  },
  itemTitle: { 
    color: colors.berry, 
    fontSize: 14, 
    fontWeight: "700", 
    marginBottom: 3 
  },
  itemDesc: { 
    color: colors.muted, 
    fontSize: 12, 
    lineHeight: 17 
  },
  divider: { 
    height: 1, 
    backgroundColor: colors.line 
  },
});