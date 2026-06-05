"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAnimationFrame } from "framer-motion";
import Image from "next/image";

type Brand = {
  name: string;
  src: string; // /public/...
  width?: number;
  height?: number;
};

export default function BrandMarquee({
  items,
  speed = 26,
  className = "",
  itemClassName = "",
}: {
  items: Brand[];
  speed?: number;
  className?: string;
  itemClassName?: string;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const setRef = useRef<HTMLDivElement | null>(null);

  const [setWidth, setSetWidth] = useState(0);
  const xRef = useRef(0);

  // شمارنده برای اینکه وقتی لوگوها لود شدند دوباره measure کنیم
  const [loadedCount, setLoadedCount] = useState(0);

  const measure = () => {
    if (!setRef.current) return;
    setSetWidth(setRef.current.scrollWidth);
  };

  useEffect(() => {
    measure();

    const ro = new ResizeObserver(measure);
    if (setRef.current) ro.observe(setRef.current);

    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // هر بار که چندتا لوگو لود شد، یکبار دیگر اندازه بگیر
  useEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedCount]);

  useAnimationFrame((_, delta) => {
    if (!trackRef.current || !setWidth) return;

    xRef.current += (speed * delta) / 1000;
    if (xRef.current >= setWidth) xRef.current -= setWidth;

    trackRef.current.style.transform = `translate3d(${xRef.current}px,0,0)`;
  });

  const doubled = useMemo(() => [...items, ...items], [items]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-black to-transparent" />

      <div
        ref={trackRef}
        className="flex w-max items-center gap-6 will-change-transform"
        style={{ transform: "translate3d(0,0,0)" }}
      >
        {/* set 1 */}
        <div ref={setRef} className="flex w-max items-center gap-6">
          {items.map((b, i) => (
            <BrandItem
              key={`a-${b.name}-${i}`}
              brand={b}
              onLoaded={() => setLoadedCount((c) => c + 1)}
              className={itemClassName}
            />
          ))}
        </div>

        {/* set 2 */}
        <div className="flex w-max items-center gap-6" aria-hidden="true">
          {items.map((b, i) => (
            <BrandItem
              key={`b-${b.name}-${i}`}
              brand={b}
              onLoaded={() => setLoadedCount((c) => c + 1)}
              className={itemClassName}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BrandItem({
  brand,
  onLoaded,
  className = "",
}: {
  brand: Brand;
  onLoaded: () => void;
  className?: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl ${className}`}
    >
      <Image
        src={brand.src}
        alt={brand.name}
        width={brand.width ?? 120}
        height={brand.height ?? 44}
        className="h-8 w-auto opacity-80 grayscale transition hover:opacity-100"
        onLoad={onLoaded}
        priority={false}
      />
    </div>
  );
}
