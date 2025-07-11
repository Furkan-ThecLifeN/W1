import React from "react";
import Styles from "./HomePage.module.css";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import RightSidebar from "../../components/RightSideBar/RightSideBar";
import PostCard from "../../components/Post/PostCard";
import TweetCard from "../../components/TweetCard/TweetCard";
import BottomNav from "../../components/LeftSideBar/BottomNav";
import { NavLink } from "react-router-dom";
import BottomToggleNav from "../../components/BottomToggleNav/BottomToggleNav";

const Home = () => {
  return (
    <>
      <div className={Styles.home}>
        <Sidebar />
        <div className={Styles.content}>
          <div className="content_header">
            <NavLink to="/home" className={Styles.logo}>
              W1
            </NavLink>
          </div>
          <PostCard />
          <TweetCard />
          <PostCard />
        </div>
        <RightSidebar />
      </div>
      <BottomToggleNav /> 
    </>
  );
};

export default Home;
