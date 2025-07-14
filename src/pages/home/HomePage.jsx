import React from "react";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import RightSidebar from "../../components/RightSideBar/RightSideBar";
import PostCard from "../../components/Post/PostCard";
import TweetCard from "../../components/TweetCard/TweetCard";
import BottomNav from "../../components/BottomNav/BottomNav";
import styles from "./HomePage.module.css";

const Home = () => {
  return (
    <div className={styles.home}>
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.topCenterLogo}>W1</div>
        </header>

        <section className={styles.feed}>
          <PostCard />
          <TweetCard />
          <PostCard />
          <PostCard />
          <TweetCard />
          <PostCard />
          <PostCard />
          <TweetCard />
          <PostCard />
        </section>
      </main>
      <RightSidebar />
      <BottomNav />
    </div>
  );
};

export default Home;
