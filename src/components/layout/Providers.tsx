"use client";
import { LazyMotion, MotionConfig, domMax } from "motion/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
