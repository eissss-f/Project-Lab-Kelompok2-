import vocabData from '../../assets/chatbot/vocab.json';
import metricsData from '../../assets/chatbot/metrics.json';
import { supabase } from '../../lib/supabase';

interface MetricsJson {
  seq_len?: number;
  labels?: Record<string, number>;
}

const parsedMetrics = (metricsData ?? {}) as MetricsJson;
const parsedVocab = (vocabData ?? {}) as Record<string, number>;

export const SEQ_LEN = parsedMetrics.seq_len || 16;
export const vocab: Record<string, number> = parsedVocab;

export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80';

// Ganti sesuai nama Edge Function yang kamu deploy di Supabase
const GEMINI_EDGE_FUNCTION = 'chatbot-gemini';

export interface CatalogItem {
  id: string;
  productId: string;
  title: string;
  category: string;
  price: number;
  formattedPrice: string;
  imageUrl: string;
  sizeName?: string;
}

export interface BotReplyPayload {
  text: string;
  recommendations: CatalogItem[];
  shouldUseGemini?: boolean;
}

export interface GeminiReplyResult {
  text: string;
  recommendedIds: string[];
}

export const id2label: Record<number, string> = Object.entries(
  parsedMetrics.labels || {}
).reduce((acc, [label, id]) => {
  acc[Number(id)] = label;
  return acc;
}, {} as Record<number, string>);

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeText(text: string): Int32Array {
  const cleaned = normalizeText(text);
  const words = cleaned ? cleaned.split(' ') : [];
  const tokens = new Int32Array(SEQ_LEN);

  for (let i = 0; i < Math.min(words.length, SEQ_LEN); i++) {
    tokens[i] = vocab[words[i]] ?? 1;
  }

  return tokens;
}

export function extractContext(text: string) {
  const lower = normalizeText(text);
  const wordSet = new Set(lower.split(' ').filter(Boolean));

  const hasAny = (terms: string[]) =>
    terms.some((term) =>
      term.includes(' ') ? lower.includes(term) : wordSet.has(term)
    );

  let foundOccasion: string | undefined;
  if (
    hasAny([
      'pacar',
      'kepacar',
      'doi',
      'ayank',
      'sayang',
      'pasangan',
      'gebetan',
    ])
  ) {
    foundOccasion = 'diberikan ke pacar';
  } else if (hasAny(['wisuda', 'sidang', 'sempro', 'kelulusan'])) {
    foundOccasion = 'wisuda';
  } else if (hasAny(['ulang tahun', 'ultah', 'birthday', 'bday'])) {
    foundOccasion = 'ulang tahun';
  } else if (hasAny(['anniversary', 'anni', 'jadian'])) {
    foundOccasion = 'anniversary';
  } else if (hasAny(['lamaran', 'tunangan'])) {
    foundOccasion = 'lamaran';
  } else if (hasAny(['pernikahan', 'nikah', 'wedding'])) {
    foundOccasion = 'pernikahan';
  } else if (hasAny(['kelahiran', 'lahiran', 'bayi', 'baby'])) {
    foundOccasion = 'kelahiran';
  } else if (hasAny(['lebaran', 'idul fitri', 'valentine', 'natal', 'imlek'])) {
    foundOccasion = 'momen spesial';
  } else if (
    hasAny([
      'kado',
      'hadiah',
      'ngasih',
      'kasih',
      'surprise',
      'kejutan',
      'orang tua',
      'ibu',
      'ayah',
      'sahabat',
      'teman',
    ])
  ) {
    foundOccasion = 'hadiah spesial';
  }

  let budgetAmount: number | null = null;
  const shortMatch = lower.match(/\b(\d+)\s*(rb|ribu|k)\b/i);
  if (shortMatch) {
    budgetAmount = Number(shortMatch[1]) * 1000;
  } else {
    const fullMatch = lower.match(/\b(\d{5,7})\b/);
    if (fullMatch) {
      budgetAmount = Number(fullMatch[1]);
    }
  }

  const wantsMostExpensive =
    /\b(paling mahal|termahal|mahal sendiri|harga tertinggi|yang mahal|buket mahal)\b/.test(
      lower
    );
  const wantsCheapest =
    /\b(paling murah|termurah|murah sendiri|harga terendah|yang murah|buket murah)\b/.test(
      lower
    );

  const categories = ['bunga', 'uang', 'snack', 'boneka'];
  const foundCategory = categories.find((cat) => wordSet.has(cat));

  const buketMatch = lower.match(/\bbuket\s+([a-z0-9_]+)\b/);
  const requestedSubject = buketMatch?.[1];
  const knownNonItemWords = new Set([
    'yang',
    'paling',
    'termahal',
    'termurah',
    'mahal',
    'murah',
    'bagus',
    'bagusnya',
    'cocok',
    'keren',
    'cantik',
    'lucu',
    'mini',
    'besar',
    'jumbo',
    'sedang',
    'baru',
    'lain',
    'apa',
    'aja',
    'saja',
    'untuk',
    'buat',
    'wisuda',
    'ultah',
    'ulang',
    'anniversary',
    'lamaran',
    'nikah',
    'pernikahan',
    'pacar',
    'custom',
    'kado',
    'hadiah',
  ]);

  const hasClearShoppingIntent =
    Boolean(foundOccasion) ||
    Boolean(foundCategory) ||
    budgetAmount !== null ||
    wantsMostExpensive ||
    wantsCheapest;

  const hasUnknownItemRequest = Boolean(
    !hasClearShoppingIntent &&
      requestedSubject &&
      !categories.includes(requestedSubject) &&
      !knownNonItemWords.has(requestedSubject)
  );

  return {
    occasion: foundOccasion,
    budgetAmount,
    wantsMostExpensive,
    wantsCheapest,
    category: foundCategory,
    requestedSubject,
    hasUnknownItemRequest,
  };
}

export function predictIntentFallback(text: string): string {
  const cleaned = normalizeText(text);
  if (!cleaned) return 'salam';

  const words = cleaned.split(' ');

  const isIdentityQuestion =
    /\b(siapa kamu|kamu siapa|namamu siapa|kamu namanya siapa|nama kamu siapa|kamu bot|ai apa|ini siapa|perkenalkan dirimu)\b/.test(
      cleaned
    ) ||
    (words.includes('siapa') &&
      (words.includes('kamu') ||
        words.includes('namamu') ||
        words.includes('nama')));

  if (isIdentityQuestion) {
    return 'identitas_bot';
  }

  if (
    /\b(diskon|promo|potongan|cashback|gratis ongkir|grosir|beli banyak|beli 2|beli dua|beli lebih)\b/.test(
      cleaned
    )
  ) {
    return 'promo_diskon';
  }

  if (
    /\b(custom|kastem|request|rekues|warna|wrapping|kertas|kartu ucapan|ucapan|greeting card|tulisan|pita|cara custom)\b/.test(
      cleaned
    )
  ) {
    return 'custom_buket';
  }

  if (
    /\b(berapa lama|lama pengerjaan|estimasi|po|pre order|preorder|dadakan|hari ini jadi|sehari jadi|ready|stok)\b/.test(
      cleaned
    )
  ) {
    return 'estimasi_proses';
  }

  if (
    /\b(kirim|pengiriman|kurir|antar|diantar|ojol|gosend|grab|ongkir|cod)\b/.test(
      cleaned
    )
  ) {
    return 'pengiriman';
  }

  const isComparisonOrStoryQuestion =
    /\b(ceritain|cerita|bedanya|beda|bandingkan|dibanding|menurut|menurutmu|kenapa|mengapa|lebih cocok|lebih seru|kesannya|kesan)\b/.test(
      cleaned
    ) &&
    !/\b(harga|berapa|budget|rb|ribu|rp|paling mahal|paling murah|termahal|termurah)\b/.test(
      cleaned
    );

  if (isComparisonOrStoryQuestion) {
    return 'luar_konteks';
  }

  const {
    occasion,
    budgetAmount,
    wantsMostExpensive,
    wantsCheapest,
    hasUnknownItemRequest,
  } = extractContext(cleaned);

  if (
    budgetAmount !== null ||
    occasion ||
    wantsMostExpensive ||
    wantsCheapest
  ) {
    return 'rekomendasi';
  }

  if (hasUnknownItemRequest) {
    return 'luar_konteks';
  }

  const scores: Record<string, number> = {
    salam: 0,
    tanya_harga: 0,
    tanya_jenis: 0,
    rekomendasi: 0,
    jadwal_ambil: 0,
    pembayaran: 0,
    keluhan: 0,
  };

  const keywordMap: Record<string, { word: string; weight: number }[]> = {
    salam: [
      { word: 'halo', weight: 4 },
      { word: 'hai', weight: 4 },
      { word: 'pagi', weight: 3 },
      { word: 'siang', weight: 3 },
      { word: 'sore', weight: 3 },
      { word: 'malam', weight: 3 },
      { word: 'assalamualaikum', weight: 5 },
      { word: 'permisi', weight: 3 },
    ],
    pembayaran: [
      { word: 'pembayaran', weight: 6 },
      { word: 'bayar', weight: 6 },
      { word: 'transfer', weight: 6 },
      { word: 'seabank', weight: 5 },
      { word: 'dana', weight: 5 },
      { word: 'gopay', weight: 5 },
      { word: 'qris', weight: 5 },
      { word: 'ewallet', weight: 5 },
      { word: 'rekening', weight: 5 },
      { word: 'bukti', weight: 4 },
    ],
    jadwal_ambil: [
      { word: 'ambil', weight: 5 },
      { word: 'pengambilan', weight: 6 },
      { word: 'jadwal', weight: 5 },
      { word: 'jam', weight: 3 },
      { word: 'kapan', weight: 3 },
      { word: 'toko', weight: 3 },
      { word: 'buka', weight: 3 },
    ],
    keluhan: [
      { word: 'keluhan', weight: 6 },
      { word: 'komplain', weight: 6 },
      { word: 'rusak', weight: 5 },
      { word: 'lecek', weight: 5 },
      { word: 'refund', weight: 6 },
      { word: 'batal', weight: 4 },
      { word: 'salah', weight: 4 },
      { word: 'masalah', weight: 4 },
    ],
    tanya_harga: [
      { word: 'harga', weight: 5 },
      { word: 'berapa', weight: 4 },
      { word: 'kisaran', weight: 4 },
      { word: 'budget', weight: 5 },
      { word: 'murah', weight: 4 },
      { word: 'mahal', weight: 4 },
      { word: 'rb', weight: 4 },
      { word: 'ribu', weight: 4 },
      { word: 'rupiah', weight: 4 },
      { word: 'rp', weight: 4 },
    ],
    rekomendasi: [
      { word: 'rekomendasi', weight: 6 },
      { word: 'saran', weight: 5 },
      { word: 'pilihkan', weight: 5 },
      { word: 'cocok', weight: 5 },
      { word: 'bagusnya', weight: 5 },
      { word: 'bagus', weight: 3 },
      { word: 'hadiah', weight: 4 },
      { word: 'kado', weight: 4 },
      { word: 'ngasih', weight: 4 },
      { word: 'wisuda', weight: 4 },
      { word: 'lamaran', weight: 4 },
      { word: 'nikah', weight: 4 },
      { word: 'pernikahan', weight: 4 },
      { word: 'ultah', weight: 4 },
      { word: 'ulang', weight: 3 },
      { word: 'tahun', weight: 3 },
      { word: 'anniversary', weight: 4 },
      { word: 'kelahiran', weight: 4 },
    ],
    tanya_jenis: [
      { word: 'jenis', weight: 5 },
      { word: 'macam', weight: 4 },
      { word: 'katalog', weight: 5 },
      { word: 'bunga', weight: 4 },
      { word: 'uang', weight: 4 },
      { word: 'snack', weight: 4 },
      { word: 'boneka', weight: 4 },
      { word: 'ukuran', weight: 4 },
      { word: 'varian', weight: 4 },
      { word: 'kategori', weight: 5 },
    ],
  };

  for (const [intent, items] of Object.entries(keywordMap)) {
    for (const { word, weight } of items) {
      if (words.includes(word) || cleaned.includes(word)) {
        scores[intent] += weight;
      }
    }
  }

  let bestIntent = 'luar_konteks';
  let bestScore = 0;

  for (const [intent, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return bestScore > 0 ? bestIntent : 'luar_konteks';
}

export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function selectCatalogMatches(
  catalog: CatalogItem[],
  ctx: ReturnType<typeof extractContext>
): {
  items: CatalogItem[];
  mode: 'expensive' | 'cheapest' | 'budget' | 'category' | 'default';
  isExactBudgetMatch: boolean;
} {
  let validItems = catalog.filter((item) => item.price > 0);
  if (validItems.length === 0) {
    return { items: [], mode: 'default', isExactBudgetMatch: false };
  }

  if (ctx.category) {
    const byCat = validItems.filter(
      (item) =>
        item.category.toLowerCase().includes(ctx.category!) ||
        item.title.toLowerCase().includes(ctx.category!)
    );
    if (byCat.length > 0) {
      validItems = byCat;
    }
  }

  if (ctx.wantsMostExpensive) {
    const sortedDesc = [...validItems].sort((a, b) => b.price - a.price);
    return {
      items: sortedDesc.slice(0, 5),
      mode: 'expensive',
      isExactBudgetMatch: true,
    };
  }

  if (ctx.wantsCheapest) {
    const sortedAsc = [...validItems].sort((a, b) => a.price - b.price);
    return {
      items: sortedAsc.slice(0, 5),
      mode: 'cheapest',
      isExactBudgetMatch: true,
    };
  }

  if (ctx.budgetAmount !== null) {
    const withinBudget = validItems
      .filter((item) => item.price <= ctx.budgetAmount!)
      .sort((a, b) => b.price - a.price)
      .slice(0, 6);

    if (withinBudget.length > 0) {
      return {
        items: withinBudget,
        mode: 'budget',
        isExactBudgetMatch: true,
      };
    }

    const cheapest = [...validItems]
      .sort((a, b) => a.price - b.price)
      .slice(0, 5);

    return {
      items: cheapest,
      mode: 'budget',
      isExactBudgetMatch: false,
    };
  }

  return {
    items: [...validItems].sort((a, b) => a.price - b.price).slice(0, 6),
    mode: ctx.category ? 'category' : 'default',
    isExactBudgetMatch: true,
  };
}

export function getBotReplyPayloadFromIntent(
  intent: string,
  userMessage: string,
  catalog: CatalogItem[] = []
): BotReplyPayload {
  const ctx = extractContext(userMessage);

  if (ctx.hasUnknownItemRequest && ctx.requestedSubject) {
    return {
      text: `Maaf kak, untuk saat ini buket ${ctx.requestedSubject} belum tersedia di katalog ra_scrafts.id 🌸 Kategori buket yang tersedia adalah Bunga, Uang, Snack, dan Boneka.`,
      recommendations: [],
      shouldUseGemini: true,
    };
  }

  switch (intent) {
    case 'identitas_bot':
      return {
        text: 'Aku Asisten Buket AI dari ra_scrafts.id 🌸 Aku bisa bantu pilihkan buket untuk berbagai momen (pacar, wisuda, ulang tahun, anniversary, lamaran, pernikahan, atau budget tertentu), info harga, cara custom buket, jadwal ambil, maupun pembayaran.',
        recommendations: [],
      };

    case 'salam':
      return {
        text: 'Halo kak! Selamat datang di ra_scrafts.id 🌸 Mau cari buket untuk momen apa dan budget berapa kak?',
        recommendations: [],
      };

    case 'promo_diskon':
      return {
        text: 'Untuk saat ini harga buket mengikuti daftar harga resmi yang tampil di katalog & halaman Checkout ya kak 🌸 Kalau ada promo atau potongan pembelian jumlah banyak, infonya akan diumumkan langsung oleh admin toko.',
        recommendations: [],
      };

    case 'custom_buket':
      return {
        text: 'Iya, bisa kak! 🌸 Cara custom buketnya gampang banget:\n\n1. Pilih model/kategori buket yang kamu suka di Katalog (Bunga, Uang, Snack, atau Boneka).\n2. Di halaman Detail Produk, pilih ukuran varian yang diinginkan lalu masukkan ke Keranjang.\n3. Saat Checkout, tuliskan detail request custom kamu (seperti warna kertas wrapping, warna pita, atau isi kartu ucapan) pada kolom catatan sebelum menyelesaikan pesanan ya kak!',
        recommendations: [],
      };

    case 'estimasi_proses':
      return {
        text: 'Untuk ketersediaan dan waktu pengerjaan buket, kamu bisa langsung memilih tanggal serta jam pengambilan yang tersedia pada halaman Checkout ya kak 🌸 Disarankan memesan lebih awal supaya rangkaian lebih maksimal.',
        recommendations: [],
      };

    case 'pengiriman':
      return {
        text: 'Pemesanan di ra_scrafts.id menggunakan sistem pengambilan di toko sesuai tanggal dan jam yang dipilih saat Checkout ya kak, agar kondisi buket tetap rapi dan aman.',
        recommendations: [],
      };

    case 'pembayaran':
      return {
        text: 'Pembayaran menggunakan transfer manual ya kak. Nomor rekening / tujuan pembayaran akan tampil langsung di halaman saat kamu melakukan Checkout (CO), lalu tinggal unggah bukti transfernya.',
        recommendations: [],
      };

    case 'jadwal_ambil':
      return {
        text: 'Untuk jadwal pengambilan pesanan di toko, kamu bisa memilih tanggal dan jam pengambilan langsung pada halaman Checkout ya kak.',
        recommendations: [],
      };

    case 'keluhan':
      return {
        text: 'Mohon maaf atas kendala yang dialami kak 🙏 Silakan sampaikan detail pesanan atau kendalanya agar dapat segera dibantu.',
        recommendations: [],
      };

    case 'luar_konteks':
      return {
        text: 'Maaf kak, aku khusus membantu seputar buket di ra_scrafts.id 🌸 Coba tanyakan rekomendasi buket untuk momen apa saja (pacar, wisuda, ulang tahun, anniversary, atau budget tertentu), daftar harga, cara custom buket, jadwal ambil, atau pembayaran ya.',
        recommendations: [],
        shouldUseGemini: true,
      };

    case 'tanya_harga':
    case 'rekomendasi':
    case 'tanya_jenis': {
      const { items, mode, isExactBudgetMatch } = selectCatalogMatches(
        catalog,
        ctx
      );

      if (items.length === 0) {
        return {
          text: 'Saat ini belum ada data produk katalog yang tersedia di database ya kak.',
          recommendations: [],
        };
      }

      if (mode === 'expensive') {
        return {
          text: `Buket dengan harga tertinggi di katalog saat ini adalah ${items[0].title} (${formatRupiah(items[0].price)}). Berikut urutan buket dari harga tertinggi di katalog:`,
          recommendations: items,
        };
      }

      if (mode === 'cheapest') {
        return {
          text: `Buket dengan harga paling terjangkau di katalog saat ini adalah ${items[0].title} (${formatRupiah(items[0].price)}). Berikut daftar harga terendah di katalog:`,
          recommendations: items,
        };
      }

      if (ctx.budgetAmount !== null && !isExactBudgetMatch) {
        return {
          text: `Belum ada buket dengan harga maksimal ${formatRupiah(ctx.budgetAmount)} kak. Berikut pilihan buket dengan harga paling terjangkau di katalog (ketuk kartu untuk melihat detail):`,
          recommendations: items,
        };
      }

      const prefix = ctx.occasion ? `Untuk ${ctx.occasion}, ` : '';
      const budgetNote =
        ctx.budgetAmount !== null
          ? `yang masuk budget maksimal ${formatRupiah(ctx.budgetAmount)}`
          : ctx.category
            ? `kategori ${ctx.category}`
            : 'yang tersedia di katalog';

      return {
        text: `${prefix}berikut pilihan buket ${budgetNote} kak. Ketuk foto atau nama buket di bawah untuk membuka detail produk:`,
        recommendations: items,
      };
    }

    default:
      return {
        text: 'Maaf kak, aku khusus membantu seputar buket di ra_scrafts.id 🌸 Silakan tanya rekomendasi buket untuk momen apa saja, budget, cara custom buket, jadwal ambil, atau pembayaran ya.',
        recommendations: [],
        shouldUseGemini: true,
      };
  }
}

export function getBotResponseFromIntent(
  intent: string,
  userMessage: string,
  catalog: CatalogItem[] = []
): string {
  return getBotReplyPayloadFromIntent(intent, userMessage, catalog).text;
}

export function getBotResponse(
  predictedClassId: number,
  userMessage: string,
  catalog: CatalogItem[] = []
): string {
  const intent = id2label[predictedClassId] || predictIntentFallback(userMessage);
  return getBotResponseFromIntent(intent, userMessage, catalog);
}

export async function askGeminiForBuket(
  userMessage: string,
  catalog: CatalogItem[]
): Promise<GeminiReplyResult | null> {
  const compactCatalog = catalog.slice(0, 20).map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    sizeName: item.sizeName ?? '-',
    price: item.price,
  }));

  try {
    const { data, error } = await supabase.functions.invoke(
      GEMINI_EDGE_FUNCTION,
      {
        body: {
          message: userMessage,
          catalog: compactCatalog,
        },
      }
    );

    if (error || !data) {
      console.error('Supabase Edge Function Gemini error:', error);
      return null;
    }

    // Mendukung format { text, recommendedIds } maupun { reply, recommendedIds }
    const rawText: string =
      typeof data.text === 'string'
        ? data.text
        : typeof data.reply === 'string'
          ? data.reply
          : '';

    const allowedIds = new Set(catalog.map((c) => c.id));
    const recommendedIds = Array.isArray(data.recommendedIds)
      ? data.recommendedIds
          .map((id: unknown) => String(id))
          .filter((id: string) => allowedIds.has(id))
          .slice(0, 5)
      : [];

    return {
      text:
        rawText.trim() ||
        'Maaf kak, aku khusus membantu seputar buket di ra_scrafts.id 🌸',
      recommendedIds,
    };
  } catch (err) {
    console.error('Gagal memanggil Supabase Edge Function Gemini:', err);
    return null;
  }
}

export function mapIdsToCatalogItems(
  ids: string[],
  catalog: CatalogItem[]
): CatalogItem[] {
  const byId = new Map(catalog.map((item) => [item.id, item]));
  return ids
    .map((id) => byId.get(id))
    .filter((item): item is CatalogItem => Boolean(item))
    .map((item) => ({
      ...item,
      imageUrl: item.imageUrl || FALLBACK_IMAGE,
    }));
}