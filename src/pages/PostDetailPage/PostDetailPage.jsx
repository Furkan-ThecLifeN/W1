// src/pages/PostDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PostBox from "../components/Box/PostBox/PostBox"; // veya FeelingsBox
import LoadingOverlay from "../components/LoadingOverlay/LoadingOverlay";
import styles from "./PostDetailPage.module.css";
import { auth } from "../config/firebase-client";

const PostDetailPage = () => {
  const { postId } = useParams(); // URL'den postId'yi alır
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
      setLoading(true);
      setError(null);
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/feelings/${postId}`, // Veya uygun olan backend rotanız
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        if (!res.ok) {
          throw new Error("Gönderi bulunamadı veya bir hata oluştu.");
        }
        const data = await res.json();
        setPost(data.post);
      } catch (err) {
        console.error("Gönderi çekme hatası:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      {post ? (
        <PostBox feeling={post} /> // Gönderiyi gösteren bileşeninizi kullanın
      ) : (
        <div className={styles.emptyContainer}>Gönderi bulunamadı.</div>
      )}
    </div>
  );
};

export default PostDetailPage;