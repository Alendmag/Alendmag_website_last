import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, TrendingUp, Users, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Hero: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [statsValues, setStatsValues] = useState({ projects: '150+', experience: '10+', satisfaction: '98%' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('setting_key, setting_value')
          .in('setting_key', ['stats_projects', 'stats_experience', 'stats_satisfaction']);
        if (data && data.length > 0) {
          const newStats = { ...statsValues };
          data.forEach(item => {
            if (item.setting_key === 'stats_projects' && item.setting_value) newStats.projects = item.setting_value;
            if (item.setting_key === 'stats_experience' && item.setting_value) newStats.experience = item.setting_value;
            if (item.setting_key === 'stats_satisfaction' && item.setting_value) newStats.satisfaction = item.setting_value;
          });
          setStatsValues(newStats);
        }
      } catch {
        // keep defaults
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { icon: TrendingUp, value: statsValues.projects, label: t('hero.stats.projects') },
    { icon: Users, value: statsValues.experience, label: t('hero.stats.experience') },
    { icon: Award, value: statsValues.satisfaction, label: t('hero.stats.satisfaction') }
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-950 dark:to-cyan-950">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-[10%] w-96 h-96 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-[10%] w-[500px] h-[500px] bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-cyan-300/10 to-blue-300/10 rounded-full blur-3xl"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium shadow-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              {isRTL ? 'مرحباً بكم في الإندماج التقني' : 'Welcome to Alendmag Tech'}
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent drop-shadow-sm">
                {t('hero.title')}
              </span>
            </h1>

            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#contact"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300 flex items-center gap-2 overflow-hidden"
              >
                <span className="relative z-10">{t('hero.startProject')}</span>
                <ArrowRight className={`relative z-10 w-5 h-5 transform group-hover:${isRTL ? '-translate-x-2' : 'translate-x-2'} transition`} />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </a>
              <a
                href="#services"
                className="group px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-xl font-semibold border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-400 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
              >
                {t('hero.ourServices')}
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="group text-center lg:text-start p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg group-hover:scale-110 transition-transform">
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative hidden lg:block">
            <div className="relative z-10">
              {/* Main Card */}
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-all duration-500 hover:shadow-blue-500/20 border border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg w-3/4 shadow-sm"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-5/6"></div>
                  <div className="grid grid-cols-2 gap-4 pt-6">
                    <div className="group h-28 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                      <div className="text-blue-600 dark:text-blue-400 text-4xl group-hover:scale-110 transition-transform">📊</div>
                    </div>
                    <div className="group h-28 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl border border-cyan-100 dark:border-cyan-800 hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                      <div className="text-cyan-600 dark:text-cyan-400 text-4xl group-hover:scale-110 transition-transform">💻</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Small Floating Card */}
              <div className="absolute -bottom-10 -left-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 transform -rotate-3 hover:rotate-0 transition-all duration-500 border border-gray-200 dark:border-gray-700 hover:shadow-cyan-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                    ✓
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg w-24"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl animate-bounce opacity-20 blur-sm"></div>
            <div className="absolute bottom-20 right-0 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-2xl animate-pulse opacity-20 blur-sm"></div>
            <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-blue-300 rounded-full animate-ping opacity-10"></div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-7 h-11 border-2 border-blue-400 dark:border-cyan-400 rounded-full flex justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
            <div className="w-1.5 h-3 bg-gradient-to-b from-blue-600 to-cyan-600 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
