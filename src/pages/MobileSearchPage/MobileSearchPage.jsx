import React, { useState, useEffect } from "react";
import styles from "./MobileSearchPage.module.css";
import { FiSearch } from "react-icons/fi";
import { useAuth } from "../../context/AuthProvider";
import UserCard from "../../components/UserCard/UserCard";
import BottomNav from "../../components/BottomNav/BottomNav";

const SimpleLoader = () => (
  <div className={styles.loader_container}>
    <div className={styles.loader}></div>
  </div>
);

const MobileSearchPage = () => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const apiBaseUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchText.trim() === "" || !currentUser) {
        setSearchResults([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const idToken = await currentUser.getIdToken();
        const response = await fetch(
          `${apiBaseUrl}/api/users/search?search=${searchText}`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );

        if (!response.ok)
          throw new Error("Kullanıcılar getirilirken hata oluştu.");

        const data = await response.json();
        setSearchResults(data.users);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchText, currentUser, apiBaseUrl]);

  return (
    <div className={styles.page_container}>
      <div className={styles.search_header}>
        <div className={styles.topCenterLogo}>W1</div>
        <div className={styles.search_bar}>
          <FiSearch className={styles.search_icon} />
          <input
            type="text"
            placeholder="Search username..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className={styles.search_input}
            autoFocus
          />
        </div>
      </div>

      <div className={styles.results_content}>
        {loading ? (
          <SimpleLoader />
        ) : error ? (
          <div className={styles.message_box}>
            <div className={styles.message_inner}>
              <p>Hata: {error}</p>
            </div>
          </div>
        ) : searchText.trim() === "" ? (
          <div className={styles.message_box}>
            <div className={styles.message_inner}>
              <p>Type the name of the person you want to find.</p>
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          <ul className={styles.user_list}>
            {searchResults.map((user) => (
              <UserCard key={user.uid} user={user} />
            ))}
          </ul>
        ) : (
          <div className={styles.message_box}>
            <div className={styles.message_inner}>
              <p>"{searchText}" No results found.</p>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MobileSearchPage;
