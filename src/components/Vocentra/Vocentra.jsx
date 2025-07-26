import React, { useState } from "react";
import styles from "./Vocentra.module.css";
import ServerList from "./VocentraServerList/VocentraServerList";
import VoCentraRoster from "./VocentraRoster/VocentraRoster";
import VoiceChannelWidget from "../VoiceChannelWidget/VoiceChannelWidget";
import VoCentraUserCard from "../VocentraChannels/VocentraUserCard/VocentraUserCard";

const Vocentra = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className={styles.Vocentra}>
      <div className={styles.VoicentraleftBar}>
        

        <ServerList onSelectUser={setSelectedUser} />
      </div>

      <div className={styles.Vocentra_main}>
        <VoCentraRoster />
      </div>

      <div className={styles.VocentraRightBar}>
        <VoiceChannelWidget 
        userName="Furkan ThecLifeN"
        channelName="Ses Kanalı"
        serverName="W1 Communication"
      />
    </div>
    </div>
  );
};

export default Vocentra;
