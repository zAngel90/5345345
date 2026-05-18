import React, { useEffect } from 'react';
import { OrdersAPI, ChatAPI, SERVER_URL } from '../services/api';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const CATALOG_URL = 'https://54345345.vercel.app/';

export default function GameItems() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();

  // Escucha mensajes del iframe (cross-origin seguro)
  useEffect(() => {
    const fetchNotifications = async (targetWindow: Window) => {
      const user = JSON.parse(localStorage.getItem('pixel_user') || 'null');
      if (!user) return;

      try {
        const [ordersRes, chatsRes] = await Promise.all([
          OrdersAPI.getUserOrders(user.id),
          ChatAPI.getChats()
        ]);

        const realNotifications: any[] = [];
        if (ordersRes.success && Array.isArray(ordersRes.data)) {
          // Only show orders that have not been seen
          ordersRes.data.filter((o: any) => !o.seen).forEach((order: any) => {
            let statusText = 'está en revisión';
            if (order.status === 'completed') statusText = 'ha sido completado ✅';
            if (order.status === 'cancelled') statusText = 'ha sido cancelado ❌';

            realNotifications.push({
              id: `order-${order.id}`,
              title: `Pedido ${order.id}`,
              desc: `Tu pedido de ${order.amount} Robux ${statusText}`,
              time: new Date(order.createdAt).toLocaleDateString(),
              type: 'orders'
            });
          });
        }

        if (chatsRes.success && Array.isArray(chatsRes.data)) {
          // Only show chats with unread messages
          chatsRes.data.filter((c: any) => c.unreadCount > 0).forEach((chat: any) => {
            realNotifications.push({
              id: `chat-${chat.id}`,
              title: chat.userName || 'Soporte Pixel',
              desc: chat.lastMessage || 'Tienes un chat activo',
              time: 'Ahora',
              type: 'chats'
            });
          });
        }

        if (realNotifications.length === 0) {
          realNotifications.push({
            id: 'welcome',
            title: '¡Bienvenido!',
            desc: 'Aún no tienes pedidos, ¡haz el primero!',
            time: 'Ahora',
            type: 'info'
          });
        }

        const robloxAvatar = `${SERVER_URL}/api/users/avatar/${user.id}`;
        let finalAvatar = user.image || user.avatar || robloxAvatar;
        
        // Fix relative URLs by prepending the SERVER_URL
        if (finalAvatar && !finalAvatar.startsWith('http')) {
          finalAvatar = `${SERVER_URL}${finalAvatar.startsWith('/') ? '' : '/'}${finalAvatar}`;
        }

        targetWindow.postMessage({
          action: 'syncAuth',
          user: { ...user, avatar: finalAvatar },
          notifications: realNotifications
        }, '*');
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    const handler = (event: MessageEvent) => {
      if (event.data?.action === 'navigateTo' && event.data?.url) {
        navigate(event.data.url);
      }
      
      if (event.data?.action === 'login') {
        document.dispatchEvent(new CustomEvent('openAuthModal'));
      }

      if (event.data?.action === 'ready') {
        // El catálogo nos avisó que ya cargó, le enviamos los datos
        if (event.source) {
          fetchNotifications(event.source as Window);
        }
      }

      if (event.data?.action === 'logout') {
        localStorage.removeItem('pixel_token');
        localStorage.removeItem('pixel_user');
        window.location.reload();
      }

      if (event.data?.action === 'checkout') {
        const { user, cart, total, currency, ...rest } = event.data;
        navigate('/checkout', { 
          state: { 
            username: user.displayName || user.name,
            userId: user.id,
            amount: total,
            cart: cart,
            currency: currency || 'COP',
            fromWebview: true,
            ...rest
          } 
        });
      }

      if (event.data?.action === 'clearNotifications') {
        const user = JSON.parse(localStorage.getItem('pixel_user') || 'null');
        if (user && user.id) {
          Promise.all([
            OrdersAPI.markAllSeen(user.id),
            ChatAPI.markAllAsRead(user.id)
          ]).catch(err => console.error('Error marking notifications as seen:', err));
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0B0F16] text-white font-sans overflow-hidden">

      {/* Top bar móvil */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0B0F16] shrink-0">
        <button
          onClick={() => navigate('/catalog')}
          className="p-2 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <img src="https://i.postimg.cc/5tSsMDgK/logo-4x.png" className="h-7 object-contain" alt="Pixel Store" />
        <div className="w-9" />
      </div>

      {/* Iframe que ocupa todo el espacio restante */}
      <iframe
        src={`${CATALOG_URL}${window.location.search}${window.location.search ? '&' : '?'}game=${encodeURIComponent(gameId || '')}`}
        title="Catálogo de Items"
        className="flex-1 w-full border-none"
        style={{ display: 'block' }}
        allow="clipboard-write"
      />
    </div>
  );
}
