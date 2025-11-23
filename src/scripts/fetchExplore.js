import axios from "axios";
import fs from "fs-extra";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.YOUTUBE_API_KEY;

// 🇹🇷 Türkçe (%85)
const TURKISH_KEYWORDS = [
  // 🎮 Oyun ağırlıklı (%30)
  "valorant komik anlar türkçe",
  "valorant kısa edit 2025 türkçe",
  "valorant meme türkiye",
  "cs2 komik anlar türkçe",
  "cs2 one tap highlights türkiye",
  "cs2 funny moments türkçe",
  "valorant troll anlar türkçe",
  "valorant clutch highlights 2025 türkiye",
  "cs2 efsane anlar 2025 türkçe",

  // 🎥 Elraenn ve Ekip Editleri (%30)
  "elraenn komik anlar edit 2025",
  "elraenn valorant edit türkiye",
  "rreane kısa edit 2025",
  "rreane komik anlar kısa",
  "cordi valorant komik kısa",
  "cordi edit 2025 türkiye",
  "wtcn funny moments türkiye",
  "ferit valorant edit 2025",
  "ferit komik anlar kısa",
  "jahrein valorant kısa video",
  "jahrein komik edit 2025",

  // 🎬 Diğer Yayıncı Editleri (%15)
  "miafitz kısa edit",
  "kaanflix komik kısa anlar",
  "pelin funny short türkiye",
  "mithrain clutch anlar 2025",
  "mithrain komik kısa edit 2025",

  // 🏍 Motor (%15)
  "motor vlog türkiye",
  "bmw motor vlog türkiye",
  "motor kazaları komik türkiye",
  "superbike kısa video türkiye",
  "süpersport motor edit 2025",

  // 🚗 Araba (azaltılmış, %5)
  "modifiye araba vlog türkçe",
  "araba komik kısa anlar türkiye",
  "drift kısa video türkiye",

  // 💡 Diğer (%5)
  "komik tiktok montaj türkçe",
  "günlük hayat komik kısa video türkiye",
  "teknoloji gelişmeleri 2025 türkiye",
  "yapay zeka haberleri türkiye",
];

// 🌍 İngilizce (%15)
const ENGLISH_KEYWORDS = [
  // 🎮 Oyun
  "valorant funny shorts 2025",
  "valorant meme edit 2025",
  "cs2 short highlights 2025",
  "cs2 funny short clips",
  "fortnite best short moments",

  // 🎥 Streamer Edits (Mixed)
  "elraenn valorant edit short",
  "rreane funny moments short",
  "twitch funny streamer clips 2025",
  "valorant streamer edits 2025",
  "funny gaming montage 2025",

  // 🏍 Motor
  "motorbike vlog short 2025",

  // 😂 Meme / Edit
  "funny memes shorts 2025",
  "daily funny short moments",
  "relatable meme short video",

  // 💡 Teknoloji
  "ai innovation short 2025",
  "science short clip 2025",
  "technology funny moments 2025",
];

const MAX_RESULTS = 25;
const DAILY_LIMIT = 250;
let allVideos = [];
let idCounter = 1;

const bannedWords = [
  "hindi", "indian", "pakistan", "urdu", "arabic",
  "music video", "official trailer", "karaoke", "song",
  "asmr", "reaction", "live", "full", "hour", "cover", "official"
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

  const filePath = "../../public/explore.json";

  try {
    if (await fs.pathExists(filePath)) {
      const content = await fs.readFile(filePath, "utf8");
      if (content.trim()) {
        const existingData = JSON.parse(content);
        allVideos = Array.isArray(existingData) ? existingData : [];
        idCounter = allVideos.length > 0 ? Math.max(...allVideos.map(v => v.id)) + 1 : 1;
      } else {
        allVideos = [];
        idCounter = 1;
      }
    } else {
      await fs.ensureFile(filePath);
      allVideos = [];
      idCounter = 1;
    }
  } catch {
    console.warn("⚠️ JSON okunamadı, sıfırdan başlatılıyor...");
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

  // 🌍 Yabancı videolar (%15)
  for (const keyword of ENGLISH_KEYWORDS) {
    if (videosFetched >= DAILY_LIMIT) break;
    const videos = await fetchVideos(keyword, "en", "US");

    for (const v of videos) {
      if (videosFetched >= DAILY_LIMIT) break;
      allVideos.push(v);
      videosFetched++;
    }
  }

  await fs.ensureDir("./src/data");
  await fs.writeJson(filePath, allVideos, { spaces: 2 });

  console.log(`✅ ${videosFetched} yeni kısa video eklendi. Toplam: ${allVideos.length}`);
}

main();
