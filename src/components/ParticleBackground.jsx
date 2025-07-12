// src/components/ParticleBackground.jsx
import React, { useCallback, useMemo, useEffect, useState } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { useTheme } from '../context/ThemeContext.jsx';

const ParticleBackground = () => {
  const { theme } = useTheme();
  const [particleKey, setParticleKey] = useState(0);

  useEffect(() => { setParticleKey(prevKey => prevKey + 1) }, [theme]);

  const particlesInit = useCallback(async engine => { await loadSlim(engine) }, []);

  const particleOptions = useMemo(() => ({
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        resize: true,
      },
      modes: {
        repulse: { distance: 80, duration: 0.4, factor: 80, speed: 1 },
      },
    },
    particles: {
      color: { value: theme === 'dark' ? "hsl(222, 20%, 30%)" : "hsl(220, 15%, 85%)" },
      links: {
        color: theme === 'dark' ? "hsl(222, 20%, 35%)" : "hsl(220, 15%, 80%)",
        distance: 160,
        enable: true,
        opacity: 0.1, // Very subtle links
        width: 1,
      },
      collisions: { enable: false },
      move: {
        direction: "none",
        enable: true,
        outModes: { default: "out" },
        random: true,
        speed: 0.3, // Slower, more ambient
        straight: false,
      },
      number: {
        density: { enable: true, area: 1200 }, // Sparser
        value: 35, // Fewer particles
      },
      opacity: { value: { min: 0.05, max: 0.3 } },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
    background: { color: 'transparent' },
  }), [theme]);

  return (
    <Particles
      key={particleKey}
      id="tsparticles-background"
      init={particlesInit}
      options={particleOptions}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1, // Ensure it's behind everything in its container
      }}
    />
  );
};

export default ParticleBackground;