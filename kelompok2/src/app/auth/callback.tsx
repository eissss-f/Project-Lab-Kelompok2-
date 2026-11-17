import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../../lib/supabase';

export default function AuthCallback() {
  const { code } = useLocalSearchParams<{ code?: string }>();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (!code) {
          throw new Error('Authorization code tidak ditemukan');
        }

        const { data, error } =
          await supabase.auth.exchangeCodeForSession(code);

        if (error) throw error;

        const user = data.user;

        if (!user) throw new Error('User tidak ditemukan');

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        let role = profile?.role;

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

        if (role === 'admin') {
          router.replace('/admin/index_admin');
        } else if (role === 'user') {
          router.replace('/user/Katalog');
        } else {
          throw new Error('Role tidak dikenal');
        }
      } catch (error) {
        console.error('Callback error:', error);
        await supabase.auth.signOut();
        router.replace('/login');
      }
    };

    handleCallback();
  }, [code]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#A83F68" />
      <Text>Memproses login Google...</Text>
    </View>
  );
}