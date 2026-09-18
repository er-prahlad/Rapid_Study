export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 overflow-hidden">
      
      {/* Inline styles guarantee it works without cache issues */}
      <style dangerouslySetInnerHTML={{__html: `
        .bubbles-container {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .bubble {
          position: absolute;
          bottom: -200px;
          background-color: rgba(99, 102, 241, 0.25);
          border-radius: 50%;
          animation: floatUp 15s infinite linear;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-120vh) scale(1.5); opacity: 0; }
        }
        .bubble:nth-child(1) { left: 10%; width: 80px; height: 80px; animation-duration: 12s; animation-delay: 0s; }
        .bubble:nth-child(2) { left: 25%; width: 40px; height: 40px; animation-duration: 8s; animation-delay: 2s; }
        .bubble:nth-child(3) { left: 40%; width: 120px; height: 120px; animation-duration: 18s; animation-delay: 4s; }
        .bubble:nth-child(4) { left: 60%; width: 60px; height: 60px; animation-duration: 11s; animation-delay: 1s; }
        .bubble:nth-child(5) { left: 75%; width: 90px; height: 90px; animation-duration: 15s; animation-delay: 5s; }
        .bubble:nth-child(6) { left: 85%; width: 50px; height: 50px; animation-duration: 9s; animation-delay: 3s; }
      `}} />

      {/* Floating Bubbles Background */}
      <div className="bubbles-container">
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
      </div>
      
      <div className="relative w-full max-w-md z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-2xl font-bold text-foreground">RapidStudy</span>
          </div>
          <p className="text-muted-foreground text-sm">Prepare • Practice • Perform</p>
        </div>
        {children}
      </div>
    </div>
  );
}
