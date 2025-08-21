import React, { useState, useEffect } from "react";
import SearchOverlayStyle from "./SearchOverlay.module.css";
import { AiOutlineClose } from "react-icons/ai";
import { useAuth } from "../../context/AuthProvider";
import UserCard from "../UserCard/UserCard";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";

const SearchOverlay = ({ searchText, onClose }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const apiBaseUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchText.trim() === "") {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const idToken = await currentUser.getIdToken();
        const response = await fetch(
          `${apiBaseUrl}/api/users/search?search=${searchText}`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Kullanıcılar getirilirken bir hata oluştu.");
        }

        const data = await response.json();
        setSearchResults(data.users);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchText, currentUser, apiBaseUrl]);

  return (
    <div className={SearchOverlayStyle.search_overlay_container}>
      <div className={SearchOverlayStyle.close_button}>
        <AiOutlineClose onClick={onClose} size={24} />
      </div>
      <div className={SearchOverlayStyle.search_results_content}>
        {loading ? (
          <LoadingOverlay />
        ) : error ? (
          <p className={SearchOverlayStyle.error_message}>Hata: {error}</p>
        ) : searchText.trim() === "" ? (
          <p className={SearchOverlayStyle.initial_message}>
            Arama yapmak için kullanıcı adını giriniz...
          </p>
        ) : searchResults.length > 0 ? (
          <ul className={SearchOverlayStyle.user_list}>
            {searchResults.map((user) => (
              <UserCard key={user.uid} user={user} />
            ))}
          </ul>
        ) : (
          <p className={SearchOverlayStyle.no_results}>
            "{searchText}" için sonuç bulunamadı.
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;