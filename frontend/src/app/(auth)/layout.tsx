export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 overflow-hidden">

      {/* Floating Bubble Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .bubbles-container {
              position: absolute;
              inset: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
              pointer-events: none;
              z-index: 0;
            }

            .bubble {
              position: absolute;
              border-radius: 50%;

              /* Bubble color */
              background: rgba(30, 58, 138, 0.22);

              /* Glass effect */
              border: 1px solid rgba(59, 130, 246, 0.30);
              backdrop-filter: blur(3px);
              -webkit-backdrop-filter: blur(3px);

              /* Glow */
              box-shadow:
                0 0 20px rgba(30, 58, 138, 0.16),
                0 0 40px rgba(59, 130, 246, 0.08),
                inset 0 0 15px rgba(255, 255, 255, 0.25);

              /*
               * Important:
               * Every bubble starts INSIDE the viewport.
               * Animation continuously moves them around.
               */
              animation-name: floatBubble;
              animation-timing-function: ease-in-out;
              animation-iteration-count: infinite;

              will-change: transform;
            }

            @keyframes floatBubble {

              0% {
                transform:
                  translate3d(0, 0, 0)
                  scale(1)
                  rotate(0deg);
              }

              20% {
                transform:
                  translate3d(50px, -70px, 0)
                  scale(1.08)
                  rotate(45deg);
              }

              40% {
                transform:
                  translate3d(-35px, -150px, 0)
                  scale(0.94)
                  rotate(90deg);
              }

              60% {
                transform:
                  translate3d(-80px, -90px, 0)
                  scale(1.12)
                  rotate(180deg);
              }

              80% {
                transform:
                  translate3d(45px, -180px, 0)
                  scale(1.04)
                  rotate(270deg);
              }

              100% {
                transform:
                  translate3d(0, -40px, 0)
                  scale(1)
                  rotate(360deg);
              }
            }

            /* --------------------------------
               Bubble Positions & Sizes
            -------------------------------- */

            .bubble:nth-child(1) {
              left: 5%;
              top: 10%;
              width: 80px;
              height: 80px;
              animation-duration: 8s;
            }

            .bubble:nth-child(2) {
              left: 15%;
              top: 65%;
              width: 40px;
              height: 40px;
              animation-duration: 6s;
              animation-delay: -2s;
            }

            .bubble:nth-child(3) {
              left: 25%;
              top: 25%;
              width: 120px;
              height: 120px;
              animation-duration: 11s;
              animation-delay: -5s;
            }

            .bubble:nth-child(4) {
              left: 35%;
              top: 75%;
              width: 60px;
              height: 60px;
              animation-duration: 7s;
              animation-delay: -1s;
            }

            .bubble:nth-child(5) {
              left: 45%;
              top: 15%;
              width: 90px;
              height: 90px;
              animation-duration: 9s;
              animation-delay: -4s;
            }

            .bubble:nth-child(6) {
              left: 55%;
              top: 55%;
              width: 50px;
              height: 50px;
              animation-duration: 6s;
              animation-delay: -3s;
            }

            .bubble:nth-child(7) {
              left: 65%;
              top: 20%;
              width: 110px;
              height: 110px;
              animation-duration: 10s;
              animation-delay: -6s;
            }

            .bubble:nth-child(8) {
              left: 75%;
              top: 70%;
              width: 70px;
              height: 70px;
              animation-duration: 8s;
              animation-delay: -3s;
            }

            .bubble:nth-child(9) {
              left: 85%;
              top: 30%;
              width: 140px;
              height: 140px;
              animation-duration: 12s;
              animation-delay: -7s;
            }

            .bubble:nth-child(10) {
              left: 95%;
              top: 80%;
              width: 45px;
              height: 45px;
              animation-duration: 7s;
              animation-delay: -2s;
            }

            .bubble:nth-child(11) {
              left: 10%;
              top: 40%;
              width: 65px;
              height: 65px;
              animation-duration: 9s;
              animation-delay: -5s;
            }

            .bubble:nth-child(12) {
              left: 30%;
              top: 5%;
              width: 85px;
              height: 85px;
              animation-duration: 10s;
              animation-delay: -6s;
            }

            .bubble:nth-child(13) {
              left: 50%;
              top: 85%;
              width: 55px;
              height: 55px;
              animation-duration: 7s;
              animation-delay: -4s;
            }

            .bubble:nth-child(14) {
              left: 70%;
              top: 45%;
              width: 95px;
              height: 95px;
              animation-duration: 11s;
              animation-delay: -8s;
            }

            .bubble:nth-child(15) {
              left: 90%;
              top: 10%;
              width: 35px;
              height: 35px;
              animation-duration: 6s;
              animation-delay: -3s;
            }

            .bubble:nth-child(16) {
              left: 20%;
              top: 85%;
              width: 100px;
              height: 100px;
              animation-duration: 10s;
              animation-delay: -7s;
            }

            .bubble:nth-child(17) {
              left: 40%;
              top: 50%;
              width: 50px;
              height: 50px;
              animation-duration: 7s;
              animation-delay: -2s;
            }

            .bubble:nth-child(18) {
              left: 60%;
              top: 5%;
              width: 75px;
              height: 75px;
              animation-duration: 9s;
              animation-delay: -5s;
            }

            .bubble:nth-child(19) {
              left: 80%;
              top: 60%;
              width: 125px;
              height: 125px;
              animation-duration: 13s;
              animation-delay: -9s;
            }

            .bubble:nth-child(20) {
              left: 5%;
              top: 85%;
              width: 40px;
              height: 40px;
              animation-duration: 6s;
              animation-delay: -3s;
            }

            /* Mobile optimization */
            @media (max-width: 640px) {
              .bubble:nth-child(3),
              .bubble:nth-child(9),
              .bubble:nth-child(19) {
                transform: scale(0.7);
              }
            }

            /* Accessibility */
            @media (prefers-reduced-motion: reduce) {
              .bubble {
                animation: none !important;
              }
            }
          `,
        }}
      />

      {/* --------------------------------
          Floating Bubbles
      -------------------------------- */}
      <div className="bubbles-container">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="bubble"
            aria-hidden="true"
          />
        ))}
      </div>

      {/* --------------------------------
          Main Content
      -------------------------------- */}
      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center gap-2 mb-2">

            {/* Logo Icon */}
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                R
              </span>
            </div>

            {/* Logo Name */}
            <span className="text-2xl font-bold text-black drop-shadow-md">
              RapidStudy
            </span>

          </div>

          {/* Tagline */}
          <p className="text-slate-500 text-sm drop-shadow">
            Prepare • Practice • Perform
          </p>

        </div>

        {/* Auth Page Content */}
        {children}

      </div>
    </div>
  );
}
