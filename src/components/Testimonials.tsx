import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, ChevronRight, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ReviewsAPI, SERVER_URL } from '../services/api';

const TestimonialCard = ({ item }: { item: any }) => (
  <div className="bg-[#0D0B1E]/40 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] w-[320px] md:w-[380px] shrink-0 flex flex-col gap-4 group hover:bg-white/5 hover:border-pixel-accent/30 transition-all duration-300">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={item.userAvatar ? (item.userAvatar.startsWith('http') ? item.userAvatar : `${SERVER_URL}${item.userAvatar}`) : `https://ui-avatars.com/api/?name=${item.username}&background=random`}
            alt={item.username}
            className="w-10 h-10 rounded-full object-cover border border-white/10"
          />
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-[#0D0B1E]">
            <CheckCircle2 size={10} className="text-white" fill="currentColor" />
          </div>
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-white text-sm truncate">{item.username}</h4>
          <div className="flex items-center gap-1.5 text-gray-500 text-[10px] mt-0.5">
            <Package size={10} className="text-gray-600" />
            <span className="truncate">{item.item || 'Compra de Robux'}</span>
          </div>
        </div>
      </div>
      <div className="flex text-yellow-500 gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={10} fill={i < item.rating ? "currentColor" : "none"} className={i < item.rating ? "" : "text-gray-700"} />
        ))}
      </div>
    </div>

    <p className="text-gray-400 text-sm leading-relaxed whitespace-normal break-words line-clamp-3">
      {item.text}
    </p>
  </div>
);

export default function Testimonials() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ average: 0, total: 0 });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await ReviewsAPI.getReviews();
        if (res.success) {
          setReviews(res.data);
          const total = res.data.length;
          const avg = total > 0 ? res.data.reduce((acc: number, r: any) => acc + r.rating, 0) / total : 5;
          setStats({ average: parseFloat(avg.toFixed(1)), total });
        }
      } catch (err) {
        console.error('Error loading testimonials:', err);
      }
    };
    fetchReviews();
  }, []);

  const half = Math.ceil(reviews.length / 2);
  const row1 = reviews.slice(0, half);
  const row2 = reviews.slice(half);

  // If not enough reviews, double them for the marquee effect
  const displayRow1 = row1.length > 0 ? [...row1, ...row1, ...row1] : [];
  const displayRow2 = row2.length > 0 ? [...row2, ...row2, ...row2] : [];

  if (reviews.length === 0) return null;

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden z-10 bg-pixel-bg">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <h2 className="text-4xl md:text-6xl font-display font-black mb-4 text-white">
          Miles confían en <span className="text-transparent bg-clip-text bg-gradient-to-r from-pixel-primaryEnd to-pixel-accent">Pixel Store</span>
        </h2>

        <div className="flex flex-col items-center gap-2">
          <div className="flex text-yellow-500 gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} fill={i < Math.floor(stats.average) ? "currentColor" : "none"} className={i < Math.floor(stats.average) ? "" : "text-gray-700"} />
            ))}
          </div>
          <p className="text-gray-400 text-sm font-medium">
            <span className="text-white font-bold">{stats.average}</span> — {stats.total} reseñas
          </p>
        </div>
      </div>

      <div className="relative flex flex-col gap-8 py-4 overflow-hidden mask-edges">
        {/* Row 1 - Moves Left */}
        <div className="relative flex overflow-hidden">
          <motion.div
            className="flex gap-6 px-6 cursor-grab active:cursor-grabbing"
            animate={{ x: [0, -1000] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 50,
                ease: "linear",
              },
            }}
            whileHover={{ animationPlayState: 'paused' }}
            style={{ width: "fit-content" }}
          >
            {displayRow1.map((item, index) => (
              <div key={`r1-${index}`} className="shrink-0">
                <TestimonialCard item={item} />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Row 2 - Moves Right */}
        <div className="relative flex overflow-hidden">
          <motion.div
            className="flex gap-6 px-6 cursor-grab active:cursor-grabbing"
            initial={{ x: -1000 }}
            animate={{ x: [-1000, 0] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 55,
                ease: "linear",
              },
            }}
            whileHover={{ animationPlayState: 'paused' }}
            style={{ width: "fit-content" }}
          >
            {displayRow2.map((item, index) => (
              <div key={`r2-${index}`} className="shrink-0">
                <TestimonialCard item={item} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <Link
          to="/reviews"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-pixel-accent transition-colors text-sm font-medium group"
        >
          Lo que dicen de nosotros ({stats.total})
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}

