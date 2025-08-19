// src/components/settings/DeleteAccount.jsx (Örnek yol)
import React, { useState } from "react";
import Modal from "react-modal";
import styles from "./DeleteAccount.module.css";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../../../../context/AuthProvider";
import { getAuth, signOut } from "firebase/auth";

Modal.setAppElement("#root");

const DeleteAccount = () => {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useAuth();
  
  const firebaseAuth = getAuth();

  const handleDelete = async () => {
    if (!password.trim() || !confirmChecked) {
      showToast('Lütfen şifrenizi girin ve onayı işaretleyin.', 'error');
      return;
    }

    setLoading(true);

    try {
      const idToken = await firebaseAuth.currentUser.getIdToken();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ password, reason }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message, 'success');
        setShowModal(false);
        // Kullanıcının oturumunu kapat
        await signOut(firebaseAuth);
      } else {
        showToast(data.error || 'Hesap silme işlemi başarısız.', 'error');
      }
    } catch (error) {
      console.error('Hesap silme hatası:', error);
      showToast('Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
    } finally {
      setLoading(false);
      setReason("");
      setPassword("");
      setConfirmChecked(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Hesabı Sil</h2>
      <p className={styles.subtext}>
        Hesabınızı ve tüm ilişkili verileri kalıcı olarak silin. Bu işlem geri alınamaz.
      </p>

      <button className={styles.deleteBtn} onClick={() => setShowModal(true)}>
        <FiTrash2 /> Hesabımı Sil
      </button>

      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h3 className={styles.modalTitle}>
          <FiAlertTriangle /> Kalıcı Silme İşlemini Onayla
        </h3>

        <p className={styles.modalText}>Hesabınızı neden siliyorsunuz? (isteğe bağlı)</p>
        <textarea
          className={styles.reasonInput}
          placeholder="Açıklamanız..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <label className={styles.label}>Şifrenizi girin</label>
        <input
          className={styles.input}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className={styles.confirmCheckbox}>
          <input
            type="checkbox"
            checked={confirmChecked}
            onChange={() => setConfirmChecked(!confirmChecked)}
          />
          Bu işlemin kalıcı olduğunu ve geri alınamayacağını anlıyorum.
        </label>

        <div className={styles.modalButtons}>
          <button
            className={styles.deleteConfirmBtn}
            disabled={!password.trim() || !confirmChecked || loading}
            onClick={handleDelete}
          >
            {loading ? 'Siliniyor...' : 'Silme İşlemini Onayla'}
          </button>
          <button className={styles.cancelBtn} onClick={() => setShowModal(false)} disabled={loading}>
            İptal
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default DeleteAccount;