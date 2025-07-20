import React, { useState, useRef } from "react";
import styles from "./PostAdd.module.css";
import PostHeader from "./PostComponents/PostHeader";
import MediaEditor from "./PostComponents/MediaEditor";
import PostSettings from "./PostComponents/PostSettings";
import BackgroundEffects from "./PostComponents/BackgroundEffects";

const PostAdd = ({ onClose }) => {
  const [postText, setPostText] = useState("");
  const [media, setMedia] = useState([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [privacy, setPrivacy] = useState("public");
  const fileInputRef = useRef(null);

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("image") ? "image" : "video",
      filter: { name: "Orijinal", class: "" },
      stickers: [],
      texts: [],
      adjustments: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
      },
    }));
    setMedia([...media, ...newMedia]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      postText,
      media,
      privacy,
    });
    onClose();
  };

  return (
    <div className={styles.postFormContainer}>
      <PostHeader 
        onClose={onClose} 
        onSubmit={handleSubmit}
        hasContent={postText.trim() || media.length > 0}
      />
      
      <div className={styles.postFormContent}>
        <MediaEditor
          media={media}
          activeMediaIndex={activeMediaIndex}
          setActiveMediaIndex={setActiveMediaIndex}
          fileInputRef={fileInputRef}
          handleMediaUpload={handleMediaUpload}
        />
        
        <PostSettings
          privacy={privacy}
          setPrivacy={setPrivacy}
          postText={postText}
          setPostText={setPostText}
        />
      </div>
      
      <BackgroundEffects />
    </div>
  );
};

export default PostAdd;