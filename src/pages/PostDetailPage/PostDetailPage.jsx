import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
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
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postId) {
      setError("Gönderi ID'si bulunamadı.");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const collections = ["globalPosts", "globalFeeds", "globalFeelings"];
        const results = await Promise.all(
          collections.map(async (col) => {
            const ref = doc(db, col, postId);
            const snap = await getDoc(ref);
            if (snap.exists()) {
              return { ...snap.data(), id: snap.id };
            }
            return null;
          })
        );

        const found = results.find((r) => r !== null);
        if (!found) throw new Error("Gönderi bulunamadı.");
        setPost(found);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) return <LoadingOverlay />;
  if (error) return <div className={styles.errorContainer}>{error}</div>;

  const renderPostCard = () => {
    if (!post || !post.type) return <div className={styles.emptyContainer}>Gönderi tipi tanımsız.</div>;

    const type = post.type.toLowerCase();
    switch (type) {
      case "feeling":
        return <TweetCard data={post} />;
      case "post":
        return <PostCard data={post} />;
      case "feed":
        return <FeedVideoCard data={post} />;
      default:
        return <div className={styles.emptyContainer}>Gönderi tipi tanımsız.</div>;
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
