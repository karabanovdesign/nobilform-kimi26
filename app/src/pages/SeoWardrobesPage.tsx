import { useEffect } from "react";
import { HelmetSeo } from "@/components/HelmetSeo";
import { openWhatsAppDirect } from "@/lib/whatsapp";

export default function SeoWardrobesPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", color: "#f5f3ef" }}>
      <HelmetSeo
        title="Гардеробные на заказ в Кишиневе | NobilForm — премиум гардеробные системы"
        description="Индивидуальные гардеробные на заказ в Кишиневе. Встроенные и отдельностоящие, с островами и витринами. Бесплатный замер, 3D-проект. От 9500 MDL/м."
        canonical="https://nobilform.md/garderobnye"
      />
      <div className="py-20 px-6 text-center" style={{ borderBottom: "1px solid rgba(184,148,90,0.1)" }}>
        <p className="text-xs font-normal tracking-[5px] uppercase mb-4" style={{ color: "#b8945a" }}>NobilForm / Гардеробные</p>
        <h1 className="font-light mb-6" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontFamily: "'Playfair Display', serif", color: "#f5f3ef" }}>
          Гардеробные на заказ в Кишиневе
        </h1>
        <p className="text-sm font-light max-w-[700px] mx-auto leading-relaxed" style={{ color: "rgba(245, 243, 239, 0.6)" }}>
          Проектирование и изготовление индивидуальных гардеробных систем премиум-класса. 
          Встроенные гардеробные, отдельностоящие шкафы, гардеробные с островами и витринами. 
          Более 80 реализованных проектов в Кишиневе и Молдове.
        </p>
      </div>
      <div className="max-w-[800px] mx-auto px-6 py-16">
        {[
          { h2: "Встроенные гардеробные", text: "Гардеробная в нише или отдельном помещении — шкафы от пола до потолка, максимальное использование пространства. Зеркальные двери, LED-подсветка, выдвижные системы." },
          { h2: "Гардеробные с островом", text: "Просторные гардеробные с центральным островом для хранения аксессуаров, украшений и часов. Витрины со стеклянными фасадами и подсветкой." },
          { h2: "Материалы для гардеробных", text: "ДСП EGGER, МДФ эмаль, шпон натуральный, зеркало, стекло. Фурнитура Blum: выдвижные штанги для брюк, галстучницы, обувницы, корзины." },
          { h2: "Наполнение гардеробной", text: "Штанги для платьев и рубашек (высота 150 см), штанги для брюк (высота 80 см), полки для свитеров (высота 35 см), выдвижные корзины для обуви, ящики для белья, встроенные гладильные доски, зеркала с подсветкой." },
          { h2: "Процесс заказа", text: "1. Бесплатный замер (2. Консультация дизайнера (3. 3D-визуализация (4. Производство 20–35 дней (5. Монтаж 1 день. Гарантия 3 года." },
        ].map((s, i) => (
          <div key={i} className="mb-10">
            <h2 className="text-xl font-medium mb-3" style={{ fontFamily: "'Playfair Display', serif", color: "#f5f3ef" }}>{s.h2}</h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(245, 243, 239, 0.6)" }}>{s.text}</p>
          </div>
        ))}
        <div className="flex flex-wrap gap-3 mt-8">
          {["Кухни на заказ","Шкафы-купе","ТВ-зоны","FAQ"].map((l, i) => (
            <a key={i} href={[`/kuhni-na-zakaz","/shkafy-kupe","/tv-zony","/faq`][i]} className="px-4 py-2 rounded text-xs tracking-[1px] uppercase transition-all hover:-translate-y-0.5" style={{ background: "rgba(184,148,90,0.08)", color: "#b8945a", border: "1px solid rgba(184,148,90,0.15)" }}>{l}</a>
          ))}
        </div>
      </div>
      <div className="text-center py-16 px-6" style={{ background: "rgba(184,148,90,0.05)", borderTop: "1px solid rgba(184,148,90,0.1)" }}>
        <h2 className="font-light mb-4" style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontFamily: "'Playfair Display', serif", color: "#f5f3ef" }}>Закажите гардеробную мечты</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="tel:+37360599907" className="px-8 py-3 rounded text-sm font-medium tracking-[2px] uppercase transition-all hover:-translate-y-0.5" style={{ background: "#b8945a", color: "#0d0d0d" }}>Позвонить</a>
          <button onClick={() => openWhatsAppDirect("")} className="px-8 py-3 rounded text-sm font-medium tracking-[2px] uppercase transition-all hover:-translate-y-0.5" style={{ background: "transparent", color: "#f5f3ef", border: "1px solid rgba(184,148,90,0.4)", cursor: "pointer" }}>WhatsApp</button>
        </div>
      </div>
    </div>
  );
}
