import axios from "axios";
import fs from "fs-extra";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Fix: gerçek path oluşturma
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "..", "..", "public", "explore.json");

const API_KEY = process.env.YOUTUBE_API_KEY;

// 🇹🇷 Türkçe (%85)
const TURKISH_KEYWORDS = [
  // 🎮 Valorant & CS2 Yayıncıları – %40
  "elraenn valorant komik anlar 2025",
  "elraenn kısa edit yeni",
  "elraenn twitch komik klip 2025",
  "rreane komik klipler 2025",
  "rreane valorant clutch kısa",
  "cordi komik anlar 2025",
  "cordi edit valorant kısa",
  "wtcn komik anlar kısa 2025",
  "wtcn cs2 funny clips türkçe",
  "wtcn ekip komik kısa",
  "ferit valorant funny moments 2025",
  "ferit komik cs2 kısa",
  "jahrein komik twitch klip 2025",
  "jahrein kısa edit 2025",
  "miafitz komik klip kısa",
  "kaanflix komik anlar yeni kısa",
  "mitrain komik anlar kısa 2025",
  "berkakan komik klipler kısa",
  "laz ali komik twitch klip 2025",

  // 🎮 Genel oyun komik – %20
  "valorant komik kısa video 2025",
  "valorant meme edit türkçe",
  "valorant troll moments türkçe",
  "cs2 komik kısa anlar türkçe",
  "cs2 clutch edit kısa",
  "pubg funny moments türkçe 2025",
  "fortnite komik türkçe kısa",
  "gta 5 komik anlar türkçe kısa",
  "rocket league funny short türkçe",

  // 😂 Komik – Popüler – %15
  "komik kısa video 2025 türkçe",
  "günlük hayat komik kısa anlar",
  "trend komik kısa video türkiye",
  "tiktok komik montaj 2025 türkçe",
  "edit komik kısa türkçe",
  "hehe funny türkçe video kısa",
  "kedi komik kısa video türkçe",
  "köpek komik kısa video türkçe",
  "whatsapp komik video kısa",
  "meme komik kısa video türkçe",

  // 🏍 Motor (%5)
  "motor vlog kısa türkiye 2025",
  "bmw motor edit kısa türkçe",
  "süpersport komik kısa video",

  // 🚗 Araba (%3)
  "araba komik kısa video türkçe",
  "drift komik kısa video 2025",

  // 💡 Teknoloji (%2)
  "yapay zeka komik kısa video türkçe",
  "teknoloji gelişmeleri kısa türkçe"
];

// 🌍 İngilizce (%15)
const ENGLISH_KEYWORDS = [
  // 🎮
  "valorant funny clips short 2025",
  "valorant meme edit funny 2025",
  "valorant twitch clips short",
  "cs2 short highlights funny",
  "cs2 meme clips short",
  "fortnite funny shorts 2025",
  "gta 5 funny shorts new",
  "pubg funny short moments english",

  // 😂
  "funny memes 2025 shorts",
  "viral funny short video 2025",
  "daily funny moments shorts",
  "relatable memes short 2025",
  "funny tiktok compilation short",

  // 🧪
  "ai funny short clip",
  "technology funny short 2025",
  "science weird moments short",

  // 🏍
  "motorcycle short vlog funny",
];

const MAX_RESULTS = 25;
const DAILY_LIMIT = 250;
let allVideos = [];
let idCounter = 1;

const bannedWords = [
  "hindi",
  "indian",
  "pakistan",
  "urdu",
  "arabic",
  "music video",
  "official trailer",
  "karaoke",
  "song",
  "asmr",
  "reaction",
  "live",
  "full",
  "hour",
  "cover",
  "official",
];

async function fetchVideos(keyword, lang, region) {
  try {
    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        key: API_KEY,
        part: "snippet",
        type: "video",
        maxResults: MAX_RESULTS,
        q: keyword,
        videoDuration: "short",
        order: "viewCount",
        relevanceLanguage: lang,
        regionCode: region,
      },
    });

    const videos = response.data.items
      .filter(item => {
        const title = item.snippet.title.toLowerCase();
        return !bannedWords.some(word => title.includes(word));
      })
      .map(item => ({
        id: idCounter++,
        type: "video",
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails.high.url,
        duration: "short",
        tags: keyword.split(" "),
        seen: false,
        date: item.snippet.publishedAt,
      }));

    return videos;
  } catch (error) {
    console.error("⚠️ Hata:", error.message);
    return [];
  }
}

async function main() {
  console.log("🚀 Güncel popüler kısa videolar toplanıyor...");

  // Dosya varsa oku
  try {
    if (await fs.pathExists(filePath)) {
      const content = await fs.readFile(filePath, "utf8");
      if (content.trim()) {
        const existingData = JSON.parse(content);
        allVideos = Array.isArray(existingData) ? existingData : [];
        idCounter = allVideos.length > 0 ? Math.max(...allVideos.map(v => v.id)) + 1 : 1;
      }
    }
  } catch {
    console.log("⚠️ JSON okunamadı, sıfırdan başlatılıyor...");
    allVideos = [];
    idCounter = 1;
  }

  let videosFetched = 0;

  // 🇹🇷 Türk videoları (%85)
  for (const keyword of TURKISH_KEYWORDS) {
    if (videosFetched >= DAILY_LIMIT * 0.85) break;
    const videos = await fetchVideos(keyword, "tr", "TR");
    for (const v of videos) {
      if (videosFetched >= DAILY_LIMIT * 0.85) break;
      allVideos.push(v);
      videosFetched++;
    }
  }

  // 🌍 İngilizce videolar (%15)
  for (const keyword of ENGLISH_KEYWORDS) {
    if (videosFetched >= DAILY_LIMIT) break;
    const videos = await fetchVideos(keyword, "en", "US");
    for (const v of videos) {
      if (videosFetched >= DAILY_LIMIT) break;
      allVideos.push(v);
      videosFetched++;
    }
  }

  await fs.ensureFile(filePath);
  await fs.writeJson(filePath, allVideos, { spaces: 2 });

  console.log(`✅ ${videosFetched} yeni kısa video eklendi. Toplam: ${allVideos.length}`);
}

main();
