import axios from "axios";
import fs from "fs-extra";
import dotenv from "dotenv";
dotenv.config();

const OUTPUT_FILE = "./src/data/ai-images.json";
// GÜNCELLENDİ: Toplam hedef yerine, her çalıştırmada ne kadar ekleneceğini .env'den okuyoruz.
const FETCH_COUNT_PER_RUN = parseInt(process.env.FETCH_COUNT_PER_RUN || "50", 10);
const PAGE_SIZE = 50;

let collected = [];
let existingUrls = new Set();
let idCounter = 1;

// --- Mevcut Dosyayı Yükleme Fonksiyonu (Değişiklik Yok) ---
async function loadExisting() {
  try {
    if (await fs.pathExists(OUTPUT_FILE)) {
      const raw = await fs.readFile(OUTPUT_FILE, "utf8");
      if (raw.trim()) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          collected = arr;
          for (const it of arr) if (it.image) existingUrls.add(it.image);
          const maxId = arr.reduce((m, it) => (it.id && it.id > m ? it.id : m), 0);
          idCounter = maxId + 1;
          console.log(`📂 Mevcut dosya yüklendi: ${arr.length} öğe. ID ${idCounter} dan devam edilecek.`);
          return;
        }
      }
    }
  } catch (err) {
    console.warn("Mevcut dosya okunamadı, sıfırdan başlanıyor.", err.message);
  }
  collected = [];
  idCounter = 1;
}

// --- Veriyi Dosyaya Yazma Fonksiyonu (Değişiklik Yok) ---
async function persist() {
  await fs.ensureDir("./src/data");
  await fs.writeJson(OUTPUT_FILE, collected, { spaces: 2 });
}

// --- Civitai Veri Normalleştirme Fonksiyonu (Değişiklik Yok) ---
function normalizeCivitaiItem(it) {
  return {
    title: "AI image from Civitai",
    image: it.url,
    source: "civitai",
    meta: {},
    createdAt: new Date().toISOString(),
  };
}

// --- Civitai Veri Çekme Fonksiyonu (Değişiklik Yok) ---
async function fetchFromCivitai(limit = 50, cursor = null) {
  try {
    const params = { limit, sort: "Newest" };
    if (cursor) params.cursor = cursor;
    const url = "https://civitai.com/api/v1/images";
    const res = await axios.get(url, { params, timeout: 20000 });
    return { items: res.data.items || [], nextCursor: res.data.metadata?.nextCursor || null };
  } catch (err) {
    console.error(`❌ CivitAI getirme hatası: ${err.message}`);
    return { items: [], nextCursor: null };
  }
}

// --- GÜNCELLENDİ: Ana Veri Toplama Fonksiyonu ---
async function gather() {
  await loadExisting();

  // YENİ: Hedef mesajı güncellendi.
  console.log(`🎯 Hedef: Bu çalışmada ${FETCH_COUNT_PER_RUN} yeni görsel bulup eklemek.`);

  let cursor = null;
  let consecutiveEmptyFetches = 0;
  // YENİ: Bu çalıştırmada kaç tane eklendiğini saymak için bir sayaç.
  let newlyAddedInThisRun = 0;

  // GÜNCELLENDİ: Döngü koşulu artık toplam hedefe değil, bu çalıştırmada eklenen adede bakıyor.
  while (newlyAddedInThisRun < FETCH_COUNT_PER_RUN && consecutiveEmptyFetches < 5) {
    console.log("🔍 Civitai kaynağından yeni görseller çekiliyor...");
    
    const { items, nextCursor } = await fetchFromCivitai(PAGE_SIZE, cursor);
    
    if (items.length === 0) {
      consecutiveEmptyFetches++;
      console.log(`⚠️ API'den veri gelmedi. Boş sonuç sayacı: ${consecutiveEmptyFetches}`);
      continue; // Bu döngüyü atla ve bir sonrakine geç
    }

    let foundInPage = 0;
    for (const item of items) {
      const normalizedItem = normalizeCivitaiItem(item);
      if (normalizedItem.image && !existingUrls.has(normalizedItem.image)) {
        collected.push({
          id: idCounter++,
          type: "image",
          ...normalizedItem
        });
        existingUrls.add(normalizedItem.image);
        newlyAddedInThisRun++; // YENİ: Yeni eklenenleri say.
        foundInPage++;
        
        // GÜNCELLENDİ: Döngüden çıkma koşulu değişti.
        if (newlyAddedInThisRun >= FETCH_COUNT_PER_RUN) break;
      }
    }

    if (foundInPage > 0) {
      console.log(`➕ ${foundInPage} yeni öğe eklendi. (Bu Çalıştırmada Toplam: ${newlyAddedInThisRun}/${FETCH_COUNT_PER_RUN} | Genel Toplam: ${collected.length})`);
      await persist();
      consecutiveEmptyFetches = 0;
    } else {
      console.log(`⚠️ Bu sayfadaki tüm görseller zaten mevcut. Yeni öğe eklenmedi.`);
      consecutiveEmptyFetches++;
    }

    cursor = nextCursor;
    if (!cursor) {
      console.log("ℹ️ Civitai'de daha fazla yeni gönderi bulunamadı. İşlem sonlandırılıyor.");
      break;
    }

    // GÜNCELLENDİ: Döngüden çıkma koşulu değişti.
    if (newlyAddedInThisRun >= FETCH_COUNT_PER_RUN) break;

    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n✅ İşlem tamamlandı. Bu çalıştırmada ${newlyAddedInThisRun} yeni görsel eklendi.`);
  console.log(`📁 Dosyadaki toplam görsel sayısı: ${collected.length}`);
  await persist();
}

// --- Ana Çalıştırma Bloğu (Değişiklik Yok) ---
(async () => {
  try {
    await gather();
  } catch (err) {
    console.error("Beklenmeyen bir genel hata oluştu:", err);
  }
})();