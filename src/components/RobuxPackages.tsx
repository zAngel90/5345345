import React from 'react';
import { ShieldCheck } from 'lucide-react';

const packages = [
  { amount: "400", price: "$4.99", bonus: "0", popular: false },
  { amount: "800", price: "$9.99", bonus: "+50", popular: true },
  { amount: "1,700", price: "$19.99", bonus: "+150", popular: false },
  { amount: "4,500", price: "$49.99", bonus: "+450", popular: false },
];

export default function RobuxPackages() {
  return (
    <section id="robux" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-black mb-4">ROBUX <span className="text-blue-500">PACKAGES</span></h2>
          <p className="text-gray-400 flex items-center justify-center gap-2">
            <ShieldCheck size={18} className="text-green-400" />
            100% Secure & Instant Delivery
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg, index) => (
            <div 
              key={index} 
              className={`relative glass-panel rounded-3xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(37,99,235,0.2)] hover:border-blue-500/50 ${pkg.popular ? 'border-blue-500/50 bg-blue-900/10' : ''}`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  MOST POPULAR
                </div>
              )}
              
              <div className="w-20 h-20 mb-6 relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                {/* Hexagon shape resembling Robux icon */}
                <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-amber-600 rounded-xl transform rotate-12 flex items-center justify-center shadow-lg border border-yellow-300/30">
                  <div className="w-8 h-8 border-4 border-white/90 rounded-sm transform -rotate-12"></div>
                </div>
              </div>

              <h3 className="text-3xl font-display font-black mb-1">{pkg.amount}</h3>
              <p className="text-blue-400 font-bold mb-6 text-sm">
                {pkg.bonus !== "0" ? `${pkg.bonus} Bonus Included` : 'Standard Package'}
              </p>
              
              <div className="mt-auto w-full">
                <div className="text-2xl font-bold mb-4">{pkg.price}</div>
                <button className={`w-full py-3 rounded-xl font-bold transition-all ${pkg.popular ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                  Purchase
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
