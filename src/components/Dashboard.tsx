import React, { useState, useEffect } from 'react';
import Login from './Login';
import CMSMain from './cms/CMSMain';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const sha256 = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const Dashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    toast.dismiss();
    const saved = sessionStorage.getItem('cms_auth');
    if (saved === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    toast.dismiss();
    try {
      const hash = await sha256(password);

      const { data, error } = await supabase
        .from('team_members')
        .select('id, name_ar, name_en, is_admin')
        .eq('username', username)
        .eq('password_hash', hash)
        .eq('is_admin', true)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setIsAuthenticated(true);
        sessionStorage.setItem('cms_auth', 'true');
        await supabase
          .from('team_members')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.id);

        setTimeout(() => {
          toast.success(`مرحباً ${data.name_ar}`, { duration: 2000, id: 'login-success' });
        }, 100);
        return true;
      } else {
        toast.error('اسم المستخدم أو كلمة المرور غير صحيحة', { id: 'login-error' });
        return false;
      }
    } catch {
      toast.error('حدث خطأ أثناء تسجيل الدخول', { id: 'login-error' });
      return false;
    }
  };

  const handleLogout = () => {
    toast.dismiss();
    setIsAuthenticated(false);
    sessionStorage.removeItem('cms_auth');
    toast.success('تم تسجيل الخروج بنجاح', { duration: 2000 });
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <CMSMain onLogout={handleLogout} />;
};

export default Dashboard;
