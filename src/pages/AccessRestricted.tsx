import { useEffect } from 'react';

type SealProps = {
  title: string;
  subtitle: string;
  variant: 'shield' | 'crest' | 'scales';
};

function SealGraphic({ variant }: Pick<SealProps, 'variant'>) {
  if (variant === 'crest') {
    return (
      <svg viewBox="0 0 160 160" className="h-28 w-28 drop-shadow-[0_18px_38px_rgba(255,192,70,0.25)]" aria-hidden="true">
        <defs>
          <linearGradient id="crestGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff4b8" />
            <stop offset="55%" stopColor="#e7b31e" />
            <stop offset="100%" stopColor="#9f6a00" />
          </linearGradient>
        </defs>
        <path fill="url(#crestGlow)" d="M80 18l12 18 21-2-8 19 18 11-18 10 8 20-21-3-12 18-12-18-21 3 8-20-18-10 18-11-8-19 21 2z" />
        <circle cx="80" cy="72" r="22" fill="#13161e" stroke="#f5d66d" strokeWidth="5" />
        <path d="M80 55l7 13 14 2-10 10 2 15-13-7-13 7 2-15-10-10 14-2z" fill="#f5d66d" />
        <path d="M52 118h56" stroke="#f5d66d" strokeWidth="7" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === 'scales') {
    return (
      <svg viewBox="0 0 160 160" className="h-28 w-28 drop-shadow-[0_18px_38px_rgba(214,226,255,0.16)]" aria-hidden="true">
        <defs>
          <linearGradient id="scalesGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f6fbff" />
            <stop offset="48%" stopColor="#b7c9dc" />
            <stop offset="100%" stopColor="#56708f" />
          </linearGradient>
        </defs>
        <path fill="url(#scalesGlow)" d="M80 18c9 12 17 18 34 24-14 8-18 20-18 34v44H64V76c0-14-4-26-18-34 17-6 25-12 34-24z" />
        <path d="M80 38v54" stroke="#102030" strokeWidth="6" strokeLinecap="round" />
        <path d="M46 56h68" stroke="#102030" strokeWidth="6" strokeLinecap="round" />
        <path d="M58 56l-14 24h28zM102 56l-14 24h28z" fill="#102030" />
        <path d="M80 92l-20 18h40z" fill="#102030" opacity="0.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 160 160" className="h-28 w-28 drop-shadow-[0_18px_38px_rgba(250,212,82,0.22)]" aria-hidden="true">
      <defs>
        <linearGradient id="shieldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff7c2" />
          <stop offset="45%" stopColor="#f3c739" />
          <stop offset="100%" stopColor="#9d6a00" />
        </linearGradient>
      </defs>
      <path fill="url(#shieldGlow)" d="M80 18l42 14v32c0 28-16 52-42 68C54 116 38 92 38 64V32z" />
      <path fill="#13161e" d="M80 40l24 8v16c0 18-8 33-24 45-16-12-24-27-24-45V48z" />
      <path d="M80 52v38M61 71h38" stroke="#f7da6e" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

function SealCard({ title, subtitle, variant }: SealProps) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] px-6 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <div className="flex items-center justify-center">
        <SealGraphic variant={variant} />
      </div>
      <div className="mt-4 text-center">
        <p className="font-serif text-xl tracking-[0.16em] text-[#f5d66d] uppercase">{title}</p>
        <p className="mt-2 text-sm uppercase tracking-[0.28em] text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

function AccessRestricted() {
  useEffect(() => {
    document.title = 'Access Restricted';
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070b13] text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(144,22,22,0.35),_transparent_42%),radial-gradient(circle_at_bottom,_rgba(179,140,33,0.18),_transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:64px_64px]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center rounded-full border border-[#f3c739]/25 bg-[#f3c739]/10 px-5 py-2 text-xs uppercase tracking-[0.45em] text-[#f5d66d]">
            Temporary access status
          </div>

          <div className="relative mb-10 w-full max-w-4xl rounded-[2rem] border border-white/10 bg-black/25 px-6 py-10 shadow-[0_25px_90px_rgba(0,0,0,0.55)] backdrop-blur-md sm:px-12">
            <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-[#f3c739]/30 bg-[#f3c739]/10 shadow-[0_0_80px_rgba(232,183,41,0.15)]">
              <svg viewBox="0 0 160 160" className="h-20 w-20" aria-hidden="true">
                <defs>
                  <linearGradient id="starBurst" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fff4b8" />
                    <stop offset="50%" stopColor="#e7b31e" />
                    <stop offset="100%" stopColor="#9f6a00" />
                  </linearGradient>
                </defs>
                <path fill="url(#starBurst)" d="M80 16l14 28 30 4-22 20 6 30-28-14-28 14 6-30-22-20 30-4z" />
                <circle cx="80" cy="64" r="13" fill="#0b1020" />
                <path d="M80 82v24M67 94h26" stroke="#0b1020" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </div>

            <div className="mx-auto max-w-3xl rounded-xl border border-[#7b0f12] bg-[#7b0f12]/90 px-5 py-4 shadow-[0_18px_40px_rgba(123,15,18,0.45)]">
              <p className="font-serif text-3xl font-semibold tracking-[0.04em] text-white sm:text-4xl">
                Доступ к сайту временно ограничен
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-4xl space-y-5 text-balance font-serif text-xl leading-relaxed text-slate-200 sm:text-2xl">
              <p>
                Онлайн-чат и публичные страницы сайта отключены. На текущий момент ресурс переведён на единый экран
                уведомления и не обслуживает пользовательские обращения.
              </p>
              <p className="text-slate-300">
                Если требуется восстановление доступа или проверка состояния ресурса, используйте административные
                контакты владельца домена и хостинг-провайдера.
              </p>
            </div>
          </div>

          <div className="grid w-full max-w-6xl gap-5 md:grid-cols-3">
            <SealCard title="Access Hold" subtitle="public pages disabled" variant="shield" />
            <SealCard title="Case Review" subtitle="manual verification" variant="crest" />
            <SealCard title="Service Lock" subtitle="routing enforced" variant="scales" />
          </div>
        </div>
      </section>
    </main>
  );
}

export default AccessRestricted;
