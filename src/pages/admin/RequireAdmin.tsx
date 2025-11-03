import React, { useEffect, useState } from 'react';
import { verifyAdminSession } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ok, setOk] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const isAdmin = await verifyAdminSession();
        if (!mounted) return;
        if (isAdmin) setOk(true);
        else {
          setOk(false);
          navigate('/admin/login', { replace: true });
        }
      } catch {
        setOk(false);
        navigate('/admin/login', { replace: true });
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  if (ok === null) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-gray-300">Checking admin session…</div>
    );
  }
  if (!ok) return null;
  return <>{children}</>;
};

export default RequireAdmin;
