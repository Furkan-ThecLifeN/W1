import React, { useState } from "react";
import styles from "./VoiceRoomSettingsModal.module.css";
import { FaTimes, FaEdit, FaLock, FaUnlock, FaTrash } from "react-icons/fa";

const VoiceRoomSettingsModal = ({ channel, onClose, onLock, onRename, onDelete }) => {
  const [name, setName] = useState(channel.name);

  return (
    <div className={styles.createChannelOverlay} onClick={onClose}>
      <div className={styles.createChannelModal} onClick={(e) => e.stopPropagation()}>
        
        {/* Header Bölümü */}
        <div className={styles.modalHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 10px 24px' }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Oda Ayarları</h3>
            <p style={{ color: '#8a8e94', fontSize: '0.85rem', marginTop: '8px' }}>Kanal ismini ve erişimini yönet.</p>
          </div>
          <FaTimes 
            style={{ color: '#72767d', cursor: 'pointer', background: '#111', padding: '5px', borderRadius: '50%' }} 
            onClick={onClose} 
          />
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Oda İsmi Grubu */}
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>ODA İSMİ</label>
            <div style={{ display: "flex", gap: "10px", alignItems: 'center' }}>
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                background: '#09090b', 
                border: '1px solid #333', 
                borderRadius: '8px', 
                padding: '10px 15px' 
              }}>
                <FaEdit style={{ color: '#58bff2ff', marginRight: '12px' }} />
                <input
                  className={styles.modalInput}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%' }}
                />
              </div>
              <button className={styles.btnCreate} onClick={() => onRename(name)}>
                Kaydet
              </button>
            </div>
          </div>

          {/* Gizlilik Grubu */}
          <div className={styles.settingGroup} style={{ marginTop: "25px", borderTop: "1px solid #1a1a1a", paddingTop: "20px" }}>
            <label className={styles.settingLabel}>GİZLİLİK VE YÖNETİM</label>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: '#111', padding: '12px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {channel.locked ? <FaLock style={{ color: '#f72828ff' }} /> : <FaUnlock style={{ color: '#58bff2ff' }} />}
                <span style={{ color: "#ccc", fontSize: "0.9rem" }}>Odayı Kilitle</span>
              </div>
              <button
                className={channel.locked ? styles.btnCancel : styles.btnCreate}
                onClick={() => onLock(!channel.locked)}
                style={{ width: "110px", fontSize: '0.8rem' }}
              >
                {channel.locked ? "KİLİDİ AÇ" : "KİLİTLE"}
              </button>
            </div>
          </div>

          {/* Tehlikeli Bölge (Oda Silme) */}
          <div style={{ marginTop: '20px', background: 'rgba(255, 77, 77, 0.05)', border: '1px solid rgba(255, 77, 77, 0.2)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ color: '#fb1414ff', fontSize: '0.85rem', fontWeight: '600' }}>Kanalı Kalıcı Olarak Sil</div>
             <button 
                onClick={() => { if(window.confirm("Bu odayı silmek istediğine emin misin?")) onDelete(); }}
                style={{ background: '#f71e1eff', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}
             >
                <FaTrash size={12} /> Sil
             </button>
          </div>
        </div>

        {/* Footer Bölümü */}
        <div style={{ backgroundColor: "#050505", padding: "16px 24px", display: "flex", justifyContent: "flex-end", borderTop: "1px solid #1a1a1a" }}>
          <button className={styles.closeBtn} onClick={onClose} style={{ background: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer' }}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceRoomSettingsModal;