import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Trash2, RefreshCw, MessageSquare, User, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { ReviewsAPI, SERVER_URL } from '../../services/api';

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await ReviewsAPI.getReviews();
      if (res.success) setReviews(res.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta reseña permanentemente?')) return;
    try {
      const res = await ReviewsAPI.deleteReview(id);
      if (res.success) {
        setReviews(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={12} fill={i < rating ? '#f59e0b' : 'none'} className={i < rating ? 'text-amber-400' : 'text-white/20'} />
    ));
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Reseñas</h2>
          <p className="text-white/40 text-[11px] font-bold mt-1">{reviews.length} reseñas · Promedio: {avgRating}/5</p>
        </div>
        <button onClick={fetchReviews} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all" title="Actualizar">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-bold">No hay reseñas aún</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-500/10 border border-white/10 shrink-0">
                      <img src={review.userAvatar ? `${SERVER_URL}/users/avatar/${review.userId}` : `https://ui-avatars.com/api/?name=${review.username || 'U'}&background=0D8ABC&color=fff`} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${review.username || 'U'}&background=0D8ABC&color=fff`; }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white truncate">{review.username}</h4>
                        {review.verified && <span className="text-[8px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">Verificado</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                        <span className="text-[10px] text-white/30 font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setExpandedId(expandedId === review.id ? null : review.id)} className="p-1.5 text-white/30 hover:text-white transition-colors">
                      {expandedId === review.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button onClick={() => handleDelete(review.id)} className="p-1.5 text-red-400/50 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-white/70 mt-3 leading-relaxed">{review.text}</p>
                {review.image && (
                  <img src={review.image} alt="" className="mt-3 max-h-40 rounded-xl object-cover" />
                )}
              </div>
              {expandedId === review.id && review.reply && (
                <div className="px-4 pb-4 pt-2 border-t border-white/[0.04] ml-14">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Respuesta</p>
                  <p className="text-sm text-white/60">{review.reply}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
