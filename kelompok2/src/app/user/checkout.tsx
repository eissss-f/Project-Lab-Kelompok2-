import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import keranjangDefault, { useCart, CartItem, parsePrice } from './keranjang';
import { supabase } from '../../../lib/supabase';

export default function CheckoutPage({ onBackToCart }: { onBackToCart?: () => void }) {
    const router = useRouter();
    const params = useLocalSearchParams<{
        name?: string;
        price?: string;
        variant?: string;
        image?: string;
        imageUrl?: string;
        quantity?: string;
    }>();

    // State untuk menampung data pemesan dari tabel profiles
    const [customerName, setCustomerName] = useState<string>('Memuat...');
    const [customerPhone, setCustomerPhone] = useState<string>('Memuat...');

    // Memastikan hook useCart aman digunakan
    const cartContext = useCart ? useCart() : null;
    const selectedItems: CartItem[] = cartContext?.selectedItems || [];
    const clearSelectedItems = cartContext?.clearSelectedItems || (() => {});

    // Mendapatkan data produk satuan jika diklik dari "Pesan Sekarang"
    const directItem: CartItem | null = params.name
        ? {
            id: 'direct-param',
            name: params.name,
            variant: params.variant || '',
            price: parsePrice ? parsePrice(params.price || 0) : Number(params.price || 0),
            quantity: params.quantity ? parseInt(params.quantity, 10) : 1,
            qty: params.quantity ? parseInt(params.quantity, 10) : 1,
            image: params.imageUrl || params.image || '',
            selected: true,
        }
        : null;

    // FIX UTAMA: Jika directItem ada, pakai directItem saja dan abaikan keranjang
    const cartSummary: CartItem[] = directItem 
        ? [directItem] 
        : (selectedItems.length > 0 ? selectedItems : []);

    const totalBouquets: number = cartSummary.reduce((sum: number, item: CartItem) => sum + (item.quantity ?? item.qty ?? 1), 0);
    const totalPrice: number = cartSummary.reduce((sum: number, item: CartItem) => sum + item.price * (item.quantity ?? item.qty ?? 1), 0);

    // Mengambil data pengguna yang login dan mencocokkannya dengan tabel profiles
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError || !user) {
                    setCustomerName('Tamu / Belum Login');
                    setCustomerPhone('-');
                    return;
                }

                // Mengambil data full_name dan phone dari tabel profiles berdasarkan id user
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('full_name, phone')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.error('Gagal mengambil profil:', profileError.message);
                    setCustomerName(user.email || 'Pengguna');
                    setCustomerPhone('Belum diatur');
                    return;
                }

                if (profile) {
                    setCustomerName(profile.full_name || user.email || 'Tanpa Nama');
                    setCustomerPhone(profile.phone || 'No. HP belum diisi');
                }
            } catch (err) {
                console.error('Terjadi kesalahan:', err);
                setCustomerName('Gagal memuat');
                setCustomerPhone('-');
            }
        };

        fetchUserProfile();

        if (typeof document !== 'undefined') {
            const linkId = 'google-fonts-ra-scrafts';
            if (!document.getElementById(linkId)) {
                const link = document.createElement('link');
                link.id = linkId;
                link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Poppins:wght@300;400;500;600;700&display=swap';
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }
        }
    }, []);

    const [isCardActive, setIsCardActive] = useState<boolean>(false);
    const [recipientName, setRecipientName] = useState<string>('');
    const [cardMessage, setCardMessage] = useState<string>('');
    const [pickupDate, setPickupDate] = useState<string>('');
    const [pickupTime, setPickupTime] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<'DANA' | 'GoPay' | 'SeaBank' | ''>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const [orderNumber, setOrderNumber] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const handleBack = () => {
        if (onBackToCart) {
            onBackToCart();
        } else {
            try {
                router.back();
            } catch {
                try {
                    router.push('/user/keranjang' as any);
                } catch {
                    // fallback
                }
            }
        }
    };

    const handleSubmitOrder = () => {
        if (cartSummary.length === 0) {
            alert('Tidak ada produk yang dipilih untuk dipesan. Silakan kembali ke keranjang.');
            return;
        }
        if (!paymentMethod) {
            alert('Mohon pilih metode pembayaran terlebih dahulu.');
            return;
        }
        if (!selectedFile) {
            alert('Mohon unggah bukti pembayaran terlebih dahulu!');
            return;
        }
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        setOrderNumber(`#RS-${randomCode}`);
        clearSelectedItems();
        setShowSuccessModal(true);
    };

    return (
        <div style={{
            maxWidth: '430px',
            margin: '0 auto',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FFF8F0',
            fontFamily: "'Poppins', sans-serif",
            boxSizing: 'border-box',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 0 25px rgba(168, 63, 104, 0.08)'
        }}>

            {/* Header */}
            <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px 16px 12px 16px',
                borderBottom: '1px solid #EED7D8',
                backgroundColor: '#FFF8F0',
                flexShrink: 0
            }}>
                <button
                    onClick={handleBack}
                    style={{
                        position: 'absolute',
                        left: '16px',
                        top: '12px',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: '1px solid #E8A6BD',
                        backgroundColor: '#FFF8F0',
                        color: '#A83F68',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        paddingBottom: '2px',
                        boxSizing: 'border-box'
                    }}
                >
                    &#8249;
                </button>
                <h1 style={{
                    fontSize: '25px',
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 600,
                    color: '#A83F68',
                    margin: 0,
                    letterSpacing: '-0.3px'
                }}>
                    Checkout
                </h1>
                <span style={{ fontSize: '12px', color: '#A83F68', opacity: 0.85, marginTop: '2px' }}>
                    ra_scrafts.id
                </span>
            </div>

            {/* Scrollable Form Body */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '14px 16px 20px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxSizing: 'border-box'
            }}>

                {/* 1. Data Pemesan (Otomatis dari tabel profiles Supabase) */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    padding: '16px',
                    borderRadius: '20px',
                    border: '1px solid #E8A6BD',
                    boxShadow: '0 2px 6px rgba(168, 63, 104, 0.03)'
                }}>
                    <h2 style={{
                        fontSize: '16px',
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 600,
                        color: '#A83F68',
                        margin: '0 0 8px 0'
                    }}>
                        Data Pemesan
                    </h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#A83F68', opacity: 0.8 }}>Nama Pemesan</span>
                        <span style={{
                            backgroundColor: '#E8A6BD',
                            color: '#FFF8F0',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '10px',
                            fontWeight: 600
                        }}>
                            Dari akun
                        </span>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#A83F68', margin: '3px 0 8px 0' }}>
                        {customerName}
                    </p>
                    <span style={{ fontSize: '11px', color: '#A83F68', display: 'block', opacity: 0.8 }}>No. HP</span>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#A83F68', margin: '3px 0 0 0' }}>
                        {customerPhone}
                    </p>
                </div>

                {/* 2. Ringkasan Pesanan */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    padding: '16px',
                    borderRadius: '20px',
                    border: '1px solid #E8A6BD',
                    boxShadow: '0 2px 6px rgba(168, 63, 104, 0.03)'
                }}>
                    <h2 style={{
                        fontSize: '16px',
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 600,
                        color: '#A83F68',
                        margin: '0 0 12px 0'
                    }}>
                        Ringkasan Pesanan
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {cartSummary.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '16px 8px', color: '#A83F68' }}>
                                <p style={{ fontSize: '12px', margin: 0, fontWeight: 500 }}>
                                    Belum ada produk yang dipilih untuk checkout.
                                </p>
                                <button
                                    onClick={handleBack}
                                    style={{
                                        marginTop: '10px',
                                        backgroundColor: '#A83F68',
                                        color: '#FFF8F0',
                                        border: 'none',
                                        padding: '7px 16px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Kembali ke Keranjang
                                </button>
                            </div>
                        ) : (
                            cartSummary.map((item: CartItem) => {
                                const qty = item.quantity ?? item.qty ?? 1;
                                return (
                                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    objectFit: 'cover',
                                                    borderRadius: '10px',
                                                    flexShrink: 0,
                                                    backgroundColor: '#F7E6E6'
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '10px',
                                                backgroundColor: '#F7E6E6',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '18px',
                                                flexShrink: 0
                                            }}>🌸</div>
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{
                                                fontSize: '13px',
                                                fontFamily: "'Playfair Display', serif",
                                                fontWeight: 600,
                                                color: '#A83F68',
                                                margin: 0,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {item.name}
                                            </h3>
                                            <p style={{ fontSize: '10px', color: '#A83F68', margin: '2px 0 0 0', opacity: 0.8 }}>
                                                {item.variant}
                                            </p>
                                            <p style={{ fontSize: '11px', color: '#A83F68', margin: '2px 0 0 0' }}>
                                                {qty}x · Rp {item.price.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#A83F68', flexShrink: 0 }}>
                                            Rp {(item.price * qty).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div style={{
                        borderTop: '1px solid #EED7D8',
                        marginTop: '12px',
                        paddingTop: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontSize: '11px', color: '#A83F68', opacity: 0.8 }}>
                            Total {totalBouquets} buket
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#A83F68' }}>
                            Rp {totalPrice.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>

                {/* 3. Kartu Ucapan */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    padding: '16px',
                    borderRadius: '20px',
                    border: '1px solid #E8A6BD',
                    boxShadow: '0 2px 6px rgba(168, 63, 104, 0.03)'
                }}>
                    <h2 style={{
                        fontSize: '16px',
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 600,
                        color: '#A83F68',
                        margin: '0 0 8px 0'
                    }}>
                        Kartu Ucapan
                    </h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#A83F68', opacity: 0.85 }}>Tambah Kartu Ucapan</span>
                        <button
                            onClick={() => setIsCardActive(!isCardActive)}
                            style={{
                                border: 'none',
                                backgroundColor: isCardActive ? '#A83F68' : '#D0C2C7',
                                color: '#FFF8F0',
                                padding: '3px 12px',
                                borderRadius: '12px',
                                fontSize: '10px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'background-color 0.2s ease'
                            }}
                        >
                            {isCardActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                    </div>

                    {isCardActive && (
                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div>
                                <label style={{ fontSize: '10px', color: '#A83F68', display: 'block', marginBottom: '3px', opacity: 0.8 }}>
                                    Nama Penerima
                                </label>
                                <input
                                    type="text"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    placeholder="Masukkan nama penerima..."
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        fontSize: '11px',
                                        borderRadius: '10px',
                                        border: '1px solid #E8A6BD',
                                        backgroundColor: '#FFF8F0',
                                        color: '#A83F68',
                                        boxSizing: 'border-box',
                                        outline: 'none',
                                        fontFamily: "'Poppins', sans-serif"
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '10px', color: '#A83F68', display: 'block', marginBottom: '3px', opacity: 0.8 }}>
                                    Pesan Ucapan
                                </label>
                                <textarea
                                    rows={2}
                                    value={cardMessage}
                                    onChange={(e) => setCardMessage(e.target.value)}
                                    placeholder="Tulis ucapan manis di sini..."
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        fontSize: '11px',
                                        borderRadius: '10px',
                                        border: '1px solid #E8A6BD',
                                        backgroundColor: '#FFF8F0',
                                        color: '#A83F68',
                                        resize: 'none',
                                        boxSizing: 'border-box',
                                        outline: 'none',
                                        fontFamily: "'Poppins', sans-serif"
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. Jadwal Pengambilan di Toko */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    padding: '16px',
                    borderRadius: '20px',
                    border: '1px solid #E8A6BD',
                    boxShadow: '0 2px 6px rgba(168, 63, 104, 0.03)'
                }}>
                    <h2 style={{
                        fontSize: '16px',
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 600,
                        color: '#A83F68',
                        margin: '0 0 10px 0'
                    }}>
                        Jadwal Pengambilan di Toko
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                            <label style={{ fontSize: '10px', color: '#A83F68', display: 'block', marginBottom: '3px', opacity: 0.8 }}>
                                Tanggal Pengambilan
                            </label>
                            <input
                                type="date"
                                value={pickupDate}
                                onChange={(e) => setPickupDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    border: '1px solid #E8A6BD',
                                    padding: '8px 10px',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    color: '#A83F68',
                                    backgroundColor: '#FFF8F0',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    fontFamily: "'Poppins', sans-serif",
                                    cursor: 'pointer'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '10px', color: '#A83F68', display: 'block', marginBottom: '3px', opacity: 0.8 }}>
                                Jam Pengambilan
                            </label>
                            <input
                                type="time"
                                value={pickupTime}
                                onChange={(e) => setPickupTime(e.target.value)}
                                style={{
                                    width: '100%',
                                    border: '1px solid #E8A6BD',
                                    padding: '8px 10px',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    color: '#A83F68',
                                    backgroundColor: '#FFF8F0',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    fontFamily: "'Poppins', sans-serif",
                                    cursor: 'pointer'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* 5. Metode Pembayaran */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    padding: '16px',
                    borderRadius: '20px',
                    border: '1px solid #E8A6BD',
                    boxShadow: '0 2px 6px rgba(168, 63, 104, 0.03)'
                }}>
                    <h2 style={{
                        fontSize: '16px',
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 600,
                        color: '#A83F68',
                        margin: '0 0 10px 0'
                    }}>
                        Metode Pembayaran (Transfer Manual)
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(['DANA', 'GoPay', 'SeaBank'] as const).map((method) => {
                            const isSelected = paymentMethod === method;
                            return (
                                <div
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px 14px',
                                        borderRadius: '12px',
                                        border: isSelected ? '1px solid #A83F68' : '1px solid #E8A6BD',
                                        backgroundColor: isSelected ? '#F7E6E6' : '#FFFFFF',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        border: isSelected ? '2px solid #A83F68' : '2px solid #C4B5BC',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxSizing: 'border-box',
                                        flexShrink: 0
                                    }}>
                                        {isSelected && (
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: '#A83F68'
                                            }} />
                                        )}
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#A83F68' }}>
                                        {method}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: '12px' }}>
                        <span style={{ fontSize: '11px', color: '#A83F68', display: 'block', marginBottom: '4px', opacity: 0.8 }}>
                            Nomor tujuan
                        </span>
                        <div style={{
                            border: '1px solid #E8A6BD',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            backgroundColor: '#FFF8F0'
                        }}>
                            <span style={{ fontWeight: 600, color: '#A83F68', fontSize: '13px', display: 'block' }}>
                                {paymentMethod ? `(Nomor ${paymentMethod} akan tampil di sini)` : 'Pilih metode pembayaran terlebih dahulu'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 6. Unggah Bukti Pembayaran */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    padding: '16px',
                    borderRadius: '20px',
                    border: '1px solid #E8A6BD',
                    boxShadow: '0 2px 6px rgba(168, 63, 104, 0.03)'
                }}>
                    <h2 style={{
                        fontSize: '16px',
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 600,
                        color: '#A83F68',
                        margin: '0 0 10px 0'
                    }}>
                        Unggah Bukti Pembayaran
                    </h2>
                    <div style={{
                        border: '1.5px dashed #A83F68',
                        padding: '16px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        backgroundColor: '#FFFFFF'
                    }}>
                        <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: '#F7E6E6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 8px auto',
                            color: '#A83F68'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A83F68" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                        </div>

                        <label style={{
                            display: 'inline-block',
                            backgroundColor: '#A83F68',
                            color: '#FFF8F0',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '7px 20px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(168, 63, 104, 0.2)'
                        }}>
                            Pilih Gambar
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </label>

                        <div style={{
                            border: '1px dashed #E8A6BD',
                            borderRadius: '12px',
                            padding: '12px',
                            backgroundColor: '#F7E6E6',
                            marginTop: '12px',
                            minHeight: '65px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {previewUrl ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                    <img
                                        src={previewUrl}
                                        alt="Bukti Transfer"
                                        style={{ maxHeight: '90px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }}
                                    />
                                    <span style={{ fontSize: '10px', color: '#A83F68', fontWeight: 600 }}>
                                        {selectedFile?.name}
                                    </span>
                                    <button
                                        onClick={handleRemoveFile}
                                        style={{
                                            border: 'none',
                                            background: 'none',
                                            color: '#A83F68',
                                            fontSize: '10px',
                                            textDecoration: 'underline',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Hapus gambar
                                    </button>
                                </div>
                            ) : (
                                <span style={{ fontSize: '11px', color: '#A83F68', opacity: 0.6 }}>
                                    Belum ada gambar terpilih
                                </span>
                            )}
                        </div>

                        <p style={{ fontSize: '10px', color: '#A83F68', margin: '8px 0 0 0', opacity: 0.8 }}>
                            Pastikan nominal dan bukti transfer terlihat jelas.
                        </p>
                    </div>
                </div>

            </div>

            {/* Bottom Sticky Footer */}
            <div style={{
                backgroundColor: '#FFF8F0',
                borderTop: '1px solid #EED7D8',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                flexShrink: 0
            }}>
                <div>
                    <span style={{ fontSize: '10px', color: '#A83F68', display: 'block', opacity: 0.85 }}>
                        Total Pembayaran
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#A83F68', display: 'block', marginTop: '1px' }}>
                        Rp {totalPrice.toLocaleString('id-ID')}
                    </span>
                </div>

                <button
                    onClick={handleSubmitOrder}
                    style={{
                        backgroundColor: '#A83F68',
                        color: '#FFF8F0',
                        border: 'none',
                        padding: '12px 26px',
                        borderRadius: '14px',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(168, 63, 104, 0.3)',
                        transition: 'transform 0.1s ease'
                    }}
                >
                    Buat Pesanan
                </button>
            </div>

            {/* Success Popup Modal */}
            {showSuccessModal && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    zIndex: 99,
                    backdropFilter: 'blur(3px)'
                }}>
                    <div style={{
                        backgroundColor: '#FFF8F0',
                        borderRadius: '24px',
                        padding: '24px 20px',
                        width: '100%',
                        maxWidth: '340px',
                        textAlign: 'center',
                        boxShadow: '0 10px 30px rgba(168, 63, 104, 0.25)',
                        border: '1px solid #E8A6BD',
                        boxSizing: 'border-box'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            backgroundColor: '#F7E6E6',
                            border: '2px solid #E8A6BD',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 14px auto',
                            fontSize: '26px'
                        }}>
                            🌸
                        </div>
                        <h3 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#A83F68',
                            margin: 0
                        }}>
                            Pesanan Berhasil!
                        </h3>
                        <p style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#A83F68',
                            marginTop: '4px',
                            marginBottom: '10px'
                        }}>
                            {orderNumber}
                        </p>
                        <p style={{
                            fontSize: '12px',
                            color: '#A83F68',
                            lineHeight: 1.5,
                            margin: '0 0 18px 0',
                            opacity: 0.85
                        }}>
                            Terima kasih, <strong>{recipientName || customerName || 'Pelanggan'}</strong>. Admin kami akan segera memverifikasi bukti pembayaran Anda.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    try {
                                        router.push('/user/pesanan' as any);
                                    } catch {
                                        // fallback
                                    }
                                }}
                                style={{
                                    backgroundColor: '#A83F68',
                                    color: '#FFF8F0',
                                    border: 'none',
                                    padding: '11px',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }}
                            >
                                Lihat Status Pesanan
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    try {
                                        router.push('/user/landingpage' as any);
                                    } catch {
                                        // fallback
                                    }
                                }}
                                style={{
                                    backgroundColor: 'transparent',
                                    color: '#A83F68',
                                    border: '1px solid #E8A6BD',
                                    padding: '10px',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }}>
                                Kembali ke Beranda
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}