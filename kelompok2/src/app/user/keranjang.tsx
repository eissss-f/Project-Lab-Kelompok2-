import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import {
    ArrowLeft,
    Trash2,
    Plus,
    Minus,
    ArrowRight,
} from 'lucide-react-native';

interface CartItem {
    id: number | string;
    name: string;
    variant: string;
    price: number;
    quantity: number;
    image: string;
    selected: boolean;
}

const ROSE = '#A83F68';
const PINK = '#E8A6BD';
const CREAM = '#FFF8F0';
const CART_STORAGE_KEY = '@ra_scrafts_cart';

const rupiah = (value: number) =>
    `Rp ${value.toLocaleString('id-ID')}`;

export default function KeranjangPage() {
    const router = useRouter();

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartLoaded, setIsCartLoaded] = useState(false);

    // Memuat data keranjang yang tersimpan dari AsyncStorage
    useEffect(() => {
        let isMounted = true;

        const loadCart = async () => {
            try {
                const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);

                if (savedCart !== null) {
                    const parsedCart: CartItem[] = JSON.parse(savedCart);

                    if (Array.isArray(parsedCart) && isMounted) {
                        setCartItems(parsedCart);
                    }
                }
            } catch (error) {
                console.warn('Gagal memuat keranjang:', error);
            } finally {
                if (isMounted) {
                    setIsCartLoaded(true);
                }
            }
        };

        loadCart();

        return () => {
            isMounted = false;
        };
    }, []);

    // Menyimpan perubahan keranjang ke AsyncStorage
    useEffect(() => {
        if (!isCartLoaded) return;

        const saveCart = async () => {
            try {
                await AsyncStorage.setItem(
                    CART_STORAGE_KEY,
                    JSON.stringify(cartItems),
                );
            } catch (error) {
                console.warn('Gagal menyimpan keranjang:', error);
            }
        };

        saveCart();
    }, [cartItems, isCartLoaded]);

    const isAllSelected =
        cartItems.length > 0 &&
        cartItems.every((item) => item.selected);

    // Mengambil item yang HANYA dicentang/dipilih saja
    const selectedItems = cartItems.filter((item) => item.selected);

    const totalBouquetsSelected = selectedItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
    );

    const totalPrice = selectedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    const toggleSelectAll = () => {
        setCartItems((items) =>
            items.map((item) => ({
                ...item,
                selected: !isAllSelected,
            })),
        );
    };

    const toggleSelectItem = (id: number | string) => {
        setCartItems((items) =>
            items.map((item) =>
                item.id === id
                    ? { ...item, selected: !item.selected }
                    : item,
            ),
        );
    };

    const updateQuantity = (id: number | string, delta: number) => {
        setCartItems((items) =>
            items.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        quantity: Math.max(1, item.quantity + delta),
                    }
                    : item,
            ),
        );
    };

    // Fungsi Hapus Produk dari Keranjang
   const removeItem = async (indexToRemove: number) => {
    const updatedItems = cartItems.filter(
        (_, index) => index !== indexToRemove
    );

    // Langsung perbarui tampilan keranjang
    setCartItems(updatedItems);

    // Simpan perubahan ke penyimpanan lokal
    try {
        await AsyncStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(updatedItems)
        );
    } catch (error) {
        console.error('Gagal menghapus produk:', error);
    }
};
    const handleCheckout = () => {
        if (!isCartLoaded) {
            Alert.alert('Mohon tunggu', 'Data keranjang sedang dimuat.');
            return;
        }

        if (selectedItems.length === 0) {
            Alert.alert(
                'Keranjang kosong',
                'Pilih setidaknya satu produk untuk checkout.',
            );
            return;
        }

        router.push({
            pathname: '/user/checkout',
            params: {
                cartItems: JSON.stringify(selectedItems),
            },
        });
    };

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/user/Katalog');
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Kembali"
                        onPress={handleBack}
                        style={styles.backButton}
                    >
                        <ArrowLeft color={ROSE} size={22} />
                    </Pressable>

                    <Text style={styles.title}>Keranjang Saya</Text>
                    <Text style={styles.brand}>ra_scrafts.id</Text>
                </View>

                {/* Pilih Semua */}
                <View style={styles.selectRow}>
                    <Pressable
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isAllSelected }}
                        onPress={toggleSelectAll}
                        style={styles.selectAllControl}
                    >
                        <View
                            style={[
                                styles.checkbox,
                                isAllSelected && styles.checkboxSelected,
                            ]}
                        >
                            {isAllSelected && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </View>

                        <Text style={styles.bodyText}>Pilih Semua</Text>
                    </Pressable>

                    <Text style={styles.muted}>
                        {selectedItems.length} produk dipilih
                    </Text>
                </View>

                {/* Daftar Produk */}
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                >
                    {cartItems.length === 0 ? (
                        <View style={styles.empty}>
                            <Text style={styles.productTitle}>
                                Keranjang masih kosong
                            </Text>

                            <Text style={styles.muted}>
                                Pilih buket dari halaman Produk.
                            </Text>
                        </View>
                    ) : (
                        cartItems.map((item, index) => (
                            <View
                                key={`${String(item.id ?? 'produk')}-${String(item.variant ?? 'default')}-${index}`}
                                style={styles.itemCard}
                            >
                                <Pressable
                                    accessibilityRole="checkbox"
                                    accessibilityLabel={`Pilih ${item.name}`}
                                    accessibilityState={{
                                        checked: item.selected,
                                    }}
                                    onPress={() => toggleSelectItem(item.id)}
                                    style={styles.itemCheckbox}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            item.selected &&
                                                styles.checkboxSelected,
                                        ]}
                                    >
                                        {item.selected && (
                                            <Text style={styles.checkmark}>
                                                ✓
                                            </Text>
                                        )}
                                    </View>
                                </Pressable>

                                <Image
                                    source={{ uri: item.image }}
                                    style={styles.productImage}
                                    resizeMode="cover"
                                />

                                <View style={styles.productInfo}>
                                    <Text style={styles.productTitle}>
                                        {item.name}
                                    </Text>

                                    <Text style={styles.variant}>
                                        {item.variant}
                                    </Text>

                                    <Text style={styles.price}>
                                        {rupiah(item.price)}
                                    </Text>

                                    <View style={styles.itemActions}>
                                        <View style={styles.quantityControl}>
                                            <Pressable
                                                accessibilityRole="button"
                                                accessibilityLabel={`Kurangi jumlah ${item.name}`}
                                                onPress={() =>
                                                    updateQuantity(item.id, -1)
                                                }
                                                style={styles.quantityButton}
                                            >
                                                <Minus
                                                    size={14}
                                                    color={ROSE}
                                                />
                                            </Pressable>

                                            <Text style={styles.quantity}>
                                                {item.quantity}
                                            </Text>

                                            <Pressable
                                                accessibilityRole="button"
                                                accessibilityLabel={`Tambah jumlah ${item.name}`}
                                                onPress={() =>
                                                    updateQuantity(item.id, 1)
                                                }
                                                style={[
                                                    styles.quantityButton,
                                                    styles.plusButton,
                                                ]}
                                            >
                                                <Plus
                                                    size={14}
                                                    color="#FFFFFF"
                                                />
                                            </Pressable>
                                        </View>

                                        {/* Tombol Hapus */}
                                        <Pressable
    onPress={() => {
        void removeItem(index);
    }}
    accessibilityRole="button"
    accessibilityLabel={`Hapus ${item.name}`}
    style={styles.deleteButton}
>
    <Trash2 size={18} color={ROSE} />
</Pressable>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>

                {/* Ringkasan Harga */}
                <View style={styles.summary}>
                    <View style={styles.summaryText}>
                        <Text style={styles.muted}>Total Harga</Text>

                        <Text style={styles.total}>
                            {rupiah(totalPrice)}
                        </Text>

                        <Text style={styles.small}>
                            {totalBouquetsSelected} buket dipilih
                        </Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        onPress={handleCheckout}
                        style={[
                            styles.checkoutButton,
                            (selectedItems.length === 0 || !isCartLoaded) &&
                                styles.checkoutButtonDisabled,
                        ]}
                    >
                        <Text style={styles.checkoutText}>Checkout</Text>
                        <ArrowRight color="#FFFFFF" size={18} />
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: CREAM },
    page: { flex: 1, backgroundColor: CREAM },
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EED7D8',
    },
    backButton: {
        position: 'absolute',
        left: 16,
        top: 14,
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1,
        borderColor: PINK,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: { color: ROSE, fontSize: 25, fontWeight: '600' },
    brand: { color: ROSE, fontSize: 12, marginTop: 2 },
    selectRow: {
        minHeight: 48,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectAllControl: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    checkbox: {
        width: 19,
        height: 19,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: PINK,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: { backgroundColor: PINK, borderColor: PINK },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        lineHeight: 16,
    },
    bodyText: { color: ROSE, fontSize: 13 },
    muted: { color: ROSE, fontSize: 11, opacity: 0.9 },
    scroll: { flex: 1 },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 12,
        gap: 12,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F0CED9',
        backgroundColor: '#FFFFFF',
        minHeight: 150,
    },
    itemCheckbox: { paddingTop: 4, paddingRight: 9 },
    productImage: {
        width: 98,
        height: 130,
        borderRadius: 12,
        backgroundColor: '#F7E6E6',
    },
    productInfo: {
        flex: 1,
        minWidth: 0,
        paddingLeft: 10,
        justifyContent: 'flex-start',
    },
    productTitle: {
        color: ROSE,
        fontSize: 17,
        fontWeight: '600',
        lineHeight: 21,
    },
    variant: { color: ROSE, fontSize: 10, marginTop: 3 },
    price: {
        color: ROSE,
        fontSize: 13,
        fontWeight: '700',
        marginTop: 5,
    },
    itemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto',
        paddingTop: 12,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0CED9',
        borderRadius: 8,
        overflow: 'hidden',
        height: 28,
    },
    quantityButton: {
        width: 23,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    plusButton: { backgroundColor: PINK },
    quantity: {
        minWidth: 28,
        textAlign: 'center',
        color: ROSE,
        fontSize: 12,
        fontWeight: '600',
    },
    deleteButton: { padding: 5 },
    summary: {
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 14,
        borderTopWidth: 1,
        borderTopColor: PINK,
        backgroundColor: CREAM,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    summaryText: { flex: 1 },
    total: {
        color: ROSE,
        fontSize: 20,
        fontWeight: '800',
        marginTop: 2,
    },
    small: { color: ROSE, fontSize: 10, marginTop: 2 },
    checkoutButton: {
        backgroundColor: ROSE,
        borderRadius: 13,
        paddingHorizontal: 17,
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    checkoutButtonDisabled: { opacity: 0.55 },
    checkoutText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
    empty: {
        padding: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        alignItems: 'center',
        gap: 8,
    },
});