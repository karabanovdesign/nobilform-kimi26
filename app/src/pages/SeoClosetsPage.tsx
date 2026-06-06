import { useEffect } from "react";
import { HelmetSeo } from "@/components/HelmetSeo";

const WHATSAPP_NUMBER = "37360599907";
function openWhatsAppDirect(text: string) {
  const encodedText = encodeURIComponent(text);
  sessionStorage.setItem("nobilform_show_thankyou_after_return", "1");
  window.location.href = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodedText}`;
}

export default function SeoClosetsPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", color: "#f5f3ef" }}>
      <HelmetSeo
        title="Шкафы-купе на заказ в Кишиневе | NobilForm — встроенные шкафы премиум"
        description="Шкафы-купе и встроенные шкафы на заказ в Кишиневе. Зеркальные, стеклянные, МДФ фасады. Системы TopLine, InLine, Raumplus. Бесплатный замер. От 800 €."
        canonical="https://nobilform.md/shkafy-kupe"
      />
      <div className="py-20 px-6 text-center" style={{ borderBottom: "1px solid rgba(184,148,90,0.1)" }}>
        <p className="text-xs font-normal tracking-[5px] uppercase mb-4" style={{ color: "#b8945a" }}>NobilForm / Шкафы</p>
        <h1 className="font-light mb-6" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontFamily: "'Playfair Display', serif", color: "#f5f3ef" }}>
          Шкафы-купе и встроенные шкафы на заказ
        </h1>
        <p className="text-sm font-light max-w-[700px] mx-auto leading-relaxed" style={{ color: "rgba(245, 243, 239, 0.6)" }}>
          Изготовление шкафов-купе и встроенных шкафов премиум-класса в Кишиневе. 
          Зеркальные, стеклянные, МДФ фасады. Системы раздвижных дверей TopLine, InLine, Raumplus. 
          Бесплатный замер, 3D-проект, гарантия 3 года.
        </p>
      </div>
      <div className="max-w-[800px] mx-auto px-6 py-16">
        {[
          { h2: "Шкафы-купе с раздвижными дверями", text: "Классические шкафы-купе с системами TopLine и InLine от Hettich. Верхнеопорная и встроенная направляющие, плавный ход, грузоподъёмность до 60 кг. Зеркальные, стеклянные, ДСП и МДФ фасады." },
          { h2: "Встроенные шкафы", text: "Шкафы в нише от пола до потолка — максимальное использование пространства. Распашные двери с доводчиками Blum, встроенная LED-подсветка, выдвижные ящики Legrabox." },
          { h2: "Материалы фасадов", text: "Зеркало (серебро, бронза, графит) — визуально увеличивает пространство. Стекло (лакобель, тонированное, матовое). ЛДСП EGGER — 100+ декоров. МДФ эмаль — любой цвет. Комбинированные фасады с фотопечатью." },
          { h2: "Наполнение шкафов", text: "Штанги для одежды, полки для обуви и сумок, выдвижные ящики, галстучницы, брючницы, корзины для белья, встроенные гладильные доски, LED-подсветка полок." },
          { h2: "Процесс заказа", text: "Бесплатный замер → 3D-визуализация → согласование → производство 20–30 дней → монтаж. Гарантия 3 года." },
        ].map((s, i) => (
          <div key={i} className="mb-10">
            <h2 className="text-xl font-medium mb-3" style={{ fontFamily: "'Playfair Display', serif", color: "#f5f3ef" }}>{s.h2}</h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(245, 243, 239, 0.6)" }}>{s.text}</p>
          </div>
        ))}
        <div className="flex flex-wrap gap-3 mt-8">
          {["Кухни на заказ","Гардеробные","ТВ-зоны","FAQ"].map((l, i) => (
            <a key={i} href={[`/kuhni-na-zakaz","/garderobnye","/tv-zony","/faq`][i]} className="px-4 py-2 rounded text-xs tracking-[1px] uppercase transition-all hover:-translate-y-0.5" style={{ background: "rgba(184,148,90,0.08)", color: "#b8945a", border: "1px solid rgba(184,148,90,0.15)" }}>{l}</a>
          ))}
        </div>
      </div>
      <div className="text-center py-16 px-6" style={{ background: "rgba(184,148,90,0.05)", borderTop: "1px solid rgba(184,148,90,0.1)" }}>
        <h2 className="font-light mb-4" style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontFamily: "'Playfair Display', serif", color: "#f5f3ef" }}>Закажите шкаф-купе</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="tel:+37360599907" className="px-8 py-3 rounded text-sm font-medium tracking-[2px] uppercase" style={{ background: "#b8945a", color: "#0d0d0d" }}>Позвонить</a>
          <button onClick={() => openWhatsAppDirect("")} className="px-8 py-3 rounded text-sm font-medium tracking-[2px] uppercase" style={{ background: "transparent", color: "#f5f3ef", border: "1px solid rgba(184,148,90,0.4)", cursor: "pointer" }}>WhatsApp</button>
        </div>
      </div>
    </div>
  );
}
