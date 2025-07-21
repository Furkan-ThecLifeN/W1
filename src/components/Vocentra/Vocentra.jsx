import React, { useState } from "react";
import styles from "./Vocentra.module.css";
import VocentraServerList from "./VocentraServerList/VocentraServerList";
import VocentraRoster from "./VocentraRoster/VocentraRoster";

const Vocentra = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  return (
    <div className={styles.Vocentra}>
      <div className={styles.VoicentraleftBar}>
        <VocentraServerList onSelectUser={setSelectedUser} />
      </div>

      <div className={styles.Vocentra_main}>
        <VocentraRoster />
      </div>

      <div className={styles.profileArea}></div>
    </div>
  );
};

export default Vocentra;
