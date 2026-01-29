import React, { useState } from 'react';
import { Agent, AgentCategory } from '../types';
import { Star, BadgeCheck, Zap, Terminal, Palette, Briefcase, Coffee, Heart, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n';

interface AgentCardProps {
  agent: Agent;
  onClick: (agent: Agent) => void;
  isHired: boolean;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  variant?: 'featured' | 'standard' | 'story';
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick, isHired, isFavorite, onToggleFavorite, variant = 'standard' }) => {
  const [imageError, setImageError] = useState(false);
  const { t } = useLanguage();

  const FallbackImage = () => (
    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
        <div className="relative z-10 text-center">
            <div className="text-xl font-black text-slate-300 font-mono tracking-tighter">{agent.name.slice(0,1).toUpperCase()}</div>
        </div>
    </div>
  );

  // --- FEATURED VARIANT (App Store "Feature" Banner Style) ---
  if (variant === 'featured') {
      return (
        <div 
            onClick={() => onClick(agent)}
            className="relative w-[300px] h-[200px] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] shrink-0 snap-center cursor-pointer group active:scale-[0.98] transition-all mx-1"
        >
            {/* Background Image */}
            <div className="absolute inset-0 bg-gray-200">
                {!imageError ? (
                    <img src={agent.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={() => setImageError(true)} />
                ) : (
                    <FallbackImage />
                )}
            </div>
            
            {/* Gradient Overlay - Softer */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

            {/* Top Badge */}
            <div className="absolute top-5 left-5 z-10">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-white/20 backdrop-blur-lg px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
                    {agent.isOfficial ? t('badge_choice') : t('badge_featured')}
                </span>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col items-start gap-1">
                 <div className="flex items-center gap-2 mb-1 opacity-90">
                     <span className="text-[10px] font-bold text-white/90 uppercase tracking-wide bg-indigo-500/80 px-2 py-0.5 rounded text-shadow-sm">{agent.category}</span>
                 </div>
                 <h3 className="text-xl font-black text-white leading-tight line-clamp-2 drop-shadow-lg tracking-tight">
                    {agent.tagline}
                 </h3>
                 <div className="flex items-center justify-between w-full mt-4">
                     <div className="flex items-center gap-2.5">
                         <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/40 shadow-sm">
                            {!imageError ? (
                                <img src={agent.imageUrl} className="w-full h-full object-cover" onError={() => setImageError(true)} />
                            ) : (
                                <FallbackImage />
                            )}
                         </div>
                         <span className="text-xs font-bold text-slate-100 truncate max-w-[100px]">{agent.name}</span>
                     </div>
                     <button className={`backdrop-blur-xl text-[10px] font-bold px-4 py-2 rounded-full border transition-all uppercase shadow-lg ${isHired ? 'bg-white/20 text-white border-white/10' : 'bg-white text-black border-white hover:bg-slate-50'}`}>
                        {isHired ? t('card_open') : t('card_try')}
                     </button>
                 </div>
            </div>
        </div>
      );
  }

  // --- STORY VARIANT (Circular Avatar) ---
  if (variant === 'story') {
      const isNew = agent.isNew;
      let ringClass = 'border-slate-200';
      if (agent.isOfficial) ringClass = 'border-amber-400';
      else if (isNew) ringClass = 'border-indigo-400';
      else if (agent.rating > 4.8) ringClass = 'border-pink-400';

      return (
        <div className="flex flex-col items-center gap-2 mr-4 cursor-pointer group active:scale-95 transition-transform" onClick={() => onClick(agent)}>
            <div className={`relative p-[3px] rounded-[24px] border-2 ${ringClass} ${isNew ? 'animate-pulse' : ''} bg-white shadow-sm`}>
                <div className="p-0.5 rounded-[20px] relative bg-white">
                    <div className="w-16 h-16 rounded-[18px] overflow-hidden relative shadow-inner">
                         {!imageError ? (
                            <img src={agent.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={() => setImageError(true)} />
                        ) : (
                            <FallbackImage />
                        )}
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-700 max-w-[70px] truncate text-center leading-tight tracking-tight">{agent.name}</span>
            </div>
        </div>
      );
  }

  // --- STANDARD VARIANT (Premium List Row) ---
  return (
    <div 
      onClick={() => onClick(agent)}
      className="bg-white p-4 mb-3 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)] border border-slate-50 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)] hover:border-slate-100 active:scale-[0.99] transition-all cursor-pointer group relative flex items-center gap-4 mx-4"
    >
        {/* App Icon */}
        <div className="relative w-[56px] h-[56px] flex-shrink-0">
            <div className="w-full h-full rounded-[16px] overflow-hidden shadow-sm relative z-10 group-hover:shadow-md transition-shadow">
                {!imageError ? (
                    <img src={agent.imageUrl} alt={agent.name} className="w-full h-full object-cover" onError={() => setImageError(true)} />
                ) : (
                    <FallbackImage />
                )}
            </div>
            {agent.isNew && <div className="absolute -top-1.5 -right-1.5 z-20 w-3 h-3 bg-indigo-500 border-2 border-white rounded-full shadow-sm animate-bounce"></div>}
        </div>

        {/* Content Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
            <div className="flex justify-between items-center">
                <h3 className="text-[15px] font-bold text-slate-900 leading-tight truncate pr-2 tracking-tight">
                    {agent.name}
                </h3>
            </div>
            
            <p className="text-[12px] text-slate-500 truncate leading-tight font-medium">
                {agent.tagline}
            </p>
            
            <div className="flex items-center gap-2 mt-1">
                 {/* Compact Rating */}
                 <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full text-[10px] text-slate-500 font-bold">
                    <Star size={8} className="fill-amber-400 text-amber-400" />
                    <span>{agent.rating}</span>
                 </div>
                 {/* Category */}
                 <span className="text-[10px] text-slate-400 font-medium truncate px-1">{agent.category}</span>
            </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center justify-center pl-1 min-w-[64px]">
            <button className={`w-[64px] py-1.5 rounded-full text-[11px] font-bold transition-all shadow-sm uppercase ${
                isHired 
                ? 'bg-slate-100 text-slate-400' 
                : 'bg-slate-900 text-white active:bg-slate-800 hover:shadow-md'
            }`}>
                {isHired ? t('card_open') : t('card_try')}
            </button>
            <span className="text-[9px] text-slate-400 mt-1.5 font-medium">
                {isHired ? t('card_hire') : (agent.pricePerTask === 0 ? 'Free' : `${agent.pricePerTask}cr`)}
            </span>
        </div>
    </div>
  );
};