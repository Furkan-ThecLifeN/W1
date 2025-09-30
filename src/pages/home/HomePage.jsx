import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase-client";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import RightSidebar from "../../components/RightSideBar/RightSideBar";
import PostCard from "../../components/Post/PostCard";
import TweetCard from "../../components/TweetCard/TweetCard";
import BottomNav from "../../components/BottomNav/BottomNav";
import LoadingOverlay from "../../components/LoadingOverlay/LoadingOverlay";
import styles from "./HomePage.module.css";

const Home = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

  useEffect(() => {
    async function fetchData() {
      try {
        const postsQuery = query(collection(db, "globalPosts"), orderBy("createdAt", "desc"));
        const feelingsQuery = query(collection(db, "globalFeelings"), orderBy("createdAt", "desc"));

        const postsSnap = await getDocs(postsQuery);
        const feelingsSnap = await getDocs(feelingsQuery);

        const posts = postsSnap.docs.map((doc) => ({ id: doc.id, type: "post", ...doc.data() }));
        const feelings = feelingsSnap.docs.map((doc) => ({ id: doc.id, type: "feeling", ...doc.data() }));

        setFeed(shuffleArray([...posts, ...feelings]));
      } catch (e) {
        console.error("Feed yüklenemedi:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className={styles.home}>
      {loading && <LoadingOverlay />}
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.topCenterLogo}>W1</div>
        </header>

        <section className={styles.feed}>
          {!loading &&
            feed.map((item) =>
              item.type === "post" ? (
                <PostCard key={item.id} data={item} />
              ) : (
                <TweetCard key={item.id} data={item} />
              )
            )}
        </section>
      </main>
      <RightSidebar />
      <BottomNav />
    </div>
  );
};

export default Home;
