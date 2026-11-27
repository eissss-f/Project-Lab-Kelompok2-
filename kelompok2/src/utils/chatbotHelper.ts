import vocabData from '../../assets/chatbot/vocab.json';
import metricsData from '../../assets/chatbot/metrics.json';

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

export function extractBudgetAmount(text: string): number | null {
  const lower = normalizeText(text);

  // Format juta / jt, contoh: "1 juta", "1.5 juta", "1,5 jt"
  const jutaMatch = lower.match(/\b(\d+(?:[.,]\d+)?)\s*(juta|jt)\b/i);
  if (jutaMatch) {
    const num = Number(jutaMatch[1].replace(',', '.'));
    if (!Number.isNaN(num) && num > 0) {
      return Math.round(num * 1_000_000);
    }
  }

  // Format rb / ribu / k, contoh: "100 ribu", "200rb", "50k"
  const shortMatch = lower.match(/\b(\d+(?:[.,]\d+)?)\s*(rb|ribu|k)\b/i);
  if (shortMatch) {
    const num = Number(shortMatch[1].replace(',', '.'));
    if (!Number.isNaN(num) && num > 0) {
      return Math.round(num * 1_000);
    }
  }

  // Angka penuh 5-7 digit, contoh: "100000" atau "1000000"
  const fullMatch = lower.match(/\b(\d{5,7})\b/);
  if (fullMatch) {
    return Number(fullMatch[1]);
  }

  return null;
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

  const budgetAmount = extractBudgetAmount(lower);

  const wantsMostExpensive =
    /\b(paling mahal|termahal|mahal sendiri|harga tertinggi|yang mahal|buket mahal)\b/.test(
      lower
    );
  const wantsCheapest =
    /\b(paling murah|termurah|murah sendiri|harga terendah|yang murah|buket murah)\b/.test(
      lower
    );

  const categories = ['bunga', 'uang', 'snack', 'boneka'];
  const matchedCategories = categories.filter((cat) => wordSet.has(cat));
  const foundCategory =
    matchedCategories.length === 1 ? matchedCategories[0] : undefined;

  const buketMatch = lower.match(/\bbuket\s+([a-z0-9_]+)\b/);
  const requestedSubject = buketMatch?.[1];
  const knownNonItemWords = new Set([
    'yang',
    'paling',
    'termahal',
    'termurah',
    'mahal',
    'murah',
    'harga',
    'budget',
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
    matchedCategories.length > 0 ||
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
    comparedCategories:
      matchedCategories.length > 1 ? matchedCategories : undefined,
    requestedSubject,
    hasUnknownItemRequest,
  };
}

export function isGratitudeOrClosing(text: string): boolean {
  const cleaned = normalizeText(text);
  if (!cleaned) return false;

  const words = cleaned.split(' ').filter(Boolean);
  const hasThanks = /\b(makasih|terimakasih|terima kasih|thx|thanks|tq)\b/.test(
    cleaned
  );

  if (hasThanks) {
    return true;
  }

  const shortAckWords = new Set([
    'oke',
    'ok',
    'okey',
    'sip',
    'siap',
    'baik',
    'iya',
    'ya',
    'boleh',
    'mantap',
    'noted',
  ]);

  return words.length <= 3 && words.every((w) => shortAckWords.has(w));
}

export function predictIntentFallback(text: string): string {
  const cleaned = normalizeText(text);
  if (!cleaned) return 'salam';

  if (isGratitudeOrClosing(cleaned)) {
    return 'terima_kasih';
  }

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
    /\b(berapa lama|lama pengerjaan|estimasi|po|pre order|preorder|dadakan|hari ini jadi|sehari jadi|besok bisa jadi|besok jadi|ready|stok|pesan hari ini)\b/.test(
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

  const {
    occasion,
    budgetAmount,
    wantsMostExpensive,
    wantsCheapest,
    comparedCategories,
    hasUnknownItemRequest,
  } = extractContext(cleaned);

  if (
    budgetAmount !== null ||
    occasion ||
    wantsMostExpensive ||
    wantsCheapest ||
    comparedCategories
  ) {
    return 'rekomendasi';
  }

  const isComparisonOrStoryQuestion =
    /\b(ceritain|cerita|bedanya|beda|bandingkan|dibanding|menurut|menurutmu|kenapa|mengapa|lebih cocok|lebih seru|kesannya|kesan|mending)\b/.test(
      cleaned
    ) &&
    !/\b(harga|berapa|budget|rb|ribu|juta|jt|rp|paling mahal|paling murah|termahal|termurah|bunga|uang|snack|boneka)\b/.test(
      cleaned
    );

  if (isComparisonOrStoryQuestion) {
    return 'luar_konteks';
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
      { word: 'juta', weight: 5 },
      { word: 'jt', weight: 5 },
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
  mode:
    | 'expensive'
    | 'cheapest'
    | 'budget'
    | 'category'
    | 'compare'
    | 'default';
  isExactBudgetMatch: boolean;
} {
  let validItems = catalog.filter((item) => item.price > 0);
  if (validItems.length === 0) {
    return { items: [], mode: 'default', isExactBudgetMatch: false };
  }

  if (ctx.comparedCategories && ctx.comparedCategories.length > 0) {
    const picked: CatalogItem[] = [];
    const seenIds = new Set<string>();

    for (const cat of ctx.comparedCategories) {
      const catMatches = validItems
        .filter(
          (item) =>
            item.category.toLowerCase().includes(cat) ||
            item.title.toLowerCase().includes(cat)
        )
        .sort((a, b) => a.price - b.price)
        .slice(0, 2);

      for (const m of catMatches) {
        if (!seenIds.has(m.id)) {
          seenIds.add(m.id);
          picked.push(m);
        }
      }
    }

    if (picked.length > 0) {
      return {
        items: picked.slice(0, 5),
        mode: 'compare',
        isExactBudgetMatch: true,
      };
    }
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

    // Jika budget lebih besar dari semua produk di katalog (misal 1 juta), tetap tampilkan pilihan terbaik katalog
    const topOptions = [...validItems]
      .sort((a, b) => b.price - a.price)
      .slice(0, 5);

    return {
      items: topOptions,
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

  if (isGratitudeOrClosing(userMessage) || intent === 'terima_kasih') {
    return {
      text: 'Sama-sama kak 🌸 Senang bisa bantu pilihkan buket untuk kakak. Kalau masih butuh rekomendasi, info harga, atau cara custom, kabari saja ya!',
      recommendations: [],
    };
  }

  if (ctx.hasUnknownItemRequest && ctx.requestedSubject) {
    return {
      text: `Maaf ya kak, untuk buket ${ctx.requestedSubject} belum tersedia di katalog ra_scrafts.id 🌸 Saat ini kami menyediakan buket Bunga, Uang, Snack, dan Boneka. Kalau mau, kakak bisa sebutkan momen atau budget-nya biar aku bantu pilihkan.`,
      recommendations: [],
    };
  }

  switch (intent) {
    case 'identitas_bot':
      return {
        text: 'Aku Asisten Buket ra_scrafts.id 🌸 Aku bisa bantu merekomendasikan buket sesuai momen (wisuda, ulang tahun, pacar, anniversary, lamaran, pernikahan) atau budget kakak, sekalian info harga, cara custom, jadwal ambil, dan pembayaran.',
        recommendations: [],
      };

    case 'salam':
      return {
        text: 'Halo kak! Selamat datang di ra_scrafts.id 🌸 Mau cari buket untuk momen apa dan kisaran budget berapa kak?',
        recommendations: [],
      };

    case 'promo_diskon':
      return {
        text: 'Untuk harga buket saat ini mengacu pada daftar harga resmi di katalog dan halaman Checkout ya kak 🌸 Kalau ada promo atau potongan khusus pembelian jumlah banyak, biasanya diinformasikan langsung oleh admin toko.',
        recommendations: [],
      };

    case 'custom_buket':
      return {
        text: 'Bisa banget kak! 🌸 Cara custom buket di ra_scrafts.id:\n\n1. Pilih kategori buket yang diinginkan di Katalog (Bunga, Uang, Snack, atau Boneka).\n2. Di halaman Detail Produk, pilih ukuran varian lalu masukkan ke Keranjang.\n3. Saat Checkout, tulis request custom kakak (warna wrapping, pita, atau isi kartu ucapan) di kolom catatan pesanan ya.',
        recommendations: [],
      };

    case 'estimasi_proses':
      return {
        text: 'Untuk ketersediaan dan estimasi waktu pengerjaan, kakak bisa langsung cek serta pilih tanggal dan jam pengambilan di halaman Checkout ya kak 🌸 Sebaiknya pesan lebih awal supaya hasil rangkaian lebih maksimal.',
        recommendations: [],
      };

    case 'pengiriman':
      return {
        text: 'Pemesanan di ra_scrafts.id dilakukan dengan pengambilan langsung di toko sesuai jadwal tanggal dan jam yang kakak pilih saat Checkout, supaya buket tetap terjaga kerapiannya.',
        recommendations: [],
      };

    case 'pembayaran':
      return {
        text: 'Pembayaran dilakukan lewat transfer manual ya kak. Detail rekening/tujuan pembayaran akan muncul di halaman Checkout, lalu kakak tinggal unggah bukti transfernya.',
        recommendations: [],
      };

    case 'jadwal_ambil':
      return {
        text: 'Jadwal pengambilan pesanan bisa kakak tentukan langsung (tanggal dan jam yang tersedia) saat proses Checkout di aplikasi ya kak.',
        recommendations: [],
      };

    case 'keluhan':
      return {
        text: 'Mohon maaf atas ketidaknyamanan yang dialami kak 🙏 Boleh ceritakan detail pesanan atau kendalanya agar bisa segera ditindaklanjuti.',
        recommendations: [],
      };

    case 'luar_konteks':
      return {
        text: 'Maaf ya kak, aku fokus membantu seputar buket di ra_scrafts.id 🌸 Kakak bisa tanya rekomendasi buket untuk momen tertentu, kisaran budget, cara custom, jadwal ambil, atau pembayaran.',
        recommendations: [],
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
          text: 'Maaf kak, data produk di katalog belum tersedia saat ini. Coba muat ulang halaman atau cek kembali beberapa saat lagi ya.',
          recommendations: [],
        };
      }

      if (mode === 'compare' && ctx.comparedCategories) {
        const labelPair = ctx.comparedCategories.join(' maupun ');
        const occasionText = ctx.occasion ? ` untuk ${ctx.occasion}` : '';
        return {
          text: `Keduanya cocok kok kak${occasionText}—buket bunga memberi kesan manis dan klasik, sedangkan buket boneka lebih awet dijadikan kenang-kenangan 🌸 Berikut beberapa pilihan buket ${labelPair} yang bisa kakak cek (ketuk kartu untuk lihat detail):`,
          recommendations: items,
        };
      }

      if (mode === 'expensive') {
        return {
          text: `Untuk pilihan dengan harga tertinggi di katalog saat ini ada ${items[0].title} (${formatRupiah(items[0].price)}) 🌸 Berikut urutan buket dari harga tertinggi:`,
          recommendations: items,
        };
      }

      if (mode === 'cheapest') {
        return {
          text: `Untuk pilihan paling ramah di kantong saat ini ada ${items[0].title} (${formatRupiah(items[0].price)}) 🌸 Berikut buket dengan harga terendah di katalog:`,
          recommendations: items,
        };
      }

      if (ctx.budgetAmount !== null && !isExactBudgetMatch) {
        const highestPrice = Math.max(...catalog.map((c) => c.price || 0));
        if (ctx.budgetAmount > highestPrice) {
          return {
            text: `Dengan budget ${formatRupiah(ctx.budgetAmount)}, pilihan di katalog saat ini berada di bawah nominal tersebut dan bisa kakak sesuaikan atau request custom saat Checkout 🌸 Berikut rekomendasi buket terbaik di katalog:`,
            recommendations: items,
          };
        }

        return {
          text: `Belum ada buket pas di bawah ${formatRupiah(ctx.budgetAmount)} kak, tapi ini pilihan buket terbaik yang tersedia di katalog (ketuk kartu untuk melihat detail):`,
          recommendations: items,
        };
      }

      const prefix = ctx.occasion ? `Untuk ${ctx.occasion}, ` : '';
      const budgetNote =
        ctx.budgetAmount !== null
          ? `dengan budget maksimal ${formatRupiah(ctx.budgetAmount)}`
          : ctx.category
            ? `kategori ${ctx.category}`
            : 'di katalog';

      return {
        text: `${prefix}berikut rekomendasi buket ${budgetNote} yang bisa kakak pilih. Ketuk kartunya untuk melihat detail produk:`,
        recommendations: items,
      };
    }

    default:
      return {
        text: 'Maaf ya kak, aku fokus membantu seputar buket di ra_scrafts.id 🌸 Silakan tanya rekomendasi buket sesuai momen atau budget, cara custom, jadwal ambil, atau pembayaran.',
        recommendations: [],
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