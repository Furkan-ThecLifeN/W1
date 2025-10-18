import axios from "axios";
import fs from "fs-extra";
import dotenv from "dotenv";
dotenv.config();

const CATEGORIES = {
  turkish: [
    "Turkey", "Turkiye", "elraenn", "twitchclips",
    "burdurland", "hort", "ZargoryanGalaksisi"
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

let allPosts = [];
let idCounter = 1;
let existingPostPermalinks = new Set();

const bannedWords = [
  "nsfw", "18+", "porn", "politic", "gore", "blood", "violence",
  "trump", "israel", "palestine", "war", "death"
];

/**
 * Reddit'ten gönderileri çeker (daha fazla tür destekler)
 */
async function fetchRedditPosts(subreddit, min_upvotes) {
  const url = `https://www.reddit.com/r/${subreddit}/top.json?limit=${LIMIT_PER_SUB}&t=year`;

  try {
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 8000
    });

    // 1. Temel kurallara göre ön filtreleme yap
    const potentialPosts = data.data.children.filter(post =>
      post.data.ups >= min_upvotes &&
      !bannedWords.some(word => post.data.title.toLowerCase().includes(word)) &&
      !existingPostPermalinks.has(post.data.permalink)
    );

    // 2. Desteklenen türleri işle ve yapılandır
    const processedPosts = potentialPosts.map(post => {
      const postData = post.data;
      
      // Tüm gönderi türleri için temel nesne
      const basePost = {
        title: postData.title,
        author: postData.author,
        subreddit,
        ups: postData.ups,
        permalink: postData.permalink,
        createdAt: new Date(postData.created_utc * 1000).toISOString(),
        seen: false,
      };

      // TÜR 1: Resim (jpg, png, gif)
      if (postData.url_overridden_by_dest?.match(/\.(jpg|png|gif)$/)) {
        return {
          ...basePost,
          type: "image",
          url: postData.url_overridden_by_dest,
        };
      }

      // TÜR 2: Reddit Videosu (v.redd.it)
      if (postData.is_video && postData.media?.reddit_video) {
        const videoUrl = postData.media.reddit_video.fallback_url;
        // Reddit videoları sesi ayrı dosyada tutar, tahmin yürüt
        const audioUrl = videoUrl.includes("DASH_")
          ? videoUrl.replace(/DASH_[\d_]+\.mp4/, 'DASH_audio.mp4')
          : null;

        return {
          ...basePost,
          type: "video",
          url: videoUrl,
          audio_url: audioUrl,
          is_reddit_video: true,
        };
      }
      
      // TÜR 3: Zengin Video (Gfycat, Imgur GIFV vb.)
      if (postData.post_hint === 'rich:video' && postData.preview?.reddit_video_preview) {
         return {
            ...basePost,
            type: "video",
            url: postData.preview.reddit_video_preview.fallback_url,
            audio_url: null, // Bunlar genellikle sessizdir
            is_reddit_video: false,
        };
      }

      // TÜR 4: Metin Gönderisi (self-post)
      const minTextLength = 10;
      const maxTextLength = 3000;
      if (
        postData.is_self &&
        postData.selftext &&
        postData.selftext.length >= minTextLength &&
        postData.selftext.length <= maxTextLength
      ) {
        return {
          ...basePost,
          type: "text",
          text: postData.selftext,
        };
      }
      
      // Desteklenmeyen tür (örn: dış link, galeri)
      return null;
    });

    // 3. Null olanları (desteklenmeyen türler) filtrele
    return processedPosts.filter(post => post !== null);

  } catch (error) {
    if (error.response?.status === 429) {
      console.warn(`⚠️ Rate limit (r/${subreddit}) — atlanıyor.`);
      return [];
    }
    console.warn(`⚠️ r/${subreddit} hatası: ${error.message}`);
    return [];
  }
}

/**
 * Belirli kategori için gönderi çeker
 */
async function fetchPostsForCategory(settings) {
  const { subreddits, targetCount, categoryName, minUpvotes } = settings;
  let categoryPosts = [];

  console.log(`\n--- 🎯 '${categoryName}' Kategorisi Başlatılıyor (Hedef: ${targetCount}) ---`);

  // Subreddit listesini karıştırarak her seferinde farklı bir sırayla başla
  for (const sub of subreddits.sort(() => 0.5 - Math.random())) {
    if (categoryPosts.length >= targetCount) break;

    console.log(`📥 [${categoryName}] r/${sub} (${categoryPosts.length}/${targetCount})`);
    const fetched = await fetchRedditPosts(sub, minUpvotes);

    for (const post of fetched) {
      if (categoryPosts.length >= targetCount) break;
      
      // fetchRedditPosts içinde permalink zaten kontrol edildi ama garanti olsun
      if (!existingPostPermalinks.has(post.permalink)) { 
        post.id = idCounter++; // ✅ her gönderiye id ver
        categoryPosts.push(post);
        existingPostPermalinks.add(post.permalink);
      }
    }
  }

  console.log(`✅ ${categoryName}: ${categoryPosts.length} gönderi toplandı.`);
  return categoryPosts;
}

/**
 * Ana fonksiyon
 */
async function main() {
  const filePath = "./src/data/memes.json";

  try {
    if (await fs.pathExists(filePath)) {
      const content = await fs.readFile(filePath, "utf8");
      if (content.trim()) {
        allPosts = JSON.parse(content);
        const lastId = Math.max(...allPosts.map(p => p.id || 0), 0);
        idCounter = lastId + 1;
        existingPostPermalinks = new Set(allPosts.map(p => p.permalink));
        console.log(`📂 Mevcut kayıt bulundu. Son id: ${lastId}. Toplam: ${allPosts.length} gönderi.`);
      }
    }
  } catch(e) {
    console.warn("Mevcut 'memes.json' okunamadı veya bozuk:", e.message);
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

  console.log(`🚀 Hedef: ${TOTAL_TARGET_POSTS} yeni gönderi (${turkishTarget} TR / ${englishTarget} EN)\n`);

  const [turkishPosts, englishPosts] = await Promise.all([
    fetchPostsForCategory(turkishSettings),
    fetchPostsForCategory(englishSettings)
  ]);

  // Yeni toplanan tüm gönderileri birleştir
  let newPosts = [...turkishPosts, ...englishPosts];
  let totalFetched = newPosts.length;

  console.log(`\n🔍 Toplam alınan gönderi: ${totalFetched}`);

  // Eksik gönderi varsa tamamla (DÜZELTME BURADA)
  if (totalFetched < TOTAL_TARGET_POSTS) {
    console.log(`🔁 Eksik gönderi (${totalFetched}/${TOTAL_TARGET_POSTS}), tamamlanıyor...`);
    const allSubs = [...CATEGORIES.turkish, ...CATEGORIES.english];
    
    for (const sub of allSubs.sort(() => 0.5 - Math.random())) {
      if (totalFetched >= TOTAL_TARGET_POSTS) break;
      
      // Tamamlama için upvote eşiğini düşür
      const fetched = await fetchRedditPosts(sub, 20); 
      
      for (const post of fetched) {
        if (totalFetched >= TOTAL_TARGET_POSTS) break;
        
        if (!existingPostPermalinks.has(post.permalink)) {
          post.id = idCounter++; // ✅ id ekle
          newPosts.push(post); // ✅ 'newPosts' dizisine ekle (allPosts yerine)
          existingPostPermalinks.add(post.permalink);
          totalFetched++;
        }
      }
    }
    console.log(`Tamamlama sonrası toplam yeni gönderi: ${totalFetched}`);
  }

  if (newPosts.length === 0) {
     console.log("\nHiç yeni gönderi bulunamadı. Kayıt işlemi atlanıyor.");
     return;
  }

  // ✅ Eski ve yeni gönderileri birleştir
  const combinedPosts = [...allPosts, ...newPosts];

  // ID'si olmayan (çok eski veriden kalma) varsa diye ID garantisi sağla
  const finalPosts = combinedPosts.map((p, i) => ({
    ...p,
    id: p.id ?? (i + 1), 
  }));

  await fs.ensureDir("./src/data");
  await fs.writeJson(filePath, finalPosts, { spaces: 2 });

  console.log(`\n✅ ${newPosts.length} yeni gönderi başarıyla toplandı ve kaydedildi!`);
  console.log(`Toplam gönderi sayısı: ${finalPosts.length}`);
}

main().catch(console.error);