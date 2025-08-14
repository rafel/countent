import Image from "next/image";
import Link from "next/link";
import { Navigation } from "./components/navigation";
import { Footer } from "./components/footer";

export default function Home() {
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
            <h1 className="text-[8rem] font-semibold leading-none -tracking-4 text-balance !text-[clamp(3.625rem,_1.6250rem_+_8.3333vw,_128px)] !leading-[0.95]">
              The AI
              <br className="md:hidden" /> Code Editor
            </h1>
            <div className="relative z-50 mb-6 px-4 md:mb-4 md:px-0">
              <p className="[&_b]:md:font-semibold [&_strong]:md:font-semibold text-base/[1.25rem] md:text-1.5xl/[1.6875rem] !text-balance [&>br]:hidden sm:[&>br]:inline">
                Built to make you extraordinarily productive, Cursor is the best
                way to code with AI.
              </p>
            </div>
            <div className="absolute bottom-0 left-0 z-50 mx-auto mb-4 flex w-full flex-col justify-center gap-2 px-5 md:static md:flex-row md:gap-4">
              <button className="group relative rounded-xl p-1 -outline-offset-2 border border-white/30 flex flex-col disabled:opacity-50">
                <div className="glowing pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity safari:!hidden style_glowingEffect__yGXeX style_glowActive__3pVbh style_white__xx63m">
                  <div className="style_glow__i4Qpo"></div>
                </div>
                <div className="pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity safari:!block border-white"></div>
                <div className="glowing pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity safari:!hidden style_glowingEffect__yGXeX style_withBlur__zKSVR style_white__xx63m">
                  <div className="style_glow__i4Qpo"></div>
                </div>
                <div className="glowing pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity safari:!hidden style_glowingEffect__yGXeX style_glowActive__3pVbh style_white__xx63m">
                  <div className="style_glow__i4Qpo"></div>
                </div>
                <div className="pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity safari:!block border-white"></div>
                <div className="glowing pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity safari:!hidden style_glowingEffect__yGXeX style_white__xx63m">
                  <div className="style_glow__i4Qpo"></div>
                </div>
                <span className="relative inline-flex w-full flex-1 items-center justify-center gap-4.5 whitespace-nowrap rounded-lg shadow-[0px_4px_10px_rgba(0,0,0,0.35)] transition-colors motion-reduce:transition-none md:gap-6 px-3.5 py-[15px] text-sm/[1rem] font-medium md:px-4 md:py-4.5 md:text-base/[1.3125rem] bg-black text-white dark:bg-white dark:text-black">
                  <span className="flex items-center gap-3 md:gap-3.5">
                    <svg
                      className="size-4.5 md:size-6"
                      fill="none"
                      viewBox="0 0 14 18"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M6.89079 4.60575c.03311.01656.0596.05629.09933.05629.03642 0 .0927-.01324.09601-.04966.00663-.04636-.0629-.07615-.10594-.09602-.05629-.02318-.12913-.03311-.1821-.00331-.01324.00662-.02649.02318-.01987.03642.00994.04304.07615.03642.11257.05628Zm-.72508.05629c.03973 0 .06622-.03973.09933-.05629.03642-.01986.10263-.01324.11588-.05297.00662-.01324-.00662-.0298-.01987-.03642-.05297-.0298-.12581-.01986-.18209.00331-.04305.01987-.11257.04966-.10595.09602.00331.03311.05959.04966.0927.04635Zm7.32039 9.23076c-.1192-.1325-.1755-.3841-.2384-.6523-.0596-.2682-.1292-.5562-.3477-.7416-.043-.0364-.0861-.0696-.1324-.096-.043-.0265-.0894-.0497-.1358-.0663.3046-.9038.1855-1.8044-.1225-2.61886-.3774-.99657-1.0363-1.86733-1.5395-2.46329-.5662-.71184-1.11578-1.38725-1.10584-2.38383.01655-1.51969.16884-4.34386-2.50964-4.34717-3.39034-.00662-2.54276 3.42344-2.57918 4.4763-.05628.77474-.21189 1.38394-.74494 2.14213-.62576.74495-1.50645 1.9468-1.92362 3.20162-.19865.5926-.29136 1.1952-.20527 1.7647-.21521.192-.37744.4867-.54961.6688-.13905.1424-.34102.1953-.56285.2748-.22183.0795-.46352.1986-.6125.4801-.06954.1291-.09271.2681-.09271.4105 0 .1291.01986.2616.03973.3907.03973.2682.08277.5198.02648.6887-.17216.4767-.19534.8078-.07283 1.0495.1258.2417.37743.3476.66548.4072.57278.1192 1.35084.0894 1.96335.4139.65555.3443 1.32104.4668 1.85078.3443.38406-.086.69859-.3178.85751-.6688.41386-.0033.87076-.1787 1.59916-.2185.49332-.0397 1.11245.1755 1.82429.1358.01986.0761.04635.1523.08277.2218v.0033c.2748.5529.78799.8045 1.33424.7615.5496-.043 1.129-.3642 1.5992-.9237.4503-.543 1.1919-.7681 1.6852-1.0661.245-.149.4437-.3344.4602-.6059.0133-.2715-.1456-.5728-.5131-.9833ZM6.98681 3.41384c.32446-.73501 1.13232-.72177 1.45678-.01324.21521.47014.11919 1.02306-.14237 1.33759-.05297-.02649-.19534-.08608-.41716-.16223.03641-.03973.10263-.0894.12912-.1523.15892-.39069-.00662-.89394-.30129-.90387-.24169-.01656-.46021.35757-.39068.7615-.13575-.06622-.31123-.11588-.43042-.14568-.03311-.22845-.00993-.48339.09602-.72177Zm-1.34753-.38075c.3344 0 .68866.47014.63238 1.10914-.11588.03311-.23507.08277-.33771.1523.03973-.29467-.10926-.66548-.31784-.64893-.27812.02318-.32447.70191-.0596.93036.03311.02648.06291-.00663-.19534.18209-.5165-.48338-.34764-1.72496.27811-1.72496ZM5.189 5.04279c.20528-.1523.45028-.33109.46684-.34764.15561-.14568.44696-.47015.92373-.47015.23507 0 .5165.07615.85752.29467.20858.13575.37413.14568.74825.30791.27812.11588.45359.32116.34765.60258-.08609.23507-.3642.47677-.75157.59927-.36751.11919-.65556.52974-1.26476.49332-.12912-.00662-.23176-.03311-.31784-.06953-.26487-.11588-.40393-.34433-.66217-.49663-.28474-.15892-.43704-.34433-.4867-.50656-.04635-.16224 0-.29798.13905-.40724Zm.10926 11.05831c-.08939 1.1621-1.45347 1.1389-2.49308.596-.98996-.5232-2.27126-.2152-2.53282-.7251-.07946-.1556-.07946-.4205.08608-.8741v-.0066c.07946-.2516.01987-.5298-.01986-.7913-.03974-.2583-.0596-.4966.0298-.6622.11587-.2218.28142-.3013.49-.3741.34102-.1225.39068-.1126.64893-.3278.1821-.1887.31454-.4271.47346-.5959.16885-.1821.33109-.2682.58602-.2285.26818.0397.49994.2251.72508.5297l.64893 1.1787c.31454.6589 1.42699 1.6025 1.35746 2.2812Zm-.04635-.8575c-.13575-.2185-.31784-.4503-.47677-.6489.23508 0 .47015-.0729.55292-.2947.07615-.2053 0-.4933-.245-.8244-.44697-.6026-1.26807-1.0761-1.26807-1.0761-.44697-.2781-.69859-.6191-.81447-.9899-.11588-.3708-.09933-.7714-.00994-1.1654.17217-.75822.61583-1.49654.90056-1.96007.07615-.05628.02649.10595-.28804.68867-.28143.53305-.80786 1.7647-.08609 2.7282.01987-.6854.1821-1.384.4569-2.03623.39731-.90718 1.23496-2.47985 1.30118-3.73136.03642.02649.1523.10595.20527.13575.1523.08939.26818.22183.41717.34102.41055.33109.9436.3046 1.40381.03973.20528-.11588.37082-.24832.52643-.29798.32778-.10264.58934-.28473.73832-.49663.25494 1.00651.8509 2.45998 1.23165 3.16851.20196.37744.60586 1.17536.78136 2.13879.1093-.0033.2318.0133.3609.0464.4569-1.182-.3874-2.45668-.7714-2.81095-.1557-.1523-.1623-.21852-.0861-.21521.4171.37082.9667 1.11577 1.1654 1.95342.0927.38404.1093.78464.0132 1.18194.543.2252 1.1886.5927 1.0165 1.1522-.0729-.0033-.106 0-.1391 0 .106-.3344-.1291-.5827-.7549-.8641-.6489-.2847-1.1919-.2847-1.268.4138-.40063.1391-.60591.4867-.70854.9039-.09271.3708-.11919.8178-.14568 1.3211-.01656.2549-.11919.5959-.22514.9601-1.06279.7582-2.53944 1.0893-3.78433.2384Zm8.52219-.3808c-.0298.5563-1.3641.6589-2.0925 1.5396-.437.5198-.9734.8078-1.4435.8443-.47016.0364-.8774-.159-1.11578-.639-.15561-.3675-.07946-.7648.03642-1.2019.1225-.4701.3046-.9535.32778-1.3442.02649-.5032.05628-.9436.13905-1.2813.08609-.341.21852-.5695.45363-.6986.0099-.0066.0231-.0099.0331-.0165.0265.437.2417.8806.6224.9767.4172.1092 1.0165-.2484 1.2714-.5397.298-.0099.5198-.0298.7482.1688.3278.2815.2351 1.0032.5662 1.3774.351.384.4635.6456.4536.8144ZM5.31813 5.44672c.06622.0629.15561.14899.26487.23507.21852.17216.52312.35095.90387.35095.38406 0 .74494-.19534 1.05285-.35757.16224-.08609.36089-.23177.49001-.34433.12913-.11257.19534-.20859.10264-.21852-.0927-.00993-.08608.08608-.19865.16885-.14568.10595-.32116.24501-.46021.32447-.24501.13905-.64562.33771-.98995.33771-.34434 0-.61914-.15893-.82441-.32116-.10264-.08277-.18872-.16554-.25494-.22845-.04966-.04635-.06291-.1523-.14237-.16223-.04635-.00331-.05959.1225.05629.21521Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                    <span>Download for Linux</span>
                  </span>
                </span>
              </button>
              <a
                className="group relative rounded-xl p-1 -outline-offset-2 border border-white/30 flex flex-col disabled:opacity-50"
                href="/downloads"
              >
                <div className="glowing pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity safari:!hidden style_glowingEffect__yGXeX style_glowActive__3pVbh style_white__xx63m">
                  <div className="style_glow__i4Qpo"></div>
                </div>
                <div className="pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity safari:!block border-white"></div>
                <div className="glowing pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity safari:!hidden style_glowingEffect__yGXeX style_withBlur__zKSVR style_white__xx63m">
                  <div className="style_glow__i4Qpo"></div>
                </div>
                <div className="glowing pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity safari:!hidden style_glowingEffect__yGXeX style_glowActive__3pVbh style_white__xx63m">
                  <div className="style_glow__i4Qpo"></div>
                </div>
                <div className="pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity safari:!block border-white"></div>
                <div className="glowing pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity safari:!hidden style_glowingEffect__yGXeX style_white__xx63m">
                  <div className="style_glow__i4Qpo"></div>
                </div>
                <span className="relative inline-flex w-full flex-1 items-center justify-center gap-4.5 whitespace-nowrap rounded-lg shadow-[0px_4px_10px_rgba(0,0,0,0.35)] transition-colors motion-reduce:transition-none md:gap-6 px-3.5 py-[15px] text-sm/[1rem] font-medium md:px-4 md:py-4.5 md:text-base/[1.3125rem] bg-white text-brand-light-black dark:bg-black dark:text-white">
                  <span className="max-h-[21px]">All Downloads</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
