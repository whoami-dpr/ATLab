"use client";

import { Navbar } from "../../components/Navbar";
import { useThemeOptimized } from "../../hooks/useThemeOptimized";
import React, { useRef } from "react";
import { Github, Linkedin, Radio, Activity, Database, Wifi, Cloud, Shield } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useInView } from "motion/react";

// Fade-in animation component
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Parallax section component
function ParallaxSection({ children, offset = 50 }: { children: React.ReactNode; offset?: number }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
    <motion.div ref={ref} style={{ y, scale }}>
      {children}
    </motion.div>
  );
}

// Number counter animation
function AnimatedNumber({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = React.useState("0");

  React.useEffect(() => {
    if (isInView) {
      const targetNum = parseFloat(value);
      const duration = 2000;
      const steps = 60;
      const increment = targetNum / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= targetNum) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(current.toFixed(value.includes(".") ? 1 : 0));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
}

export default function AboutUs() {
  const { theme } = useThemeOptimized();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scaleProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  return (
    <div
      ref={containerRef}
      className={`min-h-screen w-full ${
        theme === "light" ? "bg-white text-black" : "bg-black text-white"
      }`}
    >
      <Navbar />

      {/* Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-left z-50"
        style={{ scaleX: scaleProgress }}
      />

      {/* Hero Section - Perfectly Centered */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale, height: "calc(100vh - 4rem)" }}
        className="sticky top-0 px-6 flex items-center justify-center"
      >
        <div className="text-center max-w-6xl mx-auto transform -translate-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-8xl md:text-[12rem] lg:text-[15rem] font-semibold tracking-tighter leading-none mb-8">
              ATLab
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-2xl md:text-4xl lg:text-5xl font-medium opacity-60 tracking-tight"
          >
            F1 telemetry, engineered to perfection.
          </motion.p>
        </div>
      </motion.section>

      {/* Main Content Container */}
      <div className={`relative z-10 ${theme === "light" ? "bg-white" : "bg-black"}`}>
        
        {/* Mission Statement */}
        <section className="min-h-screen flex items-center justify-center px-6 py-32">
          <div className="max-w-5xl mx-auto text-center">
            <FadeIn>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-tight mb-12">
                Data shouldn't be <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                  complicated.
                </span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl md:text-3xl opacity-60 leading-relaxed font-light max-w-3xl mx-auto">
                We take F1's official timing stream—the same data used by teams—and transform it into 
                a clean, intuitive experience. No clutter. No delays. Just pure racing intelligence.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Feature 1: Live Telemetry */}
        <ParallaxSection offset={30}>
          <section className="min-h-screen flex items-center px-6 py-32">
            <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
              <FadeIn>
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm font-semibold">
                    <Activity className="w-4 h-4" /> Live Telemetry
                  </div>
                  <h3 className="text-5xl md:text-7xl font-semibold tracking-tight leading-tight">
                    See the race unfold in real time.
                  </h3>
                  <p className="text-xl md:text-2xl opacity-60 leading-relaxed">
                    Track positions, gaps, and sector times updated every 100ms. 
                    Know exactly who's gaining, who's losing, and where it's happening.
                  </p>
                  <ul className="space-y-4 text-lg">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                      <span>100ms update frequency—faster than you can blink</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                      <span>Sector-by-sector analysis for all 20 drivers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                      <span>Live tyre compound and age tracking</span>
                    </li>
                  </ul>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                  <img
                    src="/images/mclaren-team.png"
                    alt="Team working with live timing data"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                </div>
              </FadeIn>
            </div>
          </section>
        </ParallaxSection>

        {/* Feature 2: Team Radio */}
        <ParallaxSection offset={-30}>
          <section className="min-h-screen flex items-center px-6 py-32">
            <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
              <FadeIn delay={0.2} className="order-2 md:order-1">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                  <img
                    src="/images/team-radio-preview.png"
                    alt="Team Radio Interface"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tl from-black/20 to-transparent" />
                </div>
              </FadeIn>

              <FadeIn className="order-1 md:order-2">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-500 text-sm font-semibold">
                    <Radio className="w-4 h-4" /> Team Radio
                  </div>
                  <h3 className="text-5xl md:text-7xl font-semibold tracking-tight leading-tight">
                    Hear what the TV doesn't show.
                  </h3>
                  <p className="text-xl md:text-2xl opacity-60 leading-relaxed">
                    Uncensored team radio and Race Control messages as they happen. 
                    Get the full story, not just what makes the broadcast.
                  </p>
                  <ul className="space-y-4 text-lg">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                      <span>All team radio messages, completely uncensored</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                      <span>Race Control notifications in real time</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                      <span>AI-powered transcriptions for every message</span>
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </section>
        </ParallaxSection>

        {/* Performance Stats */}
        <section className="min-h-screen flex items-center justify-center px-6 py-32">
          <div className="max-w-6xl mx-auto w-full">
            <FadeIn>
              <h2 className="text-4xl md:text-6xl font-semibold text-center mb-24 tracking-tight">
                Built for performance.
              </h2>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-12">
              <FadeIn delay={0.1}>
                <div className="text-center space-y-4">
                  <div className="text-7xl md:text-8xl font-bold tracking-tighter">
                    <AnimatedNumber value="99.9" suffix="%" />
                  </div>
                  <div className="text-xl opacity-60 font-medium">Uptime Reliability</div>
                  <p className="text-sm opacity-40 leading-relaxed">
                    Hosted on enterprise-grade infrastructure to ensure you never miss a moment of the action.
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="text-center space-y-4">
                  <div className="text-7xl md:text-8xl font-bold tracking-tighter">
                    <AnimatedNumber value="100" suffix="ms" />
                  </div>
                  <div className="text-xl opacity-60 font-medium">Update Frequency</div>
                  <p className="text-sm opacity-40 leading-relaxed">
                    Data refreshes 10 times per second, giving you the most responsive live timing experience available.
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="text-center space-y-4">
                  <div className="text-7xl md:text-8xl font-bold tracking-tighter">
                    <AnimatedNumber value="24" suffix="/7" />
                  </div>
                  <div className="text-xl opacity-60 font-medium">Always Online</div>
                  <p className="text-sm opacity-40 leading-relaxed">
                    Continuous monitoring and instant scaling ensure peak performance during every race weekend.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-32 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <h2 className="text-4xl md:text-6xl font-semibold text-center mb-12 tracking-tight">
                Engineered with modern tech.
              </h2>
              <p className="text-xl text-center opacity-60 mb-24 max-w-3xl mx-auto">
                Built on a foundation of cutting-edge tools and frameworks, 
                chosen specifically for real-time performance and reliability.
              </p>
            </FadeIn>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: <Cloud className="w-8 h-8" />, name: "Next.js 15", desc: "React framework with App Router for optimal performance" },
                { icon: <Database className="w-8 h-8" />, name: "TypeScript", desc: "Type-safe code prevents bugs before they happen" },
                { icon: <Wifi className="w-8 h-8" />, name: "SignalR", desc: "Real-time WebSocket connection to F1's live timing" },
                { icon: <Shield className="w-8 h-8" />, name: "Cloudflare", desc: "Edge network ensures global low-latency access" }
              ].map((tech, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className={`p-8 rounded-3xl transition-all duration-300 hover:scale-105 ${
                    theme === "light" ? "bg-gray-50 hover:bg-gray-100" : "bg-white/5 hover:bg-white/10"
                  }`}>
                    <div className="mb-6 opacity-80">{tech.icon}</div>
                    <h3 className="text-xl font-semibold mb-3">{tech.name}</h3>
                    <p className="text-sm opacity-60 leading-relaxed">{tech.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="min-h-[80vh] flex items-center justify-center px-6 py-32">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <h2 className="text-5xl md:text-7xl font-semibold tracking-tight mb-12 leading-tight">
                Open source. <br /> Built for the community.
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-xl md:text-2xl opacity-60 mb-16 leading-relaxed">
                Every line of code is available on GitHub. Contribute, learn, or build your own version.
              </p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <a
                  href="https://github.com/whoami-dpr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group px-10 py-5 rounded-full text-lg font-medium transition-all duration-300 hover:scale-105 ${
                    theme === "light"
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Github className="w-6 h-6" />
                    View on GitHub
                  </span>
                </a>
                <a
                  href="https://www.linkedin.com/in/joaquinmontes10/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group px-10 py-5 rounded-full text-lg font-medium border transition-all duration-300 hover:scale-105 ${
                    theme === "light"
                      ? "border-black/20 hover:bg-black hover:text-white hover:border-black"
                      : "border-white/20 hover:bg-white hover:text-black hover:border-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Linkedin className="w-6 h-6" />
                    Connect
                  </span>
                </a>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-20 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/10">
                <img
                  src="https://github.com/whoami-dpr.png"
                  alt="Joaquín Montes"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-semibold text-lg">Joaquín Montes</div>
                <div className="text-sm opacity-60">Systems Engineer</div>
              </div>
            </div>
            <div className="text-sm opacity-40">
              &copy; 2024 ATLab. Open source under MIT License.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}