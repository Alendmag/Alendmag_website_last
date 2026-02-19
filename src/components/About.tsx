import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, Eye, Heart, Award, Users, TrendingUp, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TeamMember {
  id: string;
  name_ar: string;
  name_en: string;
  position_ar: string;
  position_en: string;
  photo_url?: string;
  image_url?: string;
}

const About: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const { data } = await supabase
        .from('team_members')
        .select('id, name_ar, name_en, position_ar, position_en, photo_url, image_url')
        .eq('is_active', true)
        .eq('is_admin', false)
        .order('order_index')
        .limit(6);
      setTeamMembers(data || []);
    } catch {
      // silently fail
    }
  };

  const values = [
    { icon: Target, title: t('about.mission'), desc: t('about.missionDesc'), color: 'from-blue-500 to-cyan-500' },
    { icon: Eye, title: t('about.vision'), desc: t('about.visionDesc'), color: 'from-green-500 to-emerald-500' },
    { icon: Heart, title: t('about.values'), desc: t('about.valuesDesc'), color: 'from-orange-500 to-amber-500' }
  ];

  const achievements = [
    { icon: Award, value: '150+', label: t('about.achievementsLabels.projects') },
    { icon: Users, value: '200+', label: t('about.achievementsLabels.clients') },
    { icon: TrendingUp, value: '10+', label: t('about.achievementsLabels.experience') }
  ];

  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium">
              {isRTL ? 'تعرف علينا' : 'About Us'}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold pb-2 leading-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {t('about.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('about.description')}
            </p>

            <div className="grid grid-cols-1 gap-4 pt-2">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:shadow-md transition">
                    <div className={`w-12 h-12 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-800 dark:text-white">{value.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{value.desc || t('about.subtitle')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800 rounded-3xl p-8 space-y-8">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white text-center">{t('about.achievements')}</h3>
            <div className="grid grid-cols-3 gap-6">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-14 h-14 bg-white dark:bg-gray-700 rounded-2xl shadow flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                      {achievement.value}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{achievement.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <img src="/mgoq3621.png" alt="Alendmag Logo" className="w-12 h-12 object-contain" />
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white">{t('common.companyName')}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('about.location')}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('about.companyDescription')}
              </p>
            </div>
          </div>
        </div>

        {teamMembers.length > 0 && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                {isRTL ? 'فريقنا المتميز' : 'Our Team'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {isRTL ? 'نخبة من الخبراء المتخصصين في تكنولوجيا المعلومات' : 'A team of specialized IT experts'}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {teamMembers.map(member => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all text-center group border border-gray-100 dark:border-gray-700"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center ring-4 ring-blue-50 dark:ring-gray-700 group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition">
                    {(member.photo_url || member.image_url) ? (
                      <img
                        src={member.photo_url || member.image_url}
                        alt={isRTL ? member.name_ar : member.name_en}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-9 h-9 text-blue-400 dark:text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {isRTL ? member.name_ar : member.name_en}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    {isRTL ? member.position_ar : member.position_en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default About;
