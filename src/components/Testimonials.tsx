import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { testimonials as testimonialsApi } from '../lib/api';
import type { Testimonial } from '../lib/supabase';

const Testimonials: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const data = await testimonialsApi.list({ is_active: true });
      setTestimonials((data || []).slice(0, 6));
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isRTL ? 'آراء عملائنا' : 'Client Testimonials'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {isRTL ? 'ماذا يقول عملاؤنا عن خدماتنا' : 'What our clients say about our services'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 relative group"
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonial.client_photo || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100'}
                  alt={testimonial.client_name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-blue-100 dark:border-gray-700"
                />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {testimonial.client_name}
                  </h3>
                  {testimonial.client_position && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.client_position}
                    </p>
                  )}
                  {testimonial.client_company && (
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {testimonial.client_company}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>
                {isRTL ? testimonial.content_ar : testimonial.content_en}
              </p>

              {testimonial.is_featured && (
                <div className="absolute top-6 left-6">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                    {isRTL ? 'مميز' : 'Featured'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
