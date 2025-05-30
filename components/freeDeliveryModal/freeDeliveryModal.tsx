"use client";

import { motion } from "framer-motion";
import styles from "./FreeDeliveryModal.module.scss";
import Sparkles from "./Sparkles"; // əlavə et

export default function FreeDeliveryModal({
  count,
  onClose,
}: {
  count: number | null;
  onClose: () => void;
}) {
  return (
    <div className={styles.modalOverlay}>
      <Sparkles /> {/* Zərləri burada çağırırıq */}
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
          Siz <strong>{count} pulsuz çatdırılma</strong> qazandınız!
        </div>
        <button onClick={onClose} className={styles.button}>
          Anladım
        </button>
      </motion.div>
    </div>
  );
}
