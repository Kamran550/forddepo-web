'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import styles from './Sparkles.module.scss';

const sparkleCount = 12;

export default function Sparkles() {
  const [sparkles, setSparkles] = useState<number[]>([]);

  useEffect(() => {
    setSparkles(Array.from({ length: sparkleCount }, (_, i) => i));
  }, []);

  return (
    <>
      {sparkles.map((id) => {
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random();

        return (
          <motion.div
            key={id}
            className={styles.sparkle}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: [1, 1.5, 1], rotate: 360 }}
            transition={{
              duration: 2,
              delay,
              repeat: Infinity,
              repeatType: 'loop',
            }}
            style={{ left: `${left}%`, top: `${top}%` }}
          />
        );
      })}
    </>
  );
}
