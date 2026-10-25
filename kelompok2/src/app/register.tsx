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
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function RegisterScreen() {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [nomorHp, setNomorHp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    setErrorMessage('');

    const namaTrim = namaLengkap.trim();
    const emailTrim = email.trim().toLowerCase();

    if (!namaTrim) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }

    if (!emailTrim) {
      setErrorMessage('Email wajib diisi.');
      return;
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim);
    if (!emailValid) {
      setErrorMessage('Format email tidak valid.');
      return;
    }

    if (!password) {
      setErrorMessage('Password wajib diisi.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password minimal harus 8 karakter.');
      return;
    }

    if (!confirmPassword) {
      setErrorMessage('Konfirmasi password wajib diisi.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password dan konfirmasi password tidak sama.');
      return;
    }

    if (!agree) {
      setErrorMessage('Silakan setujui Syarat & Ketentuan terlebih dahulu.');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: emailTrim,
        password,
        options: {
          data: {
            full_name: namaTrim,
            phone: nomorHp.trim(),
          },
        },
      });

      if (error) {
        setErrorMessage(`Pendaftaran gagal: ${error.message}`);
        return;
      }

      if (data.session) {
        router.replace('/user/Katalog');
        return;
      }

      Alert.alert(
        'Pendaftaran Berhasil',
        'Silakan cek email kamu untuk konfirmasi akun terlebih dahulu.',
        [
          {
            text: 'Ke Halaman Login',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menghubungi server.'
      );
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

          <Text style={styles.headerTitle}>Daftar Akun</Text>
          <Text style={styles.headerSub}>
            Buat akun untuk mulai berbelanja
          </Text>
        </View>

        <View style={styles.formContainer}>
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={16} color="#D9534F" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Nama Lengkap</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="person-outline"
              size={18}
              color="#A83F68"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Nama lengkap"
              placeholderTextColor="#C49AAA"
              value={namaLengkap}
              onChangeText={setNamaLengkap}
              autoCapitalize="words"
            />
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={18}
              color="#A83F68"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Alamat email"
              placeholderTextColor="#C49AAA"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.label}>Nomor HP (opsional)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="call-outline"
              size={18}
              color="#A83F68"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Nomor HP"
              placeholderTextColor="#C49AAA"
              value={nomorHp}
              onChangeText={setNomorHp}
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color="#A83F68"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password minimal 8 karakter"
              placeholderTextColor="#C49AAA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color="#A83F68"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Konfirmasi Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color="#A83F68"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Ulangi password"
              placeholderTextColor="#C49AAA"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color="#A83F68"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAgree(!agree)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={agree ? 'checkbox-outline' : 'square-outline'}
              size={18}
              color="#A83F68"
            />
            <Text style={styles.checkboxText}>
              Saya setuju dengan{' '}
              <Text style={styles.boldText}>Syarat & Ketentuan</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF8F0" />
            ) : (
              <Text style={styles.buttonText}>Daftar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/login')}
            activeOpacity={0.7}
          >
            <Text style={styles.loginLinkText}>
              Sudah punya akun? Masuk
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 50,
    height: 65,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#A83F68',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 12,
    color: '#A83F68',
    opacity: 0.7,
  },
  formContainer: {
    width: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FADBD8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#D9534F',
    fontSize: 11,
    marginLeft: 6,
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A83F68',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#E8A6BD',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#A83F68',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  checkboxText: {
    fontSize: 11,
    color: '#A83F68',
    marginLeft: 8,
  },
  boldText: {
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#E8A6BD',
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF8F0',
    fontSize: 14,
    fontWeight: '700',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A83F68',
  },
});