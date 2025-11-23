import fs from "fs-extra";
import path from "path";
import axios from "axios";

// Dosya yolu
const OUTPUT_FILE = "./public/pinterest.json";

// HER ÇALIŞTIRMADA EKLENECEK MİKTAR
const ADD_COUNT = 250; 

// Rastgele Tarih
const generateRandomDate = () => {
    const start = new Date(2024, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// --- YARDIMCI: MEVCUT DOSYAYI OKU VE SON ID'Yİ BUL ---
async function loadExistingData() {
    try {
        if (await fs.pathExists(OUTPUT_FILE)) {
            const raw = await fs.readFile(OUTPUT_FILE, "utf8");
            const data = JSON.parse(raw);
            
            // Eğer dosya doluysa en yüksek ID'yi bul
            let maxId = 0;
            if (Array.isArray(data) && data.length > 0) {
                // ID'ler string veya number olabilir, garantiye alalım
                maxId = data.reduce((max, item) => {
                    const currentId = parseInt(item.id);
                    return currentId > max ? currentId : max;
                }, 0);
            }
            
            console.log(`📂 Mevcut dosya okundu. ${data.length} öğe var. Son ID: ${maxId}`);
            return { existingData: data, nextId: maxId + 1 };
        }
    } catch (err) {
        console.log("⚠️ Dosya okunamadı veya yok, sıfırdan başlanacak.");
    }
    return { existingData: [], nextId: 1 };
}

// --- KAYNAK 1: IMGFLIP (Meme) ---
async function fetchMemes() {
    try {
        const res = await axios.get('https://api.imgflip.com/get_memes');
        if (res.data && res.data.success) {
            return res.data.data.memes.map(meme => ({
                image: meme.url,
                title: meme.name,
                category: "Humor",
                sourceType: "meme"
            }));
        }
    } catch (e) {
        console.log("⚠️ Meme API hatası.");
    }
    return [];
}

// --- KAYNAK 2: POLLINATIONS (AI PROMPTS) ---
const PINTEREST_PROMPTS = [
    "cozy aesthetic coffee shop interior autumn rain window",
    "cyberpunk street food stall neon lights night rain detailed",
    "minimalist beige living room luxury furniture plants",
    "delicious italian pizza cheese pull food photography",
    "cute fluffy golden retriever puppy playing in park",
    "fashion model street style paris vintage film look",
    "abstract colorful fluid acrylic painting detailed texture",
    "futuristic sci-fi spaceship landing on mars cinematic",
    "beautiful sunset over ocean waves tropical beach",
    "dark academia library old books candles mystery vibe",
    "luxury sports car red ferrari motion blur road",
    "japanese cherry blossom garden spring temple detailed",
    "funny cat wearing sunglasses cool vibes",
    "colorful candy shop interior sweets lollipops bright",
    "retro 80s vaporwave sunset palm trees aesthetic",
    "detailed macro photography of a blue eye",
    "snowy mountain cabin winter cozy fireplace night"
];

function generateAIPinterestImages(count) {
    const items = [];
    for (let i = 0; i < count; i++) {
        const prompt = PINTEREST_PROMPTS[Math.floor(Math.random() * PINTEREST_PROMPTS.length)];
        const seed = Math.floor(Math.random() * 99999999); // Benzersizlik için büyük sayı
        
        const encodedPrompt = encodeURIComponent(prompt);
        // seed parametresi sayesinde her resim farklı olur
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=1200&nologo=true&model=flux&seed=${seed}`;

        items.push({
            image: imageUrl,
            title: prompt.split(" ").slice(0, 3).join(" ") + "...",
            category: "Lifestyle/Aesthetic",
            sourceType: "photo"
        });
    }
    return items;
}

// --- ANA FONKSİYON ---
async function appendNewData() {
    // 1. Önce eski veriyi yükle
    const { existingData, nextId } = await loadExistingData();
    let currentIdCounter = nextId;

    console.log(`🚀 ${ADD_COUNT} adet YENİ içerik üretiliyor (ID ${currentIdCounter}'den başlayarak)...`);

    // 2. Meme'leri çek
    const rawMemes = await fetchMemes();
    
    // ÖNEMLİ: Zaten var olan meme'leri tekrar eklememek için filtrele
    // (URL'ye göre kontrol ediyoruz)
    const existingUrls = new Set(existingData.map(item => item.image));
    const uniqueMemes = rawMemes.filter(m => !existingUrls.has(m.image));
    
    // 3. AI ile tamamla
    // Eğer meme'lerin hepsi zaten varsa, tamamını AI ile dolduracağız.
    const neededAiCount = ADD_COUNT - uniqueMemes.length;
    // Eğer neededAiCount negatifse (çok fazla meme geldiyse) sadece ADD_COUNT kadar al
    const memesToUse = uniqueMemes.slice(0, ADD_COUNT);
    const aiCountToGenerate = Math.max(0, ADD_COUNT - memesToUse.length);

    const aiImages = generateAIPinterestImages(aiCountToGenerate);

    // 4. Yeni listeyi oluştur
    let newBatch = [...memesToUse, ...aiImages];

    // Karıştır
    newBatch = newBatch.sort(() => Math.random() - 0.5);

    // 5. Formatla ve ID ata
    const formattedNewBatch = newBatch.map(item => ({
        id: currentIdCounter++, // Kaldığı yerden devam et
        type: "image",
        title: item.title,
        image: item.image,
        source: "pinterest",
        meta: {
            category: item.category,
            tag: item.sourceType
        },
        createdAt: generateRandomDate()
    }));

    // 6. Birleştir
    const finalCollection = [...existingData, ...formattedNewBatch];

    // 7. Kaydet
    try {
        await fs.ensureDir(path.dirname(OUTPUT_FILE));
        await fs.writeJson(OUTPUT_FILE, finalCollection, { spaces: 2 });
        
        console.log(`\n✅ GÜNCELLEME BAŞARILI!`);
        console.log(`➕ Eklenen: ${formattedNewBatch.length} yeni görsel`);
        console.log(`📊 Toplam Dosya Boyutu: ${finalCollection.length} görsel`);
        console.log(`🔢 Son ID: ${currentIdCounter - 1}`);
    } catch (err) {
        console.error("Kayıt hatası:", err);
    }
}

appendNewData();