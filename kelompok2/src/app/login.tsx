import '@/global.css';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Platform } from 'react-native';  
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useGoogleButtonFont } from '../hooks/use-google-button-font';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const poppinsLoaded = useGoogleButtonFont();

  // Arahkan berdasarkan role pengguna
  const navigateByRole = (role: string) => {
    if (role === 'admin') {
      router.replace('/admin/index_admin');
    } else if (role === 'user') {
      router.replace('/user/Katalog');
    } else {
      throw new Error('Role akun tidak dikenali.');
    }
  };

  // Login email dan password
  const handleLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const emailTrim = email.trim().toLowerCase();

    if (!emailTrim || !password) {
      setErrorMessage('Email dan password wajib diisi.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setErrorMessage('Masukkan format email yang valid.');
      return;
    }

    try {
      setLoading(true);

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: emailTrim,
          password,
        });

      if (error) throw error;

      if (!data.user || !data.session) {
        throw new Error('Sesi login tidak berhasil dibuat.');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        throw new Error('Profil akun tidak ditemukan.');
      }

      setSuccessMessage('Login berhasil!');
      navigateByRole(profile.role);

    } catch (error: unknown) {
      console.error('Login error:', error);

      const message =
        error instanceof Error ? error.message : '';

      if (message.toLowerCase().includes('invalid login')) {
        setErrorMessage('Email atau password salah.');
      } else if (message.toLowerCase().includes('email not confirmed')) {
        setErrorMessage('Email belum dikonfirmasi.');
      } else {
        setErrorMessage(message || 'Login gagal. Silakan coba kembali.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Login Google
  


const handleGoogleLogin = async () => {
  try {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    console.log('GOOGLE LOGIN DIMULAI');

    // Redirect berbeda untuk web dan Expo Go
    const redirectTo =
      Platform.OS === 'web'
        ? `${window.location.origin}/auth/callback`
        : AuthSession.makeRedirectUri({
            path: 'auth/callback',
          });

    console.log('REDIRECT URL:', redirectTo);

    const { data, error } =
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

    if (error) throw error;
    if (!data.url) {
      throw new Error('URL Google tidak ditemukan');
    }

    // WEB: biarkan browser menuju Google,
    // kemudian kembali ke halaman callback.
    if (Platform.OS === 'web') {
      window.location.assign(data.url);
      return;
    }

    // ANDROID: buka browser autentikasi.
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo
    );

    console.log('HASIL AUTH:', JSON.stringify(result));

    if (result.type !== 'success' || !result.url) {
      throw new Error(
        'Google belum mengembalikan pengguna ke aplikasi. ' +
        'Coba periksa redirect Expo Go.'
      );
    }

    // Ambil authorization code
    const callbackUrl = new URL(result.url);
    const code = callbackUrl.searchParams.get('code');

    if (!code) {
      throw new Error(
        'Authorization code tidak ditemukan: ' + result.url
      );
    }

    // Tukar code menjadi session SATU KALI.
    const { data: sessionData, error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) throw sessionError;

    const user = sessionData.user;

    if (!user) {
      throw new Error('Pengguna tidak ditemukan');
    }

    // Ambil role pengguna
    const { data: profile, error: profileError } =
      await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    if (profileError) throw profileError;

    let role = profile?.role;

    // Buat profil jika belum tersedia
    if (!profile) {
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Pengguna';

      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: fullName,
          role: 'user',
        });

      if (insertError) throw insertError;

      role = 'user';
    }

    setSuccessMessage('Login Google berhasil!');

    if (role === 'admin') {
      router.replace('/admin/index_admin');
    } else if (role === 'user') {
      router.replace('/user/Katalog');
    } else {
      throw new Error('Role pengguna tidak dikenal');
    }

  } catch (error: unknown) {
    console.error('GOOGLE LOGIN ERROR:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Login Google gagal';

    setErrorMessage(message);
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
            source={require('../../assets/images/logo_racrafts.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />

          <Text style={styles.brandTitle}>ra_scrafts.id</Text>
          <Text style={styles.welcomeTitle}>Selamat Datang</Text>
          <Text style={styles.welcomeSub}>
            Masuk untuk melanjutkan
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

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Atau</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[
              styles.googleButton,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            <ExpoImage
              source={require('../../assets/expo.icon/Assets/logo-google.svg')}
              style={styles.googleIcon}
              contentFit="contain"
            />
            <Text
              style={[
                styles.googleButtonText,
                poppinsLoaded && styles.poppinsButtonFont,
              ]}
            >
              Masuk dengan Google
            </Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              Belum punya akun?{' '}
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/register')}
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
    fontFamily: 'Times New Roman',
    fontWeight: '600',
    color: '#A83F68',
    marginBottom: 16,
  },

  welcomeTitle: {
    fontSize: 24,
    fontFamily: 'Times New Roman',
    fontWeight: '700',
    color: '#A83F68',
    marginBottom: 4,
  },

  welcomeSub: {
    fontSize: 13,
    fontFamily: 'Times New Roman',
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
    fontFamily: 'Times New Roman',
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
    fontFamily: 'Times New Roman',
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
    fontFamily: 'Times New Roman',
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
    marginBottom: 16,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#FFF8F0',
    fontSize: 15,
    fontFamily: 'Times New Roman',
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
    fontFamily: 'Times New Roman',
    color: '#A83F68',
    opacity: 0.7,
  },

  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    minHeight: 48,
    alignSelf: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E8A6BD',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },

  googleIcon: {
    width: 24,
    height: 24,
  },

  googleButtonText: {
    color: '#49343C',
    fontSize: 14,
    fontWeight: '500',
  },

  poppinsButtonFont: {
    fontFamily: 'GoogleButtonPoppins',
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  footerText: {
    fontSize: 13,
    fontFamily: 'Times New Roman',
    color: '#A83F68',
  },

  linkText: {
    fontSize: 13,
    fontFamily: 'Times New Roman',
    fontWeight: '700',
    color: '#A83F68',
  },
});
