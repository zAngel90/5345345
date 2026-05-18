import React, { useMemo } from 'react';
import { 
  ArrowRight, 
  MessageCircle, 
  Shield, 
  FileText, 
  ShoppingBag, 
  Diamond, 
  Star, 
  User, 
  ShoppingCart,
  LayoutGrid,
  Users,
  Instagram,
  Facebook
} from 'lucide-react';

import { useLocation } from 'react-router-dom';

/* ─── Mini generador de partículas galaxia ─────────────────────────── */
function useGalaxyStars(count: number) {
    return useMemo(() => {
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2.5 + 0.6,
            opacity: Math.random() * 0.55 + 0.25,
            duration: Math.random() * 4 + 2.5,
            delay: Math.random() * 6,
            color: ['rgba(255,255,255,0.9)', 'rgba(200,180,255,0.8)', 'rgba(160,120,255,0.75)', 'rgba(100,140,255,0.7)'][Math.floor(Math.random() * 4)],
        }));
    }, []);
}

/* ─── Nebulosa de fondo ─────────────────────────────────────────────── */
const GalaxyBackground = () => {
    const stars = useGalaxyStars(180);
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute inset-0" style={{
                background: `
          radial-gradient(ellipse 80% 60% at 10% 80%, rgba(37,99,235,0.15) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 90% 20%, rgba(59,130,246,0.12) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 50% 50%, rgba(20,0,172,0.1) 0%, transparent 60%),
          radial-gradient(ellipse 70% 30% at 70% 90%, rgba(30,58,138,0.08) 0%, transparent 50%)
        `
            }} />
            <div className="absolute top-8 right-1/3 w-40 h-[1px] rotate-[-35deg] opacity-30"
                style={{ background: 'linear-gradient(to right, transparent, rgba(200,160,255,0.9), transparent)' }} />
            <div className="absolute top-20 right-1/4 w-24 h-[1px] rotate-[-35deg] opacity-20"
                style={{ background: 'linear-gradient(to right, transparent, rgba(180,140,255,0.8), transparent)' }} />
            <style>{`
        @keyframes galaxy-twinkle {
          0%,100% { opacity: var(--gop); }
          50% { opacity: calc(var(--gop)*0.1); }
        }
        .gstar { 
          position:absolute; border-radius:50%; pointer-events:none;
          animation: galaxy-twinkle var(--gdur) ease-in-out infinite;
          animation-delay: var(--gdelay);
        }
      `}</style>
            {stars.map(s => (
                <span key={s.id} className="gstar" style={{
                    left: `${s.x}%`, top: `${s.y}%`,
                    width: `${s.size}px`, height: `${s.size}px`,
                    backgroundColor: s.color,
                    filter: 'blur(0.4px)',
                    boxShadow: s.size > 2 ? `0 0 ${s.size * 3}px ${s.size}px ${s.color}` : 'none',
                    ['--gop' as string]: s.opacity,
                    ['--gdur' as string]: `${s.duration}s`,
                    ['--gdelay' as string]: `${s.delay}s`,
                }} />
            ))}
        </div>
    );
};

/* ─── Iconos Redes Sociales ─────────────────────────────────────────── */
const DiscordIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    </svg>
);

const TikTokIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.52V6.76a4.85 4.85 0 0 1-1.02-.07z" />
    </svg>
);

const InstagramIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

const WhatsAppIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .012 5.403.01 12.039a11.85 11.85 0 001.632 6.118L0 24l6.102-1.602a11.832 11.832 0 005.938 1.585h.005c6.637 0 12.039-5.403 12.041-12.04a11.82 11.82 0 00-3.535-8.503z" />
    </svg>
);

/* ─── Footer Principal ──────────────────────────────────────────────── */
export default function Footer() {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <footer className="relative z-50">
            {/* 
                MÁSCARA DE TRANSICIÓN DEFINITIVA
                Eliminamos cualquier contenedor absoluto separado y usamos un único bloque 
                que se funde perfectamente con el fondo de la página.
            */}
            {isHome && (
                <div 
                    className="absolute -top-[300px] left-0 right-0 h-[300px] pointer-events-none z-50"
                    style={{
                        background: 'linear-gradient(to top, #0d0c22 0%, #0d0c22 20%, rgba(13, 12, 34, 0.95) 40%, rgba(13, 12, 34, 0.7) 60%, transparent 100%)',
                        backdropFilter: 'blur(8px)',
                        maskImage: 'linear-gradient(to top, black 20%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 100%)'
                    }}
                />
            )}

            {isHome && (
                <div
                    className="relative overflow-hidden"
                    style={{ background: 'linear-gradient(180deg, #0d0c22 0%, #161530 100%)' }}
                >
                    <GalaxyBackground />

                    <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black mb-4 leading-tight">
                            <span className="text-white">¿Qué estás</span>{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400">
                                esperando?
                            </span>
                        </h2>
                        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                            Compra tus Robux de forma segura y rápida. Miles de clientes ya confían en nosotros.
                        </p>
                        <a
                            href="/catalog"
                            className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold text-lg rounded-full shadow-[0_0_32px_rgba(37,99,235,0.5)] hover:shadow-[0_0_48px_rgba(37,99,235,0.7)] hover:-translate-y-1 transition-all duration-300"
                        >
                            <ArrowRight size={20} />
                            Ir al catálogo
                        </a>
                    </div>

                    {/* Separador difuminado */}
                    <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
            )}

            {/* ── Footer Links ── */}
            <div className="relative overflow-hidden" style={{ background: '#0d0c22' }}>
                <GalaxyBackground />

                <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">

                    {/* Grid principal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-14">

                        {/* Brand col — ocupa 2 columnas */}
                        <div className="lg:col-span-2">
                            <img
                                src="https://i.postimg.cc/5tSsMDgK/logo-4x.png"
                                alt="Pixel Store"
                                className="h-9 w-auto object-contain mb-4 opacity-95"
                            />
                            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
                                Compra productos de Roblox de forma segura, rápida y económica.
                            </p>
                            {/* Social */}
                            <div className="flex gap-3 flex-wrap">
                                <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-blue-400/10 hover:border-blue-400/50 transition-all text-sm font-medium group shadow-lg hover:shadow-[0_0_20px_rgba(96,165,250,0.2)]">
                                    <DiscordIcon />
                                    <span className="group-hover:translate-x-0.5 transition-transform">Discord</span>
                                    <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                </a>
                                <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-blue-400/10 hover:border-blue-400/50 transition-all text-sm font-medium group shadow-lg hover:shadow-[0_0_20px_rgba(96,165,250,0.2)]">
                                    <InstagramIcon />
                                    <span className="group-hover:translate-x-0.5 transition-transform">Instagram</span>
                                    <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                </a>
                                <a href="#" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-blue-400/10 hover:border-blue-400/50 transition-all text-sm font-medium group shadow-lg hover:shadow-[0_0_20px_rgba(96,165,250,0.2)]">
                                    <TikTokIcon />
                                    <span className="group-hover:translate-x-0.5 transition-transform">TikTok</span>
                                    <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                </a>
                            </div>
                        </div>

                        {/* Tienda */}
                        <div>
                            <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-5">Tienda</h4>
                            <ul className="space-y-3">
                                <li><a href="/catalog" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"><ShoppingBag size={14} /> Catálogo</a></li>
                                <li><a href="/catalog/robux" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"><Diamond size={14} /> Robux</a></li>
                                <li><a href="/reviews" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"><Star size={14} /> Reseñas</a></li>
                            </ul>
                        </div>

                        {/* Cuenta */}
                        <div>
                            <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-5">Cuenta</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"><User size={14} /> Mi Perfil</a></li>
                                <li><a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"><ShoppingCart size={14} /> Mis Pedidos</a></li>
                            </ul>
                        </div>

                        {/* Soporte */}
                        <div>
                            <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-5">Soporte</h4>
                            <ul className="space-y-3">
                                <li>
                                    <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-all text-sm group">
                                        <WhatsAppIcon /> <span className="group-hover:translate-x-0.5 transition-transform">Whatsapp</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-all text-sm group">
                                        <DiscordIcon /> <span className="group-hover:translate-x-0.5 transition-transform">Discord</span>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-5">Legal</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"><FileText size={14} /> Términos</a></li>
                                <li><a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"><Shield size={14} /> Privacidad</a></li>
                            </ul>
                        </div>

                    </div>

                    {/* Separador */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

                    {/* Bottom bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">
                                Compra productos de Roblox de forma segura, rápida y económica.
                            </p>
                            <p className="text-xs text-gray-600">
                                © <span className="text-gray-500 font-bold">{new Date().getFullYear()}</span> PIXEL STORE. Todos los derechos reservados.
                                Servicio independiente, no somos afiliados, asociados ni respaldados por Roblox Corporation.
                            </p>
                        </div>

                        {/* Idiomas + pagos */}
                        <div className="flex flex-col items-end gap-3">
                            {/* Idiomas */}
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-all">
                                    🇪🇸 ES
                                </button>
                                <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 transition-all">
                                    🇺🇸 EN
                                </button>
                                <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 transition-all">
                                    🇧🇷 PT
                                </button>
                            </div>
                            {/* Métodos de pago */}
                            <div className="flex items-center gap-3 opacity-60">
                                {/* PayPal */}
                                <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><rect width="40" height="24" rx="4" fill="white" fillOpacity="0.08" /><text x="5" y="16" fontSize="9" fill="#00a0dc" fontWeight="bold">Pay</text><text x="18" y="16" fontSize="9" fill="#001f6b" fontWeight="bold">Pal</text></svg>
                                {/* Visa */}
                                <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><rect width="40" height="24" rx="4" fill="white" fillOpacity="0.08" /><text x="7" y="16" fontSize="11" fill="white" fontWeight="bold">VISA</text></svg>
                                {/* Mastercard */}
                                <svg width="40" height="24" viewBox="0 0 40 24" fill="none"><rect width="40" height="24" rx="4" fill="white" fillOpacity="0.08" /><circle cx="15" cy="12" r="7" fill="#eb001b" fillOpacity="0.85" /><circle cx="25" cy="12" r="7" fill="#f79e1b" fillOpacity="0.85" /></svg>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    );
}