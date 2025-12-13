import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { RiSignalTowerFill } from "react-icons/ri";
import styles from "./ServerSidebar.module.css";
import CreateServerModal from "../CreateServerModal/CreateServerModal";
import { useServerStore } from "../../../Store/useServerStore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const ServerSidebar = () => {
  const {
    servers,
    activeServerId,
    fetchUserServers,
    fetchServerDetails, // ✅ Detay çekici
    addServer,
    isLoading,
  } = useServerStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate(); // ✅
  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchUserServers();
    });
    return () => unsubscribe();
  }, [fetchUserServers]);

  // ✅ Tıklama Fonksiyonu (DÜZELTİLDİ)
  const handleServerClick = (serverId) => {
    fetchServerDetails(serverId);
    navigate(`/server/${serverId}`); // ✅ URL değişmeli
  };

  const handleServerCreated = (backendResponse) => {
    addServer(backendResponse);
    setIsModalOpen(false);
  };

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.headerCard}>
          <h2 className={styles.title}>VoCentra</h2>
          <button
            className={styles.createBtn}
            onClick={() => setIsModalOpen(true)}
          >
            <FaPlus />
          </button>
        </div>

        <div className={styles.serverList}>
          {isLoading && servers.length === 0 ? (
            <div style={{ color: "white", padding: "20px" }}>...</div>
          ) : (
            servers.map((server) => (
              <div
                key={server.id}
                className={`${styles.serverItem} ${
                  server.id === activeServerId ? styles.active : ""
                }`}
                // ✅ ARTIK ÇALIŞACAK
                onClick={() => handleServerClick(server.id)}
              >
                <div className={styles.avatarWrapper}>
                  {server.img || server.icon ? (
                    <img
                      src={server.img || server.icon}
                      className={styles.avatar}
                      alt={server.name}
                    />
                  ) : (
                    <div className={styles.initialAvatar}>
                      {getInitial(server.name)}
                    </div>
                  )}
                  {server.unread > 0 && (
                    <span className={styles.badge}>{server.unread}</span>
                  )}
                </div>

                {/* Hover Tooltip (İsteğe bağlı) */}
                <div className={styles.tooltip}>{server.name}</div>
              </div>
            ))
          )}
        </div>
      </aside>

      {isModalOpen && (
        <CreateServerModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleServerCreated}
        />
      )}
    </>
  );
};

export default ServerSidebar;
