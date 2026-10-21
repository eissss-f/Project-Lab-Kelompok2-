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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const router = useRouter();
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [nomorHp, setNomorHp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Image 
            source={require('../../assets/images/logo_racrafts.jpg.jpeg')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Daftar Akun</Text>
          <Text style={styles.headerSub}>Buat akun untuk mulai berbelanja</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#A83F68" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nama lengkap"
              placeholderTextColor="#C49AAA"
              value={namaLengkap}
              onChangeText={setNamaLengkap}
            />
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#A83F68" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Alamat email"
              placeholderTextColor="#C49AAA"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Nomor HP (opsional)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={18} color="#A83F68" style={styles.inputIcon} />
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
            <Ionicons name="lock-closed-outline" size={18} color="#A83F68" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#C49AAA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color="#A83F68"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Konfirmasi Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#A83F68" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ulangi password"
              placeholderTextColor="#C49AAA"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color="#A83F68"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgree(!agree)}>
            <Ionicons
              name={agree ? 'checkbox-outline' : 'square-outline'}
              size={18}
              color="#A83F68"
            />
            <Text style={styles.checkboxText}>
              Saya setuju dengan <Text style={styles.boldText}>Syarat & Ketentuan</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleRegister} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Daftar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/login')}>
            <Text style={styles.loginLinkText}>Masuk?</Text>
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
    fontFamily: 'Playfair Display',
    fontWeight: '700',
    color: '#A83F68',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: '#A83F68',
    opacity: 0.7,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
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
  buttonText: {
    color: '#FFF8F0',
    fontSize: 14,
    fontFamily: 'Poppins',
    fontWeight: '700',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 13,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#A83F68',
  },
});