import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

interface CartItem {
    id: number;
    name: string;
    variant: string;
    price: number;
    quantity: number;
    image: string;
    selected: boolean;
}

export default function KeranjangPage({ onNavigateToCheckout }: { onNavigateToCheckout?: () => void }) {
    const router = useRouter();

    useEffect(() => {
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

    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            id: 1,
            name: 'Buket Bunga Rose Premium',
            variant: 'Pink · Wrapping ivory',
            price: 150000,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=400&auto=format&fit=crop',
            selected: true,
        },
        {
            id: 2,
            name: 'Buket Tulip Sweet Pink',
            variant: 'Pink · Wrapping pink',
            price: 95000,
            quantity: 2,
            image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?q=80&w=400&auto=format&fit=crop',
            selected: true,
        },
        {
            id: 3,
            name: 'Buket Baby’s Breath',
            variant: 'Putih · Wrapping kraft',
            price: 85000,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?q=80&w=400&auto=format&fit=crop',
            selected: true,
        },
    ]);

    const isAllSelected = cartItems.length > 0 && cartItems.every((item) => item.selected);

    const toggleSelectAll = () => {
        const targetState = !isAllSelected;
        setCartItems(cartItems.map((item) => ({ ...item, selected: targetState })));
    };

    const toggleSelectItem = (id: number) => {
        setCartItems(
            cartItems.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
        );
    };

    const updateQuantity = (id: number, delta: number) => {
        setCartItems(
            cartItems.map((item) => {
                if (item.id === id) {
                    const newQty = item.quantity + delta;
                    return { ...item, quantity: newQty > 0 ? newQty : 1 };
                }
                return item;
            })
        );
    };

    const removeItem = (id: number) => {
        setCartItems(cartItems.filter((item) => item.id !== id));
    };

    const selectedItems = cartItems.filter((item) => item.selected);
    const totalItemsSelected = selectedItems.length;
    const totalBouquetsSelected = selectedItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const handleCheckout = () => {
        if (onNavigateToCheckout) {
            onNavigateToCheckout();
        } else {
            try {
                router.push('/checkout');
            } catch (e) {
                console.log('Navigating to checkout...', e);
            }
        }
    };

    const handleBack = () => {
        try {
            router.back();
        } catch {
            try {
                router.push('/');
            } catch {
                // fallback
            }
        }
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
            boxShadow: '0 0 25px rgba(168, 63, 104, 0.08)'
        }}>

            {/* 1. Header (Top) */}
            <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 16px 12px 16px',
                borderBottom: '1px solid #EED7D8',
                backgroundColor: '#FFF8F0',
                flexShrink: 0
            }}>
                <button
                    onClick={handleBack}
                    style={{
                        position: 'absolute',
                        left: '16px',
                        top: '16px',
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
                    Keranjang Saya
                </h1>
                <span style={{ fontSize: '12px', color: '#A83F68', opacity: 0.85, marginTop: '2px' }}>
                    ra_scrafts.id
                </span>
            </div>

            {/* 2. Select All Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                fontSize: '13px',
                flexShrink: 0
            }}>
                <div
                    onClick={toggleSelectAll}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}
                >
                    <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        backgroundColor: isAllSelected ? '#A83F68' : '#FFFFFF',
                        border: isAllSelected ? 'none' : '1.5px solid #E8A6BD',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box'
                    }}>
                        {isAllSelected && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF8F0" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        )}
                    </div>
                    <span style={{ fontWeight: 500, color: '#A83F68', fontSize: '13px' }}>Pilih Semua</span>
                </div>
                <span style={{ fontSize: '12px', color: '#A83F68', opacity: 0.85 }}>
                    {totalItemsSelected} produk dipilih
                </span>
            </div>

            {/* 3. Scrollable Content (Daftar Produk) */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '4px 16px 16px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                {cartItems.length === 0 ? (
                    <div style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: '#A83F68',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '20px',
                        border: '1px solid #E8A6BD',
                        marginTop: '20px'
                    }}>
                        <div style={{ fontSize: '36px', marginBottom: '10px' }}>🛒</div>
                        <p style={{ fontWeight: 600, fontSize: '15px', margin: 0 }}>Keranjang Anda kosong</p>
                        <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>Yuk pilih buket bunga cantik untuk melengkapi harimu!</p>
                        <button
                            onClick={() => router.push('/')}
                            style={{
                                marginTop: '14px',
                                backgroundColor: '#A83F68',
                                color: '#FFF8F0',
                                border: 'none',
                                padding: '8px 18px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Belanja Sekarang
                        </button>
                    </div>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 14px',
                            border: '1px solid #E8A6BD',
                            borderRadius: '20px',
                            backgroundColor: '#FFFFFF',
                            boxShadow: '0 2px 8px rgba(168, 63, 104, 0.04)',
                            flexShrink: 0,
                            boxSizing: 'border-box'
                        }}>
                            {/* Checkbox */}
                            <div
                                onClick={() => toggleSelectItem(item.id)}
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '6px',
                                    backgroundColor: item.selected ? '#A83F68' : '#FFFFFF',
                                    border: item.selected ? 'none' : '1.5px solid #E8A6BD',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    transition: 'all 0.2s ease',
                                    boxSizing: 'border-box'
                                }}
                            >
                                {item.selected && (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF8F0" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </div>

                            {/* Product Thumbnail */}
                            <img
                                src={item.image}
                                alt={item.name}
                                style={{
                                    width: '76px',
                                    height: '92px',
                                    objectFit: 'cover',
                                    borderRadius: '16px',
                                    flexShrink: 0,
                                    backgroundColor: '#F7E6E6'
                                }}
                            />

                            {/* Product Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h2 style={{
                                    fontSize: '16px',
                                    fontFamily: "'Playfair Display', serif",
                                    fontWeight: 600,
                                    color: '#A83F68',
                                    margin: 0,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {item.name}
                                </h2>
                                <p style={{ fontSize: '11px', color: '#A83F68', margin: '2px 0 0 0', opacity: 0.8 }}>
                                    {item.variant}
                                </p>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#A83F68', margin: '4px 0 0 0' }}>
                                    Rp {item.price.toLocaleString('id-ID')}
                                </p>

                                {/* Bottom row: Stepper + Trash */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        border: '1px solid #E8A6BD',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        height: '26px',
                                        backgroundColor: '#FFFFFF'
                                    }}>
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            style={{
                                                width: '26px',
                                                height: '100%',
                                                border: 'none',
                                                background: 'none',
                                                color: '#A83F68',
                                                fontWeight: 700,
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                paddingBottom: '2px'
                                            }}
                                        >
                                            &minus;
                                        </button>
                                        <span style={{
                                            minWidth: '24px',
                                            textAlign: 'center',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            color: '#A83F68'
                                        }}>
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            style={{
                                                width: '26px',
                                                height: '100%',
                                                border: 'none',
                                                backgroundColor: '#A83F68',
                                                color: '#FFF8F0',
                                                fontWeight: 700,
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeItem(item.id)}
                                        title="Hapus produk"
                                        style={{
                                            border: 'none',
                                            background: 'none',
                                            color: '#A83F68',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0.75,
                                            transition: 'opacity 0.2s'
                                        }}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A83F68" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18"></path>
                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                            <line x1="10" y1="11" x2="10" y2="17"></line>
                                            <line x1="14" y1="11" x2="14" y2="17"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 4. Bottom Total & Checkout Bar */}
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
                    <span style={{ fontSize: '11px', color: '#A83F68', display: 'block', opacity: 0.85 }}>
                        Total Harga
                    </span>
                    <span style={{ fontSize: '19px', fontWeight: 700, color: '#A83F68', display: 'block', marginTop: '1px' }}>
                        Rp {totalPrice.toLocaleString('id-ID')}
                    </span>
                    <span style={{ fontSize: '11px', color: '#A83F68', display: 'block', opacity: 0.85, marginTop: '1px' }}>
                        {totalBouquetsSelected} buket dipilih
                    </span>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={selectedItems.length === 0}
                    style={{
                        backgroundColor: selectedItems.length > 0 ? '#A83F68' : '#D0C2C7',
                        color: '#FFF8F0',
                        border: 'none',
                        padding: '12px 26px',
                        borderRadius: '16px',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: selectedItems.length > 0 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: selectedItems.length > 0 ? '0 4px 12px rgba(168, 63, 104, 0.3)' : 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    Checkout <span style={{ fontSize: '16px' }}>&rarr;</span>
                </button>
            </div>

            {/* 5. Bottom Navigation */}
            <div style={{
                backgroundColor: '#FFF8F0',
                borderTop: '1px solid #EED7D8',
                padding: '6px 20px 8px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    width: '100%'
                }}>
                    {/* Tab 1: Produk (Active) */}
                    <button
                        onClick={() => router.push('/Katalog')}
                        style={{
                            border: 'none',
                            backgroundColor: '#FFF0F6',
                            borderRadius: '16px',
                            padding: '6px 22px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            gap: '2px'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A83F68" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#A83F68' }}>Produk</span>
                    </button>

                    {/* Tab 2: Pesanan */}
                    <button
                        onClick={() => router.push('/pesanan')}
                        style={{
                            border: 'none',
                            background: 'none',
                            padding: '6px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            gap: '2px'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <span style={{ fontSize: '11px', fontWeight: 400, color: '#999999' }}>Pesanan</span>
                    </button>

                    {/* Tab 3: Profil */}
                    <button
                        onClick={() => router.push('/profil')}
                        style={{
                            border: 'none',
                            background: 'none',
                            padding: '6px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            gap: '2px'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span style={{ fontSize: '11px', fontWeight: 400, color: '#999999' }}>Profil</span>
                    </button>
                </div>

                {/* Home Indicator Accent */}
                <div style={{
                    width: '124px',
                    height: '4px',
                    backgroundColor: '#A83F68',
                    borderRadius: '100px',
                    marginTop: '6px'
                }}></div>
            </div>

        </div>
    );
}