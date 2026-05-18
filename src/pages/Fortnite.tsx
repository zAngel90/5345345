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
    <div className="pt-20">
      <FortniteShop user={user} />
    </div>
  );
};

export default Fortnite;
