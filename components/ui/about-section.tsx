"use client";

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

// ---------------------------------------------------------------------------
// Reusable FadeIn Component (framer-motion)
// ---------------------------------------------------------------------------
interface FadeInProps {
  children?: React.ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
  as?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className = "",
  style = {},
  as = "div",
}) => {
  const Component = (motion as any)[as] || motion.div;

  return (
    <Component
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
      style={style}
    >
      {children}
    </Component>
  );
};

// ---------------------------------------------------------------------------
// Magnet Component: Mouse-following magnetic hover effect
// ---------------------------------------------------------------------------
interface MagnetProps {
  children: React.ReactNode;
  padding?: number;
  strength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  className?: string;
}

export const Magnet: React.FC<MagnetProps> = ({
  children,
  padding = 150,
  strength = 3,
  activeTransition = "transform 0.3s ease-out",
  inactiveTransition = "transform 0.6s ease-in-out",
  className = "",
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [transition, setTransition] = useState(inactiveTransition);
  const magnetRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!magnetRef.current) return;
    const { left, top, width, height } = magnetRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    const isWithinBounds =
      Math.abs(distanceX) < width / 2 + padding &&
      Math.abs(distanceY) < height / 2 + padding;

    if (isWithinBounds) {
      setTransition(activeTransition);
      setPosition({
        x: distanceX / strength,
        y: distanceY / strength,
      });
    } else {
      setTransition(inactiveTransition);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setTransition(inactiveTransition);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={magnetRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0px)`,
        transition,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sub-component for individual character opacity scroll animation
// ---------------------------------------------------------------------------
interface CharSpanProps {
  char: string;
  scrollYProgress: MotionValue<number>;
  start: number;
  end: number;
}

const CharSpan: React.FC<CharSpanProps> = ({ char, scrollYProgress, start, end }) => {
  const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);

  return (
    <span className="relative inline-block select-none">
      {/* Dim base ghost character (opacity 0.2 fallback) */}
      <span className="text-[#D7E2EA]/20" aria-hidden="true">
        {char}
      </span>
      {/* Bright animated character layer */}
      <motion.span
        style={{ opacity }}
        className="absolute inset-0 left-0 top-0 text-[#D7E2EA] font-medium"
      >
        {char}
      </motion.span>
    </span>
  );
};

// ---------------------------------------------------------------------------
// Scroll-driven character-by-character text reveal component
// ---------------------------------------------------------------------------
interface AnimatedScrollTextProps {
  text: string;
  className?: string;
}

export const AnimatedScrollText: React.FC<AnimatedScrollTextProps> = ({ text, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"],
  });

  const words = text.split(" ");
  const totalChars = text.length;
  let globalCharIndex = 0;

  return (
    <div ref={containerRef} className={`max-w-[560px] mx-auto text-center ${className}`}>
      <p
        className="text-[#D7E2EA] font-medium text-center leading-relaxed flex flex-wrap justify-center gap-x-[0.28em] gap-y-1"
        style={{ fontSize: "clamp(1rem, 2vw, 1.35rem)" }}
      >
        {words.map((word, wordIndex) => {
          const wordChars = word.split("");
          const currentWordStartIndex = globalCharIndex;
          globalCharIndex += wordChars.length + 1;

          return (
            <span key={wordIndex} className="inline-block whitespace-nowrap">
              {wordChars.map((char, charIndex) => {
                const charGlobalIndex = currentWordStartIndex + charIndex;
                const charProgress = charGlobalIndex / totalChars;
                const start = Math.max(0, charProgress - 0.15);
                const end = Math.min(1, charProgress + 0.1);

                return (
                  <CharSpan
                    key={charIndex}
                    char={char}
                    scrollYProgress={scrollYProgress}
                    start={start}
                    end={end}
                  />
                );
              })}
            </span>
          );
        })}
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main "About Me" Section Component
// ---------------------------------------------------------------------------
export interface AboutSectionProps {
  title?: string;
  paragraphText?: string;
  buttonText?: string;
  buttonHref?: string;
  onBookMeeting?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  title = "About me",
  paragraphText = "With more than five years of experience in design, i focus on branding, web design, and user experience, i truly enjoy working with businesses that aim to stand out and present their best image. Let's build something incredible together!",
  buttonText = "Contact Me",
  buttonHref = "#contact",
  onBookMeeting,
}) => {
  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onBookMeeting) {
      e.preventDefault();
      onBookMeeting();
    }
  };

  return (
    <section
      id="about"
      className="relative min-h-screen w-full flex flex-col items-center justify-center px-5 sm:px-8 md:px-10 py-20 bg-[#0C0C0C] text-white overflow-hidden font-['Kanit',sans-serif]"
    >
      {/* --------------------------------------------------------------------- */}
      {/* 4 Decorative Corner Floating Images (Absolute Positioned, z-0)        */}
      {/* --------------------------------------------------------------------- */}

      {/* 1. Top-Left -- Moon Icon */}
      <FadeIn
        delay={0.1}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute top-[4%] left-[1%] sm:left-[2%] md:left-[4%] z-0 pointer-events-none select-none"
      >
        <motion.img
          animate={{ y: [0, -14, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png"
          alt="Decorative Moon Icon"
          className="w-[120px] sm:w-[160px] md:w-[210px] h-auto object-contain drop-shadow-2xl"
        />
      </FadeIn>

      {/* 2. Bottom-Left -- 3D Object */}
      <FadeIn
        delay={0.25}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%] z-0 pointer-events-none select-none"
      >
        <motion.img
          animate={{ y: [0, 15, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png"
          alt="Decorative 3D Object"
          className="w-[100px] sm:w-[140px] md:w-[180px] h-auto object-contain drop-shadow-2xl"
        />
      </FadeIn>

      {/* 3. Top-Right -- Lego Icon */}
      <FadeIn
        delay={0.15}
        x={80}
        y={0}
        duration={0.9}
        className="absolute top-[4%] right-[1%] sm:right-[2%] md:right-[4%] z-0 pointer-events-none select-none"
      >
        <motion.img
          animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png"
          alt="Decorative Lego Icon"
          className="w-[120px] sm:w-[160px] md:w-[210px] h-auto object-contain drop-shadow-2xl"
        />
      </FadeIn>

      {/* 4. Bottom-Right -- 3D Group */}
      <FadeIn
        delay={0.3}
        x={80}
        y={0}
        duration={0.9}
        className="absolute bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%] z-0 pointer-events-none select-none"
      >
        <motion.img
          animate={{ y: [0, 14, 0], rotate: [0, -4, 0] }}
          transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
          src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png"
          alt="Decorative 3D Group"
          className="w-[130px] sm:w-[170px] md:w-[220px] h-auto object-contain drop-shadow-2xl"
        />
      </FadeIn>

      {/* --------------------------------------------------------------------- */}
      {/* Center Content (relative z-10, max-w-4xl, centered)                  */}
      {/* --------------------------------------------------------------------- */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center gap-16 sm:gap-20 md:gap-24 text-center">
        {/* Group 1 -- Heading + Animated Text (gap 10 sm:14 md:16) */}
        <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16 w-full">
          {/* Heading "About me" */}
          <FadeIn delay={0} y={40} as="div">
            <h2
              className="font-black uppercase leading-none tracking-tight text-center hero-heading block"
              style={{
                fontSize: "clamp(3rem, 12vw, 160px)",
                background: "linear-gradient(180deg, #646973 0%, #BBCCD7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {title}
            </h2>
          </FadeIn>

          {/* Animated paragraph text reveal */}
          <AnimatedScrollText text={paragraphText} />
        </div>

        {/* Group 2 -- Contact Button with Magnet effect */}
        <FadeIn delay={0.3} y={20}>
          <Magnet strength={3} padding={120}>
            <motion.a
              whileHover={{ scale: 1.06, opacity: 0.95 }}
              whileTap={{ scale: 0.96, opacity: 0.8 }}
              href={buttonHref}
              onClick={handleContactClick}
              className="inline-block rounded-full px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-white font-medium uppercase tracking-widest text-xs sm:text-sm md:text-base cursor-pointer select-none"
              style={{
                background: "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
                boxShadow: "0px 4px 14px rgba(181, 1, 167, 0.35), 4px 4px 12px #7721B1 inset",
                outline: "2px solid #E3E3E3",
                outlineOffset: "-3px",
              }}
            >
              {buttonText}
            </motion.a>
          </Magnet>
        </FadeIn>
      </div>
    </section>
  );
};

export default AboutSection;
