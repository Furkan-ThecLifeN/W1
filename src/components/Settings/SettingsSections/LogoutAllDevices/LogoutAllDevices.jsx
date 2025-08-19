import React, { useState } from "react";
import styles from "./LogoutAllDevices.module.css";
import Modal from "react-modal";
import { FiLogOut, FiAlertTriangle} from "react-icons/fi";
import { useAuth } from "../../../../context/AuthProvider"; // ✅ YENİ: AuthContext hook'u eklendi
import { auth } from "../../../../config/firebase-client"; // ✅ YENİ: firebase-client import edildi
import { useNavigate } from "react-router-dom"; // ✅ YENİ: useNavigate import edildi

Modal.setAppElement("#root");

const LogoutAllDevices = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ YENİ: Loading state eklendi
  const { showToast, currentUser } = useAuth(); // ✅ YENİ: showToast ve currentUser alındı
  const navigate = useNavigate(); // ✅ YENİ: navigate hook'u kullanıldı

  const handleLogoutAll = () => {
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!currentUser) {
      showToast("Yetkisiz işlem.", "error");
      setModalOpen(false);
      return;
    }

    setLoading(true);
    setModalOpen(false); // Modalı kapat

    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logoutAll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (res.ok) {
        // Backend işlemi başarılıysa, bu cihazdaki oturumu da sonlandır
        await auth.signOut();
        showToast("Tüm cihazlardaki oturumlarınız başarıyla kapatıldı.", "success");
        navigate("/auth", { replace: true }); // Giriş ekranına yönlendir
      } else {
        const errorData = await res.json();
        showToast(`Hata: ${errorData.error}`, "error");
        setLoading(false);
      }
    } catch (error) {
      console.error("Tüm cihazlardan çıkış yapılırken hata:", error);
      showToast("Bir hata oluştu. Lütfen tekrar deneyin.", "error");
      setLoading(false);
    }
  };

  // ✅ Eski success ve confirmed state'leri kaldırıldı.
  // ✅ Eski setTimeout logiği kaldırıldı.

  return (
    <div className={styles.wrapper}>
      {/* Toast mesajı artık AuthProvider üzerinden yönetiliyor, bu blok kaldırıldı. */}

      <h2 className={styles.heading}>
        <FiLogOut /> Tüm Cihazlardan Çıkış Yap
      </h2>
      <p className={styles.subtext}>
        Güvenliğiniz için, bu cihaz dışındaki tüm aktif oturumlarınızı kapatabilirsiniz.
      </p>

      <button className={styles.logoutBtn} onClick={handleLogoutAll} disabled={loading}>
        {loading ? "İşleniyor..." : "Tüm Cihazlardan Çıkış Yap"}
      </button>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h3 className={styles.modalTitle}>
          <FiAlertTriangle /> Çıkışı Onayla
        </h3>
        <p className={styles.modalText}>
          Tüm cihazlardaki oturumlarınızı kapatmak istediğinizden emin misiniz? Bu işlem, mevcut cihazınız hariç tüm aktif oturumları sonlandıracaktır.
        </p>
        <div className={styles.modalButtons}>
          <button className={styles.confirmBtn} onClick={handleConfirm} disabled={loading}>
            Evet, Tüm Cihazlardan Çıkış Yap
          </button>
          <button className={styles.cancelBtn} onClick={() => setModalOpen(false)} disabled={loading}>
            İptal
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default LogoutAllDevices;