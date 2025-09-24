import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
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

  // basit shuffle fonksiyonu
  const shuffleArray = (arr) => {
    return [...arr].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const qPosts = query(collection(db, "globalPosts"), orderBy("createdAt", "desc"));
    const qFeelings = query(collection(db, "globalFeelings"), orderBy("createdAt", "desc"));

    let postsLoaded = false;
    let feelingsLoaded = false;

    const handleChanges = (snapshot, type) => {
      setFeed((prev) => {
        let updated = [...prev];
        snapshot.docChanges().forEach((change) => {
          const item = { id: change.doc.id, type, ...change.doc.data() };
          if (change.type === "added") {
            updated.push(item);
          }
          if (change.type === "modified") {
            updated = updated.map((f) => (f.id === item.id ? item : f));
          }
          if (change.type === "removed") {
            updated = updated.filter((f) => f.id !== item.id);
          }
        });
        return shuffleArray(updated); // 🔥 her güncellemeden sonra shuffle
      });
    };

    const unsubPosts = onSnapshot(qPosts, (snapshot) => {
      handleChanges(snapshot, "post");
      postsLoaded = true;
      if (postsLoaded && feelingsLoaded) setLoading(false);
    });

    const unsubFeelings = onSnapshot(qFeelings, (snapshot) => {
      handleChanges(snapshot, "feeling");
      feelingsLoaded = true;
      if (postsLoaded && feelingsLoaded) setLoading(false);
    });

    return () => {
      unsubPosts();
      unsubFeelings();
    };
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
