
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  const emailTrim = email.trim();

  if (!emailTrim || !password) {
    Alert.alert('Login Gagal', 'Email dan password wajib diisi.');
    return;
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim);

  if (!emailValid) {
    Alert.alert('Login Gagal', 'Masukkan format email yang valid.');
    return;
  }

  try {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailTrim,
      password,
    });

    if (error) {
      Alert.alert('Login Gagal', error.message);
      return;
    }

    if (!data.session || !data.user) {
      Alert.alert(
        'Login Gagal',
        'Sesi login tidak berhasil dibuat. Silakan coba lagi.'
      );
      return;
    }

    // Ambil role dari profil berdasarkan ID akun yang login
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();

      Alert.alert(
        'Login Gagal',
        'Profil akun tidak ditemukan. Hubungi admin untuk memeriksa profil akunmu.'
      );
      return;
    }

    if (profile.role === 'admin') {
      router.replace('/admin/index_admin');
      return;
    }

    if (profile.role === 'user') {
      router.replace('/user/Katalog');
      return;
    }

    await supabase.auth.signOut();

    Alert.alert(
      'Login Gagal',
      'Role akun tidak dikenali. Silakan hubungi admin.'
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Terjadi kesalahan saat login.';

    Alert.alert('Login Gagal', message);
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Image
            source={require('../../assets/images/logo_racrafts.jpg.jpeg')}
            style={styles.logoImage}
            resizeMode="contain"
          />

          <Text style={styles.brandTitle}>ra_scrafts.id</Text>
          <Text style={styles.welcomeTitle}>Selamat Datang</Text>
          <Text style={styles.welcomeSub}>
            Login untuk melanjutkan
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#A83F68"
              style={styles.inputIcon}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#C49AAA"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#A83F68"
              style={styles.inputIcon}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#C49AAA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#A83F68"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              Belum punya akun?{' '}
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/register')}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={styles.linkText}>Daftar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 60,
    height: 75,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#A83F68',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: 'Playfair Display',
    fontWeight: '700',
    color: '#A83F68',
    marginBottom: 4,
  },
  welcomeSub: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: '#A83F68',
    opacity: 0.7,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#E8A6BD',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#A83F68',
  },
  button: {
    backgroundColor: '#E8A6BD',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF8F0',
    fontSize: 15,
    fontFamily: 'Poppins',
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: '#A83F68',
  },
  linkText: {
    fontSize: 13,
    fontFamily: 'Poppins',
    fontWeight: '700',
    color: '#A83F68',
  },
});
