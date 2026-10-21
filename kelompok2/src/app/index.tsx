import { Redirect } from 'expo-router';

export default function Index() {
  // Mengarahkan tampilan awal aplikasi langsung ke landingpage.tsx
  return <Redirect href="/landingpage" />;
}