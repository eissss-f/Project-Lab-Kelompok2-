import { ProfileInfoPage } from '../components/profile-info-page';

export default function BantuanScreen() {
  return (
    <ProfileInfoPage
      title="Bantuan pelanggan"
      subtitle="Kami siap membantu pertanyaan tentang pesananmu."
      items={[
        {
          icon: 'chatbubbles-outline',
          title: 'Pesanan buket',
          description:
            'Sampaikan jenis buket, warna, dan tanggal yang kamu inginkan.',
        },
        {
          icon: 'bag-handle-outline',
          title: 'Status pesanan',
          description:
            'Buka menu Pesanan untuk melihat perkembangan pesanan yang sedang berjalan.',
        },
        {
          icon: 'logo-whatsapp',
          title: 'Hubungi toko',
          description: 'Tanyakan pesanan atau produk melalui WhatsApp toko.',
        },
      ]}
    />
  );
}
