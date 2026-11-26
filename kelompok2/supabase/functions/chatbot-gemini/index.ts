const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GEMINI_MODELS = ["gemini-3.8-flash"];
const GEMINI_TIMEOUT_MS = 22000;
const RETRY_DELAYS_MS = [1500, 3000];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGeminiWithRetry(
  apiKey: string,
  systemInstruction: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>
): Promise<{ ok: boolean; status: number; data?: any; errorText?: string }> {
  let lastStatus = 502;
  let lastErrorText = "Gemini gagal memberikan jawaban";

  for (const model of GEMINI_MODELS) {
    const maxAttempts = RETRY_DELAYS_MS.length + 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemInstruction }],
              },
              contents,
              generationConfig: {
                temperature: 0.4,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          return { ok: true, status: 200, data };
        }

        lastStatus = response.status;
        lastErrorText = await response.text();
        console.warn(
          `Gemini API warning (${model}, attempt ${attempt + 1}/${maxAttempts}):`,
          response.status,
          lastErrorText
        );

        const isRetryable = response.status === 503 || response.status === 429;
        if (!isRetryable || attempt >= RETRY_DELAYS_MS.length) {
          return {
            ok: false,
            status: response.status,
            errorText: lastErrorText,
          };
        }

        await sleep(RETRY_DELAYS_MS[attempt]);
      } catch (err) {
        clearTimeout(timeoutId);
        const isAbort = err instanceof Error && err.name === "AbortError";
        lastStatus = isAbort ? 504 : 502;
        lastErrorText = err instanceof Error ? err.message : "Network error";
        console.warn(
          `Gemini fetch warning (${model}, attempt ${attempt + 1}/${maxAttempts}):`,
          lastErrorText
        );

        if (attempt >= RETRY_DELAYS_MS.length) {
          return {
            ok: false,
            status: lastStatus,
            errorText: lastErrorText,
          };
        }

        await sleep(RETRY_DELAYS_MS[attempt]);
      }
    }
  }

  return {
    ok: false,
    status: lastStatus,
    errorText: lastErrorText,
  };
}

function parseGeminiJson(rawText: string): {
  text?: unknown;
  recommendedIds?: unknown;
} {
  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return Response.json(
        { error: "Method tidak diizinkan" },
        { status: 405, headers: corsHeaders }
      );
    }

    const { message, catalog, history = [] } = await req.json();

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 2000
    ) {
      return Response.json(
        { error: "Pesan tidak valid" },
        { status: 400, headers: corsHeaders }
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY belum dikonfigurasi");
    }

    const safeCatalog = Array.isArray(catalog)
      ? catalog.slice(0, 30).map((item: any) => ({
          id: String(item.id),
          title: String(item.title),
          category: String(item.category),
          price: Number(item.price),
          sizeName: item.sizeName || "-",
        }))
      : [];

    const systemInstruction = `
Kamu adalah Asisten Buket AI untuk toko ra_scrafts.id.

Gunakan bahasa Indonesia yang ramah, natural, sopan,
dan mudah dipahami. Panggil pelanggan dengan sebutan kak.

Tugas kamu:
1. Membantu pelanggan memilih buket.
2. Memberikan rekomendasi berdasarkan budget.
3. Menjelaskan kategori dan harga produk.
4. Menjawab pertanyaan tentang custom buket.
5. Menjelaskan pembayaran dan pengambilan pesanan.

Aturan toko:
- Kategori tersedia: Bunga, Uang, Snack, Boneka.
- Pembayaran melalui transfer manual saat Checkout.
- Pelanggan mengambil pesanan langsung di toko.
- Custom dapat ditulis pada catatan Checkout.
- Jangan mengarang produk, harga, promo, atau informasi toko.
- Gunakan hanya produk dari katalog yang diberikan.
- Jika tidak ada produk yang cocok, jelaskan dengan jujur.
- Jika pertanyaan di luar toko, arahkan kembali ke topik buket.

Aturan tambahan percakapan:
1. Pahami konteks percakapan sebelumnya, jangan hanya membaca pesan terakhir.
2. Jika pelanggan menjawab "oke", "okey", "baik", "makasih", "terima kasih", atau "siap", berikan respons ramah dan natural.
3. Jangan menganggap pesan singkat seperti "oke", "iya", "boleh", dan "terima kasih" sebagai pertanyaan di luar topik.
4. Jika pelanggan menyetujui rekomendasi, tawarkan bantuan untuk melihat detail produk atau melanjutkan pemesanan.
5. Jika pelanggan mengatakan terima kasih, ucapkan kembali dengan ramah.
6. Jangan mengulang rekomendasi produk kecuali pelanggan memintanya.
7. Selalu gunakan riwayat percakapan untuk memahami maksud pelanggan.

Data katalog:
${JSON.stringify(safeCatalog)}

Balas hanya menggunakan JSON valid dengan format:
{
  "text": "Jawaban untuk pelanggan",
  "recommendedIds": []
}
`;

    const safeHistory = Array.isArray(history)
      ? history.slice(-8).map((item: any) => ({
          role: item.sender === "user" ? "user" : "model",
          parts: [{ text: String(item.text || "").slice(0, 1500) }],
        }))
      : [];

    const contents = [
      ...safeHistory,
      {
        role: "user",
        parts: [{ text: message.trim() }],
      },
    ];

    const geminiResult = await callGeminiWithRetry(
      apiKey,
      systemInstruction,
      contents
    );

    if (!geminiResult.ok || !geminiResult.data) {
      return Response.json(
        {
          error: "Gemini sedang sibuk atau gagal memberikan jawaban",
          details: geminiResult.errorText,
        },
        {
          status: geminiResult.status >= 400 ? geminiResult.status : 502,
          headers: corsHeaders,
        }
      );
    }

    const rawText =
      geminiResult.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.warn("Gemini response kosong:", geminiResult.data);
      throw new Error("Jawaban Gemini kosong");
    }

    const parsed = parseGeminiJson(rawText);

    const allowedIds = new Set(safeCatalog.map((item: any) => item.id));
    const recommendedIds = Array.isArray(parsed.recommendedIds)
      ? parsed.recommendedIds
          .map(String)
          .filter((id: string) => allowedIds.has(id))
          .slice(0, 5)
      : [];

    return Response.json(
      {
        text: String(
          parsed.text || "Maaf kak, coba tanyakan kembali ya 🌸"
        ),
        recommendedIds,
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.warn("Chatbot fallback trigger:", error);

    return Response.json(
      {
        error: "Terjadi kesalahan pada chatbot",
        details:
          error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});