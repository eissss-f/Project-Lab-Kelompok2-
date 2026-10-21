import React, { useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function LandingPageScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.content}
        activeOpacity={1}
        onPress={() => router.replace('/login')}
      >
        <Image
          source={require('../../assets/images/logo_racrafts.jpg.jpeg')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.brandTitle}>ra_scrafts.id</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8A6BD',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 80,
    height: 100,
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 22,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#A83F68',
    letterSpacing: 0.5,
  },
});