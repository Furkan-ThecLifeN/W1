import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../config/firebase-client";
import PostCard from "../../components/Post/PostCard";
import TweetCard from "../../components/TweetCard/TweetCard";
import FeedVideoCard from "../../components/Feeds/FeedVideoCard/FeedVideoCard";
import LoadingOverlay from "../../components/LoadingOverlay/LoadingOverlay";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import RightSidebar from "../../components/RightSideBar/RightSideBar";
import BottomNav from "../../components/BottomNav/BottomNav";
import styles from "./PostDetailPage.module.css";

const PostDetailPage = () => {
  // --- DEĞİŞİKLİK 1: Tüm parametreleri al ---
  const params = useParams();
  // URL'den gelen ID'yi bul. Adı postId, feelingId, feedId veya sadece id olabilir.
  const postId = params.postId || params.feelingId || params.feedId || params.id;
  // --- DEĞİŞİKLİK SONU ---

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 'postId' (artık genel ID'miz) geçerli mi diye kontrol et
    if (!postId) {
      setError("Gönderi ID'si URL'de bulunamadı.");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const collections = ["globalPosts", "globalFeeds", "globalFeelings"];
        const results = await Promise.all(
          collections.map(async (col) => {
            const ref = doc(db, col, postId); // Güncellenmiş postId değişkenini kullan
            const snap = await getDoc(ref);
            if (snap.exists()) {
              const data = snap.data();
              if (col === "globalPosts" && !data.type) data.type = "post";
              if (col === "globalFeeds" && !data.type) data.type = "feed";
              if (col === "globalFeelings" && !data.type) data.type = "feeling";
              return { ...data, id: snap.id };
            }
            return null;
          })
        );

        const foundPost = results.find((r) => r !== null);
        if (!foundPost) throw new Error("Gönderi bulunamadı.");

        // Kullanıcının güncel verisini çekme (Önceki adımdaki gibi)
        if (foundPost.uid) {
          const userQuery = query(
            collection(db, "users"),
            where("uid", "==", foundPost.uid)
          );
          const userSnap = await getDocs(userQuery);

          if (!userSnap.empty) {
            const freshUserData = userSnap.docs[0].data();
            const finalPostData = {
              ...foundPost,
              displayName: freshUserData.displayName,
              photoURL: freshUserData.photoURL,
              username: freshUserData.username,
            };
            setPost(finalPostData);
          } else {
            setPost(foundPost);
          }
        } else {
          setPost(foundPost);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]); // 'postId' artık doğru ID'yi içeriyor

  if (loading) return <LoadingOverlay />;
  if (error) return <div className={styles.errorContainer}>{error}</div>;

  const renderPostCard = () => {
    if (!post || !post.type) {
      console.error(
        "Render edilecek gönderi veya gönderi tipi bulunamadı:",
        post
      );
      return (
        <div className={styles.emptyContainer}>
          Gönderi tipi tanımsız veya gönderi yüklenemedi.
        </div>
      );
    }

    const type = (post.type || "").toLowerCase();

    switch (type) {
      case "feeling":
        return <TweetCard data={post} />;
      case "post":
        return <PostCard data={post} />;
      case "feed":
        return <FeedVideoCard data={post} />;
      default:
        return (
          <div className={styles.emptyContainer}>
            Bilinmeyen gönderi tipi: {post.type}
          </div>
        );
    }
  };

  return (
    <div className={styles.postDetail}>
      <Sidebar />
      <main className={styles.mainContent}>
        <section className={styles.postWrapper}>
          {renderPostCard()}
        </section>
      </main>
      <RightSidebar />
      <BottomNav />
    </div>
  );
};

export default PostDetailPage;