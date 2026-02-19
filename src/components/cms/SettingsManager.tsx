import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Building, Phone, Share2, Layout, Search, Palette, RefreshCw, Upload, FileText, Globe, Shield, Mail, Clock, CreditCard, Megaphone, X } from 'lucide-react';
import { siteSettings } from '../../lib/api';
import toast from 'react-hot-toast';

interface Setting {
  id: string;
  category: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  label_ar: string | null;
  label_en: string | null;
  order_index: number;
}

interface SettingsByCategory {
  [key: string]: Setting[];
}

const categoryIcons: { [key: string]: React.ReactNode } = {
  company: <Building className="w-5 h-5" />,
  contact: <Phone className="w-5 h-5" />,
  social: <Share2 className="w-5 h-5" />,
  hero: <Layout className="w-5 h-5" />,
  seo: <Search className="w-5 h-5" />,
  appearance: <Palette className="w-5 h-5" />,
  footer: <FileText className="w-5 h-5" />,
  services: <Globe className="w-5 h-5" />,
  about: <Shield className="w-5 h-5" />,
  newsletter: <Mail className="w-5 h-5" />,
  working_hours: <Clock className="w-5 h-5" />,
  payment: <CreditCard className="w-5 h-5" />,
  announcement: <Megaphone className="w-5 h-5" />
};

const categoryLabels: { [key: string]: { ar: string; en: string } } = {
  company: { ar: 'معلومات الشركة', en: 'Company Info' },
  contact: { ar: 'معلومات الاتصال', en: 'Contact Info' },
  social: { ar: 'وسائل التواصل', en: 'Social Media' },
  hero: { ar: 'القسم الرئيسي', en: 'Hero Section' },
  seo: { ar: 'تحسين محركات البحث', en: 'SEO Settings' },
  appearance: { ar: 'المظهر', en: 'Appearance' },
  footer: { ar: 'التذييل', en: 'Footer' },
  services: { ar: 'الخدمات', en: 'Services' },
  about: { ar: 'من نحن', en: 'About Us' },
  newsletter: { ar: 'النشرة البريدية', en: 'Newsletter' },
  working_hours: { ar: 'ساعات العمل', en: 'Working Hours' },
  payment: { ar: 'الدفع', en: 'Payment' },
  announcement: { ar: 'الإعلانات', en: 'Announcements' }
};

const SettingsManager: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [settings, setSettings] = useState<SettingsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('company');
  const [changes, setChanges] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await siteSettings.list();

      const grouped: SettingsByCategory = {};
      (data || []).forEach((setting: Setting) => {
        if (!grouped[setting.category]) {
          grouped[setting.category] = [];
        }
        grouped[setting.category].push(setting);
      });

      setSettings(grouped);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error(isRTL ? 'فشل تحميل الإعدادات' : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (settingId: string, value: string) => {
    setChanges(prev => ({ ...prev, [settingId]: value }));
  };

  const handleSave = async () => {
    if (Object.keys(changes).length === 0) {
      toast.error(isRTL ? 'لا توجد تغييرات للحفظ' : 'No changes to save');
      return;
    }

    setSaving(true);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      for (const [id, value] of Object.entries(changes)) {
        try {
          await siteSettings.update(id, value);
          successCount++;
        } catch (err: any) {
          console.error(`Error updating setting ${id}:`, err);
          errors.push(err?.message || 'Unknown error');
          errorCount++;
        }
      }

      if (errorCount === 0) {
        toast.success(isRTL ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
        setChanges({});
      } else if (successCount > 0) {
        toast.success(isRTL ? `تم حفظ ${successCount} إعدادات، فشل ${errorCount}` : `Saved ${successCount}, failed ${errorCount}`);
        setChanges({});
      } else {
        toast.error(isRTL ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
        console.error('All errors:', errors);
      }

      await fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(isRTL ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const getValue = (setting: Setting): string => {
    if (changes[setting.id] !== undefined) {
      return changes[setting.id];
    }
    return setting.setting_value || '';
  };

  const compressImage = (file: File, maxWidth: number = 200): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/png', 0.9);
            resolve(compressedBase64);
          } else {
            reject(new Error('Could not get canvas context'));
          }
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (settingId: string, file: File) => {
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(isRTL ? 'صيغة الملف غير مدعومة. استخدم PNG, JPG, SVG أو WebP' : 'Unsupported format. Use PNG, JPG, SVG or WebP');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(isRTL ? 'حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)' : 'File too large (max 5MB)');
      return;
    }

    try {
      toast.loading(isRTL ? 'جاري معالجة الصورة...' : 'Processing image...', { id: 'image-upload' });

      if (file.type === 'image/svg+xml') {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          handleChange(settingId, base64String);
          toast.success(isRTL ? 'تم تحميل الصورة - اضغط حفظ' : 'Image loaded - click Save', { id: 'image-upload' });
        };
        reader.readAsDataURL(file);
      } else {
        const compressedBase64 = await compressImage(file, 200);
        handleChange(settingId, compressedBase64);
        toast.success(isRTL ? 'تم تحميل الصورة - اضغط حفظ' : 'Image loaded - click Save', { id: 'image-upload' });
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error(isRTL ? 'فشل معالجة الصورة' : 'Failed to process image', { id: 'image-upload' });
    }
  };

  const renderInput = (setting: Setting) => {
    const value = getValue(setting);
    const baseClasses = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition";

    switch (setting.setting_type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(setting.id, e.target.value)}
            className={`${baseClasses} min-h-[100px] resize-y`}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        );
      case 'color':
        return (
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => handleChange(setting.id, e.target.value)}
              className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(setting.id, e.target.value)}
              className={`${baseClasses} flex-1`}
              placeholder="#000000"
            />
          </div>
        );
      case 'email':
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => handleChange(setting.id, e.target.value)}
            className={baseClasses}
            dir="ltr"
          />
        );
      case 'image':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {value && (
                <div className="relative group">
                  <img
                    src={value}
                    alt="Preview"
                    className="w-24 h-24 object-contain rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleChange(setting.id, '')}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <label className="flex-1">
                <div className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {isRTL ? 'اختر صورة (PNG, JPG, SVG)' : 'Choose image (PNG, JPG, SVG)'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(setting.id, file);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(setting.id, e.target.value)}
              className={baseClasses}
              placeholder={isRTL ? 'أو أدخل رابط الصورة' : 'Or enter image URL'}
              dir="ltr"
            />
          </div>
        );
      case 'boolean':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value === 'true'}
              onChange={(e) => handleChange(setting.id, e.target.checked ? 'true' : 'false')}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300">
              {value === 'true' ? (isRTL ? 'مفعل' : 'Enabled') : (isRTL ? 'معطل' : 'Disabled')}
            </span>
          </label>
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(setting.id, e.target.value)}
            className={baseClasses}
            dir="ltr"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(setting.id, e.target.value)}
            className={baseClasses}
            dir={setting.setting_key.includes('_ar') ? 'rtl' : 'ltr'}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const categories = Object.keys(settings);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isRTL ? 'إعدادات الموقع' : 'Site Settings'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isRTL ? 'إدارة جميع إعدادات ومحتوى الموقع' : 'Manage all site settings and content'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSettings}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <RefreshCw className="w-5 h-5" />
            {isRTL ? 'تحديث' : 'Refresh'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || Object.keys(changes).length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
            {Object.keys(changes).length > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                {Object.keys(changes).length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sticky top-24">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">
              {isRTL ? 'الأقسام' : 'Categories'}
            </h3>
            <nav className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${
                    activeCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {categoryIcons[category]}
                  <span className="font-medium">
                    {isRTL ? categoryLabels[category]?.ar : categoryLabels[category]?.en}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white">
                {categoryIcons[activeCategory]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isRTL ? categoryLabels[activeCategory]?.ar : categoryLabels[activeCategory]?.en}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {settings[activeCategory]?.length || 0} {isRTL ? 'إعداد' : 'settings'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {settings[activeCategory]?.map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isRTL ? setting.label_ar : setting.label_en}
                    {changes[setting.id] !== undefined && (
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                        ({isRTL ? 'معدل' : 'modified'})
                      </span>
                    )}
                  </label>
                  {renderInput(setting)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {Object.keys(changes).length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-50">
          <span>
            {Object.keys(changes).length} {isRTL ? 'تغييرات غير محفوظة' : 'unsaved changes'}
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-white text-blue-600 px-4 py-1.5 rounded-full font-semibold hover:bg-blue-50 transition"
          >
            {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ الآن' : 'Save Now')}
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsManager;
