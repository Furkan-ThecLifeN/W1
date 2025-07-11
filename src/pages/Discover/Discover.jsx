import React from "react";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import ExploreFeed from "../../components/Feeds/ExploreFeed/ExploreFeed";
import BottomToggleNav from "../../components/BottomToggleNav/BottomToggleNav";
import styles from "./Discover.module.css";

const Discover = () => {
  return (
    <div className={styles.discover}>
      <Sidebar />
      <ExploreFeed />
      <BottomToggleNav /> 
    </div>
  );
};

export default Discover;
