"use client";

import { motion } from "framer-motion";
import styles from "./FreeDeliveryModal.module.scss";
import Sparkles from "./Sparkles"; // əlavə et

export default function FreeDeliveryModal({
  freeDelivery,
  onClose,
}: {
  freeDelivery: { count: number; date: string } | null;
  onClose: () => void;
}) {
  if (!freeDelivery) {
    return null;
  }

  function formatDate(dateStr: string) {
    console.log("dataa str:", dateStr);

    console.log("salam");

    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long", // "June"
      day: "numeric",
    };
    console.log("sonda date:", date);

    return dateStr;
  }

  const formattedDate = formatDate(freeDelivery.date);

  return (
    <div className={styles.modalOverlay}>
      {/* <Sparkles /> */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={styles.modalContent}
      >
        <div className={styles.emoji}>🎉</div>
        <div className={styles.title}>Təbriklər!</div>
        <div className={styles.description}>
          Siz <strong>{freeDelivery.count} pulsuz çatdırılma</strong>{" "}
          qazandınız!
          <br />
          Bu imkandan <strong>{formattedDate}</strong> tarixinə qədər yararlana
          bilərsiniz.
        </div>
        <button onClick={onClose} className={styles.button}>
          Anladım
        </button>
      </motion.div>
    </div>
  );
}
