import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Paperclip, MoreVertical, Check, CheckCheck, Smile, Hash, ArrowLeft, Loader2, MessageSquare, ShoppingBag, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChatAPI, SERVER_URL, socket } from '../services/api';

export default function Chat() {
  const navigate = useNavigate();
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showMobileList, setShowMobileList] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (instant: boolean = false) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: instant ? 'auto' : 'smooth'
      });
    }
  };

  const location = useLocation();
  const orderIdFromState = location.state?.orderId;

  useEffect(() => {
    const savedUser = localStorage.getItem('pixel_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    loadChats();
  }, []);

  // Si venimos de un pedido específico, lo seleccionamos
  useEffect(() => {
    if (chats.length > 0 && orderIdFromState) {
      const targetChat = chats.find(c => c.orderId === orderIdFromState);
      if (targetChat) {
        setActiveChat(targetChat);
      }
    }
  }, [chats, orderIdFromState]);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
    }
  }, [activeChat]);

  // Scroll instantáneo cuando cambia el chat
  useEffect(() => {
    if (activeChat) {
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [activeChat]);

  // Tiempo Real con Socket.io
  useEffect(() => {
    if (activeChat) {
      socket.emit('join-chat', activeChat.id);
      
      socket.on('new-message', (msg: any) => {
        setMessages(prev => {
          // Si el mensaje ya existe por ID, no hacer nada
          if (prev.find(m => m.id === msg.id)) return prev;
          
          // DEDUPLICACIÓN: Si el mensaje es de 'user' y coincide con un mensaje optimista
          // (mismo texto/archivo en los últimos 5 segundos), lo ignoramos para no duplicar
          const isDuplicate = prev.find(m => 
            m.isOptimistic && 
            m.text === msg.text && 
            m.fileUrl === msg.fileUrl &&
            (Date.now() - m.id < 5000)
          );
          
          if (isDuplicate) {
            // Reemplazamos el optimista con el real para tener el ID correcto del servidor
            return prev.map(m => m.id === isDuplicate.id ? msg : m);
          }

          return [...prev, msg];
        });
      });
      
      return () => {
        socket.off('new-message');
      };
    }
  }, [activeChat]);

  const loadChats = async () => {
    try {
      const res = await ChatAPI.getChats();
      if (res.success) {
        setChats(res.data);
        if (res.data.length > 0 && !activeChat) {
          setActiveChat(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: number) => {
    try {
      const res = await ChatAPI.getMessages(chatId);
      if (res.success) {
        setMessages(res.data);
        // Marcar como leído
        await ChatAPI.markAsRead(chatId);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSendMessage = async (e?: React.FormEvent, type: string = 'text', fileUrl: string | null = null) => {
    if (e) e.preventDefault();
    if (!message.trim() && !fileUrl) return;

    if (!activeChat) return;

    const textToSend = message;
    setMessage('');

    // OPTIMISTIC UI: Añadir el mensaje localmente de inmediato para evitar lag
    const tempId = Date.now();
    const optimisticMsg = {
      id: tempId,
      text: textToSend,
      type: type,
      fileUrl: fileUrl,
      sender: 'user',
      senderName: user?.username,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      isOptimistic: true // Marcador por si queremos darle un estilo tenue mientras carga
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(() => scrollToBottom(), 50);

    try {
      const res = await ChatAPI.sendMessage(textToSend, activeChat.id, undefined, type, fileUrl);
      if (res.success) {
        // Reemplazar el mensaje optimista con el real del servidor si es necesario, 
        // o simplemente dejar que el socket lo maneje (el socket filtrará por ID si ya existe)
        loadChats();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Opcional: eliminar el mensaje optimista si falló
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert('Error al enviar mensaje');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const res = await ChatAPI.uploadFile(formData);
      if (res.success) {
        await handleSendMessage(undefined, res.type, res.url);
      }
    } catch (err) {
      alert('Error al subir archivo');
    } finally {
      setIsUploading(false);
    }
  };
  // Componente Skeleton para la lista de chats
  const ChatListSkeleton = () => (
    <div className="space-y-4 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4 items-center animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/5 rounded w-1/2" />
            <div className="h-3 bg-white/5 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );

  // Componente Skeleton para los mensajes
  const MessagesSkeleton = () => (
    <div className="space-y-6 p-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} animate-pulse`}>
          <div className={`h-12 w-48 rounded-2xl bg-white/5`} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-screen w-screen bg-[#020205] overflow-hidden flex flex-col relative">
      {/* Fondo Decorativo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Sidebar - Glass iOS Style */}
        <div className={`
          w-full lg:w-[380px] h-full flex flex-col 
          bg-white/[0.03] backdrop-blur-3xl border-r border-white/5
          transition-all duration-500 ease-in-out
          ${showMobileList ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          absolute lg:relative z-20
        `}>
          <div className="px-6 py-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate('/')}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                >
                  <Home size={18} />
                </button>
                <h1 className="text-2xl font-black text-white tracking-tight">Mensajes</h1>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Hash size={18} className="text-blue-400" />
              </div>
            </div>
            <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.2em] ml-14">Soporte Pixel Store</p>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-8 custom-scrollbar">
            {loading ? <ChatListSkeleton /> : (
              chats.length === 0 ? (
                <div className="text-center py-20 opacity-20">
                  <p className="text-sm font-bold">No hay conversaciones</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <motion.div 
                    key={chat.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setActiveChat(chat); setShowMobileList(false); }}
                    className={`
                      p-4 rounded-[24px] cursor-pointer mb-2 transition-all
                      ${activeChat?.id === chat.id 
                        ? 'bg-blue-600 shadow-[0_10px_30px_rgba(37,99,235,0.3)]' 
                        : 'bg-white/5 hover:bg-white/10 border border-white/5'}
                    `}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 bg-[#0d0c22]">
                          <img src={chat.adminAvatar || "https://i.postimg.cc/mD8ZzQzC/avatar.png"} alt="" className="w-full h-full object-cover" />
                        </div>
                        {activeChat?.id === chat.id && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border-2 border-blue-600">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <h3 className={`font-black text-sm truncate ${activeChat?.id === chat.id ? 'text-white' : 'text-white/90'}`}>{chat.title}</h3>
                          <span className={`text-[9px] font-bold ${activeChat?.id === chat.id ? 'text-white/60' : 'text-white/30'}`}>{chat.time}</span>
                        </div>
                        <p className={`text-xs truncate ${activeChat?.id === chat.id ? 'text-white/80' : 'text-white/40'}`}>
                          {chat.lastMessage}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )
            )}
          </div>
        </div>

        {/* Main Chat - iOS Detail Style */}
        <div className="flex-1 flex flex-col bg-transparent relative h-full">
          {activeChat ? (
            <>
              {/* Header con Blur */}
              <div className="px-6 py-4 flex items-center justify-between bg-white/[0.02] backdrop-blur-md border-b border-white/5 z-20">
                <div className="flex items-center gap-4">
                  <button onClick={() => setShowMobileList(true)} className="lg:hidden p-2.5 text-white/60 hover:text-white bg-white/5 rounded-xl border border-white/10">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={activeChat.adminAvatar || "https://i.postimg.cc/mD8ZzQzC/avatar.png"} alt="" className="w-11 h-11 rounded-2xl object-cover border border-white/10 shadow-xl" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-[#020205] rounded-full shadow-lg" />
                    </div>
                    <div>
                      <h2 className="text-white font-black text-base tracking-tight">{activeChat.admin || 'Soporte Pixelito'}</h2>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Online</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {activeChat.orderId && (
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600/10 rounded-xl border border-blue-500/20">
                      <ShoppingBag size={14} className="text-blue-400" />
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Pedido #{activeChat.orderId}</span>
                    </div>
                  )}
                  <button className="p-2.5 text-white/5 hover:text-white/10 transition-all bg-white/5 rounded-xl border border-white/5 opacity-0 pointer-events-none">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8" 
                style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.05), transparent 70%)' }}
              >
                {loading ? <MessagesSkeleton /> : (
                  messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10">
                      <MessageSquare size={64} className="mb-4" />
                      <p className="font-black uppercase tracking-[0.3em] text-xs">Sin mensajes</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      console.log('📩 Datos del mensaje recibido:', msg);
                      const isMe = msg.senderName === user?.username || msg.sender === 'user';
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isMe && (
                              <img src={activeChat.adminAvatar || "https://i.postimg.cc/mD8ZzQzC/avatar.png"} className="w-8 h-8 rounded-xl object-cover border border-white/10 mt-1 shadow-lg" alt="" />
                            )}
                            <div className="flex flex-col gap-1.5">
                              <div className={`p-4 md:p-5 rounded-[28px] shadow-2xl ${
                                isMe 
                                  ? 'bg-blue-600 text-white rounded-br-none' 
                                  : 'bg-white/[0.06] backdrop-blur-xl text-white/90 border border-white/10 rounded-bl-none'
                              }`}>
                                  {msg.type === 'image' && (
                                    <div className="mb-3 rounded-2xl overflow-hidden border border-white/20 max-h-[350px] flex justify-center bg-black/20">
                                      <img 
                                        src={msg.fileUrl?.startsWith('http') ? msg.fileUrl : `${SERVER_URL}${msg.fileUrl}`} 
                                        alt="" 
                                        className="max-h-[350px] w-auto object-contain cursor-pointer hover:scale-[1.03] transition-transform duration-500" 
                                        onClick={() => window.open(msg.fileUrl?.startsWith('http') ? msg.fileUrl : `${SERVER_URL}${msg.fileUrl}`, '_blank')} 
                                      />
                                    </div>
                                  )}
                                {msg.type === 'video' && (
                                  <div className="mb-3 rounded-2xl overflow-hidden border border-white/20 bg-black/40">
                                    <video src={`${SERVER_URL}${msg.fileUrl}`} controls className="max-w-full h-auto" />
                                  </div>
                                )}
                                {msg.type === 'file' && (
                                  <a href={`${SERVER_URL}${msg.fileUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all mb-3 group">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                      <Paperclip size={20} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest truncate max-w-[150px]">Descargar</span>
                                  </a>
                                )}
                                {msg.text && <p className="text-sm md:text-base font-medium leading-relaxed tracking-tight">{msg.text}</p>}
                              </div>
                              <div className={`flex items-center gap-1.5 px-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[10px] font-bold text-white/20">{msg.time}</span>
                                {isMe && <CheckCheck size={12} className="text-blue-400" />}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )
                )}
              </div>

              {/* Input Area - iOS Floating Style */}
              <div className="p-4 md:p-8 bg-transparent">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-3 p-2 bg-white/[0.05] backdrop-blur-3xl border border-white/10 rounded-[30px] shadow-2xl focus-within:border-blue-500/50 transition-all">
                  <div className="flex gap-1 pl-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="p-3.5 text-white/30 hover:text-white transition-all rounded-full hover:bg-white/5 active:scale-90"
                    >
                      {isUploading ? <Loader2 className="animate-spin" size={22} /> : <ImageIcon size={22} />}
                    </button>
                  </div>
                  
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mensaje..."
                    className="flex-1 bg-transparent border-none text-base text-white placeholder-white/20 focus:outline-none focus:ring-0 py-4"
                  />
                  
                  <button 
                    type="submit"
                    disabled={!message.trim()}
                    className={`p-4 rounded-full flex items-center justify-center transition-all ${
                      message.trim() 
                        ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95' 
                        : 'bg-white/5 text-white/10'
                    }`}
                  >
                    <Send size={20} className={message.trim() ? 'translate-x-0.5' : ''} />
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">Pixel Store End-to-End Encrypted</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="size-24 bg-white/[0.03] backdrop-blur-2xl rounded-[40px] flex items-center justify-center mb-8 border border-white/5 shadow-2xl"
              >
                <MessageSquare size={48} className="text-white/20" />
              </motion.div>
              <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Hola, {user?.username}</h3>
              <p className="text-sm font-bold text-white/30 max-w-xs leading-relaxed">Selecciona un chat de la lista para empezar a hablar con nuestro equipo de soporte.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

