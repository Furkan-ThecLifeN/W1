import React, { useState } from "react";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import BottomNav from "../../components/LeftSideBar/BottomNav";
import MessagesSection from "../../components/Messages/MessagesSection";
import Styles from "./MessagesPage.module.css";
import MessagesMobile from "../../components/Messages/MessagesMobile/MessagesMobile";
import BottomSwipeNav from "../../components/BottomSwipeNav/BottomSwipeNav";

const MessagesPage = () => {
  const [showBottomNav, setShowBottomNav] = useState(true);

  return (
    <div className={Styles.messages_container}>
      <Sidebar />
      <div className={Styles.messages_box}>
        <MessagesSection />
      </div>
      <div className={Styles.messages_mobile}>
        <MessagesMobile
          hideBottomNav={(shouldHide) => setShowBottomNav(!shouldHide)}
        />
      </div>
      {showBottomNav && <BottomSwipeNav />}
    </div>
  );
};

export default MessagesPage;
