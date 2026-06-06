import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router";
import { LangProvider } from "@/providers/LangProvider";
import Home from "./pages/Home";
import SeoFaqPage from "./pages/SeoFaqPage";
import SeoKitchensPage from "./pages/SeoKitchensPage";
import SeoWardrobesPage from "./pages/SeoWardrobesPage";
import SeoClosetsPage from "./pages/SeoClosetsPage";
import SeoTvZonesPage from "./pages/SeoTvZonesPage";
import SeoWallsPage from "./pages/SeoWallsPage";
import SeoBlogPage from "./pages/SeoBlogPage";
import ThankYouPage from "./pages/ThankYouPage";
import SeoArticlePage from "./pages/SeoArticlePage";

// SEO article data (new pages)
import sovremennyeKuhni from "./data/seo/ru/sovremennye-kuhni";
import kuhniBezRuchek from "./data/seo/ru/kuhni-bez-ruchek";
import kuhniMdf from "./data/seo/ru/kuhni-mdf";
import kuhniAgt from "./data/seo/ru/kuhni-agt";
import kuhniEgger from "./data/seo/ru/kuhni-egger";
import kuhniFenix from "./data/seo/ru/kuhni-fenix";
import vstroennyeShkafy from "./data/seo/ru/vstroennye-shkafy";
import mebelNaZakaz from "./data/seo/ru/mebel-na-zakaz";
import stoimostKuhni from "./data/seo/ru/stoimost-kuhni";
import agtVsEgger from "./data/seo/ru/agt-vs-egger";
import mdfVsDsp from "./data/seo/ru/mdf-vs-dsp";
import srokIzgotovleniya from "./data/seo/ru/srok-izgotovleniya";
import bucatariiLaComanda from "./data/seo/ro/bucatarii-la-comanda";
import mobilaLaComanda from "./data/seo/ro/mobila-la-comanda";

import Navigation from "./sections/Navigation";
import ChatWidget from "./components/chat/ChatWidget";
import Preloader from "./components/Preloader";
import type { Lang } from "@/lib/i18n";

function AppContent() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const location = useLocation();
  const pathLang = location.pathname.replace(/\/$/, "").split("/").pop() as Lang;
  const initialLang: Lang = pathLang === "ro" ? "ro" : "ru";

  return (
    <LangProvider initialLang={initialLang}>
      {!preloaderDone && <Preloader onComplete={() => setPreloaderDone(true)} />}
      <div style={{ opacity: preloaderDone ? 1 : 0, transition: "opacity 0.8s ease-out" }}>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ru" element={<Home />} />
          <Route path="/ro" element={<Home />} />
          <Route path="/faq" element={<SeoFaqPage />} />
          <Route path="/blog" element={<SeoBlogPage />} />
          <Route path="/kuhni-na-zakaz" element={<SeoKitchensPage />} />
          <Route path="/uglovye-kuhni" element={<SeoKitchensPage variant="uglovye" />} />
          <Route path="/pryamye-kuhni" element={<SeoKitchensPage variant="pryamye" />} />
          <Route path="/kuhni-s-ostrovom" element={<SeoKitchensPage variant="ostrov" />} />
          <Route path="/garderobnye" element={<SeoWardrobesPage />} />
          <Route path="/shkafy-kupe" element={<SeoClosetsPage />} />
          <Route path="/tv-zony" element={<SeoTvZonesPage />} />
          <Route path="/dekorativnye-steny" element={<SeoWallsPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          {/* New SEO article pages */}
          <Route path="/sovremennye-kuhni" element={<SeoArticlePage data={sovremennyeKuhni} />} />
          <Route path="/kuhni-bez-ruchek" element={<SeoArticlePage data={kuhniBezRuchek} />} />
          <Route path="/kuhni-mdf" element={<SeoArticlePage data={kuhniMdf} />} />
          <Route path="/kuhni-agt" element={<SeoArticlePage data={kuhniAgt} />} />
          <Route path="/kuhni-egger" element={<SeoArticlePage data={kuhniEgger} />} />
          <Route path="/kuhni-fenix" element={<SeoArticlePage data={kuhniFenix} />} />
          <Route path="/vstroennye-shkafy" element={<SeoArticlePage data={vstroennyeShkafy} />} />
          <Route path="/mebel-na-zakaz" element={<SeoArticlePage data={mebelNaZakaz} />} />
          <Route path="/stoimost-kuhni" element={<SeoArticlePage data={stoimostKuhni} />} />
          <Route path="/agt-vs-egger" element={<SeoArticlePage data={agtVsEgger} />} />
          <Route path="/mdf-vs-dsp" element={<SeoArticlePage data={mdfVsDsp} />} />
          <Route path="/srok-izgotovleniya" element={<SeoArticlePage data={srokIzgotovleniya} />} />
          <Route path="/bucatarii-la-comanda" element={<SeoArticlePage data={bucatariiLaComanda} />} />
          <Route path="/mobila-la-comanda" element={<SeoArticlePage data={mobilaLaComanda} />} />
        </Routes>
        {location.pathname !== "/thank-you" && <ChatWidget />}
      </div>
    </LangProvider>
  );
}

export default function App() {
  const location = useLocation();
  useEffect(() => {
    // Check if user returned from WhatsApp → redirect to thank-you
    if (sessionStorage.getItem("nobilform_show_thankyou_after_return")) {
      sessionStorage.removeItem("nobilform_show_thankyou_after_return");
      window.location.href = "/#/thank-you";
      return;
    }
    if (location.pathname === "/" || location.pathname === "") {
      window.location.hash = "#/ru";
    }
  }, [location.pathname]);

  // Detect return from WhatsApp via focus/visibilitychange (no page reload needed)
  useEffect(() => {
    const checkReturn = () => {
      if (sessionStorage.getItem("nobilform_show_thankyou_after_return")) {
        sessionStorage.removeItem("nobilform_show_thankyou_after_return");
        window.location.replace("/#/thank-you");
      }
    };

    window.addEventListener("focus", checkReturn);

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        checkReturn();
      }
    });

    return () => {
      window.removeEventListener("focus", checkReturn);
    };
  }, []);

  return <AppContent />;
}
