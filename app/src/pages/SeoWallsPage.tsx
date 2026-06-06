import { useEffect } from "react";
import { HelmetSeo } from "@/components/HelmetSeo";
import { openWhatsAppDirect } from "@/lib/whatsapp";

export default function SeoWallsPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", color: "#f5f3ef" }}>
      <HelmetSeo
        title="Декоративные стены и панели на заказ в Кишиневе | NobilForm"
        description="Декоративные стеновые панели на заказ в Кишиневе. 3D панели, реечные перегородки, панели из дерева, камня, металла. LED-подсветка. Бесплатный замер."
        canonical="https://nobilform.md/dekorativnye-steny"
      />
      <div className="py-20 px-6 text-center" style={{ borderBottom: "1px solid rgba(184,148,90,0.1)" }}>
        <p className="text-xs font-normal tracking-[5px] uppercase mb-4" style={{ color: "#b8945a" }}>NobilForm / Декоративные стены</p>
        <h1 className="font-light mb-6" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontFamily: "'Playfair Display', serif", color: "#f5f3ef" }}>
          Декоративные стены и панели на заказ
        </h1>
        <p className="text-sm font-light max-w-[700px] mx-auto leading-relaxed" style={{ color: "rgba(245, 243, 239, 0.6)" }}>
          Декоративные стеновые панели премиум-класса для интерьеров в Кишиневе.
          3D панели, реечные перегородки, панели из дерева, камня, металла.
          Акцентные стены с LED-подсветкой для гостиных, спален, офисов и ресторанов.
        </p>
      </div>
      <div className="max-w-[800px] mx-auto px-6 py-16">
        {[
          { h2: "3D панели из дерева", text: "Объёмные панели из натурального дерева с геометрическими узорами. Шестиугольники, ромбы, волны, линейные паттерны. Каждая панель уникальна благодаря природному рисунку дерева." },
          { h2: "Реечные перегородки", text: "Тонкие деревянные рейки, установленные вертикально или горизонтально. Создают эффект жалюзи, пропускают свет, зонируют пространство. Идеальны для кухонь-гостиных и офисов." },
          { h2: "Панели из камня и керамики", text: "Натуральный камень (мрамор, травертин, сланец) и крупноформатная керамика. Премиальный вид, долговечность, уникальная текстура." },
          { h2: "Металлические панели", text: "Латунь, медь, чёрный металл с патиной. Индустриальный шик, контраст с деревом и камнем. Идеальны для лофтов и современных интерьеров." },
          { h2: "LED-подсветка панелей", text: "Контурная подсветка, скрытая LED-лента за панелями, точечные светильники. Создаёт атмосферу, акцентирует текстуру материала. Управление через приложение." },
          { h2: "Где использовать декоративные панели", text: "Гостиные (акцентная стена за диваном), спальни (изголовье кровати), прихожие (стена у входа), рестораны и отели (фирменный интерьер), офисы (зона ресепшн, переговорные)." },
        ].map((s, i) => (
          <div key={i} className="mb-10">
            <h2 className="text-xl font-medium mb-3" style={{ fontFamily: "'Playfair Display', serif", color: "#f5f3ef" }}>{s.h2}</h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(245, 243, 239, 0.6)" }}>{s.text}</p>
          </div>
        ))}
        <div className="flex flex-wrap gap-3 mt-8">
          {["Кухни на заказ","ТВ-зоны","Гардеробные","FAQ"].map((l, i) => (
            <a key={i} href={[`/kuhni-na-zakaz","/tv-zony","/garderobnye","/faq`][i]} className="px-4 py-2 rounded text-xs tracking-[1px] uppercase transition-all hover:-translate-y-0.5" style={{ background: "rgba(184,148,90,0.08)", color: "#b8945a", border: "1px solid rgba(184,148,90,0.15)" }}>{l}</a>
          ))}
        </div>
      </div>
      <div className="text-center py-16 px-6" style={{ background: "rgba(184,148,90,0.05)", borderTop: "1px solid rgba(184,148,90,0.1)" }}>
        <h2 className="font-light mb-4" style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontFamily: "'Playfair Display', serif", color: "#f5f3ef" }}>Создайте акцентную стену</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="tel:+37360599907" className="px-8 py-3 rounded text-sm font-medium tracking-[2px] uppercase" style={{ background: "#b8945a", color: "#0d0d0d" }}>Позвонить</a>
          <button onClick={() => openWhatsAppDirect("")} className="px-8 py-3 rounded text-sm font-medium tracking-[2px] uppercase" style={{ background: "transparent", color: "#f5f3ef", border: "1px solid rgba(184,148,90,0.4)", cursor: "pointer" }}>WhatsApp</button>
        </div>
      </div>
    </div>
  );
}
