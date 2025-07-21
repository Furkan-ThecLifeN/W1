import React from "react";
import styles from "./VocentraPage.module.css";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import Vocentra from "../../components/Vocentra/Vocentra";

const VocentraPage = () => {
  return (
    <div className={styles.vocentraLayout}>
      <Sidebar />
      <main className={styles.mainContent}>
        <Vocentra />
      </main>
    </div>
  );
};

export default VocentraPage;
