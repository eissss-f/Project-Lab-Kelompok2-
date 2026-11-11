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
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Wajib untuk menangani redirect web/auth di Expo
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fungsi Login Manual (Email & Password)
  const handleLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const emailTrim = email.trim().toLowerCase();

    // Validasi input kosong
    if (!emailTrim || !password) {
      setErrorMessage('Email dan password wajib diisi.');
      return;
    }

    // Validasi format email
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim);

    if (!emailValid) {
      setErrorMessage('Masukkan format email yang valid.');
      return;
    }

    try {
      setLoading(true);

      // Login menggunakan Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailTrim,
        password,
      });

      if (error) {
        const message = error.message.toLowerCase();

        if (
          message.includes('invalid login credentials') ||
          message.includes('invalid credentials')
        ) {
          setErrorMessage(
            'Email atau password salah. Periksa kembali data kamu.'
          );
        } else if (message.includes('email not confirmed')) {
          setErrorMessage(
            'Email belum dikonfirmasi. Silakan cek inbox email kamu.'
          );
        } else if (
          message.includes('network') ||
          message.includes('fetch')
        ) {
          setErrorMessage(
            'Koneksi bermasalah. Periksa internet dan coba kembali.'
          );
        } else {
          setErrorMessage(
            'Login gagal. Silakan periksa data dan coba kembali.'
          );
        }

        return;
      }

      // Pastikan sesi login tersedia
      if (!data.session || !data.user) {
        await supabase.auth.signOut();
        setErrorMessage(
          'Sesi login tidak berhasil dibuat. Silakan coba kembali.'
        );
        return;
      }

      // Ambil role pengguna dari tabel profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setErrorMessage(
          'Profil akun tidak ditemukan. Silakan hubungi admin.'
        );
        return;
      }

      // Arahkan pengguna sesuai role di Supabase
      if (profile.role === "admin") {
        setSuccessMessage("Login berhasil! Mengarahkan ke halaman admin...");

        setTimeout(() => {
          router.replace("/admin/index_admin");
        }, 1000);

        return;
      }

      if (profile.role === "user") {
        setSuccessMessage("Login berhasil! Selamat datang di ra_scrafts.id.");

        setTimeout(() => {
          router.replace("/user/Katalog");
        }, 1000);

        return;
      }

      // Jika role tidak dikenal
      await supabase.auth.signOut();
      setErrorMessage("Role akun tidak dikenali. Silakan hubungi admin.");

    } catch (error: unknown) {
      console.error('Kesalahan login:', error);

      setErrorMessage(
        'Terjadi kesalahan saat login. Periksa koneksi internet kamu.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Login dengan Google (OAuth)
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const redirectTo = AuthSession.makeRedirectUri({
        path: 'auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setErrorMessage('Gagal login dengan Google: ' + error.message);
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
          {/* Input email */}
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
              onChangeText={(value) => {
                setEmail(value);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Input password */}
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
              onChangeText={(value) => {
                setPassword(value);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
              disabled={loading}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#A83F68"
              />
            </TouchableOpacity>
          </View>

          {/* Pesan validasi di luar tombol */}
          {errorMessage !== '' && (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color="#B42345"
              />
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          )}

          {successMessage !== '' && (
            <View style={styles.successContainer}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#2E7D32"
              />
              <Text style={styles.successText}>
                {successMessage}
              </Text>
            </View>
          )}

          {/* Tombol login manual */}
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

          {/* Garis atau pemisah */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Atau</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Tombol Login Google */}
          <TouchableOpacity
            style={[styles.googleButton, loading && styles.buttonDisabled]}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={18} color="#EA4335" />
            <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
          </TouchableOpacity>

          {/* Link register */}
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
    minWidth: 0,
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#A83F68',
    paddingVertical: 0,
  },

  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FCECEF',
    borderWidth: 1,
    borderColor: '#F3C5D0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    width: '100%',
  },

  errorText: {
    flex: 1,
    color: '#A83250',
    fontSize: 12,
    fontFamily: 'Poppins',
    lineHeight: 18,
    marginLeft: 8,
  },

  successContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    width: '100%',
  },

  successText: {
    flex: 1,
    color: '#2E7D32',
    fontSize: 12,
    fontFamily: 'Poppins',
    lineHeight: 18,
    marginLeft: 8,
  },

  button: {
    backgroundColor: '#E8A6BD',
    minHeight: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 0,
    marginBottom: 16,
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

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8A6BD',
    opacity: 0.5,
  },

  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    fontFamily: 'Poppins',
    color: '#A83F68',
    opacity: 0.7,
  },

  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E8A6BD',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },

  googleButtonText: {
    color: '#49343C',
    fontSize: 14,
    fontFamily: 'Poppins',
    fontWeight: '600',
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