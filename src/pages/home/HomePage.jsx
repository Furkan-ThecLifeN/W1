import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase-client";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import RightSidebar from "../../components/RightSideBar/RightSideBar";
import PostCard from "../../components/Post/PostCard";
import TweetCard from "../../components/TweetCard/TweetCard";
import BottomNav from "../../components/BottomNav/BottomNav";
import styles from "./HomePage.module.css";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [feelings, setFeelings] = useState([]);
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    const qPosts = query(
      collection(db, "globalPosts"),
      orderBy("createdAt", "desc")
    );
    const qFeelings = query(
      collection(db, "globalFeelings"),
      orderBy("createdAt", "desc")
    );

    const unsubPosts = onSnapshot(qPosts, (snapshot) => {
      setPosts(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          type: "post",
          ...doc.data(),
        }))
      );
    });

    const unsubFeelings = onSnapshot(qFeelings, (snapshot) => {
      setFeelings(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          type: "feeling",
          ...doc.data(),
        }))
      );
    });

    return () => {
      unsubPosts();
      unsubFeelings();
    };
  }, []);

  useEffect(() => {
    const combined = [...posts, ...feelings];
    const shuffled = combined.sort(() => Math.random() - 0.5);

    const arranged = [];
    let lastType = null;
    let count = 0;

    shuffled.forEach((item) => {
      if (item.type === lastType) {
        if (count < 2) {
          arranged.push(item);
          count++;
        } else {
          // 2 aynı tip ard arda oldu, bu itemi şimdilik sona bırak
        }
      } else {
        arranged.push(item);
        lastType = item.type;
        count = 1;
      }
    });

    // Atlanan öğeleri sona ekle (hala karışık olacak)
    const missing = shuffled.filter((x) => !arranged.includes(x));
    const finalFeed = [...arranged, ...missing].sort(() => Math.random() - 0.5);

    setFeed(finalFeed);
  }, [posts, feelings]);

  return (
    <div className={styles.home}>
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.topCenterLogo}>W1</div>
        </header>

        <section className={styles.feed}>
          {feed.map((item) =>
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
