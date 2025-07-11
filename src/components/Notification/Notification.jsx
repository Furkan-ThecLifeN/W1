import React from "react";
import styles from "./Notification.module.css";
import {
  FaUserPlus,
  FaHeart,
  FaRegCommentDots,
  FaPaperPlane,
  FaCheckCircle,
} from "react-icons/fa";

const notifications = [
  {
    id: 1,
    type: "follow_request",
    user: "Sophia",
    message: "sana takip isteği gönderdi.",
    time: "3g önce",
    icon: <FaUserPlus />,
  },
  {
    id: 2,
    type: "message_permission",
    user: "David",
    message: "sana mesaj göndermek istiyor.",
    time: "2g önce",
    icon: <FaPaperPlane />,
  },
  {
    id: 3,
    type: "like",
    user: "Michael",
    message: "gönderini beğendi.",
    time: "4s önce",
    icon: <FaHeart />,
  },
  {
    id: 4,
    type: "comment",
    user: "Anna",
    message: 'yorum yaptı: "Harika kare!"',
    time: "1g önce",
    icon: <FaRegCommentDots />,
  },
  {
    id: 5,
    type: "follow_accepted",
    user: "Sen",
    message: "Sophia’nın takip isteğini onayladın.",
    time: "3g önce",
    icon: <FaCheckCircle />,
  },
  {
    id: 6,
    type: "message_accepted",
    user: "Sen",
    message: "David’in mesaj isteğine izin verdin.",
    time: "2g önce",
    icon: <FaCheckCircle />,
  },
];

const Notification = () => {
  return (
    <div className={styles.notification_page}>
      <h2 className={styles.page_title}>Bildirimler</h2>
      <ul className={styles.notification_list}>
        {notifications.map((item) => (
          <li key={item.id} className={styles.notification_item}>
            <div className={styles.icon_wrapper}>{item.icon}</div>
            <div className={styles.text_wrapper}>
              <div>
                <span className={styles.username}>{item.user}</span>{" "}
                <span className={styles.message}>{item.message}</span>
              </div>
              <div className={styles.time}>{item.time}</div>

              {item.type === "follow_request" && (
                <div className={styles.button_group}>
                  <button className={styles.accept_btn}>Onayla</button>
                  <button className={styles.reject_btn}>Reddet</button>
                </div>
              )}

              {item.type === "message_permission" && (
                <div className={styles.button_group}>
                  <button className={styles.accept_btn}>İzin Ver</button>
                  <button className={styles.reject_btn}>Yoksay</button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notification;
