import React from 'react';

export const AdminCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => {
  return (
    <div className={`bg-gradient-to-br from-red-950/50 via-gray-900 to-black border border-red-500/50 rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
};

export default AdminCard;
