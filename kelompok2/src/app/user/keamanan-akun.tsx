import { ProfileInfoPage } from '@/components/profile-info-page';

export default function KeamananAkunScreen() {
  return (
    <ProfileInfoPage
      title="Keamanan akun"
      subtitle="Informasi untuk menjaga akunmu tetap aman."
      items={[
        {
          icon: 'mail-outline',
          title: 'Email akun',
          description:
            'Gunakan email yang bisa kamu akses untuk menerima informasi akun.',
        },
        {
          icon: 'lock-closed-outline',
          title: 'Kata sandi',
          description:
            'Gunakan kata sandi yang kuat dan jangan membagikannya kepada orang lain.',
        },
        {
          icon: 'shield-checkmark-outline',
          title: 'Privasi akun',
          description:
            'Informasi akun digunakan untuk membantu pengelolaan pesananmu.',
        },
      ]}
    />
  );
}