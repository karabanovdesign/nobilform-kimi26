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
        </Routes>
        <ChatWidget />
      </div>
    </LangProvider>
  );
}

export default function App() {
  const location = useLocation();
  useEffect(() => {
    if (!location.hash || location.hash === "#/") {
      window.location.hash = "#/ru";
    }
  }, [location.hash]);

  return <AppContent />;
}
