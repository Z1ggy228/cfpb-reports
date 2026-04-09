import { useEffect } from 'react';

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  const path = direction === 'left' ? 'M14 3L4 13l10 10' : 'M4 3l10 10L4 23';

  return (
    <svg viewBox="0 0 18 26" className="h-7 w-5" aria-hidden="true">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function AccessRestricted() {
  useEffect(() => {
    document.title = 'Доступ запрещён';

    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#17a9df] px-4 pt-10 text-[#3f4d5f] sm:px-8 sm:pt-10">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/10 to-transparent" />

      <div className="pointer-events-none absolute left-[18px] top-1/2 -translate-y-1/2 text-white/45 sm:left-[32px]">
        <Chevron direction="left" />
      </div>
      <div className="pointer-events-none absolute right-[18px] top-1/2 -translate-y-1/2 text-white/45 sm:right-[32px]">
        <Chevron direction="right" />
      </div>

      <section
        className="mx-auto w-full max-w-[602px] rounded-[21px] bg-white px-8 py-8 text-center shadow-[0_2px_10px_rgba(0,0,0,0.14)] sm:px-12 sm:py-7"
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <h1 className="text-[31px] font-bold leading-none text-[#2f3c4e] sm:text-[33px]">Доступ запрещён</h1>
        <p className="mx-auto mt-5 max-w-[500px] text-[20px] leading-[1.5] text-[#4a5666] sm:text-[18px]">
          Доступ к информационному ресурсу ограничен на основании Федерального Закона от 27 июля 2006 года № 149-ФЗ «Об
          информации, информационных технологиях и о защите информации».
        </p>
      </section>
    </main>
  );
}

export default AccessRestricted;
