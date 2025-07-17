import React, { useState } from "react";
import styles from "./HiddenWords.module.css";
import { IoMdCloseCircle, IoMdAdd } from "react-icons/io";

const HiddenWords = () => {
  const [hiddenWords, setHiddenWords] = useState(["spam", "follow4follow"]);
  const [inputValue, setInputValue] = useState("");

  const handleAddWord = () => {
    if (inputValue.trim() && !hiddenWords.includes(inputValue.trim())) {
      setHiddenWords([...hiddenWords, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemoveWord = (word) => {
    setHiddenWords(hiddenWords.filter((w) => w !== word));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Hidden Words</h2>
      <p className={styles.subtitle}>
        Words you add here will be filtered out from your notifications, messages or comments.
      </p>

      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder="Type a word to hide..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={styles.input}
        />
        <button className={styles.addButton} onClick={handleAddWord}>
          <IoMdAdd size={24} />
        </button>
      </div>

      <div className={styles.wordsList}>
        {hiddenWords.map((word, index) => (
          <div key={index} className={styles.wordItem}>
            <span>{word}</span>
            <button onClick={() => handleRemoveWord(word)} className={styles.removeButton}>
              <IoMdCloseCircle size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HiddenWords;
