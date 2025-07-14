import React, { useState } from "react";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import MessagesSection from "../../components/Messages/MessagesSection";
import Styles from "./MessagesPage.module.css";
import MessagesMobile from "../../components/Messages/MessagesMobile/MessagesMobile";
import BottomNav from "../../components/BottomNav/BottomNav";

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
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default MessagesPage;
