import React from 'react';
import styles from './PostThumbnail.module.css';
import { BsImages } from 'react-icons/bs'; // Birden fazla görseli belirtmek için ikon

/**
 * Gönderinin ilk görselini thumbnail olarak gösterir ve tıklandığında modalı açar.
 * @param {object} data - Gönderi verisi (imageUrls içermelidir)
 * @param {function} onClick - Tıklama olayını işleyecek fonksiyon
 */
const PostThumbnail = ({ data, onClick }) => {
  if (!data || !data.imageUrls || data.imageUrls.length === 0) {
    // Görsel yoksa boş döndür
    return null;
  }

  const imageUrl = data.imageUrls[0];
  const hasMultipleImages = data.imageUrls.length > 1;

  return (
    <div className={styles.thumbnail_container} onClick={() => onClick(data)}>
      <img 
        src={imageUrl} 
        alt="Post Thumbnail" 
        className={styles.thumbnail_image} 
        loading="lazy"
      />
      {/* Birden fazla görsel varsa, sağ üst köşede bir ikon göster */}
      {hasMultipleImages && (
          <div className={styles.multiple_indicator}>
              <BsImages size={16} color="white" />
          </div>
      )}
    </div>
  );
};

export default PostThumbnail;