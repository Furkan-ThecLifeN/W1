// src/components/SettingsSections/LoginDeviceHistory/LoginDeviceHistory.jsx

import React, { useState, useEffect } from "react";
import styles from "./LoginDeviceHistory.module.css";
import { FiMonitor, FiSmartphone, FiTablet, FiMapPin, FiClock, FiCheckCircle } from "react-icons/fi";
import { auth } from "../../../../config/firebase-client";
import LoadingOverlay from "../../../LoadingOverlay/LoadingOverlay";

// ✅ YARDIMCI FONKSİYONLAR: Gelen veriyi her ihtimale karşı ayrıştırır
const getDisplayDeviceType = (deviceString) => {
    if (!deviceString) return "Bilinmiyor";
    const lowerCaseString = deviceString.toLowerCase();
    if (lowerCaseString.includes("bilgisayar") || lowerCaseString.includes("desktop")) {
        return "Bilgisayar";
    }
    if (lowerCaseString.includes("mobil") || lowerCaseString.includes("mobile")) {
        return "Mobil";
    }
    if (lowerCaseString.includes("tablet") || lowerCaseString.includes("ipad")) {
        return "Tablet";
    }
    return "Bilinmiyor";
};

const getDisplayBrowserName = (browserString) => {
    if (!browserString) return "Bilinmiyor";
    const lowerCaseString = browserString.toLowerCase();
    if (lowerCaseString.includes("chrome")) return "Chrome";
    if (lowerCaseString.includes("firefox")) return "Firefox";
    if (lowerCaseString.includes("safari") && !lowerCaseString.includes("chrome")) return "Safari";
    if (lowerCaseString.includes("edge")) return "Edge";
    return "Bilinmiyor";
};

const LoginDeviceHistory = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIp, setCurrentIp] = useState(null);

    useEffect(() => {
        const fetchCurrentIp = async () => {
            try {
                const res = await fetch('https://api.ipify.org?format=json');
                const data = await res.json();
                setCurrentIp(data.ip);
            } catch (err) {
                console.error("IP adresi alınırken hata:", err);
            }
        };
        fetchCurrentIp();

        const fetchLoginHistory = async () => {
            try {
                setLoading(true);
                setError(null);
                const idToken = await auth.currentUser.getIdToken();
                
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/devices`, {
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                    },
                });

                const data = await res.json();
                if (res.ok) {
                    setDevices(data.devices || []);
                } else {
                    setError(data.error || "Cihaz geçmişi alınırken bir hata oluştu.");
                }
            } catch (err) {
                setError("Bağlantı hatası. Lütfen tekrar deneyin.");
            } finally {
                setLoading(false);
            }
        };

        fetchLoginHistory();
    }, []);

    const renderDeviceIcon = (deviceType) => {
        const type = deviceType ? deviceType.toLowerCase() : '';
        if (type.includes('mobil')) {
            return <FiSmartphone />;
        }
        if (type.includes('tablet')) {
            return <FiTablet />;
        }
        return <FiMonitor />; 
    };

    if (loading) {
        return <LoadingOverlay />;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.heading}>Giriş & Cihaz Geçmişi</h2>
            <p className={styles.subtext}>Hesabınıza erişim sağlayan cihazlar. Şüpheli bir cihaz varsa erişimini iptal edin.</p>

            <div className={styles.deviceList}>
                {devices.length === 0 ? (
                    <p className={styles.noHistory}>Giriş geçmişi bulunamadı.</p>
                ) : (
                    devices.map((device) => {
                        const isCurrentDevice = currentIp && device.ip === currentIp;
                        
                        // Backend'den gelen veriyi kullanır, eğer tanımsızsa ayrıştırma fonksiyonlarını çalıştırır
                        const browserName = getDisplayBrowserName(device.browser);
                        const deviceType = getDisplayDeviceType(device.device); 
                        const location = device.location || 'Konum Bilinmiyor';
                        const timestamp = device.loggedInAt 
                                        ? new Date(device.loggedInAt._seconds * 1000).toLocaleString() 
                                        : 'Zaman Bilinmiyor';

                        return (
                            <div className={`${styles.deviceCard} ${isCurrentDevice ? styles.active : ""}`} key={device.id}>
                                <div className={styles.icon}>
                                    {renderDeviceIcon(deviceType)}
                                </div>
                                <div className={styles.info}>
                                    <h4>{`${browserName} (${deviceType})`}</h4> 
                                    <p><FiMapPin /> {location}</p>
                                    <p><FiClock /> {timestamp}</p>
                                </div>
                                {isCurrentDevice && (
                                    <div className={styles.currentTag}>
                                        <FiCheckCircle /> Bu Cihaz
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default LoginDeviceHistory;