"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();

  const handleLoginClick = () => {
    if (status === "authenticated") {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <>
      <main className="wrapper">
        <section className="hero">
          <div className="card">
            <h1>
              Vodenje evidenc gasilskih
              <br />
              intervencij
            </h1>

            <p className="subtitle">
              Sodobna spletna aplikacija za pregledno vodenje intervencij,
              opreme, vozil in sodelujočih članov gasilskih društev.
            </p>

            <button className="cta" onClick={handleLoginClick}>
              Prijava v sistem
            </button>

            <p className="hint">
              Za pooblaščene člane gasilskih društev
            </p>
          </div>
        </section>

        <section className="features">
          <div className="feature">
            <h3>Evidenca intervencij</h3>
            <p>Celoten pregled vseh gasilskih intervencij s podrobnostmi.</p>
          </div>

          <div className="feature">
            <h3>Upravljanje opreme</h3>
            <p>Šifrant gasilske opreme in spremljanje vzdrževanja.</p>
          </div>

          <div className="feature">
            <h3>Evidenca vozil</h3>
            <p>Pregled gasilskih vozil, kilometrov in servisov.</p>
          </div>

          <div className="feature">
            <h3>Statistika in stroški</h3>
            <p>Analiza ur, stroškov in ključnih kazalnikov.</p>
          </div>
        </section>

        <footer className="footer">
          © 2026 Gasilstvo – Evidenca intervencij
          <span className="phase"> • Phase 2</span>
        </footer>
      </main>

      <style jsx>{`
        .wrapper {
          min-height: 100vh;
          background: #fafafa;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
        }

        .hero {
          width: 100%;
          max-width: 900px;
        }

        .card {
          background: white;
          border-radius: 16px;
          padding: 48px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }

        h1 {
          font-size: 36px;
          line-height: 1.2;
          margin-bottom: 16px;
        }

        .subtitle {
          color: #555;
          font-size: 16px;
          max-width: 600px;
          margin: 0 auto 28px;
        }

        .cta {
          background: #dc2626;
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 10px;
          font-size: 15px;
          cursor: pointer;
        }

        .cta:hover {
          background: #b91c1c;
        }

        .hint {
          margin-top: 14px;
          font-size: 13px;
          color: #777;
        }

        .features {
          margin-top: 50px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          width: 100%;
          max-width: 900px;
        }

        .feature {
          background: white;
          border-radius: 14px;
          padding: 24px;
          text-align: center;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
        }

        .feature h3 {
          margin-bottom: 8px;
          font-size: 16px;
        }

        .feature p {
          font-size: 14px;
          color: #666;
        }

        .footer {
          margin-top: 60px;
          font-size: 13px;
          color: #777;
        }

        .phase {
          color: #bbb;
        }
      `}</style>
    </>
  );
}
