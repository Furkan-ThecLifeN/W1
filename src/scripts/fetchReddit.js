import axios from "axios";
import fs from "fs-extra";
import dotenv from "dotenv";
dotenv.config();

const CATEGORIES = {
  turkish: [
    "Turkey", "Turkiye", "elraenn", "twitchclips", "burdurland", "hort", "ZargoryanGalaksisi"
  ],
  english: [
    "memes", "funny", "gaming", "dankmemes", "wholesomememes",
    "VALORANT", "cs2", "leagueoflegends", "gtaonline",
    "pics", "gifs", "Unexpected", "me_irl"
  ]
};

const TOTAL_TARGET_POSTS = 200;
const TURKISH_CONTENT_RATIO = 0.7;
const LIMIT_PER_SUB = 100;

const RETRY_DELAY_MS = 10000;
const REQUEST_DELAY_MS = 1500;

let allPosts = [];
let idCounter = 1;
let existingPostPermalinks = new Set();

const bannedWords = [
  "nsfw", "18+", "porn", "politic", "gore", "blood", "violence",
  "trump", "israel", "palestine", "war", "death"
];

const TIME_PERIODS = ["week", "month", "year", "all"];

async function fetchRedditPosts(subreddit, time_period, min_upvotes) {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/top.json?limit=${LIMIT_PER_SUB}&t=${time_period}`;
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    return data.data.children
      .filter(post =>
        post.data.url_overridden_by_dest?.match(/\.(jpg|png|gif)$/) &&
        post.data.ups >= min_upvotes &&
        !bannedWords.some(word => post.data.title.toLowerCase().includes(word)) &&
        !existingPostPermalinks.has(post.data.permalink)
      )
      .map(post => ({
        type: "image",
        title: post.data.title,
        image: post.data.url_overridden_by_dest,
        author: post.data.author,
        subreddit,
        ups: post.data.ups,
        permalink: post.data.permalink,
        createdAt: new Date(post.data.created_utc * 1000).toISOString(),
        seen: false,
      }));
  } catch (error) {
    if (error.response?.status === 429) {
      console.warn(`⏳ Rate limit aşıldı (${subreddit}). ${RETRY_DELAY_MS / 1000}s bekleniyor...`);
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      return fetchRedditPosts(subreddit, time_period, min_upvotes);
    }
    console.warn(`⚠️ r/${subreddit} hatası: ${error.message}`);
    return [];
  }
}

async function fetchPostsForCategory(settings) {
  const { subreddits, targetCount, categoryName, minUpvotes } = settings;
  let categoryPosts = [];
  let usedPeriods = 0;

  console.log(`\n--- 🎯 '${categoryName}' Kategorisi Başlatılıyor (Hedef: ${targetCount}) ---`);

  while (categoryPosts.length < targetCount && usedPeriods < TIME_PERIODS.length) {
    const timePeriod = TIME_PERIODS[usedPeriods];
    console.log(`⏱️ Zaman aralığı: ${timePeriod}`);

    for (const sub of subreddits.sort(() => 0.5 - Math.random())) {
      if (categoryPosts.length >= targetCount) break;

      console.log(`📥 [${categoryName}] r/${sub} (${categoryPosts.length}/${targetCount})`);
      const fetched = await fetchRedditPosts(sub, timePeriod, minUpvotes);

      for (const post of fetched) {
        if (categoryPosts.length >= targetCount) break;
        if (!existingPostPermalinks.has(post.permalink)) {
          categoryPosts.push(post);
          existingPostPermalinks.add(post.permalink);
        }
      }

      await new Promise(r => setTimeout(r, REQUEST_DELAY_MS));
    }

    if (categoryPosts.length < targetCount) {
      console.warn(`⚠️ ${categoryName}: ${categoryPosts.length}/${targetCount}. Daha geniş aralık deneniyor...`);
      usedPeriods++;
    }
  }

  if (categoryPosts.length < targetCount) {
    console.warn(`⚠️ ${categoryName}: Yine de eksik gönderi (${categoryPosts.length}/${targetCount})`);
  }

  return categoryPosts;
}

async function main() {
  const filePath = "./src/data/memes.json";

  try {
    if (await fs.pathExists(filePath)) {
      const content = await fs.readFile(filePath, "utf8");
      if (content.trim()) {
        allPosts = JSON.parse(content);
        idCounter = Math.max(...allPosts.map(p => p.id)) + 1 || 1;
        existingPostPermalinks = new Set(allPosts.map(p => p.permalink));
      }
    }
  } catch {
    allPosts = [];
    idCounter = 1;
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

  console.log(`🚀 Hedef: ${TOTAL_TARGET_POSTS} yeni gönderi\n`);

  let turkishPosts = await fetchPostsForCategory(turkishSettings);
  let englishPosts = await fetchPostsForCategory(englishSettings);

  let totalFetched = turkishPosts.length + englishPosts.length;

  // Eğer 200'den azsa rastgele subredditten devam et
  while (totalFetched < TOTAL_TARGET_POSTS) {
    console.log(`🔁 Eksik gönderi: ${totalFetched}/${TOTAL_TARGET_POSTS}, tamamlanıyor...`);
    const randomSubs = [...CATEGORIES.turkish, ...CATEGORIES.english].sort(() => 0.5 - Math.random());
    for (const sub of randomSubs) {
      const fetched = await fetchRedditPosts(sub, "all", 20);
      for (const post of fetched) {
        if (totalFetched >= TOTAL_TARGET_POSTS) break;
        if (!existingPostPermalinks.has(post.permalink)) {
          englishPosts.push(post);
          existingPostPermalinks.add(post.permalink);
          totalFetched++;
        }
      }
      await new Promise(r => setTimeout(r, REQUEST_DELAY_MS));
      if (totalFetched >= TOTAL_TARGET_POSTS) break;
    }
  }

  let newPosts = [...turkishPosts, ...englishPosts].map(post => ({ ...post, id: idCounter++ }));
  const combinedPosts = [...allPosts, ...newPosts];

  await fs.ensureDir("./src/data");
  await fs.writeJson(filePath, combinedPosts, { spaces: 2 });

  console.log(`\n✅ ${TOTAL_TARGET_POSTS} gönderi başarıyla toplandı ve kaydedildi!`);
}

main();
