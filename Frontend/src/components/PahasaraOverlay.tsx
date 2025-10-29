export function PahasaraOverlay() {
  const handlePahasaraClick = () => {
    window.open('https://pahasara.ucsc.cmb.ac.lk', '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handlePahasaraClick}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Visit Pahasara Website"
        title="Visit Pahasara Website"
      >
        <div className="relative p-3">
          
          {/* Logo Button */}
            <div className="relative shadow-2xl animate-pulse hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-110 ">
            <img
              src="/logos/pahasara-logo.png"
              alt="Pahasara Logo"
              className="w-12 h-12 md:w-14 md:h-14 object-contain"
            />
          </div>
        </div>
      </button>
    </>
  );
}
