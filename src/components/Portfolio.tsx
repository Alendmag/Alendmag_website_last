import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, FolderOpen } from 'lucide-react';
import { projects as projectsApi } from '../lib/api';

interface Project {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  image_url?: string;
  technologies?: string[];
  status: string;
  category_ar?: string;
  category_en?: string;
}

const staticProjects: Project[] = [
  {
    id: 'static-1',
    title_ar: 'نظام ERP متكامل',
    title_en: 'Integrated ERP System',
    description_ar: 'نظام شامل لإدارة الموارد يربط جميع أقسام الشركة',
    description_en: 'A comprehensive resource management system connecting all company departments',
    image_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    technologies: ['React', 'Node.js', 'PostgreSQL'],
    status: 'completed',
    category_ar: 'برمجيات الأعمال',
    category_en: 'Business Software'
  },
  {
    id: 'static-2',
    title_ar: 'نظام نقطة البيع',
    title_en: 'Point of Sale System',
    description_ar: 'نظام متكامل لإدارة المبيعات والمخزون',
    description_en: 'Complete system for sales and inventory management',
    image_url: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=800',
    technologies: ['Vue.js', 'Laravel', 'MySQL'],
    status: 'completed',
    category_ar: 'تجارة إلكترونية',
    category_en: 'E-Commerce'
  },
  {
    id: 'static-3',
    title_ar: 'منظومة الأمن والمراقبة',
    title_en: 'Security & Surveillance System',
    description_ar: 'نظام مراقبة ذكي بتقنية الذكاء الاصطناعي',
    description_en: 'AI-powered intelligent surveillance system',
    image_url: 'https://images.pexels.com/photos/430205/pexels-photo-430205.jpeg?auto=compress&cs=tinysrgb&w=800',
    technologies: ['Python', 'OpenCV', 'TensorFlow'],
    status: 'completed',
    category_ar: 'أمن المعلومات',
    category_en: 'Security'
  },
  {
    id: 'static-4',
    title_ar: 'تطبيق الجوال',
    title_en: 'Mobile Application',
    description_ar: 'تطبيق للأعمال يدعم iOS وAndroid',
    description_en: 'Business application supporting iOS and Android',
    image_url: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800',
    technologies: ['React Native', 'Firebase'],
    status: 'completed',
    category_ar: 'تطوير الجوال',
    category_en: 'Mobile Development'
  },
  {
    id: 'static-5',
    title_ar: 'موقع تجارة إلكترونية',
    title_en: 'E-Commerce Website',
    description_ar: 'منصة تسوق متكاملة مع بوابة دفع آمنة',
    description_en: 'Full-featured shopping platform with secure payment gateway',
    image_url: 'https://images.pexels.com/photos/34577/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
    technologies: ['Next.js', 'Stripe', 'MongoDB'],
    status: 'completed',
    category_ar: 'تجارة إلكترونية',
    category_en: 'E-Commerce'
  },
  {
    id: 'static-6',
    title_ar: 'نظام إدارة المستشفيات',
    title_en: 'Hospital Management System',
    description_ar: 'نظام متكامل لإدارة سجلات المرضى والمواعيد',
    description_en: 'Comprehensive system for patient records and appointment management',
    image_url: 'https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg?auto=compress&cs=tinysrgb&w=800',
    technologies: ['Angular', 'Spring Boot', 'PostgreSQL'],
    status: 'completed',
    category_ar: 'برمجيات الأعمال',
    category_en: 'Business Software'
  }
];

const Portfolio: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [projects, setProjects] = useState<Project[]>([]);
  const [useStatic, setUseStatic] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectsApi.list({ status: 'completed' }) as any[];
      if (data && data.length > 0) {
        setProjects(data.slice(0, 12));
        setUseStatic(false);
      } else {
        setUseStatic(true);
      }
    } catch {
      setUseStatic(true);
    }
  };

  const displayProjects = useStatic ? staticProjects : projects;

  const allCategories = useStatic
    ? [...new Set(staticProjects.map(p => isRTL ? (p.category_ar || '') : (p.category_en || '')))]
    : [...new Set(projects.map(p => isRTL ? (p.category_ar || '') : (p.category_en || '')).filter(Boolean))];

  const filteredProjects = activeFilter === 'all'
    ? displayProjects
    : displayProjects.filter(p => {
        const cat = isRTL ? (p as any).category_ar : (p as any).category_en;
        return cat === activeFilter;
      });

  return (
    <section id="portfolio" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
            <FolderOpen className="w-4 h-4" />
            {isRTL ? 'أعمالنا المنجزة' : 'Our Completed Work'}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 pb-2 leading-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {t('portfolio.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('portfolio.subtitle')}
          </p>
        </div>

        {allCategories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-blue-400'
              }`}
            >
              {isRTL ? 'الكل' : 'All'}
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === cat
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-blue-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project: any) => (
            <div
              key={project.id}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-700 dark:to-gray-800">
                {project.image_url ? (
                  <img
                    src={project.image_url}
                    alt={isRTL ? project.title_ar : project.title_en}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderOpen className="w-20 h-20 text-blue-300 dark:text-gray-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl">
                  <ExternalLink className="w-6 h-6 text-blue-600" />
                </div>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {project.technologies.slice(0, 3).map((tech: string) => (
                      <span key={tech} className="px-2 py-0.5 bg-white/90 text-blue-700 text-xs font-medium rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                  {useStatic
                    ? (isRTL ? project.category_ar : project.category_en)
                    : (isRTL ? (project.category_ar || 'برمجيات الأعمال') : (project.category_en || 'Business Software'))
                  }
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {isRTL ? project.title_ar : project.title_en}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 line-clamp-2 text-sm leading-relaxed">
                  {isRTL ? project.description_ar : project.description_en}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {isRTL ? 'لا توجد مشاريع في هذه الفئة' : 'No projects in this category'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
