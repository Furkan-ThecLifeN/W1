import React, { useState } from "react";
import RightSidebarStyle from "./RightSideBar.module.css";
import LogoReklam from "./W1.png"; // Reklam görseliniz
import { IoSearch } from "react-icons/io5";
import SearchOverlay from "../SearchOverlay/SearchOverlay";

// Banner tipi reklamlar için veri dizisi
const bannerAdsData = [
  {
    id: 1,
    image: LogoReklam,
    title: "W1 Platformu Keşfet",
    subtitle: "Yenilikçi çözümler burada.",
  },
  {
    id: 2,
    image: LogoReklam,
    title: "Yeni Fırsatları Yakala",
    subtitle: "Sana özel kampanyalar.",
  },
];

// Kare tipi reklamlar için veri dizisi
const squareAdsData = [
  { id: 1, image: LogoReklam, alt: "Sponsorlu Reklam 1" },
  { id: 2, image: LogoReklam, alt: "Sponsorlu Reklam 2" },
];

const RightSidebar = () => {
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleSearchFocus = () => {
    setSearchActive(true);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleCloseOverlay = () => {
    setSearchActive(false);
    setSearchText("");
  };

  return (
    <div className={RightSidebarStyle.right_sidebar}>
      {/* 🔍 Arama Alanı */}
      <div className={RightSidebarStyle.search_container}>
        <IoSearch className={RightSidebarStyle.search_icon} />
        <input
          type="text"
          placeholder="Discover..."
          className={RightSidebarStyle.search_input}
          onFocus={handleSearchFocus}
          onChange={handleSearchChange}
          value={searchText}
        />
      </div>

      {/* Sadece arama aktif DEĞİLKEN gösterilir */}
      {!searchActive && (
        <>
          <hr className={RightSidebarStyle.separator} />

          <div className={RightSidebarStyle.comingSoonWrapper}>
            <span className={RightSidebarStyle.comingSoonText}>W1</span>
            <span className={RightSidebarStyle.comingSoonText}>Coming Soon</span>
          </div>

          {/* ✨ Reklam Alanı (Bu bölüm artık dikeyde esneyecek) */}
          <div className={RightSidebarStyle.ads_section}>
            <h4 className={RightSidebarStyle.ads_title}>Öne Çıkanlar</h4>

            {/* Banner Tipi Reklamları render et */}
            {bannerAdsData.map((ad) => (
              <div
                key={ad.id}
                className={`${RightSidebarStyle.ad_widget} ${RightSidebarStyle.ad_banner}`}
              >
                <img
                  src={ad.image}
                  alt={ad.title}
                  className={RightSidebarStyle.ad_banner_image}
                />
                <div className={RightSidebarStyle.ad_banner_text}>
                  <h5>{ad.title}</h5>
                  <p>{ad.subtitle}</p>
                </div>
              </div>
            ))}

            {/* Kare Tipi Reklamlar için özel esnek konteyner */}
            <div className={RightSidebarStyle.ad_square_container}>
              {squareAdsData.map((ad) => (
                <div
                  key={ad.id}
                  className={`${RightSidebarStyle.ad_widget} ${RightSidebarStyle.ad_square}`}
                >
                  <img
                    src={ad.image}
                    alt={ad.alt}
                    className={RightSidebarStyle.ad_square_image}
                  />
                  <span className={RightSidebarStyle.ad_label}>Sponsorlu</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 🔎 Arama Overlay */}
      {searchActive && (
        <SearchOverlay searchText={searchText} onClose={handleCloseOverlay} />
      )}
    </div>
  );
};

export default RightSidebar;
