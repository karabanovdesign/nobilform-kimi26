import { useEffect } from "react";
import { HelmetSeo } from "@/components/HelmetSeo";

const WHATSAPP_NUMBER = "37360599907";
function openWhatsAppDirect(text: string) {
  const encodedText = encodeURIComponent(text);
  sessionStorage.setItem("nobilform_show_thankyou_after_return", "1");
  window.location.href = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodedText}`;
}

export default function SeoTvZonesPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", color: "#f5f3ef" }}>
      <HelmetSeo
        title="ТВ-зоны и медиа-стены на заказ в Кишиневе | NobilForm"
        description="ТВ-зоны, медиа-стены и стеновые панели на заказ в Кишиневе. Декоративные панели из дерева, камня, эксклюзивных материалов. LED-подсветка, интеграция техники."
        canonical="https://nobilform.md/tv-zony"
      />
      <div className="py-20 px-6 text-center" style={{ borderBottom: "1px solid rgba(184,148,90,0.1)" }}>
        <p className="text-xs font-normal tracking-[5px] uppercase mb-4" style={{ color: "#b8945a" }}>NobilForm / ТВ-зоны</p>
        <h1 className="font-light mb-6" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontFamily: "'Playfair Display', serif", color: "#f5f3ef" }}>
          ТВ-зоны и медиа-стены на заказ
        </h1>
        <p className="text-sm font-light max-w-[700px] mx-auto leading-relaxed" style={{ color: "rgba(245, 243, 239, 0.6)" }}>
          Проектирование и изготовление ТВ-зон, медиа-стен и декоративных панелей премиум-класса.
          Дерево, камень, металл, LED-подсветка. Интеграция аудио-видео техники и скрытый кабель-менеджмент.
        </p>
      </div>
      <div className="max-w-[800px] mx-auto px-6 py-16">
        {[
          { h2: "Декоративные стеновые панели", text: "3D панели из дерева, реечные перегородки, панели из камня и керамики. Создают акцентную стену в гостиной или спальне. LED-подсветка по контуру." },
          { h2: "ТВ-консоли и медиа-стены", text: "Консоли под телевизор, встроенные ниши для ТВ, медиа-стены с полками для декора и техники. Скрытый кабель-менеджмент — никаких видимых проводов." },
          { h2: "Материалы", text: "Натуральное дерево (дуб, орех, ясень), шпон, МДФ эмаль, HPL, камень, металл (латунь, медь, чёрный металл), стекло. Комбинации материалов для уникального эффекта." },
          { h2: "LED-подсветка", text: "Контурная подсветка панелей, подсветка полок, скрытая LED-лента за ТВ (эффект парения). Управление через приложение, диммеры, смена цвета." },
          { h2: "Процесс заказа", text: "Бесплатный замер → консультация дизайнера → 3D-визуализация → производство 15–25 дней → монтаж. Гарантия 3 года." },
        ].map((s, i) => (
          <div key={i} className="mb-10">
            <h2 className="text-xl font-medium mb-3" style={{ fontFamily: "'Playfair Display', serif", color: "#f5f3ef" }}>{s.h2}</h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(245, 243, 239, 0.6)" }}>{s.text}</p>
          </div>
        ))}
        <div className="flex flex-wrap gap-3 mt-8">
          {["Кухни на заказ","Гардеробные","Декоративные стены","FAQ"].map((l, i) => (
            <a key={i} href={[`/kuhni-na-zakaz","/garderobnye","/dekorativnye-steny","/faq`][i]} className="px-4 py-2 rounded text-xs tracking-[1px] uppercase transition-all hover:-translate-y-0.5" style={{ background: "rgba(184,148,90,0.08)", color: "#b8945a", border: "1px solid rgba(184,148,90,0.15)" }}>{l}</a>
          ))}
        </div>
      </div>
      <div className="text-center py-16 px-6" style={{ background: "rgba(184,148,90,0.05)", borderTop: "1px solid rgba(184,148,90,0.1)" }}>
        <h2 className="font-light mb-4" style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontFamily: "'Playfair Display', serif", color: "#f5f3ef" }}>Создайте уникальную ТВ-зону</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="tel:+37360599907" className="px-8 py-3 rounded text-sm font-medium tracking-[2px] uppercase" style={{ background: "#b8945a", color: "#0d0d0d" }}>Позвонить</a>
          <button onClick={() => openWhatsAppDirect("")} className="px-8 py-3 rounded text-sm font-medium tracking-[2px] uppercase" style={{ background: "transparent", color: "#f5f3ef", border: "1px solid rgba(184,148,90,0.4)", cursor: "pointer" }}>WhatsApp</button>
        </div>
      </div>
    </div>
  );
}
