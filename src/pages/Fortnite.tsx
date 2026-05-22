import React, { useEffect, useState } from 'react';
import { FortniteShop } from '../components/fortnite/FortniteShop';

const Fortnite: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Cargar usuario desde localStorage
    const userData = localStorage.getItem('pixel_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="pt-16 lg:pt-20 pb-28 lg:pb-0 overflow-x-hidden relative min-h-screen">
      {/* Corner Overlays */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/3 h-1/2 opacity-100 blur-3xl bg-gradient-to-br from-[#090971]/50 via-[#000041]/35 via-30% to-transparent" />
        <div className="absolute top-0 right-0 w-1/3 h-1/2 opacity-100 blur-3xl bg-gradient-to-bl from-[#090971]/55 via-[#000041]/40 via-30% to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 opacity-100 blur-3xl bg-gradient-to-tr from-[#090971]/45 via-[#000041]/30 via-30% to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/2 opacity-100 blur-3xl bg-gradient-to-tl from-[#090971]/50 via-[#000041]/35 via-30% to-transparent" />
      </div>
      
      <div className="relative z-10">
        <FortniteShop user={user} />
      </div>
    </div>
  );
};

export default Fortnite;
