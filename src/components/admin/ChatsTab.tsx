import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, User, ShoppingBag, Clock, Image as ImageIcon, Paperclip, Loader2 } from 'lucide-react';
import { ChatAPI, SERVER_URL, socket } from '../../services/api';

export default function ChatsTab() {
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('pixel_user');
    if (savedUser) setAdminUser(JSON.parse(savedUser));
    loadChats();
  }, []);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
      socket.emit('join-chat', activeChat.id);
      
      socket.on('new-message', (msg: any) => {
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;

          const isDuplicate = prev.find(m => 
            m.isOptimistic && 
            m.text === msg.text && 
            m.fileUrl === msg.fileUrl &&
            (Date.now() - m.id < 5000)
          );
          
          if (isDuplicate) {
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
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres finalizar y eliminar este chat?')) return;
    try {
      const res = await ChatAPI.deleteChat(chatId);
      if (res.success) {
        setChats(chats.filter(c => c.id !== chatId));
        setActiveChat(null);
        setMessages([]);
      }
    } catch (err) {
      alert('Error al eliminar chat');
    }
  };

  const loadMessages = async (chatId: number) => {
    try {
      const res = await ChatAPI.getMessages(chatId);
      if (res.success) {
        setMessages(res.data);
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

    // OPTIMISTIC UI: Añadir localmente de inmediato
    const tempId = Date.now();
    const optimisticMsg = {
      id: tempId,
      text: textToSend,
      type: type,
      fileUrl: fileUrl,
      sender: 'admin',
      senderName: adminUser?.username,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
      isOptimistic: true
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(() => scrollToBottom(), 50);

    try {
      const res = await ChatAPI.sendMessage(textToSend, activeChat.id, undefined, type, fileUrl);
      if (res.success) {
        loadChats();
      }
    } catch (err) {
      console.error('Error sending message:', err);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 h-[700px]">
      {/* Chats List */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Hash size={20} className="text-blue-500" />
            Conversaciones
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
             <div className="p-4 space-y-4">
                {[1,2,3,4].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)}
             </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-10 opacity-20">
              <p className="text-sm font-bold text-white">No hay chats activos</p>
            </div>
          ) : (
            chats.map(chat => (
              <div 
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${activeChat?.id === chat.id ? 'bg-blue-600/10 border-blue-500/30' : 'bg-transparent border-transparent hover:bg-white/5'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-black text-white truncate">{chat.title}</span>
                  <span className="text-[9px] text-white/30 font-bold uppercase">{chat.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <User size={10} className="text-blue-400" />
                  </div>
                  <p className="text-[10px] text-white/40 truncate font-medium">{chat.username}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Area */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col overflow-hidden">
        {activeChat ? (
          <>
            <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{activeChat.username}</h3>
                  <p className="text-[10px] font-bold text-blue-500/60 uppercase tracking-widest">{activeChat.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {activeChat.orderId && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <ShoppingBag size={14} className="text-blue-400" />
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Pedido #{activeChat.orderId}</span>
                  </div>
                )}
                <button 
                  onClick={() => handleDeleteChat(activeChat.id)}
                  className="px-4 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl border border-red-500/20 font-black text-[9px] uppercase tracking-widest transition-all"
                >
                  Finalizar Chat
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map(msg => {
                const isMe = msg.senderName === adminUser?.username || msg.sender === 'admin';
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 rounded-2xl ${msg.sender === 'admin' ? 'bg-blue-600 text-white rounded-br-sm shadow-lg shadow-blue-600/20' : 'bg-white/5 text-white/90 border border-white/10 rounded-bl-sm'}`}>
                      {msg.type === 'image' && (
                        <div className="mb-2 rounded-xl overflow-hidden border border-white/10 max-h-[250px] bg-black/20 flex justify-center">
                          <img 
                            src={msg.fileUrl?.startsWith('http') ? msg.fileUrl : `${SERVER_URL}${msg.fileUrl}`} 
                            alt="" 
                            className="max-h-[250px] w-auto object-contain cursor-pointer hover:scale-[1.02] transition-transform" 
                            onClick={() => window.open(msg.fileUrl?.startsWith('http') ? msg.fileUrl : `${SERVER_URL}${msg.fileUrl}`, '_blank')} 
                          />
                        </div>
                      )}
                      {msg.type === 'video' && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-white/10 bg-black">
                          <video src={`${SERVER_URL}${msg.fileUrl}`} controls className="max-w-full h-auto" />
                        </div>
                      )}
                      {msg.type === 'file' && (
                        <a href={`${SERVER_URL}${msg.fileUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all mb-2">
                          <Paperclip size={18} />
                          <span className="text-xs font-bold truncate max-w-[150px]">Descargar Archivo</span>
                        </a>
                      )}
                      {msg.text && <p className="text-sm font-medium leading-relaxed">{msg.text}</p>}
                    </div>
                    <span className="mt-1 text-[9px] font-bold text-white/20 uppercase px-2">{msg.time}</span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-4">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-3 bg-white/5 text-white/40 rounded-xl hover:text-white transition-all disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="animate-spin" size={18} /> : <ImageIcon size={18} />}
              </button>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-3 bg-white/5 text-white/40 rounded-xl hover:text-white transition-all disabled:opacity-50"
              >
                <Paperclip size={18} />
              </button>
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:border-blue-500/50 outline-none"
              />
              <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 flex items-center gap-2">
                <Send size={16} />
                Enviar
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20">
            <Hash size={60} className="mb-4" />
            <p className="text-sm font-black">Selecciona un chat para responder</p>
          </div>
        )}
      </div>
    </div>
  );
}
