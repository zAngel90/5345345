import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';

export default function Home() {
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    // Esperar un momento para que Hero se monte y cargue
    const timer = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Hero />
      
      {heroLoaded && (
      <div className="flex flex-col gap-0">
        {/* PopularGames ahora está dentro del Hero */}
        
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: 'spring', stiffness: 250, damping: 20, delay: 0.1 }}
        >
          <HowItWorks />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: 'spring', stiffness: 250, damping: 20, delay: 0.1 }}
        >
          <Testimonials />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: 'spring', stiffness: 250, damping: 20, delay: 0.1 }}
        >
          <FAQ />
        </motion.div>
      </div>
      )}
    </motion.div>
  );
}
