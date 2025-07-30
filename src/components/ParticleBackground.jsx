// src/components/ParticleBackground.jsx
import React, { useCallback, useMemo, useEffect, useState } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { useTheme } from '../context/ThemeContext.jsx';

const ParticleBackground = () => {
  const { theme } = useTheme();
  const [particleKey, setParticleKey] = useState(0);

  useEffect(() => {
    setParticleKey(prevKey => prevKey + 1);
  }, [theme]);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particleOptions = useMemo(() => ({
    fullScreen: {
      enable: false, // CRUCIAL: This prevents position:fixed
      zIndex: 0
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse",
        },
        resize: true,
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: theme === 'dark' ? "hsl(222, 20%, 30%)" : "hsl(220, 15%, 80%)",
      },
      links: {
        color: theme === 'dark' ? "hsl(222, 20%, 40%)" : "hsl(220, 15%, 75%)",
        distance: 150,
        enable: true,
        opacity: 0.1,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: { default: "out" },
        random: true,
        speed: 0.3,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 1200,
        },
        value: 40,
      },
      opacity: {
        value: { min: 0.05, max: 0.3 },
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
    background: {
      color: 'transparent',
    },
  }), [theme]);

  return (
    <Particles
      key={particleKey}
      id="tsparticles-background"
      init={particlesInit}
      options={particleOptions}
      className="particle-canvas"
    />
  );
};

export default ParticleBackground;