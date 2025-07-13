import React from "react";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import ExploreFeed from "../../components/Feeds/ExploreFeed/ExploreFeed";
import styles from "./Discover.module.css";
import ToggleNavButton from "../../components/BottomToggleNav/BottomToggleNav";

const Discover = () => {
  return (
    <div className={styles.discover}>
      <Sidebar />
      <ExploreFeed />
    </div>
  );
};

export default Discover;
