import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const WhatsAppButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('+218920980096');

  useEffect(() => {
    const fetchNumber = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'whatsapp_number')
          .maybeSingle();
        if (data?.setting_value) {
          setWhatsappNumber(data.setting_value);
        }
      } catch {
        // keep default
      }
    };
    fetchNumber();
  }, []);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('مرحباً، أود الاستفسار عن خدماتكم');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-24 left-6 z-40 group"
      aria-label="تواصل عبر واتساب"
    >
      <div className="relative">
        <div className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 animate-bounce">
          <MessageCircle className="w-7 h-7" />
        </div>

        {/* Pulse Animation */}
        <span className="absolute inset-0 rounded-full bg-green-500 opacity-75 animate-ping"></span>

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
          تواصل معنا عبر واتساب
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </button>
  );
};

export default WhatsAppButton;
