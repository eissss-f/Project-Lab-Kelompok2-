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
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');

    const emailTrim = email.trim().toLowerCase();

    if (!emailTrim) {
      setErrorMessage('Email wajib diisi.');
      return;
    }

    if (!password) {
      setErrorMessage('Password wajib diisi.');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailTrim,
        password: password,
      });

      if (error) {
        setErrorMessage(`Login gagal: ${error.message}`);
        return;
      }

      // Jika berhasil login dan sesi tersedia
      if (data.session) {
        // Beri jeda 300ms agar token tersimpan sempurna di local storage
        setTimeout(() => {
          router.replace('/Katalog');
        }, 300);
      }
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

          <Text style={styles.headerTitle}>Masuk Akun</Text>
          <Text style={styles.headerSub}>
            Silakan masuk untuk melanjutkan
          </Text>
        </View>

        <View style={styles.formContainer}>
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={16} color="#D9534F" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

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
              placeholder="Masukkan password"
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

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF8F0" />
            ) : (
              <Text style={styles.buttonText}>Masuk</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => router.push('/register')}
            activeOpacity={0.7}
          >
            <Text style={styles.registerLinkText}>
              Belum punya akun? Daftar
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
  button: {
    backgroundColor: '#E8A6BD',
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
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
  registerLink: {
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A83F68',
  },
});