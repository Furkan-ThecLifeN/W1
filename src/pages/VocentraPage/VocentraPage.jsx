import React from "react";
import styles from "./VoCentraPage.module.css";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import VoCentra from "../../components/Vocentra/VoCentra";

const VoCentraPage = () => {
  return (
    <div className={styles.vocentraLayout}>
      <Sidebar />
      <main className={styles.mainContent}>
        <VoCentra />
      </main>
    </div>
  );
};

export default VoCentraPage;
