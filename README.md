# ra_scrafts.id - Admin Mobile App

Aplikasi mobile berbasis **React Native** (Expo) yang dirancang khusus untuk pengelola/admin **ra_scrafts.id** dalam memantau ringkasan toko, mengelola koleksi buket, memproses pesanan masuk, memverifikasi pembayaran, serta memperbarui progres status pesanan secara *real-time* dan responsif di berbagai ukuran layar.

---

## Fitur Utama Admin
* **Dashboard & Ringkasan Toko (`/index_admin`)**: Memantau metrik utama seperti jumlah produk aktif, pesanan masuk, verifikasi tertunda, dan pesanan siap diambil.
* **Kelola Pesanan (`/kelola_pesanan_admin`)**: Menampilkan daftar pesanan lengkap dengan detail informasi pelanggan, jadwal pengambilan, hingga pesan kartu ucapan.
* **Kelola Produk (`/produk_admin`)**: Manajemen katalog buket (tambah, edit, hapus, dan atur stok/harga produk) menggunakan *interactive bottom sheet modal*.
* **Verifikasi Pembayaran (`/verifikasi_admin`)**: Memeriksa bukti transfer pelanggan dan mengonfirmasi pembayaran dengan cepat.
* **Update Status Pesanan (`/status_admin`)**: Memperbarui status pengerjaan buket (*Sedang Dibuat*, *Siap Diambil*, hingga *Selesai*).
* **Profil Admin (`/profil_admin`)**: Informasi akun pengelola toko dan akses cepat ke seluruh menu manajemen.

---

## Tech Stack
* **Framework:** React Native (dengan Expo & Expo Router)
* **Bahasa:** TypeScript / JavaScript
* **Styling:** React Native StyleSheet (dengan dukungan *responsive layout* menggunakan `useWindowDimensions`)
* **Icons:** `@expo/vector-icons` (Ionicons & MaterialCommunityIcons)

---

## Panduan Memulai (Getting Started)

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek di perangkat lokalmu:

### 1. Prasyarat
Pastikan komputermu sudah menginstal:
* [Node.js](https://nodejs.org/) (LTS direkomendasikan)
* Package manager (`npm` atau `yarn`)
* Expo Go (di HP kamu) atau emulator Android/iOS

### 2. Instalasi Dependensi
Clone repositori ini, lalu jalankan perintah berikut di terminal:

```bash
git clone [https://github.com/eissss-f/Project-Lab-Kelompok2-]
cd kelompok2
npx expo start//web

1. halaman login
<img width="206" height="346" alt="image" src="https://github.com/user-attachments/assets/f4b9a9d8-4eb7-4b01-b0b5-3b236799cbbe" />
2. halaman register
<img width="179" height="345" alt="image" src="https://github.com/user-attachments/assets/d4b50506-1f2b-4f6e-8514-108cce835343" />
3. halaman katalog buket
<img width="198" height="342" alt="image" src="https://github.com/user-attachments/assets/7ac198c3-b508-469f-9957-c7db9c57fc95" />
4. halaman detail produk
<img width="186" height="344" alt="image" src="https://github.com/user-attachments/assets/26245e05-1728-43e4-acaa-2735c3a03a0c" />
5. halaman keranjang
<img width="203" height="349" alt="image" src="https://github.com/user-attachments/assets/05a89d33-0b29-472c-98eb-68782f5304e9" />
6. halaman checkout
<img width="194" height="347" alt="image" src="https://github.com/user-attachments/assets/e500b2d3-7f93-48a5-89e7-e2bfe84e5886" />
7. halaman status pesanan
<img width="191" height="343" alt="image" src="https://github.com/user-attachments/assets/6712ec9e-1628-4fc4-b1fd-6af693bd45db" />
8. halaman profile
<img width="187" height="337" alt="image" src="https://github.com/user-attachments/assets/378dd80d-0ab9-4d7a-a09f-52835cdd08bd" />
9. halaman admin
<img width="182" height="346" alt="image" src="https://github.com/user-attachments/assets/1aa57199-5209-4ee8-8055-a10f4d867144" />
<img width="181" height="345" alt="image" src="https://github.com/user-attachments/assets/8702163b-7013-4001-b28b-e76626809674" />
<img width="185" height="338" alt="image" src="https://github.com/user-attachments/assets/16802639-4443-4964-becc-003a5faa89bb" />
<img width="164" height="335" alt="image" src="https://github.com/user-attachments/assets/82146b00-25f9-4e5e-928d-90094403fe2d" />
<img width="173" height="340" alt="image" src="https://github.com/user-attachments/assets/bd47a800-47fa-4f4b-84eb-8389efb37bb4" />
<img width="170" height="335" alt="image" src="https://github.com/user-attachments/assets/4fb315ae-4fe3-4187-922b-1ad97cbb79b1" />
<img width="175" height="341" alt="image" src="https://github.com/user-attachments/assets/98c29518-7ad1-4cfc-9326-129ffbfa4d33" />

video demo user : 
<video controls src="Screen Recording 2026-10-22 081335.mp4" title="Title"></video>
video demo admin : 
<video controls src="Screen Recording 2026-10-22 081702.mp4" title="Title"></video>