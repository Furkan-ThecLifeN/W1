import React from "react";
import AddComponents from "../../components/Add/AddComponents";
import Sidebar from "./../../components/LeftSideBar/Sidebar";
import BottomNav from "../../components/BottomNav/BottomNav";
import styles from "./AddPage.module.css";
import Footer from "../../components/Footer/Footer";

const AddPage = () => {
  return (
    <div className={styles.AddPage}>
      <Sidebar />
      <main className={styles.mainContent}>
        <AddComponents />
      </main>
      <div className={styles.footerWrapper}>
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
};

export default AddPage;
