import { useEffect, useRef } from "react";

export const useElementOnScreen = ({
  threshold = 0.1,
  root = null,
  rootMargin = "50%",
  enabled = false,
  onScreen = () => null,
}) => {
  const targetRef = useRef(null);

  useEffect(() => {
    const node = targetRef?.current;
    if (!enabled || !node) return;

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onScreen();
          }
        }),
      {
        threshold,
        root,
        rootMargin,
      }
    );

    observer.observe(node);

    return () => {
      observer.unobserve(node);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetRef?.current, enabled]);

  return targetRef;
};