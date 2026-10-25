import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PageHeader from "@/components/PageHeader";
import { supabase } from "../../../lib/supabase";

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

type ProfileFieldErrors = {
  name?: string;
  phone?: string;
};

const accountMenu: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  href: "/user/keamanan-akun";
}[] = [
  {
    icon: "shield-checkmark-outline",
    label: "Keamanan akun",
    href: "/user/keamanan-akun",
  },
];

export default function ProfilScreen() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [draftName, setDraftName] = useState("");
  const [draftPhone, setDraftPhone] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLogoutConfirmationVisible, setIsLogoutConfirmationVisible] =
    useState(false);

  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [profileMessage, setProfileMessage] = useState("");

  // Mengambil akun yang benar-benar sedang login.
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        setIsLoading(true);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          router.replace("/login");
          return;
        }

        // Email selalu berasal dari akun Supabase Auth aktif.
        const accountEmail = user.email ?? "";

        // Mengambil profil berdasarkan ID akun yang sedang login.
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, phone")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (!isMounted) return;

        setUserId(user.id);
        setEmail(accountEmail);

        setName(
          data?.full_name ??
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            ""
        );

        setPhone(
          data?.phone ??
            user.user_metadata?.phone ??
            ""
        );
      } catch (error) {
        console.error("Gagal memuat profil:", error);

        if (isMounted) {
          Alert.alert(
            "Gagal memuat profil",
            error instanceof Error
              ? error.message
              : "Tidak dapat mengambil data profil. Coba lagi."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const openEditProfile = () => {
    setDraftName(name);
    setDraftPhone(phone);
    setFieldErrors({});
    setProfileMessage("");
    setIsEditing(true);
  };

  // Menyimpan profil untuk akun yang sedang login.
  const saveProfile = async () => {
    const errors: ProfileFieldErrors = {};
    const trimmedName = draftName.trim();
    const trimmedPhone = draftPhone.trim();

    if (!trimmedName) {
      errors.name = "Nama lengkap wajib diisi.";
    }

    if (!trimmedPhone) {
      errors.phone = "Nomor telepon wajib diisi.";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    setProfileMessage("");

    try {
      // Periksa ulang identitas pengguna sebelum menyimpan.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        router.replace("/login");
        return;
      }

      // Jangan menyimpan profil untuk ID pengguna yang berbeda.
      if (userId && user.id !== userId) {
        throw new Error(
          "Akun login berubah. Muat ulang halaman profil."
        );
      }

      // Upsert: buat baris jika belum ada, update jika sudah ada.
      const { data, error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_name: trimmedName,
            phone: trimmedPhone,
          },
          { onConflict: "id" }
        )
        .select("id, full_name, phone")
        .single();

      if (error) throw error;

      setUserId(data.id);
      setName(data.full_name ?? "");
      setPhone(data.phone ?? "");
      setIsEditing(false);
      setProfileMessage("Profil berhasil diperbarui.");
    } catch (error) {
      console.error("Gagal menyimpan profil:", error);

      Alert.alert(
        "Gagal menyimpan profil",
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan profil."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setIsLogoutConfirmationVisible(false);
      router.replace("/login");
    } catch (error) {
      Alert.alert(
        "Gagal keluar",
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat keluar dari akun."
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Profil"
          subtitle="Ruang kecil untuk cerita indahmu."
          onBack={() => router.replace("/user/Katalog")}
          backAccessibilityLabel="Kembali ke Beranda"
        />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.berry} />
            <Text style={styles.loadingText}>Memuat profil...</Text>
          </View>
        ) : (
          <>
            {/* Informasi akun aktif */}
            <View style={styles.accountCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>

              <View style={styles.accountText}>
                <Text style={styles.name}>
                  {name || "Nama pengguna"}
                </Text>
                <Text style={styles.customerLabel}>
                  Pelanggan ra_scrafts.id
                </Text>
              </View>
            </View>

            {/* Informasi kontak */}
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>INFORMASI AKUN</Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit profil"
                onPress={openEditProfile}
                style={({ pressed }) => [
                  styles.editProfileButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="create-outline"
                  size={16}
                  color={colors.berry}
                />
                <Text style={styles.editProfileText}>Edit profil</Text>
              </Pressable>
            </View>

            <View style={styles.contactList}>
              <View style={styles.contactRow}>
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color={colors.berry}
                />
                <Text style={styles.contactText}>
                  {email || "Email tidak tersedia"}
                </Text>
              </View>

              <View style={styles.contactRow}>
                <Ionicons
                  name="call-outline"
                  size={22}
                  color={colors.berry}
                />
                <Text style={styles.contactText}>
                  {phone || "Nomor telepon belum diisi"}
                </Text>
              </View>
            </View>

            {profileMessage ? (
              <Text
                accessibilityRole="alert"
                style={styles.profileMessage}
              >
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
                    index < accountMenu.length - 1 &&
                      styles.menuDivider,
                  ]}
                >
                  <View style={styles.menuLeft}>
                    <Ionicons
                      name={item.icon}
                      size={21}
                      color={colors.berry}
                    />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color={colors.berry}
                  />
                </Pressable>
              ))}
            </View>

            {/* Bantuan pelanggan */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Bantuan pelanggan"
              onPress={() => router.push("/user/bantuan")}
              style={({ pressed }) => [
                styles.supportCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.supportIcon}>
                <Ionicons
                  name="chatbubble-outline"
                  size={25}
                  color={colors.berry}
                />
              </View>

              <View style={styles.supportCopy}>
                <Text style={styles.supportTitle}>
                  Ada yang bisa kami bantu?
                </Text>
                <Text style={styles.supportSub}>
                  Panduan singkat untuk pesanan dan jadwal pengambilan.
                </Text>
              </View>

              <Ionicons
                name="arrow-forward"
                size={21}
                color={colors.berry}
              />
            </Pressable>

            {/* Logout */}
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsLogoutConfirmationVisible(true)}
              style={({ pressed }) => [
                styles.logout,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="log-out-outline"
                size={21}
                color={colors.berry}
              />
              <Text style={styles.logoutText}>Keluar dari akun</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      {/* Modal edit profil */}
      <Modal
        visible={isEditing}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isSaving) setIsEditing(false);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>Edit profil</Text>
            <Text style={styles.editSubtitle}>
              Perbarui nama dan nomor teleponmu.
            </Text>

            <Text style={styles.inputLabel}>Nama lengkap</Text>
            <TextInput
              accessibilityLabel="Nama lengkap"
              value={draftName}
              onChangeText={(value) => {
                setDraftName(value);
                setFieldErrors((current) => ({
                  ...current,
                  name: undefined,
                }));
              }}
              placeholder="Nama lengkap"
              placeholderTextColor={colors.muted}
              style={[
                styles.editInput,
                fieldErrors.name && styles.editInputError,
              ]}
              autoCapitalize="words"
              returnKeyType="next"
              editable={!isSaving}
            />

            {fieldErrors.name ? (
              <Text accessibilityRole="alert" style={styles.editError}>
                {fieldErrors.name}
              </Text>
            ) : null}

            <Text style={styles.inputLabel}>Email akun</Text>
            <Text style={styles.readOnlyEmail}>
              {email || "Email tidak tersedia"}
            </Text>

            <Text style={styles.inputLabel}>Nomor telepon</Text>
            <TextInput
              accessibilityLabel="Nomor telepon"
              value={draftPhone}
              onChangeText={(value) => {
                setDraftPhone(value);
                setFieldErrors((current) => ({
                  ...current,
                  phone: undefined,
                }));
              }}
              placeholder="Nomor telepon"
              placeholderTextColor={colors.muted}
              style={[
                styles.editInput,
                fieldErrors.phone && styles.editInputError,
              ]}
              keyboardType="phone-pad"
              returnKeyType="done"
              editable={!isSaving}
            />

            {fieldErrors.phone ? (
              <Text accessibilityRole="alert" style={styles.editError}>
                {fieldErrors.phone}
              </Text>
            ) : null}

            <View style={styles.editActions}>
              <Pressable
                accessibilityRole="button"
                disabled={isSaving}
                onPress={() => setIsEditing(false)}
                style={styles.cancelEditButton}
              >
                <Text style={styles.cancelEditText}>Batal</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={isSaving}
                onPress={saveProfile}
                style={[
                  styles.saveEditButton,
                  isSaving && styles.disabledButton,
                ]}
              >
                <Text style={styles.saveEditText}>
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal konfirmasi logout */}
      <Modal
        visible={isLogoutConfirmationVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isLoggingOut) setIsLogoutConfirmationVisible(false);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>
              Yakin ingin keluar dari akun?
            </Text>
            <Text style={styles.editSubtitle}>
              Kamu bisa masuk kembali kapan saja.
            </Text>

            <View style={styles.editActions}>
              <Pressable
                accessibilityRole="button"
                disabled={isLoggingOut}
                onPress={() =>
                  setIsLogoutConfirmationVisible(false)
                }
                style={styles.cancelEditButton}
              >
                <Text style={styles.cancelEditText}>Batal</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={isLoggingOut}
                onPress={handleLogout}
                style={[
                  styles.saveEditButton,
                  isLoggingOut && styles.disabledButton,
                ]}
              >
                <Text style={styles.saveEditText}>
                  {isLoggingOut ? "Keluar..." : "Ya, Keluar"}
                </Text>
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

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    gap: 10,
  },

  loadingText: {
    color: colors.muted,
    textAlign: "center",
  },

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

  profileMessage: {
    color: colors.success,
    backgroundColor: colors.successBackground,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontSize: 12,
    marginBottom: 8,
  },

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

  inputLabel: {
    color: colors.berry,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },

  readOnlyEmail: {
    color: colors.berry,
    fontSize: 14,
    backgroundColor: colors.palePink,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 12,
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

  disabledButton: {
    opacity: 0.6,
  },

  saveEditText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: "700",
  },
});