import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, CheckCircle2, XCircle, Ticket, Loader2, Percent, DollarSign } from 'lucide-react';
import { CouponsAPI, StoreAPI } from '../../services/api';

export default function CouponsTab() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [userSearch, setUserSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed' | 'balance',
    discountValue: '',
    initialBalance: '',
    maxUses: '',
    isPublic: true,
    expiresAt: '',
    assignedTo: ''
  });

  useEffect(() => {
    StoreAPI.getAdminUsers().then((res: any) => {
      if (res?.success) setUsers(res.data || []);
    }).catch(() => {});
  }, []);

  // Capturar TODOS los eventos wheel y redirigirlos al dropdown
  useEffect(() => {
    if (!showDropdown) return;

    // Guardar overflow original
    const originalBodyOverflow = document.body.style.overflow;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Redirigir el scroll al dropdown
      const dropdown = document.getElementById('user-dropdown-scroll');
      if (dropdown) {
        dropdown.scrollTop += e.deltaY;
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    // Capturar en fase de captura con passive: false
    window.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = originalBodyOverflow;
    };
  }, [showDropdown]);


  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const data = await CouponsAPI.getAdminAllCoupons();
      setCoupons(data || []);
    } catch (err: any) {
      console.error(err);
      setError('Error al cargar cupones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const valueOk = newCoupon.discountType === 'balance' ? !!newCoupon.initialBalance : !!newCoupon.discountValue;
    if (!newCoupon.code || !valueOk) return;

    try {
      setIsCreating(true);
      setError('');
      await CouponsAPI.createCoupon({
        code: newCoupon.code,
        discountType: newCoupon.discountType,
        discountValue: newCoupon.discountType !== 'balance' ? parseFloat(newCoupon.discountValue) : undefined,
        initialBalance: newCoupon.discountType === 'balance' ? parseFloat(newCoupon.initialBalance) : undefined,
        maxUses: newCoupon.maxUses ? parseInt(newCoupon.maxUses) : null,
        isPublic: newCoupon.isPublic,
        expiresAt: newCoupon.expiresAt ? new Date(newCoupon.expiresAt).toISOString() : null,
        assignedTo: newCoupon.assignedTo.trim() || null
      });

      // Reset form
      setNewCoupon({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        initialBalance: '',
        maxUses: '',
        isPublic: true,
        expiresAt: '',
        assignedTo: ''
      });

      await fetchCoupons();
    } catch (err: any) {
      setError(err.message || 'Error al crear el cupón');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await CouponsAPI.toggleCouponActive(id);
      await fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este cupón permanentemente?')) return;
    try {
      await CouponsAPI.deleteCoupon(id);
      await fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
          <Ticket className="text-blue-500" /> Gestión de Cupones
        </h2>
        <p className="text-white/40 text-sm">Crea códigos de descuento para tus clientes y publícalos en sus perfiles.</p>
      </div>

      {/* Formulario de creación */}
      <form onSubmit={handleCreate} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 relative shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none"></div>
        <h3 className="text-sm font-black text-white/70 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
          <Plus size={16} className="text-blue-400" /> Crear Nuevo Cupón
        </h3>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold uppercase tracking-wider relative z-10">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Código del Cupón</label>
            <input 
              type="text" placeholder="Ej: SUPERPROMO" value={newCoupon.code} required
              onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
              className="w-full bg-[#0d0c22]/60 border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Tipo de Descuento</label>
            <select 
              value={newCoupon.discountType}
              onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value as 'percentage' | 'fixed' | 'balance'})}
              className="w-full bg-[#0d0c22]/60 border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-colors appearance-none"
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Valor Fijo (USD)</option>
              <option value="balance">Saldo ($) — se descuenta por uso</option>
            </select>
          </div>

          {newCoupon.discountType === 'balance' ? (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Saldo Inicial ($)</label>
              <div className="relative">
                <input 
                  type="number" placeholder="Ej: 50.00" value={newCoupon.initialBalance} required min="0.01" step="0.01"
                  onChange={(e) => setNewCoupon({...newCoupon, initialBalance: e.target.value})}
                  className="w-full bg-[#0d0c22]/60 border border-white/10 focus:border-blue-500/50 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm outline-none transition-colors"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"><DollarSign size={14} /></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">
                Valor ({newCoupon.discountType === 'percentage' ? '%' : 'USD'})
              </label>
              <div className="relative">
                <input 
                  type="number" placeholder="Ej: 15" value={newCoupon.discountValue} required min="0" step="0.01"
                  onChange={(e) => setNewCoupon({...newCoupon, discountValue: e.target.value})}
                  className="w-full bg-[#0d0c22]/60 border border-white/10 focus:border-blue-500/50 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm outline-none transition-colors"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                  {newCoupon.discountType === 'percentage' ? <Percent size={14} /> : <DollarSign size={14} />}
                </div>
              </div>
            </div>
          )}

          {newCoupon.discountType !== 'balance' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Límite de usos (Opcional)</label>
              <input 
                type="number" placeholder="Ej: 100 (Vacío para ilimitado)" value={newCoupon.maxUses} min="0"
                onChange={(e) => setNewCoupon({...newCoupon, maxUses: e.target.value})}
                className="w-full bg-[#0d0c22]/60 border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-3.5 text-white text-sm outline-none transition-colors"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Asignar a Usuario (Opcional — vacío = global)</label>
            <div className="relative">
              {/* Botón para abrir dropdown */}
              <button
                ref={buttonRef}
                type="button"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setDropdownPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
                  setShowDropdown(!showDropdown);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-[#0d0c22]/60 border border-white/10 hover:border-blue-500/50 rounded-xl transition-colors text-left"
              >
                {newCoupon.assignedTo ? (
                  <>
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-white/10 shrink-0">
                      <img 
                        src={users.find(u => u.id === newCoupon.assignedTo)?.avatar?.startsWith('http') 
                          ? users.find(u => u.id === newCoupon.assignedTo)?.avatar 
                          : `https://ui-avatars.com/api/?name=${users.find(u => u.id === newCoupon.assignedTo)?.username}&background=random`
                        } 
                        className="w-full h-full object-cover" 
                        alt=""
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold truncate">{users.find(u => u.id === newCoupon.assignedTo)?.username}</p>
                      <p className="text-white/30 text-[10px] truncate">{users.find(u => u.id === newCoupon.assignedTo)?.email}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                      <span className="text-blue-400 text-xs">🌐</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-xs font-bold">Global (todos los usuarios)</p>
                      <p className="text-white/30 text-[10px]">Sin restricción de usuario</p>
                    </div>
                  </>
                )}
                <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown */}
              {showDropdown && (
                <div 
                  ref={dropdownRef} 
                  id="user-dropdown-scroll" 
                  className="fixed bg-[#0d0c22] border border-white/10 rounded-xl shadow-2xl z-50 overflow-y-auto" 
                  style={{ 
                    top: `${dropdownPosition.top}px`, 
                    left: `${dropdownPosition.left}px`, 
                    width: `${dropdownPosition.width}px`,
                    maxHeight: '256px',
                    lineHeight: 0
                  }}
                >  
                  {/* Buscador */}
                  <div className="sticky top-0 bg-[#0d0c22] border-b border-white/10 p-3 z-10">
                    <input
                      type="text"
                      placeholder="Buscar usuario..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-blue-500/50"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  <div
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5"
                    onClick={() => {
                      setNewCoupon({...newCoupon, assignedTo: ''});
                      setShowDropdown(false);
                      setUserSearch('');
                    }}
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                      <span className="text-blue-400 text-xs">🌐</span>
                    </div>
                    <div>
                      <p className="text-white text-xs font-bold">Global (todos los usuarios)</p>
                      <p className="text-white/30 text-[10px]">Sin restricción de usuario</p>
                    </div>
                  </div>
                  {users.filter(u => 
                    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                    u.email?.toLowerCase().includes(userSearch.toLowerCase())
                  ).map(u => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 hover:bg-white/5 cursor-pointer"
                      style={{ 
                        margin: 0, 
                        padding: '16px', 
                        border: 'none',
                        width: '100%',
                        boxSizing: 'border-box',
                        display: 'flex',
                        fontSize: '14px',
                        lineHeight: 'normal'
                      }}
                      onClick={() => {
                        setNewCoupon({...newCoupon, assignedTo: u.id});
                        setShowDropdown(false);
                        setUserSearch('');
                      }}
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-white/10 shrink-0" style={{ pointerEvents: 'none' }}>
                        <img 
                          src={u.avatar?.startsWith('http') ? u.avatar : `https://ui-avatars.com/api/?name=${u.username}&background=random`} 
                          className="w-full h-full object-cover" 
                          alt=""
                          style={{ pointerEvents: 'none' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0" style={{ pointerEvents: 'none' }}>
                        <p className="text-white text-xs font-bold truncate">{u.username}</p>
                        <p className="text-white/30 text-[10px] truncate">{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Fecha de Vencimiento (Opcional)</label>
            <input 
              type="date" value={newCoupon.expiresAt}
              onChange={(e) => setNewCoupon({...newCoupon, expiresAt: e.target.value})}
              className="w-full bg-[#0d0c22]/60 border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <div className="flex items-end h-full py-1">
            <label className="flex items-center gap-3 cursor-pointer bg-[#0d0c22]/40 hover:bg-[#0d0c22]/60 border border-white/5 rounded-2xl px-4 py-3 w-full select-none transition-colors">
              <input 
                type="checkbox" checked={newCoupon.isPublic}
                onChange={(e) => setNewCoupon({...newCoupon, isPublic: e.target.checked})}
                className="w-4 h-4 accent-blue-500 rounded border-white/10 bg-black"
              />
              <div>
                <span className="block text-xs font-bold text-white">Publicar en la Web</span>
                <span className="block text-[9px] text-white/30 font-medium">Visible en la pestaña Descuentos del usuario.</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end border-t border-white/5 pt-5 relative z-10">
          <button 
            type="submit" disabled={isCreating}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} 
            {isCreating ? 'Creando...' : 'Generar Cupón'}
          </button>
        </div>
      </form>

      {/* Listado */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-white/60 uppercase tracking-widest">Cupones Existentes ({coupons.length})</h3>
        
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="text-blue-500 animate-spin mx-auto mb-3" size={36} />
            <p className="text-white/30 text-xs font-bold uppercase tracking-wider">Cargando cupones...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-3xl py-16 text-center">
            <Ticket className="mx-auto text-white/10 mb-4" size={48} />
            <p className="text-white/40 text-sm font-medium">No has creado ningún cupón todavía.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {coupons.map((coupon) => {
              const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
              const isSoldOut = coupon.maxUses && coupon.usedCount >= coupon.maxUses;
              const statusLabel = isExpired ? 'Expirado' : isSoldOut ? 'Agotado' : coupon.isActive ? 'Activo' : 'Inactivo';

              return (
                <div 
                  key={coupon.id} 
                  className={`flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-white/[0.03] border rounded-3xl transition-all relative overflow-hidden group ${
                    coupon.isActive && !isExpired && !isSoldOut ? 'border-white/5 hover:border-white/10' : 'border-red-500/20 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 w-full">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      coupon.isActive && !isExpired && !isSoldOut ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-white/5 text-white/20 border border-white/10'
                    }`}>
                      <Ticket size={24} />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 w-full items-center">
                      <div>
                        <h4 className="font-black text-white text-lg tracking-tight">{coupon.code}</h4>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-black">
                            {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF`
                              : coupon.discountType === 'balance' ? `Saldo $${(coupon.remainingBalance ?? 0).toFixed(2)} / $${(coupon.initialBalance ?? 0).toFixed(2)}`
                              : `-$${coupon.discountValue}`}
                          </span>
                          {coupon.isPublic && (
                            <span className="text-[8px] text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded uppercase font-black tracking-widest">Público</span>
                          )}
                          {coupon.assignedTo && (
                            <span className="text-[8px] text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded uppercase font-black tracking-widest">Personal</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="block text-[9px] font-black text-white/30 uppercase tracking-widest">Estadísticas</span>
                        {coupon.discountType === 'balance' ? (
                          <span className="block text-xs font-bold text-white">
                            ${(coupon.remainingBalance ?? 0).toFixed(2)} <span className="text-white/40 font-medium">restante</span>
                          </span>
                        ) : (
                          <span className="block text-xs font-bold text-white">
                            {coupon.usedCount} / {coupon.maxUses || '∞'} <span className="text-white/40 font-medium">usos</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5 hidden md:block">
                        <span className="block text-[9px] font-black text-white/30 uppercase tracking-widest">Vence</span>
                        <span className="block text-xs font-bold text-white">
                          {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Nunca'}
                        </span>
                      </div>

                      <div className="flex justify-end">
                        <button 
                          onClick={() => handleToggle(coupon.id)}
                          disabled={isExpired || isSoldOut}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all select-none ${
                            isExpired || isSoldOut
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                              : coupon.isActive 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20'
                          }`}
                        >
                          {statusLabel === 'Activo' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {statusLabel}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-0 md:ml-6 mt-4 md:mt-0 self-end md:self-auto border-t md:border-t-0 border-white/5 pt-3 md:pt-0 w-full md:w-auto justify-end">
                    <button 
                      onClick={() => handleDelete(coupon.id)} 
                      className="p-2.5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      title="Eliminar Cupón"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
