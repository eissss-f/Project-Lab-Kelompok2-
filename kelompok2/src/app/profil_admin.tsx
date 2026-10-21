import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfilScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={32} color="#E8A6BD" />
            </View>
            <View style={styles.userTextContainer}>
              <Text style={styles.userName}>Euis Fahira</Text>
              <Text style={styles.userEmail}>euis@gmail.com</Text>
            </View>
          </View>
          
          <Image 
            source={require('../../assets/images/logo_racrafts.jpg.jpeg')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuLeft}>
              <Ionicons name="receipt-outline" size={20} color="#A83F68" />
              <Text style={styles.menuText}>Pesanan Saya</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#A83F68" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuLeft}>
              <Ionicons name="location-outline" size={20} color="#A83F68" />
              <Text style={styles.menuText}>Alamat Saya</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#A83F68" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuLeft}>
              <Ionicons name="settings-outline" size={20} color="#A83F68" />
              <Text style={styles.menuText}>Pengaturan Akun</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#A83F68" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuLeft}>
              <Ionicons name="help-circle-outline" size={20} color="#A83F68" />
              <Text style={styles.menuText}>Bantuan</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#A83F68" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#FFF8F0" style={{ marginRight: 6 }} />
          <Text style={styles.logoutText}>Lougut</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingTop: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3D2DF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userTextContainer: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '700',
    color: '#A83F68',
  },
  userEmail: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: '#A83F68',
    opacity: 0.6,
  },
  logoImage: {
    width: 40,
    height: 50,
  },
  menuContainer: {
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    marginBottom: 36,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 0.6,
    borderBottomColor: '#E8A6BD',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: '#A83F68',
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: '#E8A6BD',
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFF8F0',
    fontSize: 14,
    fontFamily: 'Poppins',
    fontWeight: '700',
  },
});