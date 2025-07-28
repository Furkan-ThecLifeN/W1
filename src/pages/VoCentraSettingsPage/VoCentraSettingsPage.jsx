import React from 'react'
import VoCentraSettings from '../../components/VoCentraSettings/VoCentraSettings';
import styles from "./VoCentraSettingsPage.module.css";

const VoCentraSettingsPage = () => {
  return (
    <div className={styles.vocentraSettings}>
        <VoCentraSettings />
    </div>
  )
}

export default VoCentraSettingsPage