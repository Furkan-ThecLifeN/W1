import React, { useState } from "react";
import RightSidebarStyle from "./RightSideBar.module.css";
import LogoReklam from "./W1.png";
import { IoEarth } from "react-icons/io5";
import SearchOverlay from "../SearchOverlay/SearchOverlay"; // Import yolu doğru olmalı

const RightSidebar = () => {
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleSearchFocus = () => {
    setSearchActive(true);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleCloseOverlay = () => {
    setSearchActive(false);
    setSearchText("");
  };

  return (
    <div className={RightSidebarStyle.right_sidebar}>
      <div className={RightSidebarStyle.search_container}>
        <input
          type="text"
          placeholder="Search..."
          className={RightSidebarStyle.search_input}
          onFocus={handleSearchFocus}
          onChange={handleSearchChange}
          value={searchText}
        />
        <IoEarth className={RightSidebarStyle.search_icon} />
      </div>

      {!searchActive && (
        <>
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
        </>
      )}

      {searchActive && (
        <SearchOverlay
          searchText={searchText}
          onClose={handleCloseOverlay}
        />
      )}
    </div>
  );
};

export default RightSidebar;