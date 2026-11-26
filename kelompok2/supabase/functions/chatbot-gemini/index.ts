
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GEMINI_MODEL = "gemini-2.5-flash";

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

    const { message, catalog, history = [] } =
      await req.json();

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
      ? catalog.slice(0, 50).map((item: any) => ({
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

Data katalog:
${JSON.stringify(safeCatalog)}

Balas hanya menggunakan JSON valid dengan format:
{
  "text": "Jawaban untuk pelanggan",
  "recommendedIds": []
}
`;

    const safeHistory = Array.isArray(history)
      ? history.slice(-10).map((item: any) => ({
          role: item.sender === "user" ? "user" : "model",
          parts: [{ text: String(item.text).slice(0, 2000) }],
        }))
      : [];

    const contents = [
      ...safeHistory,
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini error:", errorText);

      return Response.json(
        { error: "Gemini gagal memberikan jawaban" },
        { status: 502, headers: corsHeaders }
      );
    }

    const data = await response.json();

    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("Jawaban Gemini kosong");
    }

    const parsed = JSON.parse(rawText);

    const allowedIds = new Set(
      safeCatalog.map((item: any) => item.id)
    );

    const recommendedIds = Array.isArray(parsed.recommendedIds)
      ? parsed.recommendedIds
          .map(String)
          .filter((id: string) => allowedIds.has(id))
          .slice(0, 5)
      : [];

    return Response.json(
      {
        text: String(parsed.text || "Maaf kak, coba tanyakan kembali ya 🌸"),
        recommendedIds,
      },
      {
        headers: corsHeaders,
      }
    );

  } catch (error) {
    console.error("Chatbot error:", error);

    return Response.json(
      { error: "Terjadi kesalahan pada chatbot" },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
