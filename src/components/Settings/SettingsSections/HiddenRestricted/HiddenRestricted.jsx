import React, { useState } from "react";
import styles from "./HiddenRestricted.module.css";
import {
  FiUserX,
  FiEyeOff,
  FiUserPlus,
  FiX,
  FiCheck,
  FiEye,
  FiSliders,
  FiUser,
} from "react-icons/fi";
import Modal from "react-modal";

Modal.setAppElement("#root");

const restrictedUsers = [
  {
    username: "@noisyuser",
    avatar: "https://i.pravatar.cc/150?img=32",
    hidden: ["Posts", "Stories"],
  },
  {
    username: "@randomviewr",
    avatar: "https://i.pravatar.cc/150?img=45",
    hidden: ["Stories", "Live Streams"],
  },
  {
    username: "@quietwatcher",
    avatar: "https://i.pravatar.cc/150?img=60",
    hidden: ["Posts"],
  },
];

const allUsers = [
  {
    id: 1,
    name: "Furkan ThecLife",
    username: "furkan_theclifen",
    avatar: "https://i.pravatar.cc/150?img=7",
    hidden: [],
  },
  {
    id: 2,
    name: "Jane Doe",
    username: "jane_d",
    avatar: "https://i.pravatar.cc/150?img=8",
    hidden: [],
  },
  {
    id: 3,
    name: "John Smith",
    username: "johnsmith",
    avatar: "https://i.pravatar.cc/150?img=9",
    hidden: [],
  },
];

const contentOptions = ["Posts", "Stories", "Live Streams", "Notes"];

const HiddenRestricted = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [userStates, setUserStates] = useState(allUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const toggleHidden = (userId, option) => {
    setUserStates((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          const newHidden = user.hidden.includes(option)
            ? user.hidden.filter((item) => item !== option)
            : [...user.hidden, option];
          return { ...user, hidden: newHidden };
        }
        return user;
      })
    );
  };

  const filteredUsers = userStates.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "restricted" && user.hidden.length > 0) ||
      (activeFilter === "unrestricted" && user.hidden.length === 0);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Hidden / Restricted</h2>
      <p className={styles.subtext}>
        These users are restricted from seeing your selected content.
      </p>

      <div className={styles.list}>
        {restrictedUsers.map((user, idx) => (
          <div className={styles.card} key={idx}>
            <img src={user.avatar} alt="avatar" className={styles.avatar} />
            <div className={styles.info}>
              <span className={styles.username}>{user.username}</span>
              <div className={styles.hiddenItems}>
                {user.hidden.map((item, i) => (
                  <span key={i} className={styles.hiddenTag}>
                    <FiEyeOff /> {item}
                  </span>
                ))}
              </div>
            </div>
            <button className={styles.unrestrictBtn}>
              <FiUserX /> Unrestrict
            </button>
          </div>
        ))}
      </div>

      <button className={styles.addBtn} onClick={() => setModalOpen(true)}>
        <FiUserPlus /> Add New Restriction
      </button>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className={styles.modal}
        overlayClassName={styles.overlay}
        closeTimeoutMS={200}
      >
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <FiSliders className={styles.headerIcon} />
            <h3 className={styles.modalTitle}>Content Restriction Manager</h3>
          </div>
          <button
            onClick={() => setModalOpen(false)}
            className={styles.closeButton}
          >
            <FiX />
          </button>
        </div>

        <div className={styles.modalControls}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterTab} ${
                activeFilter === "all" ? styles.active : ""
              }`}
              onClick={() => setActiveFilter("all")}
            >
              All Users
            </button>
            <button
              className={`${styles.filterTab} ${
                activeFilter === "restricted" ? styles.active : ""
              }`}
              onClick={() => setActiveFilter("restricted")}
            >
              Restricted
            </button>
            <button
              className={`${styles.filterTab} ${
                activeFilter === "unrestricted" ? styles.active : ""
              }`}
              onClick={() => setActiveFilter("unrestricted")}
            >
              Unrestricted
            </button>
          </div>
        </div>

        <div className={styles.modalContent}>
          {filteredUsers.length === 0 ? (
            <div className={styles.emptyState}>
              <FiUser className={styles.emptyIcon} />
              <p>No users found matching your criteria</p>
            </div>
          ) : (
            <div className={styles.userGrid}>
              {filteredUsers.map((user) => (
                <div className={styles.userCard} key={user.id}>
                  <div className={styles.userHeader}>
                    <div className={styles.avatarContainer}>
                      <img
                        src={user.avatar}
                        className={styles.avatar}
                        alt={user.name}
                      />
                    </div>
                    <div className={styles.userInfo}>
                      <div className={styles.fullname}>{user.name}</div>
                      <div className={styles.username}>@{user.username}</div>
                    </div>

                    {user.hidden.length > 0 && (
                      <div className={styles.restrictedBadge}>
                        <span>
                          {user.hidden.length} restriction
                          {user.hidden.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.restrictionOptions}>
                    {contentOptions.map((option) => (
                      <div
                        key={option}
                        className={`${styles.optionItem} ${
                          user.hidden.includes(option) ? styles.active : ""
                        }`}
                        onClick={() => toggleHidden(user.id, option)}
                      >
                        <div className={styles.optionCheckbox}>
                          {user.hidden.includes(option) && (
                            <FiCheck className={styles.checkIcon} />
                          )}
                        </div>
                        <div className={styles.optionLabel}>
                          <FiEyeOff className={styles.optionIcon} />
                          <span>{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            onClick={() => setModalOpen(false)}
            className={styles.secondaryButton}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // İstersen burada backend'e kaydetme işlemi yapılabilir
              setModalOpen(false);
            }}
            className={styles.primaryButton}
          >
            Apply Restrictions
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default HiddenRestricted;
