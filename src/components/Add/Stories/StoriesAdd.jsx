import React, { useState, useRef, useEffect } from 'react';
import styles from './StoriesAdd.module.css';
import StoryHeader from './StoriesComponents/StoryHeader';
import StoryEditor from './StoriesComponents/StoryEditor';
import StoryTools from './StoriesComponents/StoryTools';
import ToolPanel from './StoriesComponents/ToolPanel';
import UploadArea from './StoriesComponents/UploadArea';

import { colors, stickerList, durationOptions } from './StoriesComponents/Constants';

const StoriesAdd = ({ onClose }) => {
  const [media, setMedia] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [textElements, setTextElements] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [bgColor, setBgColor] = useState('#000000');
  const [duration, setDuration] = useState(5);
  const [music, setMusic] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(5);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [canvasCtx, setCanvasCtx] = useState(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      setCanvasCtx(ctx);

      const resizeCanvas = () => {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, []);

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const mediaUrl = URL.createObjectURL(file);
    setMedia({
      file,
      preview: mediaUrl,
      type: file.type.startsWith('image') ? 'image' : 'video'
    });
  };

  const startDrawing = (e) => {
    if (isDrawing || !canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      canvasCtx.beginPath();
      canvasCtx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    canvasCtx.lineTo(x, y);
    canvasCtx.strokeStyle = drawColor;
    canvasCtx.lineWidth = brushSize;
    canvasCtx.lineCap = 'round';
    canvasCtx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const drawing = canvasRef.current.toDataURL();
      setDrawings([...drawings, drawing]);
    }
  };

  const clearDrawing = () => {
    if (canvasRef.current && canvasCtx) {
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const addTextElement = () => {
    const newText = {
      id: Date.now(),
      content: 'Metin ekle',
      position: { x: 50, y: 50 },
      color: '#ffffff',
      size: 24,
      font: 'Arial',
      rotation: 0
    };
    setTextElements([...textElements, newText]);
  };

  const addSticker = (sticker) => {
    const newSticker = {
      id: Date.now(),
      emoji: sticker,
      position: { x: 50, y: 50 },
      size: 1.0,
      rotation: 0
    };
    setStickers([...stickers, newSticker]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      media,
      textElements,
      stickers,
      drawings,
      bgColor,
      duration,
      music
    });
    onClose();
  };

  return (
    <div className={styles.storyAddContainer}>
      <StoryHeader
        onClose={onClose}
        onSubmit={handleSubmit}
        hasMedia={!!media}
      />

      <div className={styles.storyEditor}>
        {media ? (
          <StoryEditor
            media={media}
            bgColor={bgColor}
            canvasRef={canvasRef}
            startDrawing={startDrawing}
            draw={draw}
            stopDrawing={stopDrawing}
            textElements={textElements}
            stickers={stickers}
          >
            <StoryTools
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              addTextElement={addTextElement}
              setIsDrawing={setIsDrawing}
              isDrawing={isDrawing}
            />

            <ToolPanel
              activeTool={activeTool}
              textElements={textElements}
              setTextElements={setTextElements}
              addSticker={addSticker}
              drawColor={drawColor}
              setDrawColor={setDrawColor}
              brushSize={brushSize}
              setBrushSize={setBrushSize}
              clearDrawing={clearDrawing}
              setMusic={setMusic}
              bgColor={bgColor}
              setBgColor={setBgColor}
              duration={duration}
              setDuration={setDuration}
              stickerList={stickerList}
              durationOptions={durationOptions}
            />
          </StoryEditor>
        ) : (
          <UploadArea
            fileInputRef={fileInputRef}
            handleMediaUpload={handleMediaUpload}
          />
        )}
      </div>

      <div className={styles.backgroundEffects}>
        <div className={styles.gradientCircle}></div>
      </div>
    </div>
  );
};

export default StoriesAdd;
