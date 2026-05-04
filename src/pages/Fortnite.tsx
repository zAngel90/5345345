import React, { useEffect } from 'react';
import { FortniteShop } from '../components/fortnite/FortniteShop';

const Fortnite: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-20">
      <FortniteShop />
    </div>
  );
};

export default Fortnite;
