import React from 'react';
import { FiType } from 'react-icons/fi';
import { RiSurroundSoundFill, RiSurroundSoundLine } from 'react-icons/ri';
import { FiMusic } from 'react-icons/fi';
import { IoMdColorPalette } from 'react-icons/io';
import { MdOutlineTimer } from 'react-icons/md';
import styles from '../StoriesAdd.module.css';

const StoryTools = ({ 
  activeTool, 
  setActiveTool, 
  addTextElement, 
  setIsDrawing, 
  isDrawing 
}) => {
  return (
    <div className={styles.storyTools}>
      <button
        className={`${styles.toolButton} ${activeTool === 'text' ? styles.active : ''}`}
        onClick={() => {
          addTextElement();
          setActiveTool('text');
        }}
      >
        <FiType size={20} />
      </button>
      <button
        className={`${styles.toolButton} ${activeTool === 'sticker' ? styles.active : ''}`}
        onClick={() => setActiveTool(activeTool === 'sticker' ? null : 'sticker')}
      >
        <RiSurroundSoundFill size={20} />
      </button>
      <button
        className={`${styles.toolButton} ${activeTool === 'draw' ? styles.active : ''}`}
        onClick={() => {
          setActiveTool(activeTool === 'draw' ? null : 'draw');
          setIsDrawing(!isDrawing);
        }}
      >
        <RiSurroundSoundLine size={20} />
      </button>
      <button
        className={`${styles.toolButton} ${activeTool === 'music' ? styles.active : ''}`}
        onClick={() => setActiveTool(activeTool === 'music' ? null : 'music')}
      >
        <FiMusic size={20} />
      </button>
      <button
        className={`${styles.toolButton} ${activeTool === 'bg' ? styles.active : ''}`}
        onClick={() => setActiveTool(activeTool === 'bg' ? null : 'bg')}
      >
        <IoMdColorPalette size={20} />
      </button>
      <button
        className={`${styles.toolButton} ${activeTool === 'duration' ? styles.active : ''}`}
        onClick={() => setActiveTool(activeTool === 'duration' ? null : 'duration')}
      >
        <MdOutlineTimer size={20} />
      </button>
    </div>
  );
};

export default StoryTools;