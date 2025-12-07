import axios from "axios";
import fs from "fs-extra";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

const CATEGORIES = {
  turkish: [
    "Turkey", "Turkiye", "elraenn", "twitchclips",
    "burdurland", "hort", "ZargoryanGalaksisi",
    "KGBTR", "TurkeyJerky", "akagas", "Jaharia",
    "PqueeN", "veYakinEvren", "SorReddite",
    "trgamers", "gecekeyfi", "Ankara",
    "istanbul", "Izmir", "Galatasaray",
    "FenerbahceSK", "besiktas"
  ],
  english: [
    "memes", "funny", "gaming", "dankmemes",
    "wholesomememes", "VALORANT", "cs2",
    "leagueoflegends", "gtaonline", "pics",
    "gifs", "Unexpected", "me_irl", "aww",
    "MadeMeSmile", "interestingasfuck",
    "Damnthatsinteresting", "nextfuckinglevel",
    "BeAmazed", "mildlyinteresting",
    "oddlysatisfying", "dataisbeautiful",
    "Art", "food", "pUbG", "pcmasterrace",
    "Minecraft", "Whatcouldgowrong",
    "therewasanattempt", "IdiotsInCars",
    "AnimalsBeingDerps", "EldenRing",
    "Overwatch"
  ],
};

// Ayarlar
const TOTAL_TARGET_POSTS = 200;
const TURKISH_CONTENT_RATIO = 0.7;
const LIMIT_PER_SUB = 100;

// Global değişkenler
let allPosts = [];
let idCounter = 1;
let existingPostPermalinks = new Set();

const bannedWords = [
  "nsfw", "18+", "porn", "politic", "gore",
  "blood", "violence", "trump", "israel",
  "palestine", "war", "death"
];

// 🔥 Tüm türleri destekleyen gelişmiş Reddit post parser
function parsePost(p, subreddit) {
  const base = {
    title: p.title,
    author: p.author,
    subreddit,
    ups: p.ups,
    permalink: p.permalink,
    createdAt: new Date(p.created_utc * 1000).toISOString(),
    seen: false,
  };

  // Direct image
  if (p.url_overridden_by_dest?.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return { ...base, type: "image", url: p.url_overridden_by_dest };
  }

  // GIFV → MP4
  if (p.url_overridden_by_dest?.endsWith(".gifv")) {
    return {
      ...base,
      type: "video",
      url: p.url_overridden_by_dest.replace(".gifv", ".mp4"),
    };
  }

  // Reddit video
  if (p.is_video && p.media?.reddit_video) {
    const v = p.media.reddit_video.fallback_url;
    const audio = v.replace(/DASH_[\d_]+\.mp4/, "DASH_audio.mp4");

    return {
      ...base,
      type: "video",
      url: v,
      audio_url: audio,
      is_reddit_video: true,
    };
  }

  // Rich video fallback
  if (p.post_hint === "rich:video" && p.preview?.reddit_video_preview) {
    return {
      ...base,
      type: "video",
      url: p.preview.reddit_video_preview.fallback_url,
      audio_url: null,
      is_reddit_video: false,
    };
  }

  // Gallery (çoklu resim)
  if (p.gallery_data && p.media_metadata) {
    const images = Object.values(p.media_metadata)
      .map(i => i.s?.u?.replace(/&amp;/g, "&"))
      .filter(Boolean);

    if (images.length) {
      return { ...base, type: "gallery", images };
    }
  }

  // Preview image fallback
  if (p.preview?.images?.[0]?.source?.url) {
    return {
      ...base,
      type: "image",
      url: p.preview.images[0].source.url.replace(/&amp;/g, "&"),
    };
  }

  // Self post
  if (p.is_self && p.selftext?.length > 20) {
    return { ...base, type: "text", text: p.selftext };
  }

  // External link (imgur/giphy/youtube)
  if (p.post_hint === "link" && p.url_overridden_by_dest) {
    return {
      ...base,
      type: "external",
      url: p.url_overridden_by_dest,
    };
  }

  return null;
}

// Reddit'ten gönderi çek
async function fetchRedditPosts(subreddit, min_upvotes) {
  const url = `https://www.reddit.com/r/${subreddit}/top.json?limit=${LIMIT_PER_SUB}&t=year`;

  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 8000
    });

    const filtered = data.data.children.filter(post =>
      post.data.ups >= min_upvotes &&
      !bannedWords.some(w => post.data.title.toLowerCase().includes(w)) &&
      !existingPostPermalinks.has(post.data.permalink)
    );

    const posts = filtered
      .map(p => parsePost(p.data, subreddit))
      .filter(Boolean);

    return posts;

  } catch (err) {
    console.warn(`⚠️ r/${subreddit} hata: ${err.message}`);
    return [];
  }
}

// Belirli kategori için gönderi topla
async function fetchPostsForCategory({ subreddits, targetCount, categoryName, minUpvotes }) {
  console.log(`\n--- ${categoryName} Başlıyor (${targetCount}) ---`);

  let list = [];

  for (const sub of subreddits.sort(() => 0.5 - Math.random())) {
    if (list.length >= targetCount) break;

    console.log(`📥 r/${sub} (${list.length}/${targetCount})`);

    const fetched = await fetchRedditPosts(sub, minUpvotes);

    for (const post of fetched) {
      if (list.length >= targetCount) break;

      if (!existingPostPermalinks.has(post.permalink)) {
        post.id = idCounter++;
        list.push(post);
        existingPostPermalinks.add(post.permalink);
      }
    }
  }

  console.log(`✔ ${categoryName} tamamlandı → ${list.length}`);
  return list;
}

// Ana program
async function main() {
  const filePath = path.resolve(process.cwd(), "public", "memes.json");

  // Var olan dosya varsa yükle
  try {
    if (await fs.pathExists(filePath)) {
      const content = await fs.readFile(filePath, "utf8");
      if (content.trim()) {
        allPosts = JSON.parse(content);
        idCounter = Math.max(...allPosts.map(p => p.id || 0), 0) + 1;
        existingPostPermalinks = new Set(allPosts.map(p => p.permalink));
        console.log(`📂 Mevcut ${allPosts.length} gönderi bulundu. Son ID: ${idCounter - 1}`);
      }
    }
  } catch (e) {
    console.warn("⚠ memes.json okunamadı. Yeni oluşturulacak.");
  }

  const turkishTarget = Math.floor(TOTAL_TARGET_POSTS * TURKISH_CONTENT_RATIO);
  const englishTarget = TOTAL_TARGET_POSTS - turkishTarget;

  const turkishSettings = {
    subreddits: CATEGORIES.turkish,
    targetCount: turkishTarget,
    categoryName: "Türkçe Eğlence",
    minUpvotes: 40,
  };

  const englishSettings = {
    subreddits: CATEGORIES.english,
    targetCount: englishTarget,
    categoryName: "İngilizce Eğlence",
    minUpvotes: 150,
  };

  console.log(`\n🚀 Hedef: ${TOTAL_TARGET_POSTS} gönderi (TR: ${turkishTarget} | EN: ${englishTarget})\n`);

  const [tr, en] = await Promise.all([
    fetchPostsForCategory(turkishSettings),
    fetchPostsForCategory(englishSettings),
  ]);

  let newPosts = [...tr, ...en];
  console.log(`\n🔍 Toplam yeni gönderi: ${newPosts.length}`);

  // Eksikleri tamamla
  if (newPosts.length < TOTAL_TARGET_POSTS) {
    console.log(`🔁 Eksik var. Tamamlanıyor...`);

    const allSubs = [...CATEGORIES.turkish, ...CATEGORIES.english];

    for (const sub of allSubs.sort(() => 0.5 - Math.random())) {
      if (newPosts.length >= TOTAL_TARGET_POSTS) break;

      const fetched = await fetchRedditPosts(sub, 20);

      for (const post of fetched) {
        if (newPosts.length >= TOTAL_TARGET_POSTS) break;
        if (!existingPostPermalinks.has(post.permalink)) {
          post.id = idCounter++;
          newPosts.push(post);
          existingPostPermalinks.add(post.permalink);
        }
      }
    }
  }

  // Birleştir
  const finalPosts = [...allPosts, ...newPosts];

  // ID garantisi
  finalPosts.forEach((p, i) => p.id = p.id ?? i + 1);

  await fs.ensureFile(filePath);
  await fs.writeJson(filePath, finalPosts, { spaces: 2 });

  console.log(`\n🎉 ${newPosts.length} yeni gönderi kaydedildi.`);
  console.log(`📌 Toplam gönderi: ${finalPosts.length}\n`);
}

main().catch(console.error);
