import { useEffect, useRef, useState } from "react";

interface UseIntersectionAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  animationClass?: string;
}

/**
 * Hook for animating elements when they come into view
 * Uses Intersection Observer API to detect visibility
 */
export const useIntersectionAnimation = ({
  threshold = 0.1,
  rootMargin = "0px",
  triggerOnce = true,
  animationClass = "animate-fade-up",
}: UseIntersectionAnimationOptions = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);

        if (visible && (!triggerOnce || !hasAnimated)) {
          setHasAnimated(true);
          element.classList.add(animationClass);
        } else if (!triggerOnce && !visible) {
          element.classList.remove(animationClass);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, hasAnimated, animationClass]);

  return { elementRef, isVisible, hasAnimated };
};

