import axios from "axios";
import fs from "fs-extra";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.YOUTUBE_API_KEY;
const KEYWORDS = [
  "funny 2025",
  "comedy shorts",
  "valorant funny moments",
  "daily life vlog",
  "gaming highlights",
  "fails compilation",
  "funny cats 2025",
  "trending 2025"
];

const MAX_RESULTS = 10;
const DAILY_LIMIT = 500; // günlük çekilecek video sayısı
let allVideos = [];
let idCounter = 1;

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
        order: "date"
      },
    });

    const videos = response.data.items.map((item) => ({
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
  console.log("🚀 Videolar toplanıyor...");

  const filePath = "./src/data/explore.json";

  // 1️⃣ Var olan JSON'u oku ve idCounter ayarla
  if (await fs.pathExists(filePath)) {
    const existingData = await fs.readJson(filePath);
    allVideos = [...existingData];
    idCounter = Math.max(...existingData.map(v => v.id)) + 1;
  }

  let videosFetched = 0;

  // 2️⃣ Her keyword için video çek
  for (const keyword of KEYWORDS) {
    if (videosFetched >= DAILY_LIMIT) break;
    const videos = await fetchVideos(keyword);

    for (const v of videos) {
      if (videosFetched >= DAILY_LIMIT) break;
      allVideos.push(v);
      videosFetched++;
    }
  }

  // 3️⃣ JSON'a yaz
  await fs.ensureDir("./src/data");
  await fs.writeJson(filePath, allVideos, { spaces: 2 });

  console.log(`✅ Günlük ${videosFetched} yeni video eklendi. Toplam video sayısı: ${allVideos.length}`);
}

main();
