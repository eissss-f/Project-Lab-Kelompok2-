import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PageHeader from "@/components/PageHeader";

const colors = {
  background: "#FFF8F0",
  berry: "#A83F68",
  pink: "#E8A6BD",
  palePink: "#F7E6E6",
  muted: "#A17B84",
  line: "#EED7D8",
  error: "#A83232",
  success: "#287A4B",
  successBackground: "#E8F5EC",
};

const accountMenu: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail?: string;
  href: "/user/keamanan-akun";
}[] = [
  {
    icon: "shield-checkmark-outline",
    label: "Keamanan akun",
    href: "/user/keamanan-akun",
  },
];

type ProfileFieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
};

export default function ProfilScreen() {
  const router = useRouter();
  const [name, setName] = useState("Nadia Aulia");
  const [email, setEmail] = useState("nadia.aulia@gmail.com");
  const [phone, setPhone] = useState("+62 812 3456 7890");
  const [draftName, setDraftName] = useState(name);
  const [draftEmail, setDraftEmail] = useState(email);
  const [draftPhone, setDraftPhone] = useState(phone);
  const [isEditing, setIsEditing] = useState(false);
  const [isLogoutConfirmationVisible, setIsLogoutConfirmationVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [profileMessage, setProfileMessage] = useState("");

  const openEditProfile = () => {
    setDraftName(name);
    setDraftEmail(email);
    setDraftPhone(phone);
    setFieldErrors({});
    setProfileMessage("");
    setIsEditing(true);
  };

  const saveProfile = () => {
    const errors: ProfileFieldErrors = {};
    const trimmedName = draftName.trim();
    const trimmedEmail = draftEmail.trim();
    const trimmedPhone = draftPhone.trim();

    if (!trimmedName) {
      errors.name = "Nama wajib diisi.";
    }
    if (!trimmedEmail) {
      errors.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Format email belum benar.";
    }
    if (!trimmedPhone) {
      errors.phone = "Nomor telepon wajib diisi.";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setName(trimmedName);
    setEmail(trimmedEmail);
    setPhone(trimmedPhone);
    setIsEditing(false);
    setProfileMessage("Perubahan profil tersimpan sementara di layar ini.");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PageHeader
          title="Profil"
          subtitle="Ruang kecil untuk cerita indahmu."
          onBack={() => router.replace("/user/Katalog")}
          backAccessibilityLabel="Kembali ke Beranda"
        />

        {/* Informasi akun */}
        <View style={styles.accountCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("")}
            </Text>
          </View>

          <View style={styles.accountText}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.customerLabel}>Pelanggan ra_scrafts.id</Text>
          </View>
        </View>

        {/* Informasi kontak */}
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>INFORMASI AKUN</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Edit profil" onPress={openEditProfile} style={({ pressed }) => [styles.editProfileButton, pressed && styles.pressed]}>
            <Ionicons name="create-outline" size={16} color={colors.berry} />
            <Text style={styles.editProfileText}>Edit profil</Text>
          </Pressable>
        </View>

        <View style={styles.contactList}>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={22} color={colors.berry} />
            <Text style={styles.contactText}>{email}</Text>
          </View>

          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={22} color={colors.berry} />
            <Text style={styles.contactText}>{phone}</Text>
          </View>
        </View>
        {profileMessage ? (
          <Text accessibilityRole="alert" style={styles.profileMessage}>
            {profileMessage}
          </Text>
        ) : null}

        {/* Menu akun */}
        <View style={styles.menuCard}>
          {accountMenu.map((item, index) => (
            <Pressable 
              key={item.label} 
              accessibilityRole="button" 
              accessibilityLabel={item.label} 
              onPress={() => router.push(item.href)} 
              style={[
                styles.menuRow, 
                index < accountMenu.length - 1 && styles.menuDivider, 
                styles.menuPressable
              ]}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon} size={21} color={colors.berry} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>

              <View style={styles.menuRight}>
                {item.detail ? <Text style={styles.menuDetail}>{item.detail}</Text> : null}
                <Ionicons name="chevron-forward" size={19} color={colors.berry} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Bantuan pelanggan */}
        <Pressable accessibilityRole="button" accessibilityLabel="Bantuan pelanggan" onPress={() => router.push("/user/bantuan")} style={({ pressed }) => [styles.supportCard, pressed && styles.pressed]}>
          <View style={styles.supportIcon}>
            <Ionicons name="chatbubble-outline" size={25} color={colors.berry} />
          </View>

          <View style={styles.supportCopy}>
            <Text style={styles.supportTitle}>Ada yang bisa kami bantu?</Text>
            <Text style={styles.supportSub}>Panduan singkat untuk pesanan dan jadwal pengambilan.</Text>
          </View>

          <Ionicons name="arrow-forward" size={21} color={colors.berry} />
        </Pressable>

        {/* Tombol keluar akun */}
        <Pressable accessibilityRole="button" onPress={() => setIsLogoutConfirmationVisible(true)} style={({ pressed }) => [styles.logout, pressed && styles.pressed]}>
          <Ionicons name="log-out-outline" size={21} color={colors.berry} />
          <Text style={styles.logoutText}>Keluar dari akun</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={isEditing} transparent animationType="fade" onRequestClose={() => setIsEditing(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>Edit profil</Text>
            <Text style={styles.editSubtitle}>Perbarui nama, email, dan nomor teleponmu.</Text>

            <TextInput
              accessibilityLabel="Nama"
              value={draftName}
              onChangeText={(value) => {
                setDraftName(value);
                setFieldErrors((current) => ({ ...current, name: undefined }));
              }}
              placeholder="Nama lengkap"
              placeholderTextColor={colors.muted}
              style={[styles.editInput, fieldErrors.name && styles.editInputError]}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {fieldErrors.name ? (
              <Text accessibilityRole="alert" style={styles.editError}>{fieldErrors.name}</Text>
            ) : null}
            <TextInput
              accessibilityLabel="Email"
              value={draftEmail}
              onChangeText={(value) => {
                setDraftEmail(value);
                setFieldErrors((current) => ({ ...current, email: undefined }));
              }}
              placeholder="Email"
              placeholderTextColor={colors.muted}
              style={[styles.editInput, fieldErrors.email && styles.editInputError]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            {fieldErrors.email ? (
              <Text accessibilityRole="alert" style={styles.editError}>{fieldErrors.email}</Text>
            ) : null}
            <TextInput
              accessibilityLabel="Nomor telepon"
              value={draftPhone}
              onChangeText={(value) => {
                setDraftPhone(value);
                setFieldErrors((current) => ({ ...current, phone: undefined }));
              }}
              placeholder="Nomor telepon"
              placeholderTextColor={colors.muted}
              style={[styles.editInput, fieldErrors.phone && styles.editInputError]}
              keyboardType="phone-pad"
              returnKeyType="done"
            />
            {fieldErrors.phone ? (
              <Text accessibilityRole="alert" style={styles.editError}>{fieldErrors.phone}</Text>
            ) : null}

            <View style={styles.editActions}>
              <Pressable accessibilityRole="button" onPress={() => setIsEditing(false)} style={styles.cancelEditButton}>
                <Text style={styles.cancelEditText}>Batal</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={saveProfile} style={styles.saveEditButton}>
                <Text style={styles.saveEditText}>Simpan</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

        <Modal
          visible={isLogoutConfirmationVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsLogoutConfirmationVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.editCard}>
              <Text style={styles.editTitle}>Yakin ingin keluar dari akun?</Text>
              <Text style={styles.editSubtitle}>Kamu bisa masuk kembali kapan saja.</Text>

              <View style={styles.editActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setIsLogoutConfirmationVisible(false)}
                  style={styles.cancelEditButton}
                >
                  <Text style={styles.cancelEditText}>Batal</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setIsLogoutConfirmationVisible(false);
                    router.replace("/login");
                  }}
                  style={styles.saveEditButton}
                >
                  <Text style={styles.saveEditText}>Ya, Keluar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 110,
  },

  // Kartu akun
  accountCard: {
    minHeight: 94,
    borderRadius: 20,
    backgroundColor: colors.palePink,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  avatar: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: colors.pink,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: colors.background,
    fontFamily: "serif",
    fontSize: 25,
  },

  accountText: {
    marginLeft: 14,
    flex: 1,
  },

  name: {
    color: colors.berry,
    fontFamily: "serif",
    fontSize: 21,
    fontWeight: "700",
  },

  customerLabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },

  // Informasi kontak
  sectionTitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.palePink,
  },

  editProfileText: {
    color: colors.berry,
    fontSize: 12,
    fontWeight: "600",
  },

  contactList: {
    marginBottom: 4,
  },

  contactRow: {
    minHeight: 39,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  contactText: {
    color: colors.berry,
    fontSize: 15,
    flex: 1,
  },

  dataNote: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 14,
  },

  profileMessage: {
    color: colors.success,
    backgroundColor: colors.successBackground,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontSize: 12,
    marginBottom: 8,
  },

  // Menu akun
  menuCard: {
    borderWidth: 1,
    borderColor: colors.pink,
    borderRadius: 19,
    paddingHorizontal: 15,
    paddingVertical: 2,
  },

  menuRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  menuPressable: {
    width: "100%",
  },

  menuDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  menuLabel: {
    color: colors.berry,
    fontSize: 13,
    fontWeight: "600",
  },

  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  menuDetail: {
    color: colors.muted,
    fontSize: 12,
  },

  // Bantuan pelanggan
  supportCard: {
    minHeight: 72,
    backgroundColor: colors.palePink,
    borderRadius: 19,
    marginTop: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  supportIcon: {
    height: 40,
    width: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.berry,
    alignItems: "center",
    justifyContent: "center",
  },

  supportCopy: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  supportTitle: {
    color: colors.berry,
    fontFamily: "serif",
    fontSize: 16,
    fontWeight: "700",
  },

  supportSub: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 3,
  },

  // Logout
  logout: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    padding: 8,
  },

  logoutText: {
    color: colors.berry,
    fontSize: 13,
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.7,
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(40, 20, 28, 0.4)",
    padding: 24,
  },

  editCard: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
  },

  editTitle: {
    color: colors.berry,
    fontFamily: "serif",
    fontSize: 23,
    fontWeight: "700",
  },

  editSubtitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 16,
  },

  editInput: {
    color: colors.berry,
    fontSize: 14,
    backgroundColor: colors.palePink,
    borderWidth: 1,
    borderColor: colors.pink,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 10,
  },

  editInputError: {
    borderColor: colors.error,
  },

  editError: {
    color: colors.error,
    fontSize: 12,
    marginBottom: 10,
  },

  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },

  cancelEditButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  cancelEditText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },

  saveEditButton: {
    backgroundColor: colors.berry,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  saveEditText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: "700",
  },
});