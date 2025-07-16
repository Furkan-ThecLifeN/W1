import React from "react";
import styles from "./TimeManagement.module.css";
import { FiClock } from "react-icons/fi";

const usageData = [
  { day: "Mon", minutes: 60 },
  { day: "Tue", minutes: 120 },
  { day: "Wed", minutes: 30 },
  { day: "Thu", minutes: 80 },
  { day: "Fri", minutes: 50 },
  { day: "Sat", minutes: 90 },
  { day: "Sun", minutes: 20 },
];

const maxMinutes = Math.max(...usageData.map((d) => d.minutes));
const avgMinutes = Math.round(
  usageData.reduce((sum, d) => sum + d.minutes, 0) / usageData.length
);
const avgHeightPercent = (avgMinutes / maxMinutes) * 100;

const TimeManagement = () => {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>
        <FiClock /> Time Management
      </h2>
      <p className={styles.subtext}>
        Track how much time you spend daily on the app
      </p>

      <div className={styles.chart}>
        {/* Ortalama çizgisi */}
        <div
          className={styles.avgLine}
          style={{ bottom: `${avgHeightPercent}%` }}
        />
        <div className={styles.avgLabel}>{`Avg: ${avgMinutes} min`}</div>

        {usageData.map((entry) => {
          const heightPercent = (entry.minutes / maxMinutes) * 100;
          return (
            <div className={styles.barGroup} key={entry.day}>
              <div className={styles.barContainer} title={`${entry.minutes} min`}>
                <div
                  className={styles.bar}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span className={styles.label}>{entry.day}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.summary}>
        Total this week:{" "}
        <span className={styles.minutes}>
          {usageData.reduce((sum, d) => sum + d.minutes, 0)} min
        </span>
      </div>
    </div>
  );
};

export default TimeManagement;
