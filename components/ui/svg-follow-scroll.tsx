"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";

const Skiper19 = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  });

  const pathLength = useTransform(scrollYProgress, [0, 0.8], [0.05, 1]);
  const stageY = useTransform(scrollYProgress, [0, 0.85], ["0vh", "-120vh"]);

  return (
    <section
      ref={ref}
      className="mx-auto flex h-[300vh] w-screen flex-col items-center overflow-hidden bg-[#FAFDEE] text-[#1F3A4B] relative"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col items-center overflow-hidden">
        <motion.div
          style={{ translateY: stageY }}
          className="relative flex w-full max-w-5xl flex-col items-center justify-start min-h-[2200px] pt-12"
        >
          {/* Text placed directly over starting loop mashup */}
          <div className="absolute top-[180px] z-20 flex flex-col items-center justify-center text-center max-w-2xl px-4 pointer-events-none">
            <h1 className="font-serif text-5xl font-normal tracking-tight lg:text-7xl text-[#1F3A4B] drop-shadow-sm">
              Our Services
            </h1>
          </div>

          <svg
            width="1278"
            height="2670"
            viewBox="0 0 1278 2670"
            fill="none"
            overflow="visible"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full max-w-5xl pointer-events-none scale-110"
          >
            <motion.path
              d="M876.605 394.131C788.982 335.917 696.198 358.139 691.836 416.303C685.453 501.424 853.722 498.43 941.95 409.714C1016.1 335.156 1008.64 186.907 906.167 142.846C807.014 100.212 712.699 198.494 789.049 245.127C889.053 306.207 986.062 116.979 840.548 43.3233C743.932 -5.58141 678.027 57.1682 672.279 112.188C666.53 167.208 712.538 172.943 736.353 163.088C760.167 153.234 764.14 120.924 746.651 93.3868C717.461 47.4252 638.894 77.8642 601.018 116.979C568.164 150.908 557 201.079 576.467 246.924C593.342 286.664 630.24 310.55 671.68 302.614C756.114 286.446 729.747 206.546 681.86 186.442C630.54 164.898 492 209.318 495.026 287.644C496.837 334.494 518.402 366.466 582.455 367.287C680.013 368.538 771.538 299.456 898.634 292.434C1007.02 286.446 1192.67 309.384 1242.36 382.258C1266.99 418.39 1273.65 443.108 1247.75 474.477C1217.32 511.33 1149.4 511.259 1096.84 466.093C1044.29 420.928 1029.14 380.576 1033.97 324.172C1038.31 273.428 1069.55 228.986 1117.2 216.384C1152.2 207.128 1188.29 213.629 1194.45 245.127C1201.49 281.062 1132.22 280.104 1100.44 272.673C1065.32 264.464 1044.22 234.837 1032.77 201.413C1019.29 162.061 1029.71 131.126 1056.44 100.965C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513C1207.02 117.17 1186.81 143.379 1156.22 166.691C1112.57 199.959 1052.57 186.238 999.784 155.164C957.312 130.164 899.171 63.7054 931.284 26.3214C952.068 2.12513 996.288 3.87363 1007.22 43.58C1018.15 83.2749 1003.56 122.644 975.969 163.376C948.377 204.107 907.272 255.122 913.558 321.045C919.727 385.734 990.968 497.068 1063.84 503.35C1111.46 507.456 1166.79 511.984 1175.68 464.527C1191.52 379.956 1101.26 334.985 1030.29 377.017C971.109 412.064 956.297 483.647 953.797 561.655C947.587 755.413 1197.56 941.828 936.039 1140.66C745.771 1285.32 321.926 950.737 134.536 1202.19C-6.68295 1391.68 -53.4837 1655.38 131.935 1760.5C478.381 1956.91 1124.19 1515 1201.28 1997.83C1273.66 2451.23 100.805 1864.7 303.794 2668.89"
              stroke="#C2F84F"
              strokeWidth="36"
              strokeLinecap="round"
              style={{
                pathLength,
                strokeDashoffset: useTransform(pathLength, (value) => 1 - value),
              }}
            />
          </svg>

          {/* End Point Box sitting at the stroke tip */}
          <div className="rounded-4xl w-full max-w-6xl bg-[#1F3A4B] p-8 md:p-16 text-[#FAFDEE] shadow-2xl relative z-30 -mt-24">
            <div className="w-5 h-5 bg-[#C2F84F] rounded-full mx-auto -mt-14 mb-8 shadow-lg border-4 border-[#1F3A4B]" />
            <h1 className="text-center text-[10vw] font-black leading-[0.9] tracking-tighter lg:text-[8vw] uppercase mb-12">
              ARTAFIC SERVICES
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[#FAFDEE]">
              <div className="bg-white/10 backdrop-blur p-8 rounded-3xl shadow-lg border border-white/20">
                <span className="text-xs font-bold tracking-widest text-[#C2F84F] uppercase">SERVICE 01</span>
                <h3 className="text-3xl font-bold mt-2 mb-4">Web Development</h3>
                <p className="text-slate-200 leading-relaxed mb-6">
                  Professional, custom, responsive websites designed around your business goals and customers. Fast, mobile-optimized, and built to convert.
                </p>
                <ul className="space-y-2 text-sm font-semibold text-slate-100">
                  <li>✓ Custom responsive design</li>
                  <li>✓ High-speed mobile performance</li>
                  <li>✓ Conversion-focused UX &amp; structure</li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur p-8 rounded-3xl shadow-lg border border-white/20">
                <span className="text-xs font-bold tracking-widest text-[#C2F84F] uppercase">SERVICE 02</span>
                <h3 className="text-3xl font-bold mt-2 mb-4">Logo Building</h3>
                <p className="text-slate-200 leading-relaxed mb-6">
                  Professional logo design for businesses that need a stronger, clearer visual identity that builds immediate trust with customers.
                </p>
                <ul className="space-y-2 text-sm font-semibold text-slate-100">
                  <li>✓ Vector &amp; print-ready assets</li>
                  <li>✓ Modern brand color system</li>
                  <li>✓ Distinctive visual mark</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export { Skiper19 };
