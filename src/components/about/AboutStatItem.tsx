import { createElement, useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import type { AboutStat } from "@/types/about.types";
import { resolveIcon } from "@/components/icons/IconResolver";

interface AboutStatItemProps {
  stat: AboutStat;
  index: number;
}

const parseStatValue = (value: string) => {
  const match = value.match(/(\d+(\.\d+)?)/);
  if (!match || match.index === undefined) {
    return { target: 0, suffix: value };
  }

  const numericPart = match[1];
  const target = Number.parseFloat(numericPart);
  const suffix = value.slice(match.index + numericPart.length);

  if (!Number.isFinite(target)) {
    return { target: 0, suffix: value };
  }

  return { target, suffix };
};

const AboutStatItem = ({ stat, index }: AboutStatItemProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const [hasStartedCount, setHasStartedCount] = useState(false);
  const [displayValue, setDisplayValue] = useState<string>(stat.value);

  useEffect(() => {
    if (!isInView || hasStartedCount) return;

    // Ensure count starts after the card animation finishes (duration + stagger)
    const animationDuration = 0.45;
    const animationDelay = index * 0.12;
    const totalDelayMs = (animationDuration + animationDelay) * 1000;

    const timeoutId = window.setTimeout(() => {
      setHasStartedCount(true);
    }, totalDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [isInView, hasStartedCount, index]);

  useEffect(() => {
    if (!hasStartedCount) return;

    const { target, suffix } = parseStatValue(stat.value);

    if (target <= 0) {
      return;
    }

    let frameId: number;
    const duration = 1000;
    const start = performance.now();

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(progress * target);

      setDisplayValue(`${current}${suffix}`);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [hasStartedCount, stat.value]);

  const IconComponent = useMemo(() => resolveIcon(stat.key), [stat.key]);

  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      className="glass rounded-xl p-6 text-center"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={cardVariants}
      transition={{
        duration: 0.45,
        ease: "easeOut",
        delay: index * 0.12,
      }}
    >
      {IconComponent &&
        createElement(IconComponent, {
          className: "w-6 h-6 text-primary mx-auto mb-3",
        })}
      <div className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-1">
        {displayValue}
      </div>
      <div className="text-sm text-muted-foreground">{stat.label}</div>
    </motion.div>
  );
};

export default AboutStatItem;


