import React from "react";
import styles from "./MessagesRightBar.module.css";
import { FaMicrophone } from "react-icons/fa6";
import { BsCameraVideoFill } from "react-icons/bs";
import { AiFillPushpin, AiOutlineMore } from "react-icons/ai";

const MessagesRightBar = () => {
  return (
    <div className={styles.messagesRightBar}>
      <div className={styles.right_TopContainer}>
        <button className={styles.iconButton}>
          <FaMicrophone />
        </button>
        <button className={styles.iconButton}>
          <BsCameraVideoFill />
        </button>
        <button className={styles.iconButton}>
          <AiFillPushpin />
        </button>
        <button className={styles.iconButton}>
          <AiOutlineMore />
        </button>
      </div>

      <div className={styles.right_CenterContainer}>
        <div className={styles.pushPin_Container}>
          <div className={styles.pushPin_box}>
            <p>Sabitlenmiş Mesaj</p>
          </div>
          <div className={styles.pushPin_box}>
            <p>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iste,
              magni?
            </p>
          </div>
        </div>
      </div>

      <div className={styles.right_BottomContainer}>
        <div className={styles.button_container}>
          <button className={styles.bottom_box}>
            <div className={styles.box_profile}>
              <img
                src="https://i.pinimg.com/736x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg"
                alt="profile"
              />
            </div>
            <span>Sunucu 1</span>
          </button>

          <button className={styles.bottom_box}>
            <div className={styles.box_profile}>
              <img
                src="https://i.pinimg.com/736x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg"
                alt="profile"
              />
            </div>
            <span>Sunucu 2</span>
          </button>

          <button className={styles.bottom_box}>
            <div className={styles.box_profile}>
              <img
                src="https://i.pinimg.com/736x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg"
                alt="profile"
              />
            </div>
            <span>Grup 1</span>
          </button>

          <button className={styles.bottom_box}>
            <div className={styles.box_profile}>
              <img
                src="https://i.pinimg.com/736x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg"
                alt="profile"
              />
            </div>
            <span>Grup 2</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesRightBar;
