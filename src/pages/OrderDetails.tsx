import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Clock,
  Truck,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  LucideIcon,
  Tag as LucideTag,
  Info,
  ChevronRight,
  ChevronDown,
  User,
  ShieldCheck,
  Zap,
  LayoutDashboard,
  ShoppingCart,
  Send,
  Paperclip,
  Image as ImageIcon,
  X,
  Star,
  PenLine,
  Camera,
  Loader2,
  Gamepad2,
  Crown
} from 'lucide-react';
import { OrdersAPI, SERVER_URL, BASE_URL, RobloxAPI, ChatAPI, socket, ReviewsAPI } from '../services/api';

interface Order {
  id: string;
  amount: number;
  username: string;
  userId: string;
  method: 'gamepass' | 'group';
  total: number;
  currency: string;
  status: 'pending' | 'processing' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  receipt: string;
  gamepassId?: string;
  paymentMethodId?: string;
  cart?: any[];
  type?: string;
  tradeItem?: any;
  targetItem?: any;
  mm2DeliveryStatus?: 'pending' | 'requested' | 'ready' | 'completed';
  mm2PrivateServer?: string;
  mm2RequestedAt?: string;
  // Generic delivery fields (any game category)
  deliveryStatus?: 'pending' | 'requested' | 'ready' | 'completed';
  deliveryServerUrl?: string;
  deliveryRequestedAt?: string;
  fortniteData?: {
    fortniteUsername: string;
    platform: string;
    contactInfo: string;
    vbucksTotal: number;
  };
}

const formatGameName = (gameSlug: string) => {
  if (!gameSlug) return 'Ingame';
  const lower = gameSlug.toLowerCase();
  if (lower === 'mm2') return 'Murder Mystery 2';
  return gameSlug
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedGames, setExpandedGames] = useState<Record<string, boolean>>({});
  const [gamesMap, setGamesMap] = useState<Record<string, any>>({});

  // Helper: check if order type requires delivery (MM2 legacy or generic category)
  const requiresDelivery = (o: Order | null): boolean => {
    if (!o) return false;
    if (o.type === 'mm2' || o.type === 'murder-mystery-2') return true;
    if (o.type && o.type.includes(':')) return true;
    if (o.deliveryStatus) return true;
    return false;
  };

  // Helper: check if order is in-game items
  const isIngameOrder = (o: Order | null): boolean => {
    if (!o) return false;
    if (o.type === 'ingame') return true;
    if (o.cart && o.cart.some((item: any) => {
      const g = String(item.game || '').toLowerCase();
      return !g.includes('mm2') && !g.includes('murder') && !g.includes('limited') && !g.includes('unique') && !g.includes('robux') && g.length > 0;
    })) return true;
    return false;
  };

  // Render delivery content based on order type
  const renderDeliveryContent = () => {
    if (!order) return null;

    const hasCartItems = order.cart && order.cart.length > 0;
    const isFortnite = order.type === 'fortnite';
    const isTradeOrMM2 = order.type === 'trade_limited' || order.type === 'mm2' || (order.cart && order.cart.some((item: any) => String(item.game || '').toLowerCase().includes('limited') || String(item.game || '').toLowerCase().includes('mm2')));

    // Render Fortnite Header
    const fortniteHeader = isFortnite ? (
      <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <img src="/images/fortnite-icon.svg" className="w-5 h-5 brightness-0 invert" alt="Fortnite" />
          </div>
          <div>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-0.5">Método de Entrega</p>
            <h4 className="text-xs font-bold uppercase tracking-tight">Regalo</h4>
          </div>
        </div>
      </div>
    ) : null;

    if (hasCartItems) {
      // Group items by game
      const groupedItems = order.cart!.reduce((acc: Record<string, any[]>, item: any) => {
        const g = item?.game || order.type || 'Ingame';
        (acc[g] = acc[g] || []).push(item);
        return acc;
      }, {});

      return (
        <div className="space-y-3">
          {fortniteHeader}

          <div className="space-y-2">
            {Object.entries(groupedItems).map(([gameSlug, items]: [string, any[]]) => {
              const gameName = formatGameName(gameSlug);
              const total = items.reduce((s: number, i: any) => s + (Number(i.price) || 0), 0);
              const isOpen = !!expandedGames[gameSlug];
              return (
                <div key={gameSlug} className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedGames(prev => ({ ...prev, [gameSlug]: !prev[gameSlug] }))}
                    className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-white/[0.02] cursor-pointer"
                  >
                    <div className="flex items-center gap-3 font-semibold">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-center overflow-hidden">
                        {(() => {
                          const gameData = gamesMap[gameSlug];
                          let gameImg = gameData?.image;
                          if (gameImg) {
                            if (!gameImg.startsWith('http')) {
                              gameImg = `${SERVER_URL}${gameImg.startsWith('/') ? '' : '/'}${gameImg}`;
                            }
                            return <img src={gameImg} alt="" className="w-full h-full object-contain p-1" />;
                          }
                          return <Gamepad2 size={18} className="text-blue-400" />;
                        })()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{gameName}</h3>
                        <p className="text-[10px] text-white/40">{items.length} {items.length === 1 ? 'Artículo' : 'Artículos'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-white">S/ {total.toFixed(2)}</p>
                      <ChevronDown size={16} className={`text-white/30 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="border-t border-white/5 overflow-hidden"
                      >
                        {items.map((item: any, idx: number) => {
                          const imgUrl = item?.img || item?.image || item?.thumbnail;
                          const subtitle = item?.category || (isFortnite ? 'Skin Fortnite' : isTradeOrMM2 ? 'Item a recibir' : 'Producto');
                          return (
                            <div key={idx} className="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-b-0">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-9 h-9 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                  {imgUrl ? (
                                    <img src={imgUrl} alt="" className="w-full h-full object-contain p-0.5" />
                                  ) : (
                                    <Gamepad2 size={14} className="text-white/40" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate">{item?.name}</p>
                                  <p className="text-[10px] text-white/40">{subtitle}</p>
                                </div>
                              </div>
                              {item?.price != null && (
                                <span className="text-xs font-bold text-white shrink-0 ml-3">S/ {Number(item.price).toFixed(2)}</span>
                              )}
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {order.tradeItem && (
            <div className="flex items-center gap-3 p-2.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                <img src={order.tradeItem.thumbnail || order.tradeItem.img || order.tradeItem.image} alt="" className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-0.5">Tu Item (Trade)</p>
                <p className="text-xs font-bold text-white truncate">{order.tradeItem.name}</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (order.targetItem || order.tradeItem) {
      return (
        <div className="space-y-3">
          {order.targetItem && (
            <div className="flex items-center gap-3 p-2.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                <img src={order.targetItem?.img || order.targetItem?.image} alt="" className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-0.5">Item a recibir</p>
                <p className="text-xs font-bold text-white truncate">{order.targetItem?.name}</p>
              </div>
            </div>
          )}
          {order.tradeItem && (
            <div className="flex items-center gap-3 p-2.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                <img src={order.tradeItem.thumbnail || order.tradeItem.img || order.tradeItem.image} alt="" className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-0.5">Tu Item (Trade)</p>
                <p className="text-xs font-bold text-white truncate">{order.tradeItem.name}</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
            {order.method === 'group' ? (
              <img src="/images/grupos.svg" className="w-4 h-4 brightness-0 invert" alt="Grupo" />
            ) : (
              <Zap size={14} />
            )}
          </div>
          <div>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-0.5">Método de Entrega</p>
            <h4 className="text-xs font-bold uppercase tracking-tight">{order.method === 'gamepass' ? 'Gamepass' : 'Grupo'}</h4>
          </div>
        </div>
      </div>
    );
  };

  // Get delivery status (generic or legacy MM2)
  const getDeliveryStatus = (): 'pending' | 'requested' | 'ready' | 'completed' | null => {
    if (!order) return null;
    return order.deliveryStatus || null;
  };

  // Get delivery server URL (generic or legacy MM2)
  const getDeliveryServerUrl = (): string => {
    if (!order) return '';
    return order.deliveryServerUrl || '';
  };

  // Chat States
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showMM2Modal, setShowMM2Modal] = useState(false);
  const [mm2TimeLeft, setMM2TimeLeft] = useState(900); // 15 minutes in seconds
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [reviewPreviewUrl, setReviewPreviewUrl] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const scrollToBottom = (instant = false) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: instant ? 'auto' : 'smooth'
      });
    }
  };

  // MM2 Delivery Timer
  useEffect(() => {
    if (showMM2Modal && mm2TimeLeft > 0) {
      const timer = setInterval(() => {
        setMM2TimeLeft((prev: number) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showMM2Modal, mm2TimeLeft]);

  const handleMM2Ready = async () => {
    setShowMM2Modal(true);
    setMM2TimeLeft(900); // Reset to 15 minutes

    try {
      // Try generic delivery first, fallback to MM2 endpoint for legacy orders
      try {
        await OrdersAPI.requestDelivery(orderId!);
      } catch (genericError) {
        await OrdersAPI.requestMM2Delivery(orderId!);
      }
    } catch (error) {
      console.error('Error requesting delivery:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const [orderRes, chatRes, gamesRes] = await Promise.all([
          OrdersAPI.getOrderById(orderId!),
          ChatAPI.getChatByOrderId(orderId!),
          fetch(`${BASE_URL}/admin/games-config`).then(r => r.json()).catch(() => ({ success: false, data: [] }))
        ]);

        if (gamesRes.success) {
          const map: Record<string, any> = {};
          gamesRes.data.forEach((g: any) => { map[g.id] = g; });
          setGamesMap(map);
        }

        if (orderRes.success) {
          console.log('📦 Order Data:', orderRes.data);
          setOrder(orderRes.data);
          // Initialize expanded games from cart
          if (orderRes.data?.cart?.length) {
            const games: Record<string, boolean> = {};
            orderRes.data.cart.forEach((item: any) => {
              const g = item?.game || orderRes.data.type || 'Ingame';
              games[g] = true;
            });
            setExpandedGames(games);
          }
        } else {
          setError(orderRes.error || 'Pedido no encontrado');
        }

        if (chatRes.success && chatRes.data) {
          setChat(chatRes.data);
          setMessages(chatRes.data.messages || []);
          // Join socket room
          socket.emit('join-chat', chatRes.data.id);
        }
      } catch (err) {
        setError('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrderData();

    // Join order room for real-time updates
    socket.emit('join-order', orderId);

    // Socket listener for new messages
    const handleNewMessage = (msg: any) => {
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(scrollToBottom, 100);
    };

    const handleChatEnded = () => {
      setChat(prev => prev ? { ...prev, status: 'Finalizado' } : null);
    };

    // Real-time order updates
    const handleOrderUpdate = (updatedOrder: any) => {
      console.log('🔄 Order Updated:', updatedOrder);
      setOrder(updatedOrder);

      // Close delivery modal if delivery is ready
      if (updatedOrder.deliveryStatus === 'ready' || updatedOrder.mm2DeliveryStatus === 'ready') {
        setShowMM2Modal(false);
      }
    };

    socket.on('new-message', handleNewMessage);
    socket.on('chat-ended', handleChatEnded);
    socket.on('order-updated', handleOrderUpdate);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('chat-ended', handleChatEnded);
      socket.off('order-updated', handleOrderUpdate);
      socket.emit('leave-order', orderId);
    };
  }, [orderId]);

  useEffect(() => {
    setTimeout(() => scrollToBottom(), 100);
  }, [messages]);

  // Detectar cuando la orden se completa y mostrar modal de reseña
  useEffect(() => {
    if (order && order.status === 'completed') {
      // Verificar si ya dejó una reseña para esta orden
      const hasReviewed = localStorage.getItem(`reviewed_order_${order.id}`);
      if (!hasReviewed) {
        // Mostrar modal después de 1 segundo
        const timer = setTimeout(() => {
          setShowReviewModal(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [order?.status, order?.id]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await ChatAPI.sendMessage(newMessage, chat?.id, orderId);
      if (res.success) {
        setNewMessage('');
        if (!chat) {
          // Primer mensaje: agregar al array existente (no reemplazar, el admin pudo haber escrito antes)
          setMessages(prev => [...prev, res.data]);

          // Buscar el chat completo para tener el ID y unirnos al socket
          const chatRes = await ChatAPI.getChatByOrderId(orderId!);
          if (chatRes.success) {
            setChat(chatRes.data);
            socket.emit('join-chat', chatRes.data.id);
          }
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;

    const fallbackCopy = (text: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      }
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }

    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'processing':
      case 'in_progress': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'processing':
      case 'in_progress': return 'En Progreso';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const renderMessageWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0c22] pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="w-32 h-6 bg-white/5 rounded-md animate-pulse" />
                <div className="w-48 h-3 bg-white/5 rounded-md animate-pulse" />
              </div>
            </div>
            <div className="w-24 h-8 bg-white/5 rounded-lg animate-pulse" />
          </div>

          {/* Stepper Skeleton */}
          <div className="h-24 bg-white/5 rounded-[24px] animate-pulse" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Col Skeleton */}
            <div className="lg:col-span-7 space-y-4">
              <div className="h-28 bg-white/5 rounded-[24px] animate-pulse" />
              <div className="h-48 bg-white/5 rounded-[24px] animate-pulse" />
              <div className="h-16 bg-white/5 rounded-[20px] animate-pulse" />
            </div>
            {/* Right Col Skeleton */}
            <div className="lg:col-span-5 space-y-4">
              <div className="h-40 bg-white/5 rounded-[24px] animate-pulse" />
              <div className="h-20 bg-white/5 rounded-[20px] animate-pulse" />
              <div className="h-64 bg-white/5 rounded-[24px] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0d0c22] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <Info size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">¡Ups! Algo salió mal</h2>
          <p className="text-white/40 mb-8 font-medium">{error || 'No pudimos encontrar la información de este pedido.'}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white font-bold hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0c22] text-white pt-24 pb-12 px-4 sm:px-6 overflow-hidden">
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ y: -30, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 60, damping: 14, mass: 1 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 bg-white/[0.03] border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/[0.05] transition-all"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-black uppercase tracking-tight">Pedido</h1>
                <div
                  onClick={() => copyToClipboard(order.id, 'id')}
                  className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md cursor-pointer hover:bg-blue-500/20 transition-all group"
                >
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">#{order.id}</span>
                  {copiedField === 'id' ? (
                    <CheckCircle2 size={10} className="text-emerald-400" />
                  ) : (
                    <Copy size={10} className="text-blue-400 group-hover:scale-110 transition-transform" />
                  )}
                </div>
              </div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Clock size={10} /> Realizado el {new Date(order.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getStatusColor(order.status)}`}>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${order.status === 'completed' ? 'bg-emerald-400' : (order.status === 'processing' ? 'bg-blue-400' : 'bg-amber-400')}`}></div>
            {getStatusLabel(order.status)}
          </div>
        </div>

        {/* Order Stepper (REINSTATED) */}
        <div className="bg-gradient-to-br from-[#1a1b2e]/80 via-[#131428]/70 to-[#0f1022]/80 border border-white/5 rounded-[28px] p-6 mb-6 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/3 to-transparent opacity-50"></div>
          <div className="relative flex items-center justify-between max-w-3xl mx-auto">
            {/* Steps */}
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-500 ${order.status === 'pending' ? 'bg-amber-500 text-white shadow-amber-500/30 scale-110 animate-pulse ring-4 ring-amber-500/20' :
                  order.status !== 'cancelled' ? 'bg-blue-500 text-white shadow-blue-500/20' :
                    'bg-white/5 text-white/20'
                }`}>
                <Clock size={18} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${order.status === 'pending' ? 'text-amber-400' : order.status !== 'cancelled' ? 'text-white' : 'text-white/20'}`}>Pendiente</span>
            </div>

            <div className={`flex-1 h-0.5 mx-3 rounded-full overflow-hidden bg-white/5`}>
              <div className={`h-full transition-all duration-1000 ${['processing', 'in_progress', 'completed'].includes(order.status) ? 'w-full bg-blue-500' : 'w-0'}`}></div>
            </div>

            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-500 ${order.status === 'processing' || order.status === 'in_progress' ? 'bg-blue-500 text-white shadow-blue-500/30 scale-110 animate-pulse ring-4 ring-blue-500/20' :
                  order.status === 'completed' ? 'bg-blue-500 text-white shadow-blue-500/20' :
                    'bg-white/5 text-white/20 border border-white/10'
                }`}>
                <Truck size={18} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${order.status === 'processing' || order.status === 'in_progress' ? 'text-blue-400' : ['processing', 'in_progress', 'completed'].includes(order.status) ? 'text-white' : 'text-white/20'}`}>En Progreso</span>
            </div>

            <div className={`flex-1 h-0.5 mx-3 rounded-full overflow-hidden bg-white/5`}>
              <div className={`h-full transition-all duration-1000 ${order.status === 'completed' ? 'w-full bg-emerald-500' : 'w-0'}`}></div>
            </div>

            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-500 ${order.status === 'completed' ? 'bg-emerald-500 text-white shadow-emerald-500/30 scale-110 animate-pulse ring-4 ring-emerald-500/20' :
                  'bg-white/5 text-white/20 border border-white/10'
                }`}>
                <CheckCircle2 size={18} />
              </div>
              <div className="flex flex-col items-center">
                <span className={`text-[9px] font-black uppercase tracking-widest ${order.status === 'completed' ? 'text-emerald-400' : 'text-white/20'}`}>Completado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Control - For MM2 and In-Game category deliveries */}
        {requiresDelivery(order) && (
          <div className="bg-gradient-to-br from-[#1a1b2e]/90 via-[#131428]/80 to-[#0f1022]/90 border border-white/5 rounded-[28px] overflow-hidden relative backdrop-blur-xl mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.04] via-blue-500/[0.02] to-transparent opacity-40"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.06),transparent_50%)]"></div>

            {/* Header */}
            <div className="p-5 border-b border-white/5 bg-white/[0.01] flex items-center gap-3 relative z-10">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
                <Truck size={16} />
              </div>
              <h3 className="text-base font-black uppercase tracking-tight">Control de Entrega</h3>
            </div>

            {/* Steps */}
            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-6">
                {/* Step 1: Esperando cliente */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${getDeliveryStatus() === 'pending' || !getDeliveryStatus()
                      ? 'bg-blue-500 text-white shadow-blue-500/30 ring-4 ring-blue-500/20'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                    <Clock size={20} />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest text-center ${getDeliveryStatus() === 'pending' || !getDeliveryStatus() ? 'text-blue-400' : 'text-white/40'
                    }`}>Esperando<br />cliente</span>
                </div>

                {/* Connector */}
                <div className="flex-1 h-0.5 mx-2 bg-white/5 rounded-full">
                  <div className={`h-full transition-all ${['requested', 'ready', 'completed'].includes(getDeliveryStatus() || '') ? 'w-full bg-blue-500' : 'w-0'
                    } rounded-full`}></div>
                </div>

                {/* Step 2: Solicitado */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${getDeliveryStatus() === 'requested'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20'
                      : ['ready', 'completed'].includes(getDeliveryStatus() || '')
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-white/5 text-white/20 border border-white/10'
                    }`}>
                    <User size={20} />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest text-center ${getDeliveryStatus() === 'requested' ? 'text-blue-400' :
                      ['ready', 'completed'].includes(getDeliveryStatus() || '') ? 'text-white/40' : 'text-white/20'
                    }`}>Solicitado</span>
                </div>

                {/* Connector */}
                <div className="flex-1 h-0.5 mx-2 bg-white/5 rounded-full">
                  <div className={`h-full transition-all ${['ready', 'completed'].includes(getDeliveryStatus() || '') ? 'w-full bg-blue-500' : 'w-0'
                    } rounded-full`}></div>
                </div>

                {/* Step 3: Servidor Listo */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${getDeliveryStatus() === 'ready'
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 ring-4 ring-amber-500/20'
                      : getDeliveryStatus() === 'completed'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-white/5 text-white/20 border border-white/10'
                    }`}>
                    <Zap size={20} />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest text-center ${getDeliveryStatus() === 'ready' ? 'text-amber-400' :
                      getDeliveryStatus() === 'completed' ? 'text-white/40' : 'text-white/20'
                    }`}>Servidor<br />Listo</span>
                </div>

                {/* Connector */}
                <div className="flex-1 h-0.5 mx-2 bg-white/5 rounded-full">
                  <div className={`h-full transition-all ${getDeliveryStatus() === 'completed' ? 'w-full bg-emerald-500' : 'w-0'
                    } rounded-full`}></div>
                </div>

                {/* Step 4: Completado */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${getDeliveryStatus() === 'completed'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/20'
                      : 'bg-white/5 text-white/20 border border-white/10'
                    }`}>
                    <CheckCircle2 size={20} />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest text-center ${getDeliveryStatus() === 'completed' ? 'text-emerald-400' : 'text-white/20'
                    }`}>Completado</span>
                </div>
              </div>

              {/* Ready Button or Status Message */}
              {getDeliveryStatus() === 'completed' ? (
                <div className="w-full py-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} />
                  Entrega Completada
                </div>
              ) : getDeliveryStatus() === 'ready' ? (
                <div className="w-full py-3 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                  <Info size={18} />
                  Servidor privado disponible abajo
                </div>
              ) : (
                <button
                  onClick={handleMM2Ready}
                  disabled={showMM2Modal || getDeliveryStatus() === 'requested'}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShieldCheck size={18} />
                  {getDeliveryStatus() === 'requested' ? 'Solicitud enviada' : 'Estoy listo para la entrega'}
                </button>
              )}

            </div>
          </div>
        )}

        {/* Private Server Card - Shows when admin approves */}
        {getDeliveryStatus() === 'ready' && getDeliveryServerUrl() && (
          <div className="bg-gradient-to-br from-red-900/40 via-red-800/30 to-red-900/40 border border-red-500/30 rounded-[28px] overflow-hidden relative backdrop-blur-xl mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.08] via-orange-500/[0.05] to-transparent opacity-60"></div>
            <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse"></div>

            {/* Header */}
            <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400 border border-red-500/30">
                <Truck size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black uppercase tracking-tight text-white">Servidor Privado</h3>
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Únete para recibir tus ítems</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 relative z-10 space-y-4">
              <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                <p className="text-xs text-white/60 mb-3 flex items-start gap-2">
                  <Info size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <span>Haz clic en <strong className="text-white">Únirse al Servidor Privado</strong> para entrar y recibir tus artículos. Asegúrate de iniciar sesión en Roblox con tu cuenta correcta.</span>
                </p>

                {/* Server Link */}
                <div className="flex items-center gap-2 p-3 bg-black/20 border border-white/10 rounded-lg mb-3">
                  <input
                    type="text"
                    value={getDeliveryServerUrl()}
                    readOnly
                    className="flex-1 bg-transparent text-[10px] text-white/60 font-mono outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getDeliveryServerUrl()!);
                      setCopiedField('mm2server');
                      setTimeout(() => setCopiedField(null), 2000);
                    }}
                    className="p-2 text-white/40 hover:text-white transition-colors"
                  >
                    {copiedField === 'mm2server' ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Join Button */}
                <a
                  href={getDeliveryServerUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
                >
                  <Zap size={18} />
                  Únirse al Servidor Privado
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content (Left) - 7 Columns */}
          <div className="lg:col-span-7 space-y-4">
            {/* Product Summary */}
            <div className="bg-gradient-to-br from-[#1a1b2e]/90 via-[#131428]/80 to-[#0f1022]/90 border border-white/5 rounded-[28px] p-6 hover:border-white/10 transition-all duration-300 relative overflow-hidden backdrop-blur-xl group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.04] via-blue-500/[0.02] to-transparent opacity-40"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.08),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center relative group p-3">
                      <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                      {order.type === 'trade_limited' || (order.cart && order.cart.some((item: any) => String(item.game || '').toLowerCase().includes('limited'))) ? (
                        <Crown className="w-8 h-8 text-yellow-400" />
                      ) : order.type === 'fortnite' ? (
                        <Gamepad2 className="w-8 h-8 text-blue-400" />
                      ) : (order.type === 'mm2' || (order.cart && order.cart.some((item: any) => String(item.game || '').toLowerCase().includes('mm2')))) ? (
                        <img src="https://www.peekstore.com/_next/image?url=%2Fmm2-logo.webp&w=64&q=75" className="w-full h-full object-contain rounded-lg" alt="MM2" />
                      ) : isIngameOrder(order) ? (
                        <Gamepad2 className="w-8 h-8 text-green-400" />
                      ) : (
                        <img src="/images/robux-logo.svg" className="w-8 h-8 object-contain brightness-0 invert opacity-90" alt="" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tighter mb-0.5">
                        {order.type === 'trade_limited' || (order.cart && order.cart.some((item: any) => String(item.game || '').toLowerCase().includes('limited'))) ? (
                          `${order.cart?.length || 1} ${order.cart?.length === 1 ? 'Artículo' : 'Artículos'} Limitados`
                        ) : order.type === 'fortnite' ? (
                          `${order.cart?.length || 1} ${order.cart?.length === 1 ? 'Item' : 'Items'} Fortnite`
                        ) : (order.type === 'mm2' || (order.cart && order.cart.some((item: any) => String(item.game || '').toLowerCase().includes('mm2')))) ? (
                          `${order.cart?.length || 1} ${order.cart?.length === 1 ? 'Artículo' : 'Artículos'} MM2`
                        ) : isIngameOrder(order) ? (
                          `${order.cart?.length || 1} ${order.cart?.length === 1 ? 'Artículo' : 'Artículos'} In-Game`
                        ) : (
                          `${order.amount.toLocaleString()} Robux`
                        )}
                      </h2>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <LucideTag size={10} /> {order.type === 'trade_limited' || order.type === 'fortnite' || order.type === 'mm2' || isIngameOrder(order) ? `${order.cart?.length || 1} ${order.cart?.length === 1 ? 'Artículo' : 'Artículos'}` : `Cantidad: ${order.amount}`}
                      </p>

                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black tracking-tighter text-white">
                      S/ {order.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

            </div>
            {/* Delivery Information Box */}
            <div className="bg-gradient-to-br from-[#1a1b2e]/90 via-[#131428]/80 to-[#0f1022]/90 border border-white/5 rounded-[28px] overflow-hidden relative backdrop-blur-xl group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.04] via-blue-500/[0.02] to-transparent opacity-40 pointer-events-none"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.06),transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="p-5 border-b border-white/5 bg-white/[0.01] flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
                  <Truck size={16} />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight">Información de Entrega</h3>
              </div>

              <div className="p-5 space-y-4">
                {renderDeliveryContent()}

                {/* Profile Box - Always show */}
                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between relative group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-xl overflow-hidden border border-white/10 ring-2 ring-white/5">
                      <img
                        src={
                          order.type === 'fortnite'
                            ? (() => {
                              const user = localStorage.getItem('pixel_user');
                              if (user) {
                                const userData = JSON.parse(user);
                                return userData?.avatar?.startsWith('http')
                                  ? userData.avatar
                                  : userData?.avatar
                                    ? `${SERVER_URL}${userData.avatar}`
                                    : `${SERVER_URL}/api/users/avatar/${order.userId}`;
                              }
                              return `${SERVER_URL}/api/users/avatar/${order.userId}`;
                            })()
                            : `${SERVER_URL}/api/users/avatar/${order.userId}`
                        }
                        alt={order.type === 'fortnite' ? order.fortniteData?.fortniteUsername || order.username : order.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-tight">{order.type === 'fortnite' ? order.fortniteData?.fortniteUsername || order.username : order.username}</h4>
                      <p className="text-[9px] text-white/30 font-bold mt-0.5">{order.type === 'fortnite' ? `Plataforma: ${order.fortniteData?.platform || 'Epic'}` : `ID: ${order.userId}`}</p>
                    </div>
                  </div>
                  <button onClick={() => copyToClipboard(order.type === 'fortnite' ? order.fortniteData?.fortniteUsername || order.username : order.username, 'username')} className="p-2 text-white/20 hover:text-white transition-colors">
                    {copiedField === 'username' ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Status/Required Row - Only for Robux gamepass */}
                {order.method === 'gamepass' && !(order.type === 'trade_limited' || order.type === 'mm2' || order.type === 'fortnite' || isIngameOrder(order) || (order.cart && order.cart.some((item: any) => String(item.game || '').toLowerCase().includes('limited') || String(item.game || '').toLowerCase().includes('mm2')))) && (
                  <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex flex-col gap-1.5">
                        <h4 className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                          <ShieldCheck size={14} className="text-blue-400" />
                          Precio Requerido: {Math.ceil(order.amount / 0.7)} R$
                        </h4>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                          <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Precio verificado correctamente</p>
                        </div>
                      </div>
                      <a
                        href={`https://www.roblox.com/game-pass/${order.gamepassId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-10 pointer-events-auto w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingCart size={14} /> Comprar Gamepass
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Bottom Chat Bar Summary */}
            <div className="bg-gradient-to-br from-[#1a1b2e]/90 via-[#131428]/80 to-[#0f1022]/90 border border-white/5 rounded-[24px] p-3 flex items-center justify-between hover:border-white/10 transition-all cursor-pointer group relative overflow-hidden backdrop-blur-xl" onClick={() => scrollToBottom()}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-transparent opacity-40 pointer-events-none"></div>
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 shrink-0">
                    <MessageSquare size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Chat del pedido <span className="ml-1.5 text-blue-400 font-bold bg-blue-500/10 px-1 py-0.5 rounded-md text-[8px]">{messages.length}</span></p>
                    <p className="text-[10px] font-bold text-white/60 truncate italic">
                      {messages.length > 0 ? `${messages[messages.length - 1].sender === 'admin' ? 'Soporte' : 'Tú'}: ${messages[messages.length - 1].text}` : 'Inicia una conversación...'}
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>

          {/* Sidebar (Right) - 5 Columns */}
          <div className="lg:col-span-5 space-y-4">
            {/* Payment Proof Card */}
            <div className="bg-gradient-to-br from-[#1a1b2e]/90 via-[#131428]/80 to-[#0f1022]/90 border border-white/5 rounded-[28px] p-5 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.04] via-blue-500/[0.02] to-transparent opacity-40"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-blue-500/10 rounded-md flex items-center justify-center text-blue-400">
                    <ImageIcon size={12} />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-tight">Comprobante</h3>
                </div>

                <div className="relative aspect-video bg-black/40 rounded-xl overflow-hidden border border-white/5 mb-3 group cursor-pointer" onClick={() => setIsModalOpen(true)}>
                  <img
                    src={`${SERVER_URL}${order.receipt}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt="Comprobante"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold uppercase tracking-widest bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">Ver Ampliado</span>
                  </div>
                </div>

                <button
                  onClick={() => window.open(`${SERVER_URL}${order.receipt}`, '_blank')}
                  className="w-full py-2 bg-white/[0.03] border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white/[0.05] transition-all flex items-center justify-center gap-1.5"
                >
                  <ExternalLink size={10} /> Abrir comprobante
                </button>
              </div>
            </div>

            {/* Status Card */}
            <div className={`p-4 rounded-[20px] border flex items-center gap-3 ${order.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-blue-500/10 border-blue-500/20'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${order.status === 'completed' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'}`}>
                <CheckCircle2 size={14} />
              </div>
              <div>
                <h4 className={`text-xs font-black uppercase tracking-tight ${order.status === 'completed' ? 'text-emerald-400' : 'text-blue-400'}`}>Pedido {getStatusLabel(order.status)}</h4>
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-0.5 leading-tight">
                  {order.status === 'completed' ? '¡Tu pedido ha sido entregado!' : 'Estamos procesando tu pedido.'}
                </p>
              </div>
            </div>

            {/* Chat de Soporte Box */}
            <div className="bg-[#0f1126] border border-white/[0.06] rounded-[24px] flex flex-col h-[400px] overflow-hidden shadow-xl relative">
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-tight">Chat de Soporte</h3>
                    <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest">
                      {order.username || order.userId ? `${order.username || 'Usuario'} (ID: ${order.userId || 'N/A'})` : 'Cargando...'}
                    </p>
                  </div>
                </div>
                <div className="px-2 py-1 bg-white/5 rounded-full flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Soporte</span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/10" ref={messagesContainerRef}>
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                    <MessageSquare size={36} className="mb-3" />
                    <p className="text-[9px] font-black uppercase tracking-widest">No hay mensajes</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender === 'user';
                    return (
                      <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* Avatar for support messages */}
                        {!isMe && (
                          <div className="flex items-center gap-1.5 mb-1 ml-1">
                            <div className="w-4 h-4 bg-blue-500 rounded-md flex items-center justify-center">
                              <Zap size={8} className="text-white" />
                            </div>
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Soporte</span>
                          </div>
                        )}
                        <div className={`max-w-[85%] p-3 rounded-xl ${isMe ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/10' : 'bg-[#1a1b3a] text-white/90 rounded-tl-none border border-white/5'}`}>
                          <p className="text-[11px] font-medium leading-relaxed">{renderMessageWithLinks(msg.text)}</p>
                          <p className={`text-[7px] mt-1.5 font-black uppercase tracking-widest text-right ${isMe ? 'text-white/40' : 'text-white/20'}`}>{msg.time}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-[#0d0c22] border-t border-white/5">
                {chat?.status === 'Finalizado' || order?.status === 'completed' || order?.status === 'cancelled' ? (
                  <div className="py-2.5 px-3 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col items-center text-center">
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-0.5">Este chat ha sido finalizado</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Mensaje..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[11px] font-medium outline-none focus:border-blue-500/50 transition-all pr-10"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || isSending}
                      className="absolute right-1 w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-500 transition-all disabled:opacity-50"
                    >
                      {isSending ? (
                        <div className="w-2.5 h-2.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Send size={12} />
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Image Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
            >
              <img
                src={`${SERVER_URL}${order.receipt}`}
                alt="Comprobante Ampliado"
                className="w-auto h-auto max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain border border-white/10"
              />
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-400 hover:scale-110 transition-all border-2 border-black"
              >
                <span className="font-bold text-xl leading-none">&times;</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MM2 Delivery Modal */}
      <AnimatePresence>
        {showMM2Modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowMM2Modal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#1a1b2e] via-[#131428] to-[#0f1022] border border-blue-500/20 rounded-3xl p-8 max-w-md w-full relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowMM2Modal(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>

              {/* Animated Circle */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-blue-500/20 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-t-blue-500 border-r-blue-500/50 border-b-blue-500/20 border-l-blue-500/20 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-black text-blue-400">K</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-black text-center text-white mb-2">Conectando...</h3>
              <p className="text-sm text-white/60 text-center mb-6">
                Buscando un miembro del staff para<br />entregar tu pedido.
              </p>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <Clock size={16} className="text-blue-400" />
                <span className="text-sm font-bold text-white/40">Expira en</span>
                <span className="text-lg font-black text-blue-400">{formatTime(mm2TimeLeft)}</span>
              </div>

              {/* Loading Dots */}
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submittingReview && setShowReviewModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl bg-[#151432] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-white">¡Pedido Completado! 🎉</h2>
                    <p className="text-white/40 text-sm mt-1">¿Qué te pareció tu experiencia?</p>
                  </div>
                  <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Stars */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Calificación</label>
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={32}
                            onClick={() => setReviewRating(star)}
                            className={`${star <= reviewRating 
                              ? (reviewRating <= 2 ? "fill-red-400 text-red-400" : "fill-amber-400 text-amber-400") 
                              : "text-white/10 fill-white/10"} cursor-pointer hover:scale-110 transition-transform`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs font-medium ${reviewRating <= 2 ? 'text-red-400/60' : 'text-amber-400/60'}`}>
                        {['Muy mala', 'Mala', 'Regular', 'Buena', 'Excelente'][reviewRating - 1]}
                      </span>
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Comentario</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="¿Qué te pareció el servicio? ¿Fue rápido? ¿Lo recomendarías?"
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:border-blue-500/50 transition-all outline-none resize-none"
                    />
                  </div>

                  {/* Image Upload */}
                  {reviewRating >= 3 && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest">Añadir Foto (Opcional)</label>
                    <div className="flex items-center gap-4">
                      {reviewPreviewUrl ? (
                        <div className="relative size-24 rounded-2xl overflow-hidden border border-amber-500/50">
                          <img src={reviewPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            onClick={() => { setReviewImage(null); setReviewPreviewUrl(null); }}
                            className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white/80 hover:text-white"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="size-24 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/[0.08] hover:border-amber-500/40 cursor-pointer transition-all">
                          <Camera className="text-white/20" size={24} />
                          <span className="text-[10px] font-bold text-white/30">AÑADIR</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setReviewImage(file);
                                setReviewPreviewUrl(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </label>
                      )}
                      <div className="flex-1">
                        <p className="text-[11px] text-white/40 leading-relaxed">
                          Sube una captura de tu pedido para ayudar a otros usuarios. Formatos: JPG, PNG, WebP. Máx 5MB.
                        </p>
                      </div>
                    </div>
                  </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowReviewModal(false);
                        localStorage.setItem(`reviewed_order_${order?.id}`, 'skipped');
                      }}
                      className="flex-1 h-14 bg-white/5 hover:bg-white/10 text-white/60 font-bold rounded-2xl transition-all"
                    >
                      Ahora no
                    </button>
                    <button
                      onClick={async () => {
                        if (!reviewText.trim()) return;

                        const user = JSON.parse(localStorage.getItem('pixel_user') || 'null');
                        if (!user) {
                          document.dispatchEvent(new CustomEvent('openAuthModal'));
                          return;
                        }

                        setSubmittingReview(true);
                        try {
                          const formData = new FormData();
                          formData.append('rating', reviewRating.toString());
                          formData.append('text', reviewText);

                          const username = user.displayName || user.name || user.username || user.display_name || 'Usuario';
                          formData.append('username', username);
                          formData.append('userId', user.id);

                          const avatar = user.avatar || user.profilePicture || user.photoURL || user.userAvatar;
                          if (avatar) formData.append('userAvatar', avatar);

                          if (reviewImage) {
                            formData.append('image', reviewImage);
                          }

                          if (order?.id) formData.append('orderId', order.id);

                          const res = await ReviewsAPI.createReview(formData);
                          if (res.success) {
                            localStorage.setItem(`reviewed_order_${order?.id}`, 'true');
                            setShowReviewModal(false);
                            setReviewText('');
                            setReviewImage(null);
                            setReviewPreviewUrl(null);
                          }
                        } catch (error) {
                          console.error('Error submitting review:', error);
                        } finally {
                          setSubmittingReview(false);
                        }
                      }}
                      disabled={submittingReview || !reviewText.trim()}
                      className="flex-1 h-14 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-white/20 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3"
                    >
                      {submittingReview ? <Loader2 className="animate-spin" size={20} /> : <PenLine size={20} />}
                      {submittingReview ? 'Publicando...' : 'Publicar Reseña'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderDetails;
