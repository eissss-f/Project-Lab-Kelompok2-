import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

export interface CartItem {
    id: number | string;
    name: string;
    variant: string;
    price: number;
    quantity: number;
    qty?: number;
    image: string;
    selected: boolean;
}

const CART_STORAGE_KEY = 'ra_scrafts_cart_v1';
let inMemoryCart: CartItem[] = [];
const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((fn) => {
        try {
            fn();
        } catch {}
    });
}

export function loadCart(): CartItem[] {
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            const data = window.localStorage.getItem(CART_STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    return parsed
                        .filter((item) => item && typeof item.name === 'string' && item.name.trim() !== '')
                        .map((item) => {
                            const safeQty = Math.max(1, Math.floor(Number(item.quantity ?? item.qty ?? 1)) || 1);
                            const safePrice = Math.max(0, Number(item.price) || 0);
                            return {
                                ...item,
                                price: safePrice,
                                quantity: safeQty,
                                qty: safeQty,
                                selected: item.selected !== false,
                            };
                        });
                }
            }
        } catch {}
    }
    return inMemoryCart;
}

export function saveCart(items: CartItem[]) {
    inMemoryCart = items;
    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch {}
    }
    notify();
}

inMemoryCart = loadCart();

export function parsePrice(price: string | number): number {
    if (typeof price === 'number') return Number.isFinite(price) && price >= 0 ? price : 0;
    if (!price) return 0;
    const cleaned = price.toString().replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
}

export const cartActions = {
    addItem(newItem: {
        name: string;
        price: string | number;
        variant?: string;
        image?: string;
        quantity?: number;
    }) {
        if (!newItem.name || !String(newItem.name).trim()) return;

        const current = loadCart();
        const numPrice = parsePrice(newItem.price);
        if (numPrice < 0 || Number.isNaN(numPrice)) return;

        const variant = newItem.variant || 'Standard';
        const image = newItem.image || '';
        const qty =
            newItem.quantity && Number.isFinite(Number(newItem.quantity)) && Number(newItem.quantity) >= 1
                ? Math.floor(Number(newItem.quantity))
                : 1;

        const idx = current.findIndex((i) => i.name === newItem.name && i.variant === variant);
        let updated: CartItem[];
        if (idx > -1) {
            const newQty = current[idx].quantity + qty;
            updated = [...current];
            updated[idx] = {
                ...current[idx],
                price: numPrice > 0 ? numPrice : current[idx].price,
                quantity: newQty,
                qty: newQty,
                selected: true,
            };
        } else {
            const item: CartItem = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                name: newItem.name,
                variant,
                price: numPrice,
                quantity: qty,
                qty,
                image,
                selected: true,
            };
            updated = [item, ...current];
        }
        saveCart(updated);
    },

    updateQuantity(id: number | string, delta: number) {
        if (typeof delta !== 'number' || Number.isNaN(delta)) return;

        const current = loadCart();
        const updated = current.map((i) => {
            if (i.id === id) {
                const newQty = Math.max(1, Math.floor(i.quantity + delta));
                return { ...i, quantity: newQty, qty: newQty };
            }
            return i;
        });
        saveCart(updated);
    },

    toggleSelect(id: number | string) {
        const current = loadCart();
        const updated = current.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i));
        saveCart(updated);
    },

    toggleSelectAll(targetState: boolean) {
        const current = loadCart();
        const updated = current.map((i) => ({ ...i, selected: targetState }));
        saveCart(updated);
    },

    removeItem(id: number | string) {
        const current = loadCart();
        const updated = current.filter((i) => i.id !== id);
        saveCart(updated);
    },

    clearSelected() {
        const current = loadCart();
        const updated = current.filter((i) => !i.selected);
        saveCart(updated);
    },

    clearAll() {
        saveCart([]);
    },
};

export function useCart() {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => loadCart());

    useEffect(() => {
        setCartItems(loadCart());
        const listener = () => setCartItems([...loadCart()]);
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }, []);

    const isAllSelected = cartItems.length > 0 && cartItems.every((item) => item.selected);
    const selectedItems = cartItems.filter((item) => item.selected);
    const totalItemsSelected = selectedItems.length;
    const totalBouquetsSelected = selectedItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return {
        cartItems,
        selectedItems,
        isAllSelected,
        totalItemsSelected,
        totalBouquetsSelected,
        totalPrice,
        toggleSelectAll: () => cartActions.toggleSelectAll(!isAllSelected),
        toggleSelectItem: cartActions.toggleSelect,
        updateQuantity: cartActions.updateQuantity,
        removeItem: cartActions.removeItem,
        clearSelectedItems: cartActions.clearSelected,
        clearCart: cartActions.clearAll,
    };
}

export default function KeranjangPage({ onNavigateToCheckout }: { onNavigateToCheckout?: () => void }) {
    const router = useRouter();
    const params = useLocalSearchParams<{
        name?: string;
        price?: string;
        variant?: string;
        image?: string;
        imageUrl?: string;
        quantity?: string;
    }>();

    // State validasi konfirmasi hapus & notifikasi dalam aplikasi
    const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
    const [alertMessage, setAlertMessage] = useState<string>('');

    useEffect(() => {
        if (params.name && params.name.trim()) {
            const parsedQty = params.quantity ? parseInt(params.quantity, 10) : 1;
            cartActions.addItem({
                name: params.name.trim(),
                price: params.price || 0,
                variant: params.variant || 'Standard',
                image: params.imageUrl || params.image || '',
                quantity: Number.isInteger(parsedQty) && parsedQty >= 1 ? parsedQty : 1,
            });
        }
    }, [params.name, params.price, params.variant, params.quantity]);

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

    const {
        cartItems,
        selectedItems,
        isAllSelected,
        totalItemsSelected,
        totalBouquetsSelected,
        totalPrice,
        toggleSelectAll,
        toggleSelectItem,
        updateQuantity,
        removeItem
    } = useCart();

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            setAlertMessage('Silakan pilih minimal 1 produk untuk checkout.');
            return;
        }

        const hasInvalidItem = selectedItems.some(
            (item) =>
                !item.name ||
                !item.name.trim() ||
                item.quantity < 1 ||
                Number.isNaN(item.price) ||
                item.price <= 0
        );

        if (hasInvalidItem || totalPrice <= 0) {
            setAlertMessage('Terdapat produk dengan harga atau jumlah yang tidak valid.');
            return;
        }

        if (onNavigateToCheckout) {
            onNavigateToCheckout();
        } else {
            try {
                router.push('./checkout');
            } catch (e) {
                console.log('Navigating to checkout...', e);
            }
        }
    };

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;
        removeItem(itemToDelete.id);
        setItemToDelete(null);
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
            width: '100%',
            flex: 1,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FFF8F0',
            fontFamily: "'Poppins', sans-serif",
            boxSizing: 'border-box',
            overflow: 'hidden',
            position: 'relative'
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
                            onClick={() => router.push('./Katalog')}
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
                            {item.image ? (
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
                            ) : (
                                <div style={{
                                    width: '76px',
                                    height: '92px',
                                    borderRadius: '16px',
                                    backgroundColor: '#F7E6E6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px',
                                    flexShrink: 0
                                }}>🌸</div>
                            )}

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
                                        onClick={() => setItemToDelete(item)}
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

            {/* Popup Konfirmasi Hapus Produk */}
            {itemToDelete && (
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
                        maxWidth: '320px',
                        textAlign: 'center',
                        boxShadow: '0 10px 30px rgba(168, 63, 104, 0.25)',
                        border: '1px solid #E8A6BD',
                        boxSizing: 'border-box'
                    }}>
                        <h3 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#A83F68',
                            margin: '0 0 8px 0'
                        }}>
                            Hapus Produk?
                        </h3>
                        <p style={{
                            fontSize: '12px',
                            color: '#A83F68',
                            lineHeight: 1.5,
                            margin: '0 0 18px 0',
                            opacity: 0.85
                        }}>
                            Apakah Anda yakin ingin menghapus <strong>{itemToDelete.name}</strong> ({itemToDelete.variant}) dari keranjang?
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setItemToDelete(null)}
                                style={{
                                    flex: 1,
                                    backgroundColor: 'transparent',
                                    color: '#A83F68',
                                    border: '1px solid #E8A6BD',
                                    padding: '10px',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#A83F68',
                                    color: '#FFF8F0',
                                    border: 'none',
                                    padding: '10px',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }}
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup Notifikasi Validasi Checkout */}
            {alertMessage && (
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
                        maxWidth: '320px',
                        textAlign: 'center',
                        boxShadow: '0 10px 30px rgba(168, 63, 104, 0.25)',
                        border: '1px solid #E8A6BD',
                        boxSizing: 'border-box'
                    }}>
                        <h3 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#A83F68',
                            margin: '0 0 8px 0'
                        }}>
                            Perhatian
                        </h3>
                        <p style={{
                            fontSize: '12px',
                            color: '#A83F68',
                            lineHeight: 1.5,
                            margin: '0 0 18px 0',
                            opacity: 0.85
                        }}>
                            {alertMessage}
                        </p>
                        <button
                            onClick={() => setAlertMessage('')}
                            style={{
                                width: '100%',
                                backgroundColor: '#A83F68',
                                color: '#FFF8F0',
                                border: 'none',
                                padding: '10px',
                                borderRadius: '12px',
                                fontWeight: 600,
                                fontSize: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}