import React from "react";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import ExploreFeed from "../../components/Feeds/ExploreFeed/ExploreFeed";
import styles from "./Discover.module.css";
import BottomNav from "../../components/BottomNav/BottomNav";

const Discover = () => {
  return (
    <div className={styles.discover}>
      <div className="sidebar">
        <Sidebar />
      </div>

      <div className="exploreFeed">
        <ExploreFeed />
      </div>

      <div className="bottomNav">
        <BottomNav />
      </div>
    </div>
  );
};

export default Discover;
