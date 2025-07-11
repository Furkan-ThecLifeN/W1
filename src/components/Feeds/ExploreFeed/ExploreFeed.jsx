import AdsLeftGallery from "../Ads/AdsLeftGallery/AdsLeftGallery";
import AdsRightVideo from "../Ads/AdsRightVideo/AdsRightVideo";
import PostVideoCard from "../PostVideoCard/PostVideoCard";
import styles from "./ExploreFeed.module.css";

const DUMMY_VIDEOS = [
  "https://v1.pinimg.com/videos/mc/720p/f1/f8/70/f1f870f2655b9c2007b0d39d9003c37c.mp4",
  "https://v1.pinimg.com/videos/mc/720p/c6/7c/02/c67c02bd646b5bde96a08293ab3d20ed.mp4",
  "https://v1.pinimg.com/videos/mc/720p/3b/05/ac/3b05ac56e4b7e8732b9319926762a3db.mp4",
];

export default function ExploreFeed() {
  return (
    <>
     {/*  <AdsLeftGallery
        ads={[
          { image: "https://picsum.photos/100", link: "#" },
          { image: "https://picsum.photos/101", link: "#" },
        ]}
      /> */}
      <div className={styles.feed}>
        {DUMMY_VIDEOS.map((src, index) => (
          <PostVideoCard key={index} videoSrc={src} />
        ))}
      </div>
      {/* <AdsRightVideo
        videoSrc="https://www.w3schools.com/html/mov_bbb.mp4"
        link="#"
      /> */}
    </>
  );
}
