import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Vocentra.module.css";

import ServerSidebar from "./ServerSidebar/ServerSidebar";
import FriendRoster from "./FriendRoster/FriendRoster";

const Vocentra = () => {
  const navigate = useNavigate();

  const handleServerSelect = (server) => {
    const slug = server.name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/server/${slug}`, { state: { server } });
  };

  return (
    <div className={styles.container}>
      <nav className={styles.leftRail}>
        <ServerSidebar
          onServerSelect={handleServerSelect}
          activeServerId={null}
        />
      </nav>

      <main className={styles.mainStage}>
        <FriendRoster />
      </main>

      <aside className={styles.rightPanel}>
        <h1>Right bar</h1>
      </aside>
    </div>
  );
};

export default Vocentra;
