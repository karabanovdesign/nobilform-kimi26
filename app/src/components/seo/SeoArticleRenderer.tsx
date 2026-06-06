import { HelmetSeo } from "@/components/HelmetSeo";
import FaqSchema from "./FaqSchema";
import BreadcrumbSchema from "./BreadcrumbSchema";
import type { SeoArticleData } from "@/data/seo/types";

const WHATSAPP_NUMBER = "37360599907";
function openWhatsAppDirect(text: string) {
  const encodedText = encodeURIComponent(text);
  sessionStorage.setItem("nobilform_show_thankyou_after_return", "1");
  window.location.href = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodedText}`;
}

interface Props {
  data: SeoArticleData;
  breadcrumbItems: { name: string; url: string }[];
}

export default function SeoArticleRenderer({ data, breadcrumbItems }: Props) {
  const isRo = data.lang === "ro";

  const waText = data.ctaWhatsAppText
    ? encodeURIComponent(data.ctaWhatsAppText)
    : encodeURIComponent(
        isRo
          ? `Bună! Sunt interesat de ${data.h1}.\n\nAm citit articolul de pe site și am câteva întrebări.`
          : `Здравствуйте! Меня интересует ${data.h1}.\n\nПрочитал статью на сайте и есть вопросы.`
      );

  return (
    <>
      <HelmetSeo title={data.title} description={data.description} />
      <FaqSchema faq={data.faq} />
      <BreadcrumbSchema items={breadcrumbItems} />

      <article
        className="min-h-screen px-6 py-16 sm:px-8 lg:px-12"
        style={{ background: "#0d0d0d" }}
      >
        <div className="max-w-3xl mx-auto">
          {/* H1 */}
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-light mb-8 leading-tight tracking-wide"
            style={{
              color: "#f5f3ef",
              fontFamily: "'Playfair Display', serif",
              letterSpacing: "0.02em",
            }}
          >
            {data.h1}
          </h1>

          {/* Intro */}
          <div
            className="text-base sm:text-lg leading-relaxed mb-12 whitespace-pre-line"
            style={{ color: "rgba(245,243,239,0.7)" }}
          >
            {data.intro}
          </div>

          {/* Sections */}
          {data.sections.map((section, i) => (
            <section key={i} className="mb-12">
              <h2
                className="text-xl sm:text-2xl font-light mb-4"
                style={{
                  color: "#D6C1A3",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {section.h2}
              </h2>
              <div
                className="text-base leading-relaxed whitespace-pre-line"
                style={{ color: "rgba(245,243,239,0.65)" }}
                dangerouslySetInnerHTML={{
                  __html: section.text
                    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f5f3ef;">$1</strong>')
                    .replace(/\n/g, "<br/>"),
                }}
              />
            </section>
          ))}

          {/* Advantages */}
          {data.advantages && (
            <section className="mb-12 p-6 rounded-xl" style={{ background: "rgba(184,148,90,0.05)", border: "1px solid rgba(214,193,163,0.1)" }}>
              <h2
                className="text-xl font-light mb-4"
                style={{ color: "#D6C1A3", fontFamily: "'Playfair Display', serif" }}
              >
                {isRo ? "De ce NobilForm?" : "Почему NobilForm?"}
              </h2>
              <ul className="space-y-2">
                {data.advantages.map((adv, i) => (
                  <li key={i} className="flex items-start gap-2 text-base" style={{ color: "rgba(245,243,239,0.7)" }}>
                    <span style={{ color: "#b8945a" }}>—</span> {adv}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* AI Consultant Block */}
          {data.aiBlock && (
            <section className="mb-12 p-6 rounded-xl" style={{ background: "rgba(37,211,102,0.03)", border: "1px solid rgba(37,211,102,0.1)" }}>
              <h2
                className="text-xl font-light mb-4"
                style={{ color: "#25d366", fontFamily: "'Playfair Display', serif" }}
              >
                {isRo ? "Consilier AI NobilForm" : "AI-консультант NobilForm"}
              </h2>
              <p className="text-base leading-relaxed" style={{ color: "rgba(245,243,239,0.65)" }}>
                {data.aiBlock}
              </p>
            </section>
          )}

          {/* Portfolio Block — hidden until images are available */}
          {/*
          {data.portfolioImages && data.portfolioImages.length > 0 && (
            <section className="mb-12">
              <h2
                className="text-xl sm:text-2xl font-light mb-6"
                style={{ color: "#D6C1A3", fontFamily: "'Playfair Display', serif" }}
              >
                {isRo ? "Lucrări reale NobilForm" : "Реальные работы NobilForm"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.portfolioImages.map((img, i) => (
                  <div key={i} className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(214,193,163,0.1)" }}>
                    <img src={img.src} alt={img.alt} className="w-full h-48 object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </section>
          )}
          */}

          {/* FAQ */}
          <section className="mb-12">
            <h2
              className="text-xl sm:text-2xl font-light mb-6"
              style={{ color: "#D6C1A3", fontFamily: "'Playfair Display', serif" }}
            >
              {isRo ? "Întrebări frecvente" : "Часто задаваемые вопросы"}
            </h2>
            <div className="space-y-4">
              {data.faq.map((item, i) => (
                <details
                  key={i}
                  className="rounded-xl p-4 cursor-pointer"
                  style={{ background: "rgba(245,243,239,0.03)", border: "1px solid rgba(214,193,163,0.08)" }}
                >
                  <summary
                    className="text-base font-light list-none"
                    style={{ color: "#f5f3ef", fontFamily: "'Playfair Display', serif" }}
                  >
                    {item.q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(245,243,239,0.6)" }}>
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Related Materials */}
          {data.relatedMaterials.length > 0 && (
            <section className="mb-12">
              <h2
                className="text-xl font-light mb-4"
                style={{ color: "#D6C1A3", fontFamily: "'Playfair Display', serif" }}
              >
                {isRo ? "Materiale similare" : "Похожие материалы"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.relatedMaterials.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    className="text-sm px-4 py-2 rounded-full transition-all hover:scale-105"
                    style={{
                      background: "rgba(184,148,90,0.08)",
                      color: "#D6C1A3",
                      border: "1px solid rgba(214,193,163,0.15)",
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* CTAs */}
          <section className="flex flex-col sm:flex-row gap-4 mb-16">
            <button
              onClick={() => openWhatsAppDirect(data.ctaWhatsAppText || "")}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded text-sm font-medium tracking-[2px] uppercase transition-all hover:-translate-y-0.5 hover:scale-[1.02]"
              style={{ background: "#25d366", color: "#fff" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {isRo ? "Scrieți pe WhatsApp" : "Написать в WhatsApp"}
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-nobilform-chat"))}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded text-sm font-medium tracking-[2px] uppercase transition-all hover:-translate-y-0.5 hover:scale-[1.02]"
              style={{
                background: "rgba(184,148,90,0.1)",
                color: "#D6C1A3",
                border: "1px solid rgba(214,193,163,0.3)",
              }}
            >
              {isRo ? "Consultant AI" : "AI-консультант"}
            </button>
          </section>

          {/* Back to home */}
          <div className="text-center">
            <a
              href="/"
              className="text-sm transition-colors hover:text-[#D6C1A3]"
              style={{ color: "rgba(245,243,239,0.4)" }}
            >
              {isRo ? "← Înapoi la pagina principală" : "← Вернуться на главную"}
            </a>
          </div>
        </div>
      </article>
    </>
  );
}
