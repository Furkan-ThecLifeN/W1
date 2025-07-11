import React from "react";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import ExploreFeed from "../../components/Feeds/ExploreFeed/ExploreFeed";
import BottomSwipeNav from "../../components/BottomSwipeNav/BottomSwipeNav";
import styles from "./Discover.module.css";

const Discover = () => {
  return (
    <div className={styles.discover}>
      <Sidebar />
      <ExploreFeed />
      <BottomSwipeNav /> 
    </div>
  );
};

export default Discover;
