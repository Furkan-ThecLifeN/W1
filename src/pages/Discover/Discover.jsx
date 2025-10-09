import React from "react";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import ExploreFeed from "../../components/Feeds/ExploreFeed/HybridExploreFeed";
import styles from "./Discover.module.css";
import BottomNav from "../../components/BottomNav/BottomNav";

const Discover = () => {
  return (
    <div className={styles.discover}>
      <div className={styles.sidebar}>
        <Sidebar />
      </div>

      <div className={styles.exploreFeed}>
        <ExploreFeed />
      </div>

      <div className={styles.bottomNav}>
        <BottomNav />
      </div>
    </div>
  );
};

export default Discover;
