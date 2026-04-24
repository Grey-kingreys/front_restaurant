"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import StatsSection from "./StatsSection";
import FeaturesSection from "./FeaturesSection";
import WorkflowSection from "./WorkflowSection";
import RolesSection from "./RolesSection";
import CTASection from "./CTASection";
import Footer from "./Footer";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-up");
            entry.target.classList.remove("opacity-0-init");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll(".scroll-reveal").forEach((el) => {
      el.classList.add("opacity-0-init");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-dark)" }}>
      <Navbar scrolled={scrolled} />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <WorkflowSection />
      <RolesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
