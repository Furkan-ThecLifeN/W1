import React from 'react'
import AddComponents from '../../components/Add/AddComponents';
import Sidebar from './../../components/LeftSideBar/Sidebar';
import styles from "./AddPage.module.css";

const AddPage = () => {
  return (
    <div className={styles.AddPage}>
        <AddComponents />
    </div>
  )
}

export default AddPage