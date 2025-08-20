"use client";
import { Navigation } from "./components/navigation";
import { Footer } from "./components/footer";
import { useLanguage } from "@/hooks/use-language";
import { ArrowUp } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import Typed from "typed.js";
import { useRouter } from "next/navigation";

export default function Home() {
  const { ttt } = useLanguage();
  const router = useRouter();
  const placeholderRef = useRef<HTMLSpanElement>(null);
  const typedRef = useRef<Typed | null>(null);

  useEffect(() => {
    if (placeholderRef.current) {
      const startText = `${ttt("Ask Countant")}:`;
      const placeholderTexts = [
        `${startText} ${ttt("How much tax will I have to pay this year?")}`,
        `${startText} ${ttt("How much VAT will I have to pay this year?")}`,
        `${startText} ${ttt("How do I optimize my company's tax situation?")}`,
        `${startText} ${ttt("What expenses can I deduct this quarter?")}`,
        `${startText} ${ttt("When is my next VAT filing deadline?")}`,
        `${startText} ${ttt("Are my company ready for balancing of books?")}`,
        `${startText} ${ttt(
          "How will a company car affact my salary and tax?"
        )}`,
      ];

      typedRef.current = new Typed(placeholderRef.current, {
        strings: placeholderTexts,
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 1000,
        startDelay: 0,
        loop: true,
        showCursor: false,
        smartBackspace: true,
      });
    }

    return () => {
      if (typedRef.current) {
        typedRef.current.destroy();
      }
    };
  }, [ttt]);

  const handleFocus = () => {
    if (typedRef.current) {
      typedRef.current.stop();
      if (placeholderRef.current) {
        placeholderRef.current.style.opacity = "0";
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (!e.target.value && typedRef.current && placeholderRef.current) {
      placeholderRef.current.style.opacity = "1";
      typedRef.current.start();
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <section className="container-full min-h-[40rem] md:h-svh md:max-h-[min(50rem,250vw)] md:min-h-[50rem] px-4 pb-4 pt-[calc(var(--navbar-height)+32px)] text-brand-white dark:text-brand-black md:px-6 md:pb-6 lg:pt-[calc(var(--navbar-height)+48px)] mb-18 md:mb-28">
        <div className="relative flex flex-col justify-start mx-auto gap-4 pt-12 h-full max-w-[1600px] overflow-hidden rounded-2xl text-center md:justify-between md:gap-6 md:px-10 md:pt-24">
          <Image
            className="absolute left-0 top-0 h-full w-full object-cover"
            src="/img/bg3.jpg"
            alt="Countent Hero Background"
            width={1808}
            height={1016}
            quality={100}
          />
          <div className="pointer-events-none absolute inset-0 bg-[url('/img/noise.webp')] mix-blend-soft-light" />
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
          {/*<div className="z-10 flex w-full max-w-[1180px] flex-1 items-end px-2 relative mx-auto md:px-0">
            <div className="w-full overflow-hidden rounded-md">
              <img src="https://cursor.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flanding-small-dark.cropped.1eebf8a3.webp&w=3840&q=100&dpl=dpl_JBSMfNm5mSG2FiU5ECRJHsmLGhM1" />
            </div>
          </div>*/}

          <div className="w-full max-w-3xl mx-auto relative z-50 px-4">
            <div className="flex flex-col items-center">
              <div className="w-full">
                <form className="group flex flex-col gap-2 p-3 w-full rounded-lg border border-muted-foreground/20 bg-background/90 backdrop-blur-sm text-base shadow-xl transition-all duration-150 ease-in-out focus-within:border-foreground/30 hover:border-foreground/20 focus-within:hover:border-foreground/30">
                  <div className="relative flex flex-1 items-center">
                    <textarea
                      onClick={() => router.push("/d")}
                      className="flex w-full rounded-md px-3 py-3 bg-transparent border-0 resize-none text-[16px] leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-base max-h-[200px] min-h-[80px]"
                      id="chatinput"
                      maxLength={50000}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                    <span
                      ref={placeholderRef}
                      className="absolute left-3 top-3 text-[16px] leading-relaxed text-muted-foreground pointer-events-none transition-opacity duration-200 md:text-base"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => router.push("/d")}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary hover:bg-primary/90 transition-all duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50 group-focus-within:scale-105"
                    >
                      <ArrowUp className="h-5 w-5 text-primary-foreground" />
                    </button>
                  </div>
                </form>
              </div>
              <div className="h-10"></div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
