import React, { useState } from 'react';
import { FiCalendar, FiClock, FiEdit2, FiTrash2, FiPlus, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaYoutube, FaTwitch } from 'react-icons/fa';
import { RiLiveLine } from 'react-icons/ri';
import { BsGrid3X3Gap, BsListUl } from 'react-icons/bs';
import { DatePicker, TimePicker, Select } from 'antd';
import moment from 'moment';

// CSS modülünü içe aktarıyoruz. Bu, stillere 'styles' nesnesi üzerinden erişmemizi sağlar.
import styles from './ContentSchedule.module.css';

const { Option } = Select;

const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/600x400/2F3142/ffffff?text=Content+Thumbnail';

const ContentSchedule = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDate, setSelectedDate] = useState(moment());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    platform: 'youtube',
    date: moment().format('YYYY-MM-DD'),
    time: moment().format('HH:mm'),
    status: 'scheduled'
  });

  const [scheduledPosts, setScheduledPosts] = useState([
    {
      id: 1,
      title: 'Haftalık Ürün Lansmanı',
      description: 'Yaz koleksiyonumuzun tanıtımı ve özel indirimler',
      platform: 'youtube',
      date: '2023-06-15',
      time: '14:00',
      status: 'scheduled',
      thumbnail: PLACEHOLDER_IMAGE_URL
    },
    {
      id: 2,
      title: 'Canlı Ürün Tanıtımı',
      description: 'Yeni gelen ürünlerin canlı tanıtımı ve soru-cevap',
      platform: 'twitch',
      date: '2023-06-16',
      time: '19:30',
      status: 'scheduled',
      thumbnail: PLACEHOLDER_IMAGE_URL
    },
    {
      id: 3,
      title: 'Haftalık Güncelleme',
      description: 'Bu haftaki gelişmeler ve duyurular',
      platform: 'youtube',
      date: '2023-06-18',
      time: '09:00',
      status: 'published',
      thumbnail: PLACEHOLDER_IMAGE_URL
    },
    {
      id: 4,
      title: 'Oyun Canlı Yayını',
      description: 'Yeni oyunumuzu deniyoruz, bize katılın!',
      platform: 'twitch',
      date: '2023-06-22',
      time: '21:00',
      status: 'draft',
      thumbnail: PLACEHOLDER_IMAGE_URL
    },
    {
      id: 5,
      title: 'Yeni Oyun Tanıtımı',
      description: 'En çok satan oyunumuzun kullanım detayları',
      platform: 'youtube',
      date: '2023-06-24',
      time: '11:00',
      status: 'scheduled',
      thumbnail: PLACEHOLDER_IMAGE_URL
    }
  ]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleAddPost = () => {
    const newId = scheduledPosts.length > 0 ? Math.max(...scheduledPosts.map(p => p.id)) + 1 : 1;
    const postToAdd = {
      ...newPost,
      id: newId,
      date: moment(newPost.date).format('YYYY-MM-DD'),
      time: newPost.time,
      thumbnail: PLACEHOLDER_IMAGE_URL
    };
    setScheduledPosts([...scheduledPosts, postToAdd]);
    setShowAddModal(false);
    setNewPost({
      title: '',
      description: '',
      platform: 'youtube',
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HH:mm'),
      status: 'scheduled'
    });
  };

  const handleDeletePost = (id) => {
    setPostToDelete(id);
    setShowConfirmModal(true);
  };
  
  const confirmDelete = () => {
    setScheduledPosts(scheduledPosts.filter(post => post.id !== postToDelete));
    setShowConfirmModal(false);
    setPostToDelete(null);
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'youtube':
        return <FaYoutube className={styles.platformIcon} style={{ color: '#FF0000' }} />;
      case 'twitch':
        return <FaTwitch className={styles.platformIcon} style={{ color: '#9147FF' }} />;
      default:
        return <RiLiveLine className={styles.platformIcon} />;
    }
  };

  const getStatusBadge = (status) => {
    return <span className={`${styles.statusBadge} ${styles[status]}`}>{status === 'scheduled' ? 'Planlandı' : status === 'published' ? 'Yayınlandı' : 'Taslak'}</span>;
  };

  const filteredPosts = scheduledPosts.filter(post => {
    if (selectedPlatform !== 'all' && post.platform !== selectedPlatform) return false;
    if (selectedStatus !== 'all' && post.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className={styles.container}>
      {/* Header and Controls */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>
            <FiCalendar className={styles.titleIcon} />
            İçerik Yayın Takvimi
          </h1>
          <div className={styles.dateNavigator}>
            <button className={styles.navButton} onClick={() => setSelectedDate(moment(selectedDate).subtract(1, 'days'))}>
              <FiChevronLeft />
            </button>
            <DatePicker 
              className={styles.datePicker}
              onChange={handleDateChange}
              value={selectedDate}
              format="YYYY-MM-DD"
              // Ant Design'ın stilini değiştirmek için style prop'u kullanabiliriz.
              style={{ background: 'var(--secondary-bg)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
            />
            <button className={styles.navButton} onClick={() => setSelectedDate(moment(selectedDate).add(1, 'days'))}>
              <FiChevronRight />
            </button>
            <div className={styles.viewToggle}>
              <button 
                className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <BsGrid3X3Gap />
              </button>
              <button 
                className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                onClick={() => setViewMode('list')}
              >
                <BsListUl />
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.headerRight}>
          <button 
            className={styles.filterButton}
            onClick={() => setShowFilter(!showFilter)}
          >
            <FiFilter />
            <span>Filtrele</span>
          </button>
          <button 
            className={styles.addButton}
            onClick={() => setShowAddModal(true)}
          >
            <FiPlus />
            <span>Yeni Yayın</span>
          </button>
        </div>
      </div>
      
      {/* Filter Panel */}
      {showFilter && (
        <div className={styles.filterPanel}>
          <div className={styles.filterGroup}>
            <label>Platform</label>
            <Select
              defaultValue="all"
              style={{ width: '100%' }}
              onChange={value => setSelectedPlatform(value)}
              className={styles.filterSelect}
            >
              <Option value="all">Tüm Platformlar</Option>
              <Option value="youtube">YouTube</Option>
              <Option value="twitch">Twitch</Option>
            </Select>
          </div>
          
          <div className={styles.filterGroup}>
            <label>Durum</label>
            <Select
              defaultValue="all"
              style={{ width: '100%' }}
              onChange={value => setSelectedStatus(value)}
              className={styles.filterSelect}
            >
              <Option value="all">Tüm Durumlar</Option>
              <Option value="scheduled">Planlandı</Option>
              <Option value="published">Yayınlandı</Option>
              <Option value="draft">Taslak</Option>
            </Select>
          </div>
          
          <button className={styles.applyFilters} onClick={() => setShowFilter(false)}>
            Filtreleri Uygula
          </button>
        </div>
      )}
      
      {/* Content Area */}
      <div className={styles.contentArea}>
        {viewMode === 'grid' ? (
          <div className={styles.gridView}>
            {filteredPosts.map(post => (
              <div key={post.id} className={styles.postCard}>
                <div className={styles.postThumbnail}>
                  <img src={post.thumbnail} alt={post.title} />
                  <div className={styles.postOverlay}>
                    <button className={styles.postAction} onClick={() => {/* Edit action */}}>
                      <FiEdit2 />
                    </button>
                    <button className={styles.postAction} onClick={() => handleDeletePost(post.id)}>
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                
                <div className={styles.postDetails}>
                  <div className={styles.postHeader}>
                    <h3>{post.title}</h3>
                    {getPlatformIcon(post.platform)}
                  </div>
                  
                  <p className={styles.postDescription}>{post.description}</p>
                  
                  <div className={styles.postMeta}>
                    <div className={styles.postDate}>
                      <FiCalendar />
                      <span>{post.date}</span>
                    </div>
                    <div className={styles.postTime}>
                      <FiClock />
                      <span>{post.time}</span>
                    </div>
                  </div>
                  
                  <div className={styles.postFooter}>
                    {getStatusBadge(post.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.listView}>
            <div className={styles.listHeader}>
              <div className={styles.listColumn}>Başlık</div>
              <div className={`${styles.listColumn} ${styles.mobileHidden}`}>Platform</div>
              <div className={`${styles.listColumn} ${styles.mobileHidden}`}>Tarih</div>
              <div className={`${styles.listColumn} ${styles.mobileHidden}`}>Saat</div>
              <div className={`${styles.listColumn} ${styles.mobileHidden}`}>Durum</div>
              <div className={`${styles.listColumn} ${styles.listActionsColumn}`}>İşlemler</div>
            </div>
            
            {filteredPosts.map(post => (
              <div key={post.id} className={styles.listItem}>
                <div className={`${styles.listCell} ${styles.listTitleCell}`}>
                  <div className={styles.listTitle}>{post.title}</div>
                  <div className={styles.listDescription}>{post.description}</div>
                </div>
                
                <div className={styles.listCell}>
                  <div className={styles.mobileLabel}>Platform</div>
                  <div className={styles.platformInfo}>
                    {getPlatformIcon(post.platform)}
                    <span className={styles.platformName}>
                      {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className={styles.listCell}>
                  <div className={styles.mobileLabel}>Tarih</div>
                  {post.date}
                </div>
                
                <div className={styles.listCell}>
                  <div className={styles.mobileLabel}>Saat</div>
                  {post.time}
                </div>
                
                <div className={styles.listCell}>
                  <div className={styles.mobileLabel}>Durum</div>
                  {getStatusBadge(post.status)}
                </div>
                
                <div className={`${styles.listCell} ${styles.listActionsCell}`}>
                  <button className={styles.listAction} onClick={() => {/* Edit action */}}>
                    <FiEdit2 />
                  </button>
                  <button className={styles.listAction} onClick={() => handleDeletePost(post.id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add New Post Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Yeni Yayın Ekle</h2>
            
            <div className={styles.formGroup}>
              <label>Başlık</label>
              <input 
                type="text" 
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                placeholder="Yayın başlığını girin"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Açıklama</label>
              <textarea 
                value={newPost.description}
                onChange={(e) => setNewPost({...newPost, description: e.target.value})}
                placeholder="Yayın açıklamasını girin"
                rows="3"
              />
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Platform</label>
                <Select
                  defaultValue="youtube"
                  style={{ width: '100%' }}
                  onChange={value => setNewPost({...newPost, platform: value})}
                >
                  <Option value="youtube">YouTube</Option>
                  <Option value="twitch">Twitch</Option>
                </Select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Durum</label>
                <Select
                  defaultValue="scheduled"
                  style={{ width: '100%' }}
                  onChange={value => setNewPost({...newPost, status: value})}
                >
                  <Option value="scheduled">Planlandı</Option>
                  <Option value="draft">Taslak</Option>
                </Select>
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Tarih</label>
                <DatePicker 
                  style={{ width: '100%' }}
                  value={newPost.date ? moment(newPost.date) : null}
                  onChange={(date, dateString) => setNewPost({...newPost, date: dateString})}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Saat</label>
                <TimePicker 
                  style={{ width: '100%' }}
                  value={newPost.time ? moment(newPost.time, 'HH:mm') : null}
                  onChange={(time, timeString) => setNewPost({...newPost, time: timeString})}
                />
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowAddModal(false)}
              >
                İptal
              </button>
              <button 
                className={styles.saveButton}
                onClick={handleAddPost}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      {showConfirmModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModalContent}>
            <h2 className={styles.modalTitle}>Onay</h2>
            <p>Bu yayını silmek istediğinizden emin misiniz?</p>
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowConfirmModal(false)}
              >
                İptal
              </button>
              <button 
                className={styles.deleteButton}
                onClick={confirmDelete}
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentSchedule;
