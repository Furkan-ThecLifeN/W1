import React, { useState } from "react";
import {
  FaHeart,
  FaSmile,
  FaPaperPlane,
  FaMicrophone,
  FaPause,
  FaPlay,
} from "react-icons/fa";
import styles from "./Chat.module.css";
import userAvatar from "../../../assets/W1.png";
import { MdAddBox } from "react-icons/md";
import { AiFillFileAdd } from "react-icons/ai";

const Chat = ({ user, onBack }) => {
  const [message, setMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const handleInputChange = (e) => setMessage(e.target.value);
  const togglePlay = () => setIsPlaying((prev) => !prev);
  const canSend = message.trim().length > 0;

  return (
    <div className={styles.Chat}>
      <div className={styles.chatHeader}>
        <button className={styles.backButton} onClick={onBack}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            className={styles.backIcon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className={styles.backBtnSpan}>Geri</span>
        </button>

        <h2>{user?.name || "Chat"}</h2>
      </div>

      <div className={styles.chatBox}>
        <div className={styles.messages}>
          <div className={styles.messageRow + " " + styles.left}>
            <img src={userAvatar} alt="user" className={styles.userAvatar} />
            <div className={`${styles.messageBubble} ${styles.text}`}>
              Hey, check out this image 👇
            </div>
          </div>

          <div className={styles.messageRow + " " + styles.right}>
            <img
              src="https://i.pinimg.com/736x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg"
              alt="example"
              className={styles.messageImage}
            />
            <div className={`${styles.messageBubble} ${styles.text}`}>
              Sure!
            </div>
          </div>

          <div className={styles.messageRow + " " + styles.left}>
            <img src={userAvatar} alt="user" className={styles.userAvatar} />
            <div className={`${styles.messageBubble} ${styles.audio}`}>
              <div className={styles.audioIconWrapper}>
                <FaMicrophone className={styles.voiceIcon} />
              </div>
              <div
                className={`${styles.audioWaveform} ${
                  isPlaying ? styles.playing : styles.paused
                }`}
              >
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={styles.wave}></div>
                ))}
              </div>
              <div className={styles.audioControls}>
                <button className={styles.playPauseBtn} onClick={togglePlay}>
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <span className={styles.audioDuration}>0:12</span>
              </div>
            </div>
          </div>

          <div className={styles.messageRow + " " + styles.right}>
            <div className={`${styles.messageBubble} ${styles.file}`}>
              <AiFillFileAdd />
              ProjectDocs.pdf
            </div>
          </div>
        </div>
      </div>

      <div className={styles.messageInputWrapper}>
        <div className={styles.messageInputContainer}>
          <MdAddBox className={styles.inputIconLeft} />

          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={handleInputChange}
            className={styles.textInput}
          />

          <div className={styles.iconGroupRight}>
            <FaHeart className={styles.rightIconHeart} />
            <FaSmile className={styles.rightIcon} />
            <button className={styles.sendButton} disabled={!canSend}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
