import React from 'react';
import { PiMusicNoteSimpleLight } from 'react-icons/pi';
import { PiPaintBrushBroadLight } from 'react-icons/pi';
import { PiStickerLight } from 'react-icons/pi';
import { PiTextAaLight } from 'react-icons/pi';
import { PiPaletteLight } from 'react-icons/pi';
import { PiClockCountdownLight } from 'react-icons/pi';
import styles from '../StoriesAdd.module.css';
import { colors, stickerList, durationOptions } from './Constants';

const ToolPanel = ({
  activeTool,
  textElements,
  setTextElements,
  addSticker,
  drawColor,
  setDrawColor,
  brushSize,
  setBrushSize,
  clearDrawing,
  setMusic,
  bgColor,
  setBgColor,
  duration,
  setDuration
}) => {
  if (!activeTool) return null;

  return (
    <div className={styles.toolPanel}>
      {activeTool === 'text' && textElements.length > 0 && (
        <div className={styles.textEditPanel}>
          <h4><PiTextAaLight /> Metin Düzenle</h4>
          {textElements.map((text, i) => (
            <div key={text.id} className={styles.textEditItem}>
              <input
                type="text"
                value={text.content}
                onChange={(e) => {
                  const newTexts = [...textElements];
                  newTexts[i].content = e.target.value;
                  setTextElements(newTexts);
                }}
                className={styles.textEditInput}
              />
              <input
                type="color"
                value={text.color}
                onChange={(e) => {
                  const newTexts = [...textElements];
                  newTexts[i].color = e.target.value;
                  setTextElements(newTexts);
                }}
                className={styles.textColorInput}
              />
            </div>
          ))}
        </div>
      )}

      {activeTool === 'sticker' && (
        <div className={styles.stickerPanel}>
          <h4><PiStickerLight /> Çıkartmalar</h4>
          <div className={styles.stickerGrid}>
            {stickerList.map((sticker, i) => (
              <button
                key={i}
                className={styles.stickerOption}
                onClick={() => addSticker(sticker)}
              >
                {sticker}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTool === 'draw' && (
        <div className={styles.drawPanel}>
          <h4><PiPaintBrushBroadLight /> Çizim Araçları</h4>
          <div className={styles.colorPicker}>
            {colors.map((color, i) => (
              <button
                key={i}
                className={styles.colorOption}
                style={{ backgroundColor: color }}
                onClick={() => setDrawColor(color)}
              />
            ))}
          </div>
          <div className={styles.brushSize}>
            <span>Kalınlık:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
            />
            <span>{brushSize}px</span>
          </div>
          <button className={styles.clearButton} onClick={clearDrawing}>
            Temizle
          </button>
        </div>
      )}

      {activeTool === 'music' && (
        <div className={styles.musicPanel}>
          <h4><PiMusicNoteSimpleLight /> Müzik Ekle</h4>
          <div className={styles.musicList}>
            {['Popüler Şarkı 1', 'Popüler Şarkı 2', 'Popüler Şarkı 3'].map((song, i) => (
              <div 
                key={i}
                className={styles.musicItem}
                onClick={() => setMusic(song)}
              >
                <PiMusicNoteSimpleLight size={18} />
                <span>{song}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTool === 'bg' && (
        <div className={styles.bgPanel}>
          <h4><PiPaletteLight /> Arkaplan Rengi</h4>
          <div className={styles.colorGrid}>
            {colors.map((color, i) => (
              <button
                key={i}
                className={styles.colorOption}
                style={{ backgroundColor: color }}
                onClick={() => setBgColor(color)}
              />
            ))}
          </div>
        </div>
      )}

      {activeTool === 'duration' && (
        <div className={styles.durationPanel}>
          <h4><PiClockCountdownLight /> Story Süresi</h4>
          <div className={styles.durationOptions}>
            {durationOptions.map((time, i) => (
              <button
                key={i}
                className={`${styles.durationOption} ${duration === time ? styles.active : ''}`}
                onClick={() => setDuration(time)}
              >
                {time}s
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolPanel;
