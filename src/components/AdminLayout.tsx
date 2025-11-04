import React from "react";

export const AdminLayout: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden pt-4 md:pt-6 pb-[48px] md:pb-0">
        <div className="bg-gradient-to-br from-red-950 via-black to-red-950">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-24 right-24 w-72 h-72 bg-red-500/8 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-24 left-24 w-72 h-72 bg-yellow-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          {/* <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
            <div className="flex items-center gap-4">
              <img src="/logos/uoc-logo.png" alt="logo" className="h-20 w-20 object-contain drop-shadow-2xl" />
              <div>
                <div className="text-sm text-red-400">University of Colombo</div>
                <h1 className="text-2xl md:text-4xl font-bold text-white">{title ?? "Admin Console"}</h1>
                <p className="text-sm text-gray-300 mt-1">Manage sports, faculties, results and the points system.</p>
              </div>
            </div>
          </div> */}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-black">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
