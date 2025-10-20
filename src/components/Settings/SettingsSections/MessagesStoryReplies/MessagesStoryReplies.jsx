import React, { useState, useEffect } from "react";
import {
    FiMessageSquare,
    FiCamera,
    FiUser,
    FiUserPlus, // Takip Ettiklerin ikonu
    FiUserX,
    FiCheck,
    FiX,
    FiStar,
    FiSettings, // Modal ikonları
    FiTrash2    // Modal ikonları
} from "react-icons/fi";
// === YENİ CSS DOSYASINI KULLANIYORUZ ===
import styles from "./MessagesStoryReplies.module.css";
import { useUser } from "../../../../context/UserContext"; // Path'inizi kontrol edin
import LoadingOverlay from "../../../LoadingOverlay/LoadingOverlay"; // Path'inizin doğru olduğundan emin olun

const MessagesStoryReplies = () => {
    const { currentUser, updatePrivacySettings, loading: contextLoading } = useUser();

    // Başlangıç state'ini useEffect içinde ayarlama
    const [localSettings, setLocalSettings] = useState({
        whoCanMessage: "everyone",
        allowStoryReplies: true, // Başlangıçta true (görsel amaçlı)
        storyReplyAudience: "everyone",
    });

    // Custom list management state'leri
    const [showCustomList, setShowCustomList] = useState(false);
    const [customListType, setCustomListType] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [followers, setFollowers] = useState([ // Modal testi için sahte veri
         { id: 1, name: "Alex Johnson", username: "alexj", avatar: "https://randomuser.me/api/portraits/men/32.jpg", allowed: true, denied: false },
         { id: 2, name: "Sarah Miller", username: "sarahm", avatar: "https://randomuser.me/api/portraits/women/44.jpg", allowed: false, denied: false },
         { id: 3, name: "David Kim", username: "davidk", avatar: "https://randomuser.me/api/portraits/men/22.jpg", allowed: false, denied: true },
         { id: 4, name: "Emma Wilson", username: "emmaw", avatar: "https://randomuser.me/api/portraits/women/33.jpg", allowed: true, denied: false },
    ]);

    // currentUser yüklendiğinde local state'i güncelle
    useEffect(() => {
        if (currentUser?.privacySettings) {
            setLocalSettings({
                whoCanMessage: currentUser.privacySettings.messages || "everyone",
                // Hikaye ayarlarını da yükle ama görsel amaçlı kullanacağız
                allowStoryReplies: currentUser.privacySettings.storyReplies !== undefined ? currentUser.privacySettings.storyReplies : true,
                storyReplyAudience: currentUser.privacySettings.storyReplyAudience || "everyone",
            });
        }
    }, [currentUser]);

    // Mesaj ayarını değiştirme fonksiyonu (Bu çalışır)
    const toggleMessageSetting = (value) => {
        setLocalSettings((prev) => ({ ...prev, whoCanMessage: value }));
        updatePrivacySettings({ type: "messages", data: { messages: value } });
    };

    // --- Hikaye Fonksiyonları Devre Dışı ---
    // const toggleStoryReplies = () => { /* İşlevsiz */ };
    // const toggleStoryReplyAudience = (value) => { /* İşlevsiz */ };

    // Modal fonksiyonları (sahte veri üzerinde)
    const toggleUserPermission = (userId, type) => {
        setFollowers((prev) => prev.map((user) => {
            if (user.id === userId) {
                if (type === "allow") return { ...user, allowed: !user.allowed, denied: false };
                else return { ...user, denied: !user.denied, allowed: false };
            }
            return user;
        }));
    };
    const openCustomList = (type) => { setCustomListType(type); setShowCustomList(true); };
    const filteredFollowers = followers.filter(
        (user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Yüklenme durumu
    if (contextLoading) return <LoadingOverlay />;
    if (!currentUser) return <div className={styles.wrapper}><p className={styles.pageSubtitle}>Ayarlar yüklenemedi. Lütfen tekrar deneyin.</p></div>;

    return (
        <div className={styles.wrapper}>
            {/* Sayfa Başlığı */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Mesaj & Yanıt Ayarları</h1>
                <p className={styles.pageSubtitle}>Gizliliğini kişiselleştir ve etkileşimlerini kontrol et.</p>
            </div>

            <div className={styles.settingsGrid}>

                {/* === Direkt Mesajlar Kartı (Aktif) === */}
                <div className={styles.settingCard}>
                    <div className={styles.cardHeader}>
                        <FiMessageSquare className={styles.cardIcon} />
                        <h2 className={styles.cardTitle}>Direkt Mesajlar</h2>
                    </div>
                    <p className={styles.cardDescription}>Kimlerin sana mesaj gönderebileceğini belirle.</p>
                    <div className={styles.optionGroup}>
                        {/* Aktif Butonlar */}
                        <button className={`${styles.optionButton} ${localSettings.whoCanMessage === 'everyone' ? styles.active : ''}`} onClick={() => toggleMessageSetting('everyone')}> <FiUser /> <span>Herkes</span> {localSettings.whoCanMessage === 'everyone' && <FiCheck />} </button>
                        <button className={`${styles.optionButton} ${localSettings.whoCanMessage === 'followers' ? styles.active : ''}`} onClick={() => toggleMessageSetting('followers')}> <FiUserPlus /> <span>Takip Ettiklerin</span> {localSettings.whoCanMessage === 'followers' && <FiCheck />} </button>
                        <button className={`${styles.optionButton} ${localSettings.whoCanMessage === 'closeFriends' ? styles.active : ''}`} onClick={() => toggleMessageSetting('closeFriends')}> <FiStar /> <span>Yakın Arkadaşlar</span> {localSettings.whoCanMessage === 'closeFriends' && <FiCheck />} </button>
                        <button className={`${styles.optionButton} ${localSettings.whoCanMessage === 'no' ? styles.active : ''}`} onClick={() => toggleMessageSetting('no')}> <FiUserX /> <span>Hiç Kimse</span> {localSettings.whoCanMessage === 'no' && <FiCheck />} </button>
                    </div>
                    {/* Aktif Custom Butonlar */}
                    <div className={styles.customActions}>
                        <button className={styles.customButton} onClick={() => openCustomList('allow')}> <FiSettings /> İzin Verilenleri Yönet </button>
                        <button className={`${styles.customButton} ${styles.denyButton}`} onClick={() => openCustomList('deny')}> <FiTrash2 /> Engellenenleri Yönet </button>
                    </div>
                </div>

                {/* === Hikaye Yanıtları Kartı (Devre Dışı) === */}
                {/* ✅ disabledCard sınıfı eklendi */}
                <div className={`${styles.settingCard} ${styles.disabledCard}`}>
                    <div className={styles.cardHeader}>
                        <FiCamera className={styles.cardIcon} />
                        <h2 className={styles.cardTitle}>Hikaye Yanıtları</h2>
                        {/* ✅ "Yakında" Etiketi */}
                        <span className={styles.soonBadge}>Yakında</span>
                    </div>

                    {/* Anahtar (Görsel ama tıklanamaz) */}
                    <div className={styles.toggleContainer}>
                        <p className={styles.toggleLabel}>Yanıtları Aç/Kapat</p>
                        <label className={styles.switch}>
                            {/* Input devre dışı, onClick yok */}
                            <input type="checkbox" checked={localSettings.allowStoryReplies} readOnly disabled />
                            <span className={styles.slider}></span>
                        </label>
                    </div>

                    {/* Seçenekler (Görsel ama tıklanamaz) */}
                    {/* true kullanarak her zaman göster */}
                    {true && (
                         <div className={styles.subOptionGroup}>
                             <p className={styles.cardDescription}>Kimler yanıt verebilir?</p>
                             {/* Butonlar devre dışı, onClick yok */}
                            <button className={`${styles.optionButton} ${localSettings.storyReplyAudience === 'everyone' ? styles.active : ''}`} disabled>
                                <FiUser className={styles.optionIcon} /> <span className={styles.optionText}>Herkes</span> {localSettings.storyReplyAudience === 'everyone' && <FiCheck className={styles.checkIcon} />}
                            </button>
                            <button className={`${styles.optionButton} ${localSettings.storyReplyAudience === 'closeFriends' ? styles.active : ''}`} disabled>
                                <FiStar className={styles.optionIcon} /> <span className={styles.optionText}>Yakın Arkadaşlar</span> {localSettings.storyReplyAudience === 'closeFriends' && <FiCheck className={styles.checkIcon} />}
                            </button>
                         </div>
                    )}

                     {/* Özel Listeler Butonları (Görsel ama tıklanamaz) */}
                     <div className={styles.customActions}>
                        {/* Butonlar devre dışı, onClick yok */}
                        <button className={styles.customButton} disabled> <FiSettings /> İzin Verilenleri Yönet </button>
                        <button className={`${styles.customButton} ${styles.denyButton}`} disabled> <FiTrash2 /> Engellenenleri Yönet </button>
                    </div>
                </div>
            </div>

            {/* === Custom List Modal (Aktif) === */}
            {showCustomList && (
                <div className={styles.modalOverlay} onClick={() => setShowCustomList(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>{customListType === 'allow' ? 'İzin Verilen Kullanıcılar' : 'Engellenen Kullanıcılar'}</h3>
                            <button className={styles.modalCloseButton} onClick={() => setShowCustomList(false)}><FiX /></button>
                        </div>
                        <div className={styles.modalSearch}>
                            <input type="text" placeholder="Kullanıcı ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput}/>
                        </div>
                        <div className={styles.modalUserList}>
                            {filteredFollowers.length > 0 ? (
                                filteredFollowers.map((user) => (
                                    <div key={user.id} className={styles.userItem}>
                                        <img src={user.avatar} alt={user.name} className={styles.userAvatar} />
                                        <div className={styles.userInfo}>
                                            <span className={styles.userName}>{user.name}</span>
                                            <span className={styles.userUsername}>@{user.username}</span>
                                        </div>
                                        <button className={`${styles.permissionButton} ${customListType === 'allow' ? (user.allowed ? styles.allowed : '') : (user.denied ? styles.denied : '')}`} onClick={() => toggleUserPermission(user.id, customListType)}>
                                            {customListType === 'allow' ? (user.allowed ? <><FiCheck /> İzinli</> : 'İzin Ver') : (user.denied ? <><FiX /> Engelli</> : 'Engelle')}
                                        </button>
                                    </div>
                                ))
                            ) : (<p className={styles.emptyList}>Liste boş veya arama sonucu bulunamadı.</p>)}
                        </div>
                         <div className={styles.modalFooter}>
                            <button className={styles.saveButton} onClick={() => setShowCustomList(false)}> Kapat </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesStoryReplies;