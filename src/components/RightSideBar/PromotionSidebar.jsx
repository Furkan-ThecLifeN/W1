import React from "react";
import RightSidebarStyle from "./RightSideBar.module.css";
import LogoReklam from "./W1.png";
import { IoEarth } from "react-icons/io5";

const PromotionSidebar = () => {
  return (
    <div className={RightSidebarStyle.right_sidebar}>
      <div className={RightSidebarStyle.ad_widget}>
        <img
          src={LogoReklam}
          alt="Ad 1"
          className={RightSidebarStyle.ad_image}
        />
      </div>

      <div className={RightSidebarStyle.ad_widget}>
        <img
          src={LogoReklam}
          alt="Ad 2"
          className={RightSidebarStyle.ad_image}
        />
      </div>
      
      <div className={RightSidebarStyle.ad_widget}>
        <img
          src={LogoReklam}
          alt="Ad 2"
          className={RightSidebarStyle.ad_image}
        />
      </div>
    </div>
  );
};

export default PromotionSidebar;
