export default function Stats() {
  return (
    <section
      id="collection"
      className="flex flex-wrap justify-center gap-12 sm:gap-24 py-16 px-6"
      style={{
        background: "rgba(26, 26, 26, 0.5)",
        borderTop: "1px solid rgba(184, 148, 90, 0.1)",
        borderBottom: "1px solid rgba(184, 148, 90, 0.1)",
      }}
    >
      {[
        { number: "14+", label: "Уникальных стилей" },
        { number: "28+", label: "Визуализаций" },
        { number: "5", label: "Рубрик" },
      ].map((stat) => (
        <div key={stat.label} className="text-center">
          <div
            className="text-4xl sm:text-5xl font-light leading-none"
            style={{
              color: "#b8945a",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {stat.number}
          </div>
          <div
            className="text-xs font-normal tracking-[3px] uppercase mt-2"
            style={{ color: "rgba(245, 243, 239, 0.5)" }}
          >
            {stat.label}
          </div>
        </div>
      ))}
    </section>
  );
}
