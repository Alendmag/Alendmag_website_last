import React, { useState, useEffect } from 'react';
import Login from './Login';
import CMSMain from './cms/CMSMain';
import toast from 'react-hot-toast';
import { auth } from '../lib/api';

const Dashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    toast.dismiss();
    auth.check()
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    toast.dismiss();
    try {
      const data: any = await auth.login(username, password);
      if (data) {
        setIsAuthenticated(true);
        setTimeout(() => {
          toast.success(`مرحباً ${data.name_ar || username}`, { duration: 2000, id: 'login-success' });
        }, 100);
        return true;
      }
      return false;
    } catch {
      toast.error('اسم المستخدم أو كلمة المرور غير صحيحة', { id: 'login-error' });
      return false;
    }
  };

  const handleLogout = async () => {
    toast.dismiss();
    try {
      await auth.logout();
    } catch {}
    setIsAuthenticated(false);
    toast.success('تم تسجيل الخروج بنجاح', { duration: 2000 });
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <CMSMain onLogout={handleLogout} />;
};

export default Dashboard;
