"use client";
import ReactDOM from "react-dom";

import { motion } from "framer-motion";
import styles from "./FreeDeliveryModal.module.scss";
import { useTranslation } from "react-i18next";
import Sparkles from "./Sparkles"; // Əgər istifadə edəcəksənsə

export default function FreeDeliveryModal({
  freeDelivery,
  onClose,
}: {
  freeDelivery: { count: number; date: string } | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  if (!freeDelivery) {
    return null;
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("az-AZ", options); // Tarixi formatlayırıq
  }

  const formattedDate = formatDate(freeDelivery.date);

  const description = t("free_delivery_text", {
    count: `<strong>${freeDelivery.count}</strong>`,
    date: `<strong>${freeDelivery.date}</strong>`,
  });

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay}>
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={styles.modalContent}
      >
        <div className={styles.emoji}>🎉</div>
        <div className={styles.title}>{t("congratulations")}</div>
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: description }}
        />
        <button onClick={onClose} className={styles.button}>
          {t("understood")}
        </button>
      </motion.div>
    </div>,
    document.body,
  );
}
