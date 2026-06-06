import type { SeoArticleData } from "../types";

const data: SeoArticleData = {
  lang: "ro",
  slug: "mdf-vs-pal",
  title: "MDF sau PAL — ce e mai bine pentru bucătărie | NobilForm Chișinău",
  description: "Comparație MDF și PAL pentru bucătărie. AGT MDF vs EGGER PAL. NobilForm Chișinău.",
  h1: "MDF sau PAL — ce e mai bine pentru bucătărie",
  intro: `În NobilForm by KVDesign se utilizează două tipuri principale de plăci: **PAL (PAL laminat)** de la EGGER (Austria) pentru corpuri și **MDF** de la AGT (Turcia) și producție proprie pentru fațade. Acestea sunt materiale diferite pentru sarcini diferite.

În acest articol comparăm detaliat parametrii cheie: acoperire, rezistență la umiditate, preț, aplicare.`,
  sections: [
    {
      h2: "Comparație după parametrii cheie",
      text: `| Parametru | EGGER PAL | AGT MDF | MDF vopsit |
|-----------|-----------|---------|------------|
| **Aplicare** | Corpuri | Fațade | Fațade premium |
| **Acoperire** | Laminat, melamină | Melamină, diverse decoruri | Email mat/lucios |
| **Frezare** | Limitată | Posibilă | Orice complexitate |

PAL EGGER — optim pentru corpuri și fațade economice.
MDF AGT — pentru fațade cu paletă largă de decoruri.
MDF vopsit — pentru culoare unică și calitate premium a vopsirii.`,
    },
    {
      h2: "Când să alegeți PAL",
      text: `**EGGER PAL** — alegere optimă pentru corpuri și fațade economice:

— Corpuri tuturor bucătăriilor NobilForm implicit — EGGER
— Fațade din EGGER PAL — decoruri diverse
— Îngrijire ușoară, rezistență la uzura casnică
— Marginile se protejează cu cromă pentru protecție la umiditate

**Atenție:** marginile fațadelor trebuie protejate obligatoriu cu cromă.

Corpuri → întotdeauna EGGER PAL (Austria).`,
    },
    {
      h2: "Când să alegeți MDF",
      text: `**AGT MDF** — pentru fațade cu paletă largă de decoruri:

— Decoruri diverse: uni, lemn, textil, metal, piatră
— Material solid pentru utilizare zilnică

**MDF vopsit** — pentru culoare unică:

— Paletă largă de culori, colorare conform mostrei
— Suprafață Soft Touch mat sau lucioasă
— Vopsire în mai multe straturi cu șlefuire intermediară`,
    },
    {
      h2: "Verdict",
      text: `**Corpuri** → întotdeauna EGGER PAL (Austria)

**Fațade economic** → EGGER PAL

**Fațade standard** → AGT MDF

**Fațade premium** → MDF vopsit sau Cleaf (Italia)

Alegerea depinde de buget și aspectul dorit. Toate variantele sunt disponibile în NobilForm.`,
    },
  ],
  advantages: [
    "Materiale pentru orice buget",
    "Mostre în showroom pentru comparație",
    "AI-consultant pentru alegere",
    "Vizualizare 3D cu orice material",
    "Fabricație proprie în Chișinău",
    "Condițiile de garanție se stabilesc individual",
  ],
  aiBlock: `AI-consultantul NobilForm vă ajută să alegeți materialul optim. Răspundeți la întrebări despre buget și stil — primiți recomandarea.`,
  portfolioImages: [],
  faq: [
    { q: "MDF sau PAL — ce e mai ieftin?", a: "EGGER PAL — variantă economică. AGT MDF — raport optim calitate-preț. MDF vopsit — premium." },
    { q: "MDF se teme de apă?", a: "MDF este mai rezistent la umiditate decât PAL. Pentru bucătărie este suficient MDF standard cu îngrijire corectă." },
    { q: "Cât timp servește PAL în bucătărie?", a: "La utilizare atentă, materialele servesc mulți ani. Termenul depinde de condițiile de utilizare și îngrijire." },
    { q: "Se poate vopsi PAL?", a: "Nu, PAL nu se poate vopsi. Pentru vopsire se utilizează MDF — MDF vopsit." },
  ],
  relatedMaterials: [
    { label: "Bucătării AGT", href: "/bucatarii-agt" },
    { label: "Bucătării EGGER", href: "/bucatarii-egger" },
    { label: "Preț bucătărie", href: "/pret-bucatarie-la-comanda" },
    { label: "Bucătării la comandă", href: "/bucatarii-la-comanda" },
  ],
  ctaWhatsAppText: "Bună! Nu pot alege între MDF și PAL. Ajutați-mă să decid materialul pentru bucătărie.",
};

export default data;
