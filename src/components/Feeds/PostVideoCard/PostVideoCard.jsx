import { useState } from "react";
import {
  FiHeart,
  FiMessageCircle,
  FiBookmark,
  FiSend,
  FiMoreVertical
} from "react-icons/fi";
import {
  FaHeart,
  FaCommentDots,
  FaBookmark,
  FaShare,
  FaEllipsisV
} from "react-icons/fa";
import styles from "./PostVideoCard.module.css";

export default function PostVideoCard({ videoSrc }) {
  const [liked, setLiked] = useState(false);
  const [doubleTap, setDoubleTap] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeIcons, setActiveIcons] = useState({});
  const [followed, setFollowed] = useState(false);

  const handleDoubleClick = () => {
    setLiked(true);
    setDoubleTap(true);
    setTimeout(() => setDoubleTap(false), 1000);
  };

  const toggleIcon = (name) =>
    setActiveIcons(prev => ({ ...prev, [name]: !prev[name] }));

  const handleLikeClick = () =>
    setLiked(prev => !prev);

  const handleSaveClick = () =>
    setSaved(prev => !prev);

  return (
    <div className={styles.video_card} onDoubleClick={handleDoubleClick}>
      <div className={styles.video_wrapper}>
        <video
          src={videoSrc}
          className={styles.video}
          autoPlay muted loop playsInline
        />

        {doubleTap && <FaHeart className={styles.double_tap} />}

        <div className={styles.ad_header}>
          <span className={styles.ad_text}>Sponsored</span>
          <button className={styles.ad_btn} onClick={() => window.open("#")}>
            Learn More
          </button>
        </div>

        <div className={styles.actions}>
          <div className={styles.icon_box} onClick={handleLikeClick}>
            {liked ? (
              <FaHeart className={`${styles.icon} ${styles.liked}`} />
            ) : (
              <FiHeart className={styles.icon} />
            )}
          </div>
          <FiMessageCircle className={styles.icon} onClick={() => toggleIcon("comment")} />
          <div className={styles.icon_box} onClick={handleSaveClick}>
            {saved ? (
              <FaBookmark className={`${styles.icon} ${styles.saved}`} />
            ) : (
              <FiBookmark className={styles.icon} />
            )}
          </div>
          <FiSend className={styles.icon} onClick={() => toggleIcon("send")} />
          <FiMoreVertical className={styles.icon} onClick={() => toggleIcon("more")} />
        </div>

        <div className={styles.info_box}>
          <div className={styles.info_top}>
            <div className={styles.profile}>
              <img
                src="https://i.pravatar.cc/48"
                alt="User"
                className={styles.avatar}
              />
              <span className={styles.username}>Furkan ThecLifeN</span>
            </div>
            <button
              onClick={() => setFollowed(!followed)}
              className={styles.follow_btn}
            >
              {followed ? "Unfollow" : "Follow"}
            </button>
          </div>
          <div className={styles.description}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempore
            inventore molestias repellendus quas modi fuga voluptas?
          </div>
        </div>
      </div>
    </div>
  );
}
