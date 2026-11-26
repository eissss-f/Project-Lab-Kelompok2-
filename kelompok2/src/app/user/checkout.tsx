import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import {
  askGeminiForBuket,
  CatalogItem,
  FALLBACK_IMAGE,
  formatRupiah,
  getBotReplyPayloadFromIntent,
  mapIdsToCatalogItems,
  predictIntentFallback,
  tokenizeText,
} from '../../utils/chatbotHelper';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  recommendations?: CatalogItem[];
}

const QUICK_REPLIES = [
  'Harga buket budget 200 ribu',
  'Rekomendasi buket budget 100 ribu',
  'Cara pembayaran apa saja?',
  'Jadwal pengambilan di toko',
];

export default function ChatbotScreen() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Halo! Aku asisten virtual ra_scrafts.id 🌸 Mau cari buket untuk momen apa dan budget berapa kak?',
      sender: 'bot',
      recommendations: [],
    },
  ]);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const { data: productsData, error: prodErr } = await supabase
          .from('products')
          .select('id, title, category, photo, price')
          .order('id', { ascending: false });

        if (prodErr || !productsData) return;

        const { data: variantsData } = await supabase
          .from('product_variants')
          .select('product_id, size_name, price');

        const variants = variantsData ?? [];
        const items: CatalogItem[] = [];

        for (const prod of productsData) {
          const prodId = String(prod.id);
          const photoUrl = prod.photo || FALLBACK_IMAGE;
          const prodVariants = variants.filter(
            (v) => String(v.product_id) === prodId
          );

          if (prodVariants.length > 0) {
            for (const v of prodVariants) {
              const vPrice = Number(v.price) || 0;
              if (vPrice > 0) {
                items.push({
                  id: `${prodId}-${v.size_name}`,
                  productId: prodId,
                  title: prod.title,
                  category: prod.category,
                  price: vPrice,
                  formattedPrice: formatRupiah(vPrice),
                  imageUrl: photoUrl,
                  sizeName: v.size_name,
                });
              }
            }
          } else {
            const basePrice = Number(prod.price) || 0;
            if (basePrice > 0) {
              items.push({
                id: prodId,
                productId: prodId,
                title: prod.title,
                category: prod.category,
                price: basePrice,
                formattedPrice: formatRupiah(basePrice),
                imageUrl: photoUrl,
              });
            }
          }
        }

        setCatalog(items);
      } catch (err) {
        console.error('Gagal memuat data katalog untuk chatbot:', err);
      }
    };

    loadCatalog();
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/user' as any);
    }
  };

  const handleOpenDetail = (item: CatalogItem) => {
    router.push({
      pathname: '/user/DetailProduk',
      params: {
        id: item.productId,
        name: item.title,
        price: item.formattedPrice,
        imageUrl: item.imageUrl,
        category: item.category,
      },
    } as any);
  };

  const handleSend = async (customText?: string) => {
    const query = (customText ?? inputText).trim();
    if (!query || isSending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: query,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputText('');

    // Tokenisasi input menggunakan vocab.json (panjang 16)
    tokenizeText(query);

    const detectedIntent = predictIntentFallback(query);
    const replyPayload = getBotReplyPayloadFromIntent(
      detectedIntent,
      query,
      catalog
    );

    let finalText = replyPayload.text;
    let finalRecs = replyPayload.recommendations;

    const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
    if (replyPayload.shouldUseGemini && geminiApiKey) {
      setIsSending(true);
      try {
        const geminiRes = await askGeminiForBuket(query, catalog, geminiApiKey);
        if (geminiRes) {
          finalText = geminiRes.text;
          finalRecs = mapIdsToCatalogItems(geminiRes.recommendedIds, catalog);
        }
      } finally {
        setIsSending(false);
      }
    }
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: finalText,
      sender: 'bot',
      recommendations: finalRecs,
    };

    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={22} color="#A83F68" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Asisten Buket AI</Text>
          <Text style={styles.headerSub}>ra_scrafts.id • Konsultasi Cepat</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        renderItem={({ item }) => (
          <View style={styles.messageGroup}>
            <View
              style={[
                styles.bubble,
                item.sender === 'user' ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  item.sender === 'user' ? styles.userText : styles.botText,
                ]}
              >
                {item.text}
              </Text>
            </View>

            {item.sender === 'bot' &&
              item.recommendations &&
              item.recommendations.length > 0 && (
                <View style={styles.recsContainer}>
                  {item.recommendations.map((rec) => (
                    <TouchableOpacity
                      key={rec.id}
                      style={styles.recCard}
                      activeOpacity={0.85}
                      onPress={() => handleOpenDetail(rec)}
                    >
                      <Image
                        source={{ uri: rec.imageUrl || FALLBACK_IMAGE }}
                        style={styles.recImage}
                        resizeMode="cover"
                      />
                      <View style={styles.recInfo}>
                        <Text style={styles.recTitle} numberOfLines={1}>
                          {rec.title}
                        </Text>
                        {rec.sizeName ? (
                          <Text style={styles.recSize}>Ukuran: {rec.sizeName}</Text>
                        ) : null}
                        <Text style={styles.recPrice}>{rec.formattedPrice}</Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="#A83F68"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
          </View>
        )}
      />

      {isSending ? (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color="#A83F68" />
          <Text style={styles.typingText}>Asisten sedang mengetik...</Text>
        </View>
      ) : null}

      <View style={styles.quickContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={QUICK_REPLIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.quickChip}
              onPress={() => handleSend(item)}
            >
              <Text style={styles.quickText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Tanya rekomendasi buket..."
            placeholderTextColor="#A17B84"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={() => handleSend()}
            disabled={isSending}
          >
            <Ionicons name="send" size={18} color="#FFF8F0" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EED7D8',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8A6BD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'serif',
    fontSize: 18,
    fontWeight: '700',
    color: '#A83F68',
  },
  headerSub: { fontSize: 11, color: '#A17B84' },
  chatList: { padding: 16, gap: 12 },
  messageGroup: { gap: 8 },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#A83F68',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8A6BD',
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 13, lineHeight: 19 },
  userText: { color: '#FFF8F0' },
  botText: { color: '#49343C' },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  typingText: { fontSize: 11, color: '#A17B84', fontStyle: 'italic' },
  recsContainer: {
    maxWidth: '90%',
    gap: 8,
  },
  recCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8A6BD',
    borderRadius: 12,
    padding: 8,
    gap: 10,
  },
  recImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#F7E6E6',
  },
  recInfo: {
    flex: 1,
    gap: 2,
  },
  recTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#49343C',
  },
  recSize: {
    fontSize: 11,
    color: '#A17B84',
  },
  recPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A83F68',
  },
  quickContainer: { paddingHorizontal: 12, paddingVertical: 8 },
  quickChip: {
    backgroundColor: '#F7E6E6',
    borderWidth: 1,
    borderColor: '#E8A6BD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  quickText: { fontSize: 11, color: '#A83F68', fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EED7D8',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8A6BD',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: '#49343C',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#A83F68',
    alignItems: 'center',
    justifyContent: 'center',
  },
});