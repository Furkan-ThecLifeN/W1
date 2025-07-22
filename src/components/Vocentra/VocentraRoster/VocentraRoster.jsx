import React, { useState } from "react";
import { FaCircle, FaSearch, FaUserPlus } from "react-icons/fa";
import styles from "./VoCentraRoster.module.css";

const dummyUsers = [
  {
    id: 1,
    name: "John Doe",
    note: "Online çalışıyorum.",
    status: "online",
    isPrivate: false,
  },
  { id: 2, name: "Jane Smith", note: "", status: "busy", isPrivate: true },
  {
    id: 3,
    name: "Ali Veli",
    note: "Yarın toplantı.",
    status: "offline",
    isPrivate: false,
  },
  { id: 4, name: "Elif Yılmaz", note: "", status: "online", isPrivate: true },
  {
    id: 5,
    name: "Mert Kaya",
    note: "Kod yazıyorum...",
    status: "busy",
    isPrivate: false,
  },
];

const pendingRequests = [
  { id: 6, name: "Ahmet Yıldız" },
  { id: 7, name: "Zeynep Demir" },
];

const VoCentraRoster = () => {
  const [activeTab, setActiveTab] = useState("online");
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = dummyUsers.filter((u) => {
    if (activeTab === "online") return u.status === "online";
    if (activeTab === "pending") return pendingRequests;
    return true;
  });

  const searchedUsers = dummyUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Arkadaş Listesi</h2>
        <button
          className={styles.addFriendButton}
          onClick={() => setShowAddFriendModal(true)}
        >
          <FaUserPlus className={styles.buttonIcon} />
          <span>Yeni Bağlantı</span>
        </button>
      </div>

      <div className={styles.tabBar}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "online" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("online")}
        >
          Çevrimiçi ({dummyUsers.filter((u) => u.status === "online").length})
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "all" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("all")}
        >
          Tüm Arkadaşlar ({dummyUsers.length})
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "pending" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("pending")}
        >
          Bekleyenler ({pendingRequests.length})
        </button>
      </div>

      <ul className={styles.userList}>
        {activeTab === "pending"
          ? pendingRequests.map((u) => (
              <li key={u.id} className={styles.userCard}>
                <div className={styles.avatar}></div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{u.name}</span>
                </div>
                <div className={styles.requestActions}>
                  <button className={styles.acceptButton}>Onayla</button>
                  <button className={styles.declineButton}>Yoksay</button>
                </div>
              </li>
            ))
          : filteredUsers.map((u) => (
              <li key={u.id} className={styles.userCard}>
                <div className={styles.avatar}></div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{u.name}</span>
                  {u.note && <span className={styles.userNote}>{u.note}</span>}
                </div>
                <FaCircle
                  className={`${styles.statusIcon} ${
                    u.status === "online"
                      ? styles.online
                      : u.status === "busy"
                      ? styles.busy
                      : styles.offline
                  }`}
                />
              </li>
            ))}
      </ul>

      {showAddFriendModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Yeni Bağlantı Ekle</h3>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowAddFriendModal(false);
                  setSearchQuery("");
                }}
              >
                &times;
              </button>
            </div>

            <div className={styles.searchContainer}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Kullanıcı ara..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <p className={styles.searchHint}>
              {searchQuery ? "Arama sonuçları" : "Popüler kullanıcılar"}
            </p>

            <ul className={styles.searchResults}>
              {searchedUsers.map((u) => (
                <li key={u.id} className={styles.searchCard}>
                  <div className={styles.avatar}></div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{u.name}</span>
                    <span className={styles.userStatus}>
                      {u.status === "online"
                        ? "Çevrimiçi"
                        : u.status === "busy"
                        ? "Meşgul"
                        : "Çevrimdışı"}
                    </span>
                  </div>
                  <button className={styles.addButton}>
                    {u.isPrivate ? "İstek Gönder" : "Takip Et"}
                  </button>
                </li>
              ))}

              {searchedUsers.length === 0 && searchQuery && (
                <div className={styles.noResults}>
                  "{searchQuery}" ile eşleşen kullanıcı bulunamadı
                </div>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoCentraRoster;
