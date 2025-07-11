import React from "react";
import styles from "./SearchBar.module.css";
import { FiSearch } from "react-icons/fi";

const SearchBar = ({ value, onChange }) => {
  return (
    <div className={styles.searchBar}>
      <FiSearch className={styles.search_icon}/>
      <input
        type="text"
        placeholder="Kullanıcı ara..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
