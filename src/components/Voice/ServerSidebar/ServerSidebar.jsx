import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
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
    fetchServerDetails,
    addServer,
    isLoading,
  } = useServerStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchUserServers();
    });
    return () => unsubscribe();
  }, [fetchUserServers]);

  const handleServerClick = (serverId) => {
    if (!serverId) return;
    fetchServerDetails(serverId);
    navigate(`/server/${serverId}`);
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
            servers.map((server) => {
              const serverId = server.id || server._id;
              if (!serverId) return null;

              return (
                <div
                  key={serverId}
                  className={`${styles.serverItem} ${
                    serverId === activeServerId ? styles.active : ""
                  }`}
                  onClick={() => handleServerClick(serverId)}
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

                  <div className={styles.tooltip}>{server.name}</div>
                </div>
              );
            })
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
