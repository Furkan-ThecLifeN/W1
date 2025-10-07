import React, { useState, useEffect } from "react";
//Firebasebackendbağlantılarıyorumsatırınaalındı
//import{db}from"../../../config/firebase-client";
//import{collection,query,orderBy,limit,getDocs}from"firebase/firestore";
//YeniDiscoverVideoCardbileşeniniiçeaktar
import DiscoverVideoCard from "../DiscoverVideoCard/DiscoverVideoCard";
import styles from "./HybridExploreFeed.module.css";
//import LoadingOverlay from"../../LoadingOverlay/LoadingOverlay"; //Şimdiliker tutucuolarakyoruml...
import { FiArrowDown, FiArrowUp } from "react-icons/fi";
export default function HybridExploreFeed() {
  const [feed, setFeed] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const JSON_LIMIT = 10;
  const FIREBASE_BATCH = 5;
  //1️⃣JSONverilerinieçek
  useEffect(() => {
    //Mockdataiçinfetchyerineplaceholderkullanıldı
    const mockData = Array.from({ length: JSON_LIMIT }).map((_, index) => ({
      id: `mock-${index}`,
      type: "video",
      mediaUrl: "https://www.youtube.com/watch?v=O07prvg0o3E",
      caption: `Bu${index + 1}.mockvideodur.Denemeamaçlıuzunbiraçıklama.`,
      username: `MockUser${index}`,
      userProfileImage: `https://i.pravatar.cc/150?img=${index + 1}`,
      uid: `post_owner_${index}`,
      isPrivate: false,
      commentsDisabled: false,
    }));
    //fetch("/data/explore.json")
    //.then((res)=>res.json())
    //.then((data)=>{
    setFeed(mockData); //Mockverikullanıldı
    setLoading(false);
    //});
  }, []);
  //2️⃣Firebaseverilerinieçek(Backendyapısıkorundu,içeriğiyor...
  const fetchFirebaseData = async () => {
    /*//const feedsCollection=collection(db,"globalFeeds");
//const q=query(feedsCollection,orderBy("createdAt","desc"),limit(FIREBASE_BATCH));
//const snapshot=await getDocs(q);
//const firebaseData=snapshot.docs.map((doc)=>({
//id:doc.id,
//type:"video",
//...doc.data(),
//}));
//setFeed((prev)=>[...prev,...firebaseData]);
*/
    console.log("Firebase'den yeniverieçekmesimüleedildi.");
  };
  const handleNext = () => {
    if (activeIndex < feed.length - 1) setActiveIndex(activeIndex + 1);
    //else fetchFirebaseData(); //isteğe bağlı:sonunagelinceFire...
  };
  const handlePrev = () => {
    if (activeIndex > 0) setActiveIndex(activeIndex - 1);
  };
  if (loading)
    return (
      <div className={styles.feedWrapper}>
        <p>Yükleniyor...</p>
      </div>
    ); //LoadingOverlayyerin...
  if (feed.length === 0)
    return (
      <div className={styles.feedWrapper}>
        <p>Henüziçerikyok.</p>
      </div>
    );
  const currentItem = feed[activeIndex];
  return (
    <div className={styles.feedWrapper}>
      {/*TekVideoPlayeryerineyenibileşenkullanıldı*/}
      {currentItem && (
        <DiscoverVideoCard key={currentItem.id} data={currentItem} />
      )}
      {/*NavigasyonButonları*/}
      <div className={styles.navButtons}>
        <button
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className={styles.navButton}
          aria-label="Öncekiİçerik"
        >
          <FiArrowUp size={32} />
        </button>
        <button
          onClick={handleNext}
          disabled={activeIndex === feed.length - 1}
          className={styles.navButton}
          aria-label="Sonrakiİçerik"
        >
          <FiArrowDown size={32} />
        </button>
      </div>
    </div>
  );
}
