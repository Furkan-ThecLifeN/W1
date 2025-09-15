import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PostBox from "../../components/AccountPage/Box/FeelingsBox/FeelingsBox"; 
import LoadingOverlay from "../../components/LoadingOverlay/LoadingOverlay";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import RightSidebar from "../../components/RightSideBar/RightSideBar";
import BottomNav from "../../components/BottomNav/BottomNav";
import styles from "./PostDetailPage.module.css";
import { auth } from "../../config/firebase-client";

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
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/feelings/${postId}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        if (!res.ok) throw new Error("Gönderi bulunamadı.");
        const data = await res.json();
        setPost(data.post);
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

  return (
    <div className={styles.postDetail}>
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.topCenterLogo}>W1</div>
        </header>

        <section className={styles.postWrapper}>
          {post ? (
            <PostBox feeling={post} />
          ) : (
            <div className={styles.emptyContainer}>Gönderi bulunamadı.</div>
          )}
        </section>
      </main>
      <RightSidebar />
      <BottomNav />
    </div>
  );
};

export default PostDetailPage;
