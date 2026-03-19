import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Circle as HelpCircle } from 'lucide-react';
import { faq as faqApi } from '../lib/api';
import type { FAQ as FAQType } from '../lib/supabase';

const FAQ: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [faqs, setFaqs] = useState<FAQType[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const data = await faqApi.list();
      setFaqs((data || []).slice(0, 8));
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isRTL ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {isRTL ? 'إجابات على الأسئلة الأكثر شيوعاً' : 'Answers to the most common questions'}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 transition-all"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white" dir={isRTL ? 'rtl' : 'ltr'}>
                      {isRTL ? faq.question_ar : faq.question_en}
                    </h3>
                    {faq.category && (
                      <span className="inline-block mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                        {faq.category}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={`w-6 h-6 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                    openId === faq.id ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {openId === faq.id && (
                <div className="px-6 pb-6">
                  <div className="pl-14 pr-4">
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-inner">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>
                        {isRTL ? faq.answer_ar : faq.answer_en}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8">
            <p className="text-gray-600 dark:text-gray-400">
              {isRTL ? 'لم تجد إجابة لسؤالك؟' : "Didn't find what you're looking for?"}
            </p>
            <a
              href="#contact"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition"
            >
              {isRTL ? 'اتصل بنا' : 'Contact Us'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
