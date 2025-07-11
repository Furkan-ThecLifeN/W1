import styles from "./VideoPlayer.module.css"

export default function VideoPlayer({ src }) {
  return (
    <video
      src={src}
      controls
      className={StyleSheet.videoPlayer}
      preload="none"
    />
  );
}
