import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  CheckCircle2, 
  ChevronDown, 
  Package, 
  Search, 
  MessageSquare, 
  PenLine,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  Upload,
  Camera,
  Loader2
} from 'lucide-react';
import { ReviewsAPI, SERVER_URL } from '../services/api';

// --- Types ---
interface Review {
  id: string | number;
  userId: string;
  username: string;
  rating: number;
  text: string;
  image?: string | null;
  createdAt: string;
  verified?: boolean;
  userAvatar?: string;
  userColor?: string;
  reply?: {
    author: string;
    text: string;
    date: string;
  };
}

// --- Components ---

const StarRating = ({ rating, size = 16, className = "", onSelect }: { rating: number, size?: number, className?: string, onSelect?: (r: number) => void }) => (
  <div className={`flex gap-0.5 ${className}`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star 
        key={star} 
        size={size} 
        onClick={() => onSelect?.(star)}
        className={`${star <= rating ? "fill-amber-400 text-amber-400" : "text-white/10 fill-white/10"} ${onSelect ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`} 
      />
    ))}
  </div>
);

const Pagination = ({ current, total, onChange }: { current: number, total: number, onChange: (p: number) => void }) => {
  const pages = useMemo(() => {
    const p = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
        p.push(i);
      } else if (p[p.length - 1] !== '...') {
        p.push('...');
      }
    }
    return p;
  }, [current, total]);

  if (total <= 1) return null;

  return (
    <div className="flex items-center gap-1 p-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-md shadow-lg">
      <button 
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="size-8 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <ChevronLeft size={16} />
      </button>
      
      {pages.map((p, i) => (
        <React.Fragment key={i}>
          {p === '...' ? (
            <span className="px-1 text-white/20"><MoreHorizontal size={14} /></span>
          ) : (
            <button 
              onClick={() => onChange(Number(p))}
              className={`size-8 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                current === p 
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {p}
            </button>
          )}
        </React.Fragment>
      ))}

      <button 
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        className="size-8 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

const ReviewCard = ({ review }: { review: Review }) => {
  const dateStr = new Date(review.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  const initials = review.username.charAt(0).toUpperCase();
  
  // Logic to build the avatar URL
  let avatarUrl = "";
  if (review.userAvatar) {
    avatarUrl = review.userAvatar.startsWith('http') ? review.userAvatar : `${SERVER_URL}${review.userAvatar}`;
  } else {
    avatarUrl = `${SERVER_URL}/api/users/avatar/${review.userId}`;
  }

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white/[0.04] backdrop-blur-sm border border-blue-500/10 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 transition-all duration-500 hover:border-blue-500/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.1)]"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className={`size-10 sm:size-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-inner overflow-hidden`}>
            <img src={avatarUrl} alt={initials} className="w-full h-full object-cover" onError={(e) => { (e.target as any).style.display = 'none'; }} />
            <span className="absolute inset-0 flex items-center justify-center">{initials}</span>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-green-500 border-2 border-[#0d0c22] flex items-center justify-center">
            <CheckCircle2 size={10} className="text-white fill-white" />
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="font-semibold text-white text-[15px] tracking-tight truncate">
                {review.username}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                Verificado
              </span>
            </div>
            <StarRating rating={review.rating} size={12} />
          </div>

          <div className="flex items-center gap-2 text-[13px] text-white/40 flex-wrap mt-1 mb-3 font-medium">
            <span>{dateStr}</span>
            <span className="text-white/20">·</span>
            <span className="inline-flex items-center gap-1 text-white/60">
              <Package size={14} className="opacity-70" />
              Pedido Realizado
            </span>
          </div>

          <p className="text-sm text-white/90 leading-relaxed">
            {review.text}
          </p>

          {review.image && (
            <div className="flex gap-2 mt-4">
              <div className="relative size-32 sm:size-48 rounded-lg overflow-hidden border border-white/10 group/img cursor-zoom-in">
                <img 
                  src={review.image.startsWith('http') ? review.image : `${SERVER_URL}${review.image}`} 
                  alt="Review" 
                  className="size-full object-cover transition-transform duration-500 group-hover/img:scale-105" 
                />
              </div>
            </div>
          )}

          {review.reply && (
            <div className="mt-4 p-4 rounded-xl bg-white/5 border-l-2 border-blue-500/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <MessageSquare size={12} />
                  {review.reply.author}
                </span>
                <span className="text-[10px] text-white/30">{review.reply.date}</span>
              </div>
              <p className="text-[13px] text-white/70 leading-relaxed">
                {review.reply.text}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ratingDropdownOpen, setRatingDropdownOpen] = useState(false);
  const [showOnlyMyReviews, setShowOnlyMyReviews] = useState(false);
  
  // Review Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const itemsPerPage = 10;

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

  const stats = useMemo(() => {
    const total = reviews.length;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    
    reviews.forEach(r => {
      distribution[r.rating as keyof typeof distribution]++;
      sum += r.rating;
    });

    return {
      total,
      distribution,
      average: total > 0 ? (sum / total).toFixed(1) : '5.0'
    };
  }, [reviews]);

  const isFiltered = filterRating !== 'all' || searchQuery !== '' || sortBy !== 'newest';

  const clearFilters = () => {
    setFilterRating('all');
    setSearchQuery('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const filteredReviews = useMemo(() => {
    const user = JSON.parse(localStorage.getItem('pixel_user') || 'null');
    return reviews
      .filter(r => (filterRating === 'all' || r.rating === filterRating))
      .filter(r => r.text.toLowerCase().includes(searchQuery.toLowerCase()) || r.username.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(r => !showOnlyMyReviews || (user && String(r.userId) === String(user.id)))
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'highest') return b.rating - a.rating;
        if (sortBy === 'lowest') return a.rating - b.rating;
        return 0;
      });
  }, [reviews, filterRating, sortBy, searchQuery, showOnlyMyReviews]);

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = filteredReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredReviews.length);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReview = async () => {
    const user = JSON.parse(localStorage.getItem('pixel_user') || 'null');
    console.log('Enviando reseña con usuario:', user);
    if (!user) {
      document.dispatchEvent(new CustomEvent('openAuthModal'));
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('rating', newRating.toString());
      formData.append('text', newText);
      const username = user.displayName || user.name || user.username || user.display_name || 'Usuario';
      formData.append('username', username);
      formData.append('userId', user.id);
      const avatar = user.avatar || user.profilePicture || user.photoURL || user.userAvatar;
      if (avatar) formData.append('userAvatar', avatar);
      if (newImage) formData.append('image', newImage);

      const res = await ReviewsAPI.createReview(formData);
      if (res.success) {
        setIsModalOpen(false);
        setNewText('');
        setNewImage(null);
        setPreviewUrl(null);
        fetchReviews();
      }
    } catch (err) {
      alert('Error al enviar la reseña');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="min-h-screen bg-[#0d0c22] relative"
    >
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-10 lg:px-16 xl:px-24 pt-24 sm:pt-32 pb-28 md:pb-20 relative z-10">
        
        {/* Header Section */}
        <motion.header className="mb-8 lg:mb-12">
          <h1 className="text-4xl lg:text-5xl font-display font-black text-white tracking-tight leading-tight mb-2">
            Reseñas
          </h1>
          <p className="text-white/40 text-lg">Lo que nuestros clientes dicen de nosotros.</p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[340px_1fr] gap-8">
          
          {/* Sidebar */}
          <aside className="sticky top-28 self-start space-y-4">
            
            {/* Overall Rating Card */}
            <motion.div className="bg-white/[0.03] backdrop-blur-xl border border-blue-500/20 rounded-3xl transition-all duration-500 hover:border-blue-500/50 group/rating relative">
              <div className="px-6 pt-5 pb-4 border-b border-white/5">
                <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Puntuación General</h3>
              </div>
              <div className="px-6 pt-16 pb-14 flex flex-col items-center text-center gap-5">
                <span className="text-[84px] font-black bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text text-transparent leading-none tracking-tighter group-hover/rating:scale-110 transition-transform duration-500 tabular-nums">
                  {stats.average}
                </span>
                <StarRating rating={Math.round(parseFloat(stats.average))} size={28} />
                <p className="text-sm text-white/40 font-medium">
                  Basado en <span className="text-white font-bold">{stats.total.toLocaleString()}</span> reseñas
                </p>
                <div className="w-full space-y-2 mt-1">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.distribution[rating as keyof typeof stats.distribution];
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <button 
                        key={rating}
                        onClick={() => { setFilterRating(rating === filterRating ? 'all' : rating); setCurrentPage(1); }}
                        className={`w-full group flex items-center gap-3 text-xs transition-all ${filterRating === rating ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                      >
                        <span className="w-3 font-bold text-white/60 group-hover:text-white">{rating}</span>
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className="h-full rounded-full bg-amber-400/90 shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                          />
                        </div>
                        <span className="w-10 text-right text-white/20 tabular-nums group-hover:text-white/40">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="px-4 pb-4">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                >
                  <PenLine size={16} />
                  Escribir reseña
                </button>
              </div>
            </motion.div>

            {/* Filters Card */}
            <motion.div className="bg-white/[0.03] backdrop-blur-xl border border-blue-500/20 rounded-3xl transition-all duration-500 hover:border-blue-500/50 relative z-20">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Filtrar por</h3>
                <AnimatePresence>
                  {isFiltered && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-[10px] font-bold"
                    >
                      <X size={10} />
                      LIMPIAR
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Por calificación</label>
                  <div className="relative">
                    <button
                      onClick={() => setRatingDropdownOpen(!ratingDropdownOpen)}
                      className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white hover:border-white/20 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        {filterRating === 'all' ? <span className="text-white/60">Todas</span> : <StarRating rating={filterRating as number} size={11} />}
                        <span className="text-white/30 text-[10px]">
                          · {filterRating === 'all' ? stats.total.toLocaleString() : stats.distribution[filterRating as keyof typeof stats.distribution]}
                        </span>
                      </span>
                      <ChevronDown size={14} className={`text-white/30 transition-transform ${ratingDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {ratingDropdownOpen && (
                      <div className="absolute z-50 top-full mt-1.5 w-full bg-[#151432] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        <button
                          onClick={() => { setFilterRating('all'); setCurrentPage(1); setRatingDropdownOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors text-sm ${filterRating === 'all' ? 'text-white' : 'text-white/60'}`}
                        >
                          <span>Todas</span>
                          <span className="text-white/30 text-xs">{stats.total.toLocaleString()}</span>
                        </button>
                        {[5,4,3,2,1].map(r => (
                          <button
                            key={r}
                            onClick={() => { setFilterRating(r); setCurrentPage(1); setRatingDropdownOpen(false); }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors ${filterRating === r ? 'bg-white/5' : ''}`}
                          >
                            <StarRating rating={r} size={13} />
                            <span className="text-white/30 text-xs">{stats.distribution[r as keyof typeof stats.distribution]}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => { setShowOnlyMyReviews(!showOnlyMyReviews); setCurrentPage(1); }}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border transition-all ${showOnlyMyReviews ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/60 hover:text-white'} text-xs font-semibold`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
                  {showOnlyMyReviews ? 'Ver Todas' : 'Mis Reseñas'}
                </button>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Ordenar por</label>
                  <div className="relative">
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
                    >
                      <option value="newest" className="bg-[#0d0c22]">Más recientes</option>
                      <option value="oldest" className="bg-[#0d0c22]">Más antiguas</option>
                      <option value="highest" className="bg-[#0d0c22]">Mejor calificación</option>
                      <option value="lowest" className="bg-[#0d0c22]">Menor calificación</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            
            {/* Search Bar */}
            <div className="flex flex-col gap-4">
              <motion.div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                <input 
                  type="text"
                  placeholder="Buscar reseñas..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                />
              </motion.div>

              <div className="flex items-center justify-between gap-4 flex-wrap px-1">
                <p className="text-sm text-white/40 font-medium tabular-nums">
                  {loading ? 'Cargando reseñas...' : (
                    <>
                      Mostrando <span className="text-white/80 font-bold">{startItem}–{endItem}</span> de <span className="text-white/80 font-bold">{filteredReviews.length.toLocaleString()}</span> reseñas
                      {filterRating !== 'all' && <span className="text-blue-400 ml-2">· (filtrado)</span>}
                    </>
                  )}
                </p>
                <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} />
              </div>
            </div>

            {/* List */}
            <div className="grid gap-4 min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
                  <Loader2 className="animate-spin" size={40} />
                  <p>Cargando experiencias...</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {paginatedReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </AnimatePresence>
              )}
              
              {!loading && filteredReviews.length === 0 && (
                <div className="py-20 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
                  <MessageSquare size={48} className="mx-auto text-white/5 mb-4" />
                  <h3 className="text-xl font-bold text-white/60">No se encontraron reseñas</h3>
                  <p className="text-white/30 text-sm mt-1">Intenta ajustar los filtros de búsqueda.</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} />
              </div>
            )}
          </div>
        </div>

        <div className="h-40" />
      </div>

      {/* Write Review Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitting && setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-[#151432] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-white">Escribir Reseña</h2>
                    <p className="text-white/40 text-sm mt-1">Cuéntanos tu experiencia con Pixel Store</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Stars */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Calificación</label>
                    <div className="flex flex-col gap-1">
                      <StarRating rating={newRating} size={32} onSelect={setNewRating} />
                      <span className="text-xs text-amber-400/60 font-medium">
                        {['Muy mala', 'Mala', 'Regular', 'Buena', 'Excelente'][newRating - 1]}
                      </span>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Comentario</label>
                    <textarea 
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      placeholder="¿Qué te pareció el servicio? ¿Fue rápido? ¿Lo recomendarías?"
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:border-blue-500/50 transition-all outline-none resize-none"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Añadir Foto (Opcional)</label>
                    <div className="flex items-center gap-4">
                      {previewUrl ? (
                        <div className="relative size-24 rounded-2xl overflow-hidden border border-blue-500/50">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => { setNewImage(null); setPreviewUrl(null); }}
                            className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white/80 hover:text-white"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="size-24 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-blue-500/40 cursor-pointer transition-all">
                          <Camera className="text-white/20" size={24} />
                          <span className="text-[10px] font-bold text-white/30">AÑADIR</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                      )}
                      <div className="flex-1">
                        <p className="text-[11px] text-white/40 leading-relaxed">
                          Sube una captura de tu pedido para ayudar a otros usuarios. Formatos: JPG, PNG, WebP. Máx 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleSubmitReview}
                    disabled={submitting || !newText.trim()}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-white/20 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 mt-4"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <PenLine size={20} />}
                    {submitting ? 'Publicando...' : 'Publicar Reseña'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
