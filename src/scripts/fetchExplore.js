import axios from "axios";
import fs from "fs-extra";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.YOUTUBE_API_KEY;

// 🎮 Güncel popüler oyun içerikleri
const GAME_KEYWORDS = [
  "valorant funny moments 2025",
  "valorant highlights 2025",
  "gta 6 gameplay 2025",
  "gta 5 funny moments 2025",
  "fortnite funny clips 2025",
  "minecraft builds 2025",
  "cs2 highlights 2025",
  "apex legends montage 2025",
  "call of duty modern warfare 3 funny 2025",
  "pubg mobile highlights 2025",
  "roblox funny moments 2025",
  "league of legends plays 2025",
  "fifa 25 goals and fails",
  "battlefield 2042 funny clips",
  "esports moments 2025",
  "gaming memes 2025",
  "trending gaming shorts 2025",
  "valorant montage best 2025",
  "popular fps games clips 2025",
  "gta 6 news trailer 2025"
];

const MAX_RESULTS = 15;
const DAILY_LIMIT = 200;
let allVideos = [];
let idCounter = 1;

const bannedWords = [
  "hindi", "indian", "pakistan", "urdu", "arabic",
  "music video", "official trailer", "karaoke", "song"
];

// 🔍 Popüler oyun videolarını getir
async function fetchVideos(keyword) {
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
        relevanceLanguage: "en",
        regionCode: "US"
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
  console.log("🚀 Popüler oyun videoları toplanıyor...");

  const filePath = "./src/data/explore.json";

  // 1️⃣ JSON dosyasını güvenli oku
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

  // 2️⃣ Her oyun türü için video çek
  for (const keyword of GAME_KEYWORDS) {
    if (videosFetched >= DAILY_LIMIT) break;
    const videos = await fetchVideos(keyword);

    for (const v of videos) {
      if (videosFetched >= DAILY_LIMIT) break;
      allVideos.push(v);
      videosFetched++;
    }
  }

  // 3️⃣ JSON olarak kaydet
  await fs.ensureDir("./src/data");
  await fs.writeJson(filePath, allVideos, { spaces: 2 });

  console.log(`✅ ${videosFetched} yeni oyun videosu eklendi. Toplam: ${allVideos.length}`);
}

main();
