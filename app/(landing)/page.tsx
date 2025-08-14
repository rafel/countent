"use client";
import { Navigation } from "./components/navigation";
import { Footer } from "./components/footer";
import { useLanguage } from "@/hooks/uselanguage";

export default function Home() {
  const { ttt } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <section className="container-full min-h-[40rem] md:h-svh md:max-h-[min(80rem,300vw)] md:min-h-[48rem] px-4 pb-4 pt-[calc(var(--navbar-height)+32px)] text-brand-white dark:text-brand-black md:px-6 md:pb-6 lg:pt-[calc(var(--navbar-height)+48px)] mb-18 md:mb-28">
        <div className="relative flex flex-col justify-start mx-auto gap-4 pt-12 h-full max-w-[1808px] overflow-hidden rounded-2xl text-center md:justify-between md:gap-6 md:px-10 md:pt-24">
          <img
            className="absolute left-0 top-0 h-full w-full object-cover"
            src="https://cursor.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgradient-hero-prerender.3af0e196.webp&w=2880&q=75&dpl=dpl_2XJpmggiP6JBW8wk3EeXcjZAFkYQ"
            alt="Countent Hero Background"
          />
          <div className="relative z-50 px-4 md:px-6">
            <h1 className="text-[8rem] font-semibold leading-none -tracking-4 text-balance !text-[clamp(3.625rem,_1.6250rem_+_8.3333vw,_128px)] !leading-[0.95] mb-10 text-white">
              {ttt("ServiceSlogan")}
            </h1>
            <div className="relative z-50 mb-6 px-4 md:mb-4 md:px-0">
              <p className="[&_b]:md:font-semibold [&_strong]:md:font-semibold text-base/[1.25rem] md:text-1.5xl/[1.6875rem] mb-10 text-white">
                {ttt("ServiceDescription")}
              </p>
            </div>
          </div>
          <div className="z-10 flex w-full max-w-[1180px] flex-1 items-end px-2 relative mx-auto md:px-0">
            <div className="w-full overflow-hidden rounded-md">
              <img src="https://cursor.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flanding-small-dark.cropped.1eebf8a3.webp&w=3840&q=100&dpl=dpl_JBSMfNm5mSG2FiU5ECRJHsmLGhM1" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
