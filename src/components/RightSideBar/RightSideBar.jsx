import React from "react";
import RightSidebarStyle from "./RightSideBar.module.css";
import LogoReklam from "./W1.png";
import { IoEarth } from "react-icons/io5";

const RightSidebar = () => {
  return (
    <div className={RightSidebarStyle.right_sidebar}>
      <div className={RightSidebarStyle.search_container}>
        <input
          type="text"
          placeholder="Search..."
          className={RightSidebarStyle.search_input}
        />
        <IoEarth className={RightSidebarStyle.search_icon} />
      </div>

      <div className={RightSidebarStyle.messages_widget}>
        <h3>Messages</h3>
        <div className={RightSidebarStyle.message_card}>
          <div className={RightSidebarStyle.avatar_wrapper}>
            <div className={RightSidebarStyle.avatar}></div>
          </div>
          <div className={RightSidebarStyle.user_info}>
            <p className={RightSidebarStyle.username}>Jane Doe</p>
            <p className={RightSidebarStyle.message}>Hey! How are you?</p>
          </div>
        </div>

        <div className={RightSidebarStyle.message_card}>
          <div className={RightSidebarStyle.avatar_wrapper}>
            <div className={RightSidebarStyle.avatar}></div>
          </div>
          <div className={RightSidebarStyle.user_info}>
            <p className={RightSidebarStyle.username}>Jane Doe</p>
            <p className={RightSidebarStyle.message}>Hey! How are you?</p>
          </div>
        </div>
      </div>

      <div className={RightSidebarStyle.ad_widget}>
        <img src={LogoReklam} alt="Ad 1" className={RightSidebarStyle.ad_image} />
      </div>

      <div className={RightSidebarStyle.ad_widget}>
        <img src={LogoReklam} alt="Ad 2" className={RightSidebarStyle.ad_image} />
      </div>
    </div>
  );
};

export default RightSidebar;
