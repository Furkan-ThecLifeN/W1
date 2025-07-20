import React from 'react';
import styles from '../StoriesAdd.module.css';

const StoryEditor = ({ 
  media, 
  bgColor, 
  canvasRef, 
  startDrawing, 
  draw, 
  stopDrawing, 
  textElements, 
  stickers, 
  children 
}) => {
  return (
    <div className={styles.storyPreview} style={{ backgroundColor: bgColor }}>
      {media.type === 'image' ? (
        <img src={media.preview} alt="Story" className={styles.mediaPreview} />
      ) : (
        <video
          src={media.preview}
          className={styles.mediaPreview}
          autoPlay
          loop
          muted
        />
      )}

      <canvas
        ref={canvasRef}
        className={styles.drawingCanvas}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      {textElements.map((text) => (
        <div
          key={text.id}
          className={styles.textElement}
          style={{
            left: `${text.position.x}%`,
            top: `${text.position.y}%`,
            color: text.color,
            fontSize: `${text.size}px`,
            fontFamily: text.font,
            transform: `rotate(${text.rotation}deg)`
          }}
        >
          {text.content}
        </div>
      ))}

      {stickers.map((sticker) => (
        <div
          key={sticker.id}
          className={styles.sticker}
          style={{
            left: `${sticker.position.x}%`,
            top: `${sticker.position.y}%`,
            transform: `scale(${sticker.size}) rotate(${sticker.rotation}deg)`
          }}
        >
          {sticker.emoji}
        </div>
      ))}

      {children}
    </div>
  );
};

export default StoryEditor;