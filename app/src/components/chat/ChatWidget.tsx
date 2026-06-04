import { useState, useRef, useEffect, useCallback } from "react";
import { useLang } from "@/providers/LangProvider";
import { trpc } from "@/providers/trpc";
import {
  MessageCircle, X, Send, Bot, User, Phone, Mic, MicOff,
  Calculator, ImageIcon, MessageSquare,
  Trash2, Sparkles, ChevronRight, Mail,
} from "lucide-react";
import type { Message, ChatMode, CalculatorState, VoiceState } from "./types";
import { fetchGptReply } from "./gptApi";
import { generateResponse } from "./ragEngine";
import {
  calculateKitchen, formatResult, looksLikeSize, extractSize,
  looksLikePhone, extractPhone, isConsultationRequest,
  calculateCloset, formatClosetResult,
} from "./calculatorEngine";
import {
  createEmptyWizard, wizardResponse, productInfo,
  parseSizes, parseColor, parseMaterial, parseDoorType,
  getWizardStep, type WizardState, type WizardStep,
} from "./wizardEngine";
import {
  createSpeechRecognizer, stopSpeaking, isVoiceSupported,
} from "./voiceManager";

// ===== WHATSAPP HELPER =====
// Opens WhatsApp — MUST be called synchronously from onClick
// DO NOT wrap in setTimeout or async callback
function openWhatsAppDirect(phone: string, text: string) {
  const encodedText = encodeURIComponent(text);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const url = isMobile
    ? `https://wa.me/${phone}?text=${encodedText}`
    : `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

// ===== CONSTANTS =====
const WELCOME_RU = "Здравствуйте! Чем могу помочь?";
const WELCOME_RO = "Bună ziua! Cu ce vă pot ajuta?";
const STORAGE_KEY = "nobilform_chat_v5";

const WHATSAPP_NUMBER = "37360599907";
const EMAIL_ADDRESS = "nobilaform@gmail.com";

// ===== QUICK QUESTIONS =====
const QUICK_RU = [
  { icon: Calculator, text: "Рассчитать кухню" },
  { icon: Calculator, text: "Рассчитать шкаф" },
  { icon: Sparkles, text: "Подобрать стиль" },
  { icon: MessageSquare, text: "Консультация" },
  { icon: ImageIcon, text: "Сгенерировать дизайн" },
  { icon: Phone, text: "Вызвать дизайнера на дом" },
];
const QUICK_RO = [
  { icon: Calculator, text: "Calculează bucătăria" },
  { icon: Calculator, text: "Calculează dulapul" },
  { icon: Sparkles, text: "Alege stilul" },
  { icon: MessageSquare, text: "Consultare" },
  { icon: ImageIcon, text: "Generează design" },
  { icon: Phone, text: "Designer la domiciliu" },
];

// Wizard options — ШКАФ materials (buttons)
const WIZARD_MATERIALS_RU = [
  { id: "ДСП", label: "ДСП EGGER" },
  { id: "МДФ", label: "МДФ" },
  { id: "AGT", label: "AGT ламинат" },
  { id: "МДФ мат", label: "МДФ крашенный мат" },
  { id: "МДФ глянец", label: "МДФ крашенный глянец" },
  { id: "МДФ шпон", label: "МДФ шпонированный" },
];
const WIZARD_MATERIALS_RO = [
  { id: "ДСП", label: "PAL EGGER" },
  { id: "МДФ", label: "MDF" },
  { id: "AGT", label: "AGT laminat" },
  { id: "МДФ мат", label: "MDF vopsit mat" },
  { id: "МДФ глянец", label: "MDF vopsit lucios" },
  { id: "МДФ шпон", label: "MDF furniruit" },
];

// Wizard options — ШКАФ door types (buttons)
const WIZARD_DOORS_RU = [
  { id: "распашные", label: "Распашные" },
  { id: "раздвижные", label: "Раздвижные" },
];
const WIZARD_DOORS_RO = [
  { id: "распашные", label: "Batante" },
  { id: "раздвижные", label: "Glisante" },
];

// Calculator options
const CALC_STYLES = [
  { id: "modern_minimal", ru: "Modern Minimal", ro: "Modern Minimal" },
  { id: "japandi", ru: "Japandi", ro: "Japandi" },
  { id: "warm_minimal", ru: "Warm Minimalism", ro: "Warm Minimalism" },
  { id: "soft_luxury", ru: "Soft Luxury", ro: "Soft Luxury" },
  { id: "dark_premium", ru: "Dark Premium", ro: "Dark Premium" },
  { id: "natural_wood", ru: "Natural Wood", ro: "Natural Wood" },
  { id: "contemporary", ru: "Contemporary", ro: "Contemporary" },
];

const CALC_MATERIALS = [
  { id: "egger", ru: "ДСП EGGER (-25%)", ro: "PAL EGGER (-25%)" },
  { id: "agt", ru: "AGT МДФ (-10%)", ro: "AGT MDF (-10%)" },
  { id: "matte", ru: "МДФ мат (база)", ro: "MDF mat (bază)" },
  { id: "glossy", ru: "МДФ глянец (+15%)", ro: "MDF lucios (+15%)" },
  { id: "veneer", ru: "МДФ шпон (+45%)", ro: "MDF furnir (+45%)" },
];

const CALC_COUNTERtops = [
  { id: "egger", ru: "ДСП Egger 38мм", ro: "PAL Egger 38mm" },
  { id: "hpl", ru: "HPL Fundermax (+40%)", ro: "HPL Fundermax (+40%)" },
  { id: "quartz", ru: "Кварц Silestone (+80%)", ro: "Cuarț Silestone (+80%)" },
  { id: "marble", ru: "Мрамор (+150%)", ro: "Marmură (+150%)" },
];

const CALC_EXTRAS = [
  { id: "island", ru: "Кухонный остров (+40%)", ro: "Insulă (+40%)" },
  { id: "led_premium", ru: "LED подсветка (+15%)", ro: "LED premium (+15%)" },
  { id: "legrabox", ru: "Blum Legrabox (+20%)", ro: "Blum Legrabox (+20%)" },
  { id: "glass_facade", ru: "Стеклянные фасады (+10%)", ro: "Fațade sticlă (+10%)" },
];

// Kitchen height options (calculator step 2)
const KITCHEN_HEIGHTS_RU = [
  { id: "стандартная 85см", label: "Стандартная 85см" },
  { id: "высокая 92см", label: "Высокая 92см" },
  { id: "под потолок", label: "Под потолок" },
];
const KITCHEN_HEIGHTS_RO = [
  { id: "standard 85cm", label: "Standard 85cm" },
  { id: "inalta 92cm", label: "Înaltă 92cm" },
  { id: "sub tavan", label: "Sub tavan" },
];

export default function ChatWidget() {
  const { lang } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("chat");
  const [messages, setMessages] = useState<Message[]>(() => loadMessages(lang));
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voice, setVoice] = useState<VoiceState>({
    isListening: false, isSpeaking: false, transcript: "", supported: isVoiceSupported(),
  });
  const [calculator, setCalculator] = useState<CalculatorState>({
    size: 0, height: "", style: "", material: "", countertop: "", extras: [], notes: "", type: "",
  });

  // ===== CLOSET CALCULATOR CONSTANTS =====
  const CLOSET_TYPES_RU = [
    { id: "встроенный", label: "Встроенный" },
    { id: "отдельностоящий", label: "Отдельностоящий" },
  ];
  const CLOSET_TYPES_RO = [
    { id: "встроенный", label: "Încorporat" },
    { id: "отдельностоящий", label: "Independent" },
  ];

  const CLOSET_MATERIALS_RU = [
    { id: "egger", label: "ДСП EGGER" },
    { id: "agt", label: "AGT МДФ ламинат" },
    { id: "matte", label: "МДФ крашенный мат" },
    { id: "glossy", label: "МДФ крашенный глянец" },
    { id: "veneer", label: "МДФ шпон" },
    { id: "mirror", label: "Зеркало" },
    { id: "glass", label: "Стекло" },
  ];
  const CLOSET_MATERIALS_RO = [
    { id: "egger", label: "PAL EGGER" },
    { id: "agt", label: "AGT MDF laminat" },
    { id: "matte", label: "MDF vopsit mat" },
    { id: "glossy", label: "MDF vopsit lucios" },
    { id: "veneer", label: "MDF furnir" },
    { id: "mirror", label: "Oglindă" },
    { id: "glass", label: "Sticlă" },
  ];

  const CLOSET_DOORS_RU = [
    { id: "распашные", label: "Распашные" },
    { id: "раздвижные", label: "Раздвижные" },
  ];
  const CLOSET_DOORS_RO = [
    { id: "распашные", label: "Batante" },
    { id: "раздвижные", label: "Glisante" },
  ];

  const CLOSET_COLORS_RU = [
    { id: "белый", label: "Белый" },
    { id: "чёрный", label: "Чёрный" },
    { id: "серый", label: "Серый" },
    { id: "коричневый", label: "Коричневый" },
    { id: "бежевый", label: "Бежевый" },
    { id: "другой", label: "Другой (укажите)" },
  ];
  const CLOSET_COLORS_RO = [
    { id: "белый", label: "Alb" },
    { id: "чёрный", label: "Negru" },
    { id: "серый", label: "Gri" },
    { id: "коричневый", label: "Maro" },
    { id: "бежевый", label: "Bej" },
    { id: "другой", label: "Altul (specificați)" },
  ];
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  // Use ref to avoid stale closure in sendToWhatsApp/sendToEmail callbacks
  const lastCalcResultRef = useRef<string>("");
  // Structured wizard state — collects all params step by step
  const [wizardState, setWizardState] = useState<WizardState>(createEmptyWizard);
  const [wizardStep, setWizardStep] = useState<WizardStep>("width");
  // Context product — remembered across messages (шкаф, кухня, etc.)
  const [contextProduct, setContextProduct] = useState<string>("");
  // Current dialog step for "yes/no" flow
  const [dialogStep, setDialogStep] = useState<number>(0);

  // tRPC mutation for OpenAI image generation
  const generateImageMutation = trpc.ai.generateImage.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setGeneratedImage(data.imageUrl);
        setIsGeneratingImage(false);
        const currentLang = lang as "ru" | "ro";
        setMessages(prev => [...prev, {
          role: "assistant",
          content: currentLang === "ro"
            ? `🎨 Design generat!\n\nPentru realizare — contactați-ne: +373 60 599 907`
            : `🎨 Дизайн сгенерирован!\n\nДля реализации — свяжитесь: +373 60 599 907`,
          timestamp: Date.now(),
        }]);
      } else {
        handleImageFallback();
      }
    },
    onError: () => {
      handleImageFallback();
    },
  });

  const handleImageFallback = useCallback(() => {
    setIsGeneratingImage(false);
    const currentLang = lang as "ru" | "ro";
    setMessages(prev => [...prev, {
      role: "assistant",
      content: currentLang === "ro"
        ? `🎨 Designerul pregătește vizualizarea 3D în 2-3 zile.\n\nContactați-ne: +373 60 599 907`
        : `🎨 Дизайнер подготовит 3D-визуализацию за 2-3 дня.\n\nСвяжитесь: +373 60 599 907`,
      timestamp: Date.now(),
    }]);
  }, [lang]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognizerRef = useRef<SpeechRecognition | null>(null);

  // ===== LANGUAGE CHANGE — update welcome message =====
  useEffect(() => {
    const currentLang = lang as "ru" | "ro";
    const welcome = currentLang === "ro" ? WELCOME_RO : WELCOME_RU;
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        // Only welcome message exists — update it
        return [{ ...prev[0], content: welcome }];
      }
      return prev;
    });
  }, [lang]);

  // ===== PERSISTENCE =====
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch { /* */ }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen, mode]);

  // Clear generated image on close
  useEffect(() => {
    if (!isOpen) {
      setGeneratedImage(null);
    }
  }, [isOpen]);

  // ===== VOICE =====
  const toggleVoice = useCallback(() => {
    if (voice.isListening) {
      recognizerRef.current?.stop();
      setVoice(v => ({ ...v, isListening: false, transcript: "" }));
    } else {
      const rec = createSpeechRecognizer(
        lang,
        (text, isFinal) => {
          if (isFinal) {
            setInput(text);
            setVoice(v => ({ ...v, isListening: false, transcript: "" }));
            setTimeout(() => sendMessage(text), 100);
          } else {
            setInput(text);
          }
        },
        () => setVoice(v => ({ ...v, isListening: false })),
      );
      if (rec) {
        recognizerRef.current = rec;
        rec.start();
        setVoice(v => ({ ...v, isListening: true }));
      }
    }
  }, [voice.isListening, lang]);

  // ===== WHATSAPP SEND (project/phone with full context) =====
  const sendToWhatsApp = useCallback((type: "phone" | "project", data?: string) => {
    const chatHistory = messages.slice(-10).map(m =>
      `${m.role === "user" ? "[Client]" : "[AI]"}: ${m.content.substring(0, 150)}`
    ).join("\n");
    if (type === "phone" && data) {
      const text = encodeURIComponent(
        lang === "ro"
          ? `Bună! Sunt client NobilForm AI.\n\n📞 Numărul meu: +${data}\n\n💬 Istoric conversație:\n${chatHistory}\n\nRog să mă contactați pentru consultare.`
          : `Здравствуйте! Я клиент NobilForm AI.\n\n📞 Мой номер: +${data}\n\n💬 История диалога:\n${chatHistory}\n\nПрошу связаться для консультации.`
      );
      openWhatsAppDirect(WHATSAPP_NUMBER, decodeURIComponent(text));
    } else if (type === "project") {
      const projectText = lastCalcResultRef.current || chatHistory;
      const waMsg = lang === "ro"
        ? `Bună! Am pregătit proiectul la NobilForm AI.\n\n📋 Detalii:\n${projectText}\n\nRog revizuirea și contactarea mea.`
        : `Здравствуйте! Я подготовил проект в NobilForm AI.\n\n📋 Детали:\n${projectText}\n\nПрошу рассмотреть и связаться со мной.`;
      openWhatsAppDirect(WHATSAPP_NUMBER, waMsg);
    }
  }, [lang, messages]);

  const sendToEmail = useCallback(() => {
    const projectText = lastCalcResultRef.current || messages.slice(-8).map(m => `${m.role === "user" ? "Client" : "AI"}: ${m.content.substring(0, 120)}`).join("\n%0D%0A");
    const subject = encodeURIComponent(lang === "ro" ? "Proiect NobilForm AI" : "Проект NobilForm AI");
    const body = encodeURIComponent(
      lang === "ro"
        ? `Bună!\n\nAm pregătit următorul proiect prin consilierul AI NobilForm:\n\n${projectText}\n\nAștept feedback.`
        : `Здравствуйте!\n\nЯ подготовил следующий проект через AI-консультанта NobilForm:\n\n${projectText}\n\nЖду обратной связи.`
    );
    window.open(`mailto:${EMAIL_ADDRESS}?subject=${subject}&body=${body}`, "_blank");
  }, [lang, messages]);

  // Extract product from all messages (context memory)
  function detectProductFromHistory(msgs: Message[]): string {
    for (let i = msgs.length - 1; i >= 0; i--) {
      const h = msgs[i].content.toLowerCase();
      if (/(шкаф|dulap|cupe|купе)/i.test(h)) return "шкаф";
      if (/(гардеробн|dressing)/i.test(h)) return "гардеробная";
      if (/(кухн|bucatarie|bucătărie|kitchen)/i.test(h)) return "кухня";
      if (/(тв|tv|televizor|телевизор|media)/i.test(h)) return "ТВ-зона";
      if (/(стен|perete|панел|panou|3d|изголовье)/i.test(h)) return "декоративная стена";
    }
    return "";
  }

  // ===== MAIN SEND =====
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const trimmed = text.trim();
    const currentLang = lang as "ru" | "ro";

    const userMsg: Message = {
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    stopSpeaking();

    // ALWAYS detect product from full conversation history
    const detectedProduct = detectProductFromHistory(newMessages);
    if (detectedProduct && detectedProduct !== contextProduct) {
      setContextProduct(detectedProduct);
    }
    setVoice(v => ({ ...v, isSpeaking: false }));

    // Pre-compute WhatsApp message for awaiting_phone — MUST open BEFORE setTimeout
    // (mobile browsers block window.open inside setTimeout)
    let preWaUrl: string | null = null;
    if (mode === "awaiting_phone") {
      const digits = extractPhone(trimmed);
      if (digits.length >= 5) {
        const phone = digits.startsWith("373") || digits.startsWith("0") ? digits : "373" + digits;
        const chatHistory = newMessages.slice(-10).map(m =>
          `${m.role === "user" ? "[Client]" : "[AI]"}: ${m.content.substring(0, 150)}`
        ).join("\n");
        const waMsgText = currentLang === "ro"
          ? `Bună! Sunt client NobilForm AI.\n\n📞 Numărul meu: +${phone}\n\n💬 Istoric conversație:\n${chatHistory}\n\nRog să mă contactați pentru consultare.`
          : `Здравствуйте! Я клиент NobilForm AI.\n\n📞 Мой номер: +${phone}\n\n💬 История диалога:\n${chatHistory}\n\nПрошу связаться для консультации.`;
        preWaUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsgText)}`;
      }
    }

    // Open WhatsApp NOW — directly from user gesture, not from setTimeout
    if (preWaUrl) {
      window.open(preWaUrl, "_blank", "noopener,noreferrer");
    }

    setTimeout(async () => {
      try {
        let response = "";
        let newMode: ChatMode = mode; // preserve current mode by default
        let skipMessage = false;

        switch (mode) {
          // ===== ШКАФ WIZARD (6 steps like kitchen calculator) =====
          case "wizard_width": {
            const m = trimmed.match(/(\d+[.,]?\d*)/);
            if (m) {
              setWizardState(prev => ({ ...prev, sizeWidth: m[1].replace(",", ".") }));
              response = currentLang === "ro" ? `Lățime ${m[1]}m înregistrată. Acum înălțimea:` : `Ширина ${m[1]}м записана. Теперь высота:`;
              newMode = "wizard_height";
            } else {
              response = currentLang === "ro" ? `Ce lățime aveți în vedere? (în metri)` : `Какая ширина вас интересует? (в метрах)`;
            }
            break;
          }

          case "wizard_height": {
            const m = trimmed.match(/(\d+[.,]?\d*)/);
            if (m) {
              setWizardState(prev => ({ ...prev, sizeHeight: m[1].replace(",", ".") }));
              response = currentLang === "ro" ? `Înălțime ${m[1]}m înregistrată. Ce culoare preferați?` : `Высота ${m[1]}м записана. Какой цвет предпочитаете?`;
              newMode = "wizard_color";
            } else {
              response = currentLang === "ro" ? `Ce înălțime aveți în vedere? (în metri)` : `Какая высота вас интересует? (в метрах)`;
            }
            break;
          }

          case "wizard_color": {
            const c = parseColor(trimmed);
            if (c) {
              setWizardState(prev => ({ ...prev, color: c }));
              response = currentLang === "ro" ? `Culoare ${c} — notat. Alegeți materialul:` : `Цвет ${c} — принят. Выберите материал:`;
              newMode = "wizard_material";
            } else {
              response = currentLang === "ro" ? `Ce culoare preferați? (ex: alb, negru, gri, maro)` : `Какой цвет предпочитаете? (например: белый, чёрный, серый, коричневый)`;
            }
            break;
          }

          case "wizard_material": {
            const mat = parseMaterial(trimmed);
            if (mat) {
              setWizardState(prev => ({ ...prev, material: mat }));
              response = currentLang === "ro" ? `Material ${mat} — primit. Alegeți tipul ușilor:` : `Материал ${mat} — принят. Выберите тип дверей:`;
              newMode = "wizard_doors";
            } else {
              response = currentLang === "ro" ? `Alegeți materialul (butoanele de mai jos):` : `Выберите материал (кнопки ниже):`;
            }
            break;
          }

          case "wizard_doors": {
            const dt = parseDoorType(trimmed);
            if (dt) {
              const finalState = { ...wizardState, doorType: dt };
              setWizardState(finalState);
              const sizeStr = `${finalState.sizeWidth}×${finalState.sizeHeight}м`;
              response = currentLang === "ro"
                ? `✅ Comanda primită:\n• Produs: ${finalState.product}\n• Dimensiuni: ${sizeStr}\n• Culoare: ${finalState.color}\n• Material: ${finalState.material}\n• Uși: ${dt}\n\nTrimitem cererea designerului. Vă contactează în cel mult o oră. Mulțumim pentru alegere!`
                : `✅ Заявка принята:\n• Изделие: ${finalState.product}\n• Размеры: ${sizeStr}\n• Цвет: ${finalState.color}\n• Материал: ${finalState.material}\n• Двери: ${dt}\n\nОтправляем запрос дизайнеру. Скоро с вами свяжутся. Спасибо за выбор нашей компании!`;
              newMode = "wizard_result";
              // Send to WhatsApp
              const waMsg = currentLang === "ro"
                ? `Comandă Nouă — NobilForm AI\n\n• Produs: ${finalState.product}\n• Dimensiuni: ${sizeStr}\n• Culoare: ${finalState.color}\n• Material: ${finalState.material}\n• Uși: ${dt}\n\nContactați clientul urgent!`
                : `Новая заявка — NobilForm AI\n\n• Изделие: ${finalState.product}\n• Размеры: ${sizeStr}\n• Цвет: ${finalState.color}\n• Материал: ${finalState.material}\n• Двери: ${dt}\n\nСвяжитесь с клиентом срочно!`;
              setTimeout(() => openWhatsAppDirect(WHATSAPP_NUMBER, waMsg), 500);
            } else {
              response = currentLang === "ro" ? `Alegeți tipul ușilor (butoanele de mai jos):` : `Выберите тип дверей (кнопки ниже):`;
            }
            break;
          }

          case "wizard_result": {
            response = currentLang === "ro" ? "Comanda a fost trimisă. Mai aveți întrebări?" : "Заявка отправлена. Ещё вопросы?";
            newMode = "chat";
            break;
          }

          case "awaiting_phone": {
            const digits = extractPhone(trimmed);
            if (digits.length >= 5) {
              // WhatsApp already opened before setTimeout (preserves user gesture)
              response = currentLang === "ro"
                ? `✅ Datele trimise designerului prin WhatsApp (+373 60 599 907).\n\nDeschideți WhatsApp pentru a finaliza trimiterea. Designerul vă contactează în cel mult o oră.\n\nPână atunci — alte întrebări?`
                : `✅ Данные отправлены дизайнеру через WhatsApp (+373 60 599 907).\n\nОткройте WhatsApp для завершения отправки. Дизайнер свяжется в течение часа.\n\nА пока — другие вопросы?`;
            } else {
              response = currentLang === "ro"
                ? "Vă rog introduceți un număr valid (ex: 060123456)"
                : "Пожалуйста, введите корректный номер (например: 060123456)";
              newMode = "awaiting_phone";
            }
            break;
          }

          case "calculator_size": {
            const size = extractSize(trimmed);
            if (size > 0.5 && size < 50) {
              setCalculator(prev => ({ ...prev, size }));
              response = currentLang === "ro" ? `✅ Dimensiune: ${size}m. Acum alegeți înălțimea:` : `✅ Размер: ${size} м. Теперь выберите высоту:`;
              newMode = "calculator_height";
            } else {
              response = currentLang === "ro" ? "Introduceți dimensiunea validă (ex: 3.5, 4, 5.2)" : "Введите корректный размер (например: 3.5, 4, 5.2)";
              newMode = "calculator_size";
            }
            break;
          }

          case "calculator_height": {
            setCalculator(prev => ({ ...prev, height: trimmed }));
            response = currentLang === "ro" ? `✅ Înălțime: ${trimmed}. Acum alegeți stilul:` : `✅ Высота: ${trimmed}. Теперь выберите стиль:`;
            newMode = "calculator_style";
            break;
          }

          case "calculator_style":
            setCalculator(prev => ({ ...prev, style: trimmed.toLowerCase().replace(/\s+/g, "_") }));
            response = currentLang === "ro" ? `✅ Stil selectat. Acum alegeți materialul:` : `✅ Стиль выбран. Теперь выберите материал:`;
            newMode = "calculator_material";
            break;

          case "calculator_material":
            setCalculator(prev => ({ ...prev, material: trimmed }));
            response = currentLang === "ro" ? `✅ Material selectat. Acum alegeți blatul:` : `✅ Материал выбран. Теперь выберите столешницу:`;
            newMode = "calculator_countertop";
            break;

          case "calculator_countertop":
            setCalculator(prev => ({ ...prev, countertop: trimmed }));
            response = currentLang === "ro"
              ? `✅ Blat selectat. Doriți opțiuni suplimentare? (selectați sau scrieți "nu")`
              : `✅ Столешница выбрана. Нужны дополнительные опции? (выберите или напишите "нет")`;
            newMode = "calculator_extras";
            break;

          case "calculator_extras": {
            const extras = trimmed.toLowerCase().split(/[,;]/).map(s => s.trim()).filter(Boolean);
            const finalExtras = extras.filter(e => e !== "нет" && e !== "nu" && e !== "no" && e !== "skip" && e !== "");
            setCalculator(prev => ({ ...prev, extras: finalExtras }));
            response = currentLang === "ro"
              ? `✅ Extra: ${finalExtras.length > 0 ? finalExtras.join(", ") : "fără"}.\n\n📝 Doriți să adăugați comentarii, corecții sau sugestii? (descrieți sau scrieți "nu")`
              : `✅ Дополнительно: ${finalExtras.length > 0 ? finalExtras.join(", ") : "нет"}.\n\n📝 Хотите добавить комментарии, корректировки или пожелания? (опишите или напишите "нет")`;
            newMode = "calculator_notes";
            break;
          }

          case "calculator_notes": {
            const notes = trimmed.toLowerCase();
            const finalNotes = (notes === "нет" || notes === "nu" || notes === "no" || notes === "n/a") ? "" : trimmed;
            const finalCalc = { ...calculator, notes: finalNotes };
            setCalculator(finalCalc);
            const result = calculateKitchen(finalCalc);
            const formatted = formatResult(currentLang, finalCalc, result);
            response = formatted;
            lastCalcResultRef.current = formatted;
            newMode = "calculator_result";
            break;
          }

          // ===== ШКАФ КАЛЬКУЛЯТОР (8 steps) =====
          case "closet_size": {
            const size = extractSize(trimmed);
            if (size > 0.5 && size < 50) {
              setCalculator(prev => ({ ...prev, size }));
              response = currentLang === "ro" ? `✅ Dimensiune: ${size}m. Acum înălțimea:` : `✅ Размер: ${size} м. Теперь высота:`;
              newMode = "closet_height";
            } else {
              response = currentLang === "ro" ? "Introduceți dimensiunea validă (ex: 3.5, 4, 5.2)" : "Введите корректный размер (например: 3.5, 4, 5.2)";
              newMode = "closet_size";
            }
            break;
          }

          case "closet_height": {
            setCalculator(prev => ({ ...prev, height: trimmed }));
            response = currentLang === "ro" ? `✅ Înălțime: ${trimmed}. Acum tipul:` : `✅ Высота: ${trimmed}. Теперь тип:`;
            newMode = "closet_type";
            break;
          }

          case "closet_type": {
            setCalculator(prev => ({ ...prev, type: trimmed }));
            response = currentLang === "ro" ? `✅ Tip: ${trimmed}. Acum materialul:` : `✅ Тип: ${trimmed}. Теперь материал:`;
            newMode = "closet_material";
            break;
          }

          case "closet_material": {
            setCalculator(prev => ({ ...prev, material: trimmed.toLowerCase() }));
            response = currentLang === "ro" ? `✅ Material: ${trimmed}. Acum culoarea:` : `✅ Материал: ${trimmed}. Теперь цвет:`;
            newMode = "closet_color";
            break;
          }

          case "closet_color": {
            setCalculator(prev => ({ ...prev, style: trimmed }));
            response = currentLang === "ro" ? `✅ Culoare: ${trimmed}. Acum tipul ușilor:` : `✅ Цвет: ${trimmed}. Теперь тип фасадов:`;
            newMode = "closet_doors";
            break;
          }

          case "closet_doors": {
            setCalculator(prev => ({ ...prev, extras: [trimmed] }));
            response = currentLang === "ro"
              ? `✅ Uși: ${trimmed}.\n\n📝 Doriți să adăugați comentarii? (ex: fațade combinate PAL cu oglindă, fațade de sticlă cu iluminare LED, MDF vopsit sau frezat lucios/mat etc.)`
              : `✅ Фасады: ${trimmed}.\n\n📝 Хотите добавить комментарии? (например: комбинированные фасады ДСП с зеркалом, стеклянные фасады с подсветкой, крашеные МДФ или фрезированные глянец/мат и т.д.)`;
            newMode = "closet_notes";
            break;
          }

          case "closet_notes": {
            const notes = trimmed.toLowerCase();
            const finalNotes = (notes === "нет" || notes === "nu" || notes === "no" || notes === "n/a") ? "" : trimmed;
            const finalCalc = { ...calculator, notes: finalNotes };
            setCalculator(finalCalc);
            const result = calculateCloset(finalCalc);
            const formatted = formatClosetResult(currentLang, finalCalc, result);
            response = formatted;
            lastCalcResultRef.current = formatted;
            newMode = "closet_result";
            break;
          }

          case "closet_edit": {
            // Handled by ClosetEditForm — just acknowledge
            response = currentLang === "ro" ? "Modificați parametrii mai jos:" : "Измените параметры ниже:";
            break;
          }

          case "designer_visit": {
            // Collect address + phone and send to WhatsApp
            const phoneDigits = extractPhone(trimmed);
            if (phoneDigits.length >= 5 && trimmed.length > 10) {
              const phone = phoneDigits.startsWith("373") || phoneDigits.startsWith("0") ? phoneDigits : "373" + phoneDigits;
              const waText = currentLang === "ro"
                ? `Bună! Cerere vizită designer la domiciliu.\n\n📍 Adresa: ${trimmed}\n📞 Contact: +${phone}\n\nRog confirmarea programării.`
                : `Здравствуйте! Заявка на выезд дизайнера на дом.\n\n📍 Адрес: ${trimmed}\n📞 Контакт: +${phone}\n\nПрошу подтвердить запись.`;
              openWhatsAppDirect(WHATSAPP_NUMBER, waText);
              response = currentLang === "ro"
                ? `✅ Datele trimise designerului prin WhatsApp (+373 60 599 907).\n\nDeschideți WhatsApp pentru a finaliza trimiterea. Designerul vă contactează pentru confirmarea vizitei.`
                : `✅ Данные отправлены дизайнеру через WhatsApp (+373 60 599 907).\n\nОткройте WhatsApp для завершения отправки. Дизайнер свяжется для подтверждения визита.`;
              newMode = "chat";
            } else {
              response = currentLang === "ro"
                ? "Vă rog introduceți adresa și numărul de telefon (ex: str. Pușkin 15, apart. 42, 060123456)"
                : "Пожалуйста, введите адрес и номер телефона (например: ул. Пушкина 15, кв. 42, 060123456)";
              newMode = "designer_visit";
            }
            break;
          }

          case "generating_design": {
            // Real OpenAI DALL-E 3 generation via tRPC backend
            setIsGeneratingImage(true);
            generateImageMutation.mutate({ prompt: trimmed });
            skipMessage = true; // Response comes from mutation callback
            newMode = "chat";
            break;
          }

          default: {
            // === 1. DESIGNER VISIT COST — before isConsultationRequest! ===
            if (/(выезд|вызов|приедет|приезжает|deplasare|vizita|vizit)/i.test(trimmed) && /(дизайн|designer|design|мастер|meister)/i.test(trimmed)) {
              response = currentLang === "ro"
                ? "Deplasarea designerului în Chișinău costă 300 lei.\nLa plasarea comenzii, costul deplasării se deduce integral din valoarea mobilierului."
                : "Выезд дизайнера по Кишинёву стоит 300 леев.\nПри оформлении заказа стоимость выезда вычитается из стоимости мебели.";
            }
            // === 2. OBJECTION: "too expensive" ===
            else if (/(дорого|сильно дорог|prea scump|scump|недоступн|дороговато)/i.test(trimmed)) {
              response = currentLang === "ro"
                ? "Putem selecta o soluție mai accesibilă. Ce buget luați în considerare?"
                : "Мы можем подобрать более доступное решение. Какой бюджет вы рассматриваете?";
            }
            // === 3. OBJECTION: "I'll think about it" ===
            else if (/(подумаю|подумаем|mai.*gândesc|gândesc|ma gandesc|voi.*gândi)/i.test(trimmed)) {
              response = currentLang === "ro"
                ? "Desigur. Pot salva calculul și vă pot conecta cu designerul mai târziu. Doriți să vă reamintesc prin WhatsApp?"
                : "Конечно. Могу сохранить расчёт и связать вас с дизайнером позже. Напомнить через WhatsApp?";
            }
            // === 4. "How much is a kitchen" → launch kitchen calculator ===
            else if (/(сколько.*стоит.*кухн|цена.*кухн|pret.*bucat|preț.*bucat)/i.test(trimmed)) {
              setCalculator({ size: 0, height: "", style: "", material: "", countertop: "", extras: [], notes: "", type: "" });
              newMode = "calculator_size";
              response = currentLang === "ro"
                ? "🧮 Calculator bucătărie. Pasul 1: Dimensiunea în metri liniari (ex: 3.5, 4, 5):"
                : "🧮 Калькулятор кухни. Шаг 1: Введите размер в погонных метрах (например: 3.5, 4, 5):";
            }
            // --- ТВ-ЗОНА & ДЕКОРАТИВНЫЕ ПАНЕЛИ (individual project) ---
            else if (/(тв.*зон|tv.*zon|телевизор|televizor|media|медиа|декоративн|panou|perete decorativ|3d.*панел|изголовье|tăblie)/i.test(trimmed)) {
              response = currentLang === "ro"
                ? `Acest produs se calculează ca proiect individual și complex, care necesită atenția maximă a designerului!\n\nDescrieți mai jos preferințele dvs. pentru produs:\n• lățimea și înălțimea\n• ce caracter decorativ trebuie să aibă acest model\n• locul amplasării\n• ce elemente trebuie să fie (consolă suspendată pentru TV, noptieră, masă de lucru/birou)\n\nSau atașați o imagine în WhatsApp cu descrierea. De asemenea, puteți avea încredere în ideea designerului — vă vor ajuta cu alegerea!`
                : `Данное изделие рассчитывается как индивидуальный и сложный проект, который требует к себе максимального внимания дизайнера!\n\nОпишите ниже ваши предпочтения к изделию:\n• ширина и высота\n• какой декоративный характер должна нести эта модель\n• её место расположения\n• какие элементы должны быть (подвесная консоль для ТВ, прикроватная тумба, стол рабочий/письменный)\n\nИли прикрепите изображение в WhatsApp с описанием. Также вы можете довериться идее самого дизайнера — в любом случае вам помогут с выбором!`;
              newMode = "tv_wall_inquiry";
            }
            // --- YES / NO handling ---
            else if (/^(da|да|yes|si|да\s*)$/i.test(trimmed)) {
              // Client said YES — continue the flow based on context
              const product = detectedProduct || contextProduct;
              if (product) {
                // We know the product — ask for the next missing detail
                const step = dialogStep;
                if (step === 0) {
                  response = currentLang === "ro" ? "Perfect! Ce material preferați?" : "Отлично! Какой материал предпочитаете?";
                  setDialogStep(1);
                } else if (step === 1) {
                  response = currentLang === "ro" ? "Ce culoare doriți?" : "Какой цвет хотите?";
                  setDialogStep(2);
                } else if (step === 2) {
                  response = currentLang === "ro"
                    ? `Am notat: ${product}. Pregătim un calcul personalizat.\n\nLăsați numărul de telefon — designerul vă contactează cu detaliile.`
                    : `Записал: ${product}. Готовим персональный расчёт.\n\nОставьте номер телефона — дизайнер свяжется с деталями.`;
                  setDialogStep(3);
                  newMode = "awaiting_phone";
                } else {
                  response = currentLang === "ro" ? "Mai aveți întrebări?" : "Ещё вопросы?";
                }
              } else {
                response = currentLang === "ro" ? "Cu ce produs să continuăm — bucătărie, dressing, dulap?" : "С каким продуктом продолжим — кухня, гардеробная, шкаф?";
              }
            } else if (/^(nu|нет|no|nu\s*)$/i.test(trimmed)) {
              // Client said NO
              response = currentLang === "ro"
                ? "Înțeles. Dacă aveți alte întrebări — sunt aici."
                : "Понял. Если есть другие вопросы — обращайтесь.";
            }
            // --- CONSULTATION ---
            else if (isConsultationRequest(trimmed)) {
              response = currentLang === "ro"
                ? `Desigur! Lăsați numărul de telefon — designerul vă contactează în cel mult o oră.\n\nSau scrieți direct pe WhatsApp: +373 60 599 907`
                : `Отлично! Оставьте номер телефона — дизайнер свяжется в течение часа.\n\nИли напишите в WhatsApp: +373 60 599 907`;
              newMode = "awaiting_phone";
            }
            // --- SIZE input ---
            else if (looksLikeSize(trimmed) && !looksLikePhone(trimmed)) {
              const size = extractSize(trimmed);
              if (size > 0 && size < 50) {
                // Use detectedProduct (local, synchronous) not contextProduct (async state)
                const product = detectedProduct || contextProduct;
                if (product) {
                  response = currentLang === "ro"
                    ? `Dimensiune ${size}m înregistrată pentru ${product}. Ce material preferați?`
                    : `Размер ${size}м принят для ${product}. Какой материал предпочитаете?`;
                  setDialogStep(1);
                } else {
                  response = currentLang === "ro"
                    ? `Dimensiune ${size}m înregistrată. Cu ce produs lucrăm — bucătărie, dressing, dulap, zonă TV?`
                    : `Размер ${size}м принят. С каким продуктом работаем — кухня, гардеробная, шкаф, ТВ-зона?`;
                }
              } else {
                const history = newMessages.slice(-6).map(m => m.content);
                try {
                  response = await fetchGptReply(currentLang, trimmed, history);
                } catch {
                  response = generateResponse(currentLang, trimmed, history);
                }
              }
            }
            // --- PHONE NUMBER in chat mode ---
            else if (looksLikePhone(trimmed) && !looksLikeSize(trimmed) && trimmed.replace(/\D/g, "").length >= 5) {
              response = currentLang === "ro"
                ? `Am înțeles — doriți să lăsați numărul pentru contact. Salvez: +${trimmed.replace(/\D/g, "")}?`
                : `Понял — хотите оставить номер для связи. Сохраняю: +${trimmed.replace(/\D/g, "")}?`;
              newMode = "awaiting_phone";
            }
            // --- PRICE request for TV / decorative panels ---
            else if (/(сколько стоит|цена|pret|preț|cost|cat costa|цену|цене|prețul)/i.test(trimmed) &&
                     /(тв|tv|телевизор|televizor|media|медиа|декоративн|panou|perete|3d.*панел|изголовье)/i.test(trimmed)) {
              response = currentLang === "ro"
                ? `Acest produs se calculează ca proiect individual și complex, care necesită atenția maximă a designerului!\n\nDescrieți mai jos preferințele dvs. pentru produs — lățimea, înălțimea, caracterul decorativ, locul amplasării, elementele dorite (consolă suspendată pentru TV, noptieră, masă de lucru/birou).\n\nSau atașați o imagine în WhatsApp cu descrierea. De asemenea, puteți avea încredere în ideea designerului!`
                : `Данное изделие рассчитывается как индивидуальный и сложный проект, который требует к себе максимального внимания дизайнера!\n\nОпишите ниже ваши предпочтения к изделию — ширину, высоту, декоративный характер, место расположения, желаемые элементы (подвесная консоль для ТВ, прикроватная тумба, стол рабочий/письменный).\n\nИли прикрепите изображение в WhatsApp с описанием. Также вы можете довериться идее самого дизайнера!`;
              newMode = "tv_wall_inquiry";
            }
            // --- NORMAL chat ---
            else {
              const lowerTrimmed = trimmed.toLowerCase();

              // Product keyword detection (general mentions)
              {
                const productKeywords: Record<string, string> = {
                  шкаф: "шкаф", dulap: "шкаф", cupe: "шкаф", купе: "шкаф", "шкафы": "шкаф",
                  кухня: "кухня", bucatarie: "кухня", bucătărie: "кухня", kitchen: "кухня",
                  гардеробная: "гардеробная", dressing: "гардеробная", "гардеробные": "гардеробная",
                  "тв-зона": "ТВ-зона", "тв зона": "ТВ-зона", tv: "ТВ-зона", телевизор: "ТВ-зона", televizor: "ТВ-зона",
                  стена: "стена", perete: "стена", "декоративная стена": "стена", "3d панель": "стена",
                };
                let foundProduct = "";
                for (const [kw, prod] of Object.entries(productKeywords)) {
                  if (lowerTrimmed.includes(kw)) { foundProduct = prod; break; }
                }

                if (foundProduct === "шкаф" || foundProduct === "кухня") {
                  // General mention (not price-specific) → direct to calculator quick actions
                  response = currentLang === "ro"
                    ? `Mai jos pentru dvs. am pregătit un răspuns simplu la întrebările dvs., derulați în jos în chat și veți găsi secțiunea "ACȚIUNI RAPIDE", alegeți calculatorul potrivit pentru dvs. și răspundeți la întrebări, dacă printre întrebări nu găsiți un răspuns potrivit pentru dvs., puteți contacta direct designerul la numărul +373 60 599 907 sau prin WhatsApp!`
                    : `Ниже для вас мы подготовили простой вариант на ответы по вашим вопросам, спуститесь ниже в чате вы найдете раздел "БЫСТРЫЕ ДЕЙСТВИЯ", выбирете подходящую для вас калькулятор и ответьте на вопросы, если в вопросах вы ненайдете подходящего ответа для вас вы можете связаться напрямую с дизайнером по номеру +373 60 599 907 или через WhatsApp!`;
                } else if (foundProduct && !mode.startsWith("wizard")) {
                // ENTER WIZARD MODE (other products)
                const wState = createEmptyWizard();
                wState.product = foundProduct;
                setWizardState(wState);
                setContextProduct(foundProduct);
                newMode = "wizard_width";
                response = currentLang === "ro"
                  ? `Excelentă alegere — ${foundProduct}!\n\n${productInfo(currentLang, foundProduct)}\n\nSă colectăm detaliile. Lățimea:`
                  : `Отличный выбор — ${foundProduct}!\n\n${productInfo(currentLang, foundProduct)}\n\nДавайте соберём детали. Ширина:`;
              } else {
                const history = newMessages.slice(-6).map(m => m.content);
                // Try GPT first, fallback to local RAG engine
                try {
                  response = await fetchGptReply(currentLang, trimmed, history);
                } catch {
                  response = generateResponse(currentLang, trimmed, history);
                }
                // Extract and save product from response if found
                if (foundProduct) {
                  setContextProduct(foundProduct);
                  setDialogStep(0);
                }
              }
            }
            }
            break;
          }
        }

        setMode(newMode);
        if (!skipMessage) {
          setMessages(prev => [...prev, { role: "assistant", content: response, timestamp: Date.now() }]);
        }
      } catch {
        const fb = currentLang === "ro"
          ? `Pentru acest detaliu vă recomand consultarea cu designerul.\n📱 WhatsApp: +373 60 599 907\n📧 ${EMAIL_ADDRESS}`
          : `Для этого вопроса рекомендую консультацию с дизайнером.\n📱 WhatsApp: +373 60 599 907\n📧 ${EMAIL_ADDRESS}`;
        setMessages(prev => [...prev, { role: "assistant", content: fb, timestamp: Date.now() }]);
      } finally {
        setIsLoading(false);
      }
    }, 400);
  }, [messages, isLoading, lang, mode, calculator, sendToWhatsApp, contextProduct, dialogStep, wizardState, wizardStep]);

  // ===== CALCULATOR FLOW =====
  const startCalculator = useCallback(() => {
    setCalculator({ size: 0, height: "", style: "", material: "", countertop: "", extras: [], notes: "", type: "" });
    setMode("calculator_size");
    setMessages(prev => [...prev, {
      role: "assistant",
      content: lang === "ro"
        ? "🧮 Calculator bucătărie. Pasul 1: Dimensiunea în metri liniari (ex: 3.5, 4, 5):"
        : "🧮 Калькулятор кухни. Шаг 1: Введите размер в погонных метрах (например: 3.5, 4, 5):",
      timestamp: Date.now(),
    }]);
  }, [lang]);

  const startClosetCalculator = useCallback(() => {
    setCalculator({ size: 0, height: "", style: "", material: "", countertop: "", extras: [], notes: "", type: "" });
    setMode("closet_size");
    setMessages(prev => [...prev, {
      role: "assistant",
      content: lang === "ro"
        ? "🧮 Calculator dulap. Pasul 1: Dimensiunea în metri liniari (ex: 3.5, 4, 5):"
        : "🧮 Калькулятор шкаф. Шаг 1: Введите размер в погонных метрах (например: 3.5, 4, 5):",
      timestamp: Date.now(),
    }]);
  }, [lang]);

  const startDesignGeneration = useCallback(() => {
    setMode("generating_design");
    setGeneratedImage(null);
    setMessages(prev => [...prev, {
      role: "assistant",
      content: lang === "ro"
        ? "🎨 Descrieți bucătăria visurilor dvs. (stil, culori, materiale, dimensiuni):"
        : "🎨 Опишите кухню вашей мечты (стиль, цвета, материалы, размеры):",
      timestamp: Date.now(),
    }]);
  }, [lang]);

  const selectCalcOption = useCallback((value: string) => {
    sendMessage(value);
  }, [sendMessage]);

  const clearChat = useCallback(() => {
    const currentLang = lang as "ru" | "ro";
    setMessages([{ role: "assistant", content: currentLang === "ro" ? WELCOME_RO : WELCOME_RU, timestamp: Date.now() }]);
    setMode("chat");
    setGeneratedImage(null);
    setWizardState(createEmptyWizard());
    setWizardStep("width");
    setContextProduct("");
    setDialogStep(0);
    setCalculator({ size: 0, height: "", style: "", material: "", countertop: "", extras: [], notes: "", type: "" });
    lastCalcResultRef.current = "";
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
  }, [lang]);

  const currentLang = lang as "ru" | "ro";
  const quickQuestions = currentLang === "ro" ? QUICK_RO : QUICK_RU;
  const showQuickQuestions = !isLoading && mode === "chat" && messages[messages.length - 1]?.role === "assistant";
  const showProjectSend = (mode === "calculator_result" || mode === "closet_result") && !isLoading;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110"
        style={{
          background: isOpen ? "#1a1a1a" : "linear-gradient(135deg, #D6C1A3, #C4A882)",
          border: "2px solid rgba(214,193,163,0.3)",
        }}
      >
        {isOpen ? <X className="w-6 h-6" style={{ color: "#f5f3ef" }} /> : <MessageCircle className="w-6 h-6" style={{ color: "#111" }} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-5 z-50 w-[440px] max-w-[calc(100vw-2.5rem)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{
            height: "640px",
            background: "rgba(14,14,14,0.97)",
            border: "1px solid rgba(214,193,163,0.12)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-3.5 shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(214,193,163,0.12), rgba(214,193,163,0.04))",
              borderBottom: "1px solid rgba(214,193,163,0.1)",
            }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(214,193,163,0.25), rgba(214,193,163,0.1))" }}>
              <Bot className="w-5 h-5" style={{ color: "#D6C1A3" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: "#F5F2ED", fontFamily: "'Playfair Display', serif" }}>NobilForm AI</div>
              <div className="text-xs truncate" style={{ color: "rgba(245,242,237,0.45)" }}>
                {mode === "awaiting_phone" ? (currentLang === "ro" ? "Aștept numărul..." : "Ожидаю номер...")
                  : mode === "tv_wall_inquiry" ? (currentLang === "ro" ? "Proiect individual" : "Индивидуальный проект")
                    : mode === "designer_visit" ? (currentLang === "ro" ? "Designer la domiciliu" : "Вызов дизайнера")
                      : mode.startsWith("closet") ? (currentLang === "ro" ? "Calculator dulap" : "Калькулятор шкафа")
                        : mode.startsWith("wizard") ? `${wizardState.product || (currentLang === "ro" ? "Colectare detalii" : "Сбор деталей")}`
                          : mode.startsWith("calculator") ? (currentLang === "ro" ? "Calculator bucătărie" : "Калькулятор кухни")
                            : mode === "generating_design" ? (currentLang === "ro" ? "Design..." : "Дизайн...")
                              : (currentLang === "ro" ? "Consultant Premium" : "Премиум консультант")
                }
              </div>
            </div>

            {voice.supported && (
              <button onClick={toggleVoice} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ background: voice.isListening ? "rgba(239,68,68,0.2)" : "rgba(214,193,163,0.08)", border: `1px solid ${voice.isListening ? "rgba(239,68,68,0.3)" : "rgba(214,193,163,0.12)"}` }}>
                {voice.isListening ? <MicOff className="w-4 h-4" style={{ color: "#ef4444" }} /> : <Mic className="w-4 h-4" style={{ color: "#D6C1A3" }} />}
              </button>
            )}

            <div className="w-2 h-2 rounded-full shrink-0" style={{
              background: isLoading ? "#f59e0b" : (mode === "awaiting_phone" || mode === "tv_wall_inquiry") ? "#60a5fa" : "#4ade80",
              boxShadow: isLoading ? "0 0 6px #f59e0b" : (mode === "awaiting_phone" || mode === "tv_wall_inquiry") ? "0 0 6px #60a5fa" : "0 0 6px #4ade80",
            }} />

            {messages.length > 1 && (
              <button onClick={clearChat} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70 shrink-0" style={{ background: "rgba(245,242,237,0.04)" }}>
                <Trash2 className="w-3.5 h-3.5" style={{ color: "rgba(245,242,237,0.4)" }} />
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ background: msg.role === "user" ? "rgba(214,193,163,0.2)" : "rgba(214,193,163,0.1)" }}>
                  {msg.role === "user" ? <User className="w-4 h-4" style={{ color: "#D6C1A3" }} /> : <Bot className="w-4 h-4" style={{ color: "#D6C1A3" }} />}
                </div>
                <div className="max-w-[82%] space-y-1">
                  <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line" style={{
                    background: msg.role === "user" ? "rgba(214,193,163,0.12)"
                      : mode === "awaiting_phone" && msg.role === "assistant" && i === messages.length - 1 ? "rgba(96,165,250,0.06)"
                        : mode.startsWith("calculator") && msg.role === "assistant" ? "rgba(168,130,80,0.06)"
                          : "rgba(245,242,237,0.03)",
                    color: "#F5F2ED",
                    border: msg.role === "user" ? "1px solid rgba(214,193,163,0.15)"
                      : mode === "awaiting_phone" && msg.role === "assistant" && i === messages.length - 1 ? "1px solid rgba(96,165,250,0.15)"
                        : "1px solid rgba(245,242,237,0.05)",
                  }}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {/* Generated Image — protected from download/screenshot */}
            {generatedImage && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ background: "rgba(168,130,80,0.15)" }}>
                  <ImageIcon className="w-4 h-4" style={{ color: "#D6C1A3" }} />
                </div>
                <div className="max-w-[82%] relative select-none" style={{ pointerEvents: "none", userSelect: "none", WebkitUserSelect: "none" }}>
                  <img
                    src={generatedImage}
                    alt="Kitchen design preview"
                    className="rounded-xl w-full"
                    style={{ border: "1px solid rgba(214,193,163,0.15)", pointerEvents: "none", userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
                    draggable={false}
                  />
                  <div className="absolute inset-0 rounded-xl" style={{ background: "transparent" }} />
                </div>
              </div>
            )}

            {/* Note input hint for calculator_notes step */}
            {mode === "calculator_notes" && !isLoading && (
              <div className="mx-10 space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: "rgba(168,130,80,0.06)", color: "#D6C1A3", border: "1px solid rgba(214,193,163,0.12)" }}>
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  {currentLang === "ro"
                    ? "Descrieți corecțiile, sugestiile sau comentariile dvs."
                    : "Опишите корректировки, пожелания или комментарии."}
                </div>
              </div>
            )}

            {/* ===== ШКАФ — Кнопки для каждого шага ===== */}
            {mode === "closet_type" && !isLoading && (
              <CalculatorOptions
                options={currentLang === "ro" ? CLOSET_TYPES_RO : CLOSET_TYPES_RU}
                onSelect={selectCalcOption}
                lang={currentLang}
                title={currentLang === "ro" ? "Alegeți tipul:" : "Выберите тип:"}
              />
            )}
            {mode === "closet_material" && !isLoading && (
              <CalculatorOptions
                options={currentLang === "ro" ? CLOSET_MATERIALS_RO : CLOSET_MATERIALS_RU}
                onSelect={selectCalcOption}
                lang={currentLang}
                title={currentLang === "ro" ? "Alegeți materialul:" : "Выберите материал:"}
              />
            )}
            {mode === "closet_color" && !isLoading && (
              <CalculatorOptions
                options={currentLang === "ro" ? CLOSET_COLORS_RO : CLOSET_COLORS_RU}
                onSelect={(id) => { if (id === "другой") { /* user will type manually */ } else { selectCalcOption(id); } }}
                lang={currentLang}
                title={currentLang === "ro" ? "Alegeți culoarea:" : "Выберите цвет:"}
              />
            )}
            {mode === "closet_doors" && !isLoading && (
              <CalculatorOptions
                options={currentLang === "ro" ? CLOSET_DOORS_RO : CLOSET_DOORS_RU}
                onSelect={selectCalcOption}
                lang={currentLang}
                title={currentLang === "ro" ? "Alegeți tipul ușilor:" : "Выберите тип фасадов:"}
              />
            )}
            {mode === "closet_notes" && !isLoading && (
              <div className="mx-10 space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: "rgba(168,130,80,0.06)", color: "#D6C1A3", border: "1px solid rgba(214,193,163,0.12)" }}>
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  {currentLang === "ro"
                    ? "Ex: fațade combinate PAL cu oglindă, sticlă cu LED, MDF vopsit/frezat..."
                    : "Например: комбинированные ДСП с зеркалом, стекло с LED, МДФ крашеный/фрезерованный..."}
                </div>
              </div>
            )}

            {/* Closet Edit Form */}
            {mode === "closet_edit" && (
              <ClosetEditForm
                calculator={calculator}
                lang={currentLang}
                onSave={(updated) => {
                  setCalculator(updated);
                  const result = calculateCloset(updated);
                  const formatted = formatClosetResult(currentLang, updated, result);
                  lastCalcResultRef.current = formatted;
                  setMessages(prev => [...prev, {
                    role: "assistant",
                    content: (currentLang === "ro" ? "✅ Corecții salvate!\n\n" : "✅ Корректировки сохранены!\n\n") + formatted,
                    timestamp: Date.now(),
                  }]);
                  setMode("closet_result");
                }}
                onCancel={() => setMode("closet_result")}
              />
            )}

            {mode === "calculator_style" && !isLoading && (
              <CalculatorOptions options={CALC_STYLES.map(s => ({ id: s.id, label: currentLang === "ro" ? s.ro : s.ru }))} onSelect={selectCalcOption} lang={currentLang} title={currentLang === "ro" ? "Alegeți stilul:" : "Выберите стиль:"} />
            )}
            {mode === "calculator_material" && !isLoading && (
              <CalculatorOptions options={CALC_MATERIALS.map(m => ({ id: m.id, label: currentLang === "ro" ? m.ro : m.ru }))} onSelect={selectCalcOption} lang={currentLang} title={currentLang === "ro" ? "Alegeți materialul:" : "Выберите материал:"} />
            )}
            {mode === "calculator_countertop" && !isLoading && (
              <CalculatorOptions options={CALC_COUNTERtops.map(c => ({ id: c.id, label: currentLang === "ro" ? c.ro : c.ru }))} onSelect={selectCalcOption} lang={currentLang} title={currentLang === "ro" ? "Alegeți blatul:" : "Выберите столешницу:"} />
            )}
            {mode === "calculator_extras" && !isLoading && (
              <CalculatorOptions options={[
                ...CALC_EXTRAS.map(e => ({ id: e.id, label: currentLang === "ro" ? e.ro : e.ru })),
                { id: "skip", label: currentLang === "ro" ? "✓ Fără extra" : "✓ Без дополнений" },
              ]} onSelect={(id) => selectCalcOption(id === "skip" ? (currentLang === "ro" ? "nu" : "нет") : id)} lang={currentLang} title={currentLang === "ro" ? "Opțiuni suplimentare:" : "Дополнительные опции:"} />
            )}

            {/* Wizard — Material Buttons (ШКАФ) */}
            {mode === "wizard_material" && !isLoading && (
              <div className="mx-10 space-y-2">
                <div className="text-xs" style={{ color: "rgba(214,193,163,0.5)" }}>
                  {currentLang === "ro" ? "Alegeți materialul:" : "Выберите материал:"}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(currentLang === "ro" ? WIZARD_MATERIALS_RO : WIZARD_MATERIALS_RU).map((m) => (
                    <button key={m.id} onClick={() => sendMessage(m.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105" style={{ background: "rgba(168,130,80,0.08)", color: "#D6C1A3", border: "1px solid rgba(214,193,163,0.12)" }}>
                      <ChevronRight className="w-3 h-3" />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Wizard — Door Type Buttons (ШКАФ) */}
            {mode === "wizard_doors" && !isLoading && (
              <div className="mx-10 space-y-2">
                <div className="text-xs" style={{ color: "rgba(214,193,163,0.5)" }}>
                  {currentLang === "ro" ? "Alegeți tipul ușilor:" : "Выберите тип дверей:"}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(currentLang === "ro" ? WIZARD_DOORS_RO : WIZARD_DOORS_RU).map((d) => (
                    <button key={d.id} onClick={() => sendMessage(d.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105" style={{ background: "rgba(168,130,80,0.08)", color: "#D6C1A3", border: "1px solid rgba(214,193,163,0.12)" }}>
                      <ChevronRight className="w-3 h-3" />
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(214,193,163,0.08)" }}>
                  <Bot className="w-4 h-4" style={{ color: "#D6C1A3" }} />
                </div>
                <div className="px-4 py-2.5 rounded-2xl" style={{ background: "rgba(245,242,237,0.03)", border: "1px solid rgba(245,242,237,0.05)" }}>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#D6C1A3", animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#D6C1A3", animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#D6C1A3", animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {isGeneratingImage && (
              <div className="flex gap-2 items-center px-4 py-2 rounded-xl" style={{ background: "rgba(168,130,80,0.06)", border: "1px solid rgba(214,193,163,0.1)" }}>
                <Sparkles className="w-4 h-4 animate-spin" style={{ color: "#D6C1A3" }} />
                <span className="text-xs" style={{ color: "#D6C1A3" }}>{currentLang === "ro" ? "Pregătesc conceptul..." : "Готовлю концепт..."}</span>
              </div>
            )}

            {/* Вызов дизайнера на дом — подсказка */}
            {mode === "designer_visit" && !isLoading && (
              <div className="mx-10 space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: "rgba(168,130,80,0.06)", color: "#D6C1A3", border: "1px solid rgba(214,193,163,0.12)" }}>
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  {currentLang === "ro"
                    ? "Ex: str. Pușkin 15, apart. 42, 060123456"
                    : "Например: ул. Пушкина 15, кв. 42, 060123456"}
                </div>
              </div>
            )}

            {/* ТВ-зона & Декоративные панели — кнопки WhatsApp + Email */}
            {mode === "tv_wall_inquiry" && !isLoading && (
              <div className="mx-10 space-y-2 pt-1">
                <div className="text-xs" style={{ color: "rgba(214,193,163,0.5)", letterSpacing: "1.5px", textTransform: "uppercase", fontSize: "9px" }}>
                  {currentLang === "ro" ? "Contactați designerul" : "Связаться с дизайнером"}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      const waText = currentLang === "ro"
                        ? `Bună! Sunt interesat de o zonă TV / panouri decorative.\n\nAm văzut pe site NobilForm că acest produs se calculează individual.\n\nRog să mă contactați pentru discutarea detaliilor.\n\nPreferințele mele:\n[lăsați gol sau completați]`
                        : `Здравствуйте! Меня интересует ТВ-зона / декоративные панели.\n\nУвидел на сайте NobilForm, что это изделие рассчитывается индивидуально.\n\nПрошу связаться со мной для обсуждения деталей.\n\nМои предпочтения:\n[оставьте пустым или заполните]`;
                      openWhatsAppDirect(WHATSAPP_NUMBER, waText);
                    }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
                    style={{ background: "rgba(37,211,102,0.08)", color: "#25d366", border: "1px solid rgba(37,211,102,0.15)" }}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => {
                      const subject = encodeURIComponent(currentLang === "ro" ? "Proiect Zonă TV / Panouri Decorative" : "Проект ТВ-зона / Декоративные панели");
                      const body = encodeURIComponent(
                        currentLang === "ro"
                          ? `Bună!\n\nSunt interesat de un proiect personalizat pentru zonă TV sau panouri decorative.\n\nAm văzut pe site-ul NobilForm că acest produs necesită consultare cu designerul.\n\nVă rog să mă contactați pentru discuții.\n\nPreferințele mele:\n[lăsați gol sau completați]`
                          : `Здравствуйте!\n\nМеня интересует индивидуальный проект ТВ-зоны или декоративных панелей.\n\nУвидел на сайте NobilForm, что это изделие требует консультации с дизайнером.\n\nПрошу связаться со мной для обсуждения.\n\nМои предпочтения:\n[оставьте пустым или заполните]`
                      );
                      window.open(`mailto:${EMAIL_ADDRESS}?subject=${subject}&body=${body}`, "_blank");
                    }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
                    style={{ background: "rgba(59,130,246,0.08)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.15)" }}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </button>
                </div>
              </div>
            )}

            {/* Phone mode hint */}
            {mode === "awaiting_phone" && !isLoading && (
              <div className="mx-10 space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: "rgba(96,165,250,0.06)", color: "#93bbfc", border: "1px solid rgba(96,165,250,0.12)" }}>
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  {currentLang === "ro" ? "Introduceți numărul — deschideți WhatsApp pentru a trimite" : "Введите номер — откроется WhatsApp для отправки"}
                </div>
                <button
                  onClick={() => window.open(`tel:+37360599907`, "_blank")}
                  className="w-full flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(37,211,102,0.06)", color: "#25d366", border: "1px solid rgba(37,211,102,0.12)" }}
                >
                  <Phone className="w-3.5 h-3.5" />
                  {currentLang === "ro" ? "Sunați direct: +373 60 599 907" : "Позвонить напрямую: +373 60 599 907"}
                </button>
              </div>
            )}

            {/* Send Project Buttons (after calculator result) */}
            {showProjectSend && (
              <div className="mx-10 space-y-2 pt-1">
                <div className="text-xs" style={{ color: "rgba(214,193,163,0.5)", letterSpacing: "1.5px", textTransform: "uppercase", fontSize: "9px" }}>
                  {currentLang === "ro" ? "Trimiteți proiectul" : "Отправить проект"}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => sendToWhatsApp("project")} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105" style={{ background: "rgba(37,211,102,0.08)", color: "#25d366", border: "1px solid rgba(37,211,102,0.15)" }}>
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp
                  </button>
                  <button onClick={sendToEmail} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105" style={{ background: "rgba(59,130,246,0.08)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.15)" }}>
                    <Mail className="w-3.5 h-3.5" />
                    Email
                  </button>
                  <button onClick={() => setMode(mode === "closet_result" ? "closet_edit" : "calculator_edit")} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105" style={{ background: "rgba(245,242,237,0.05)", color: "#D6C1A3", border: "1px solid rgba(214,193,163,0.15)" }}>
                    <Sparkles className="w-3.5 h-3.5" />
                    {currentLang === "ro" ? "Corectează" : "Корректировать"}
                  </button>
                </div>
              </div>
            )}

            {/* Calculator Edit Form */}
            {mode === "calculator_edit" && (
              <CalculatorEditForm
                calculator={calculator}
                lang={currentLang}
                onSave={(updated) => {
                  setCalculator(updated);
                  const result = calculateKitchen(updated);
                  const formatted = formatResult(currentLang, updated, result);
                  lastCalcResultRef.current = formatted;
                  setMessages(prev => [...prev, {
                    role: "assistant",
                    content: (currentLang === "ro" ? "✅ Corecții salvate!\n\n" : "✅ Корректировки сохранены!\n\n") + formatted,
                    timestamp: Date.now(),
                  }]);
                  setMode("calculator_result");
                }}
                onCancel={() => setMode("calculator_result")}
              />
            )}

            {/* Quick Questions */}
            {showQuickQuestions && (
              <div className="pt-1 space-y-2">
                <div className="px-1" style={{ color: "rgba(214,193,163,0.5)", letterSpacing: "1.5px", textTransform: "uppercase", fontSize: "9px" }}>
                  {currentLang === "ro" ? "Acțiuni rapide" : "Быстрые действия"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q) => (
                    <button key={q.text} type="button" onClick={() => {
                      if (q.text.includes("кухн") || q.text.includes("bucătăria")) {
                        startCalculator();
                      } else if (q.text.includes("шкаф") || q.text.includes("dulapul")) startClosetCalculator();
                      else if (q.text.includes("Сгенерировать") || q.text.includes("Generează")) startDesignGeneration();
                      else if (q.text.includes("дизайнера") || q.text.includes("Designer la domiciliu")) {
                        setMode("designer_visit");
                        setMessages(prev => [...prev, {
                          role: "assistant",
                          content: lang === "ro"
                            ? "Vizita designerului la domiciliu.\n\nScrieți adresa și lăsați numărul dvs. de contact:"
                            : "Вызов дизайнера на дом.\n\nНапишите адрес и оставьте свой контактный номер телефона:",
                          timestamp: Date.now(),
                        }]);
                      }
                      else sendMessage(q.text);
                    }} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105" style={{ background: "rgba(214,193,163,0.06)", color: "#D6C1A3", border: "1px solid rgba(214,193,163,0.12)" }}>
                      <q.icon className="w-3.5 h-3.5" />
                      {q.text}
                    </button>
                  ))}
                </div>

                <button onClick={() => sendToWhatsApp("project")} className="w-full flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-xl transition-all hover:scale-[1.02]" style={{ background: "rgba(37,211,102,0.08)", color: "#25d366", border: "1px solid rgba(37,211,102,0.15)" }}>
                  <MessageSquare className="w-3.5 h-3.5" />
                  {currentLang === "ro" ? "Continuă pe WhatsApp" : "Продолжить в WhatsApp"}
                </button>
              </div>
            )}

            {/* Design generation examples */}
            {mode === "generating_design" && !isLoading && !isGeneratingImage && (
              <div className="flex flex-wrap gap-2 mx-10">
                {(currentLang === "ro"
                  ? ["Bucătărie modernă 4m, alb mat", "Japandi 3.5m, lemn deschis", "Lux dark 5m, blat marmură"]
                  : ["Современная кухня 4м, белый мат", "Japandi 3.5м, светлое дерево", "Тёмный люкс 5м, мрамор"]
                ).map((example) => (
                  <button key={example} onClick={() => { setInput(example); }} className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105" style={{ background: "rgba(168,130,80,0.08)", color: "#D6C1A3", border: "1px solid rgba(214,193,163,0.12)" }}>
                    {example}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); if (mode === "generating_design" && input.trim()) { sendMessage(input.trim()); } else { sendMessage(input); } }} className="px-4 py-3 shrink-0 flex gap-2" style={{ borderTop: "1px solid rgba(214,193,163,0.08)", background: "rgba(10,10,10,0.8)" }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "awaiting_phone" ? (currentLang === "ro" ? "Număr..." : "Номер...")
                  : mode.startsWith("calculator") ? (currentLang === "ro" ? "Scrieți sau selectați..." : "Напишите или выберите...")
                    : mode === "generating_design" ? (currentLang === "ro" ? "Descrieți..." : "Опишите...")
                      : (currentLang === "ro" ? "Scrieți mesajul..." : "Напишите сообщение...")
              }
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: mode === "awaiting_phone" ? "rgba(96,165,250,0.05)" : mode === "generating_design" ? "rgba(168,130,80,0.05)" : "rgba(245,242,237,0.03)",
                color: "#F5F2ED",
                border: mode === "awaiting_phone" ? "1px solid rgba(96,165,250,0.15)" : mode === "generating_design" ? "1px solid rgba(214,193,163,0.12)" : "1px solid rgba(214,193,163,0.08)",
              }}
              disabled={isLoading || isGeneratingImage}
            />
            <button type="submit" disabled={isLoading || isGeneratingImage || !input.trim()} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40 shrink-0" style={{ background: mode === "generating_design" ? "linear-gradient(135deg, #D6C1A3, #C4A882)" : mode === "awaiting_phone" ? "#60a5fa" : "#D6C1A3" }}>
              <Send className="w-4 h-4" style={{ color: mode === "awaiting_phone" ? "#fff" : "#111" }} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

// ===== CALCULATOR EDIT FORM =====
function CalculatorEditForm({
  calculator,
  lang,
  onSave,
  onCancel,
}: {
  calculator: CalculatorState;
  lang: "ru" | "ro";
  onSave: (updated: CalculatorState) => void;
  onCancel: () => void;
}) {
  const [edit, setEdit] = useState<CalculatorState>({ ...calculator });
  // Size is stored as string during editing to allow "3." or "4," while typing
  const [sizeInput, setSizeInput] = useState<string>(String(calculator.size));

  const labelSize = lang === "ro" ? "Dimensiune (m)" : "Размер (м)";
  const labelHeight = lang === "ro" ? "Înălțime" : "Высота";
  const labelStyle = lang === "ro" ? "Stil" : "Стиль";
  const labelMaterial = lang === "ro" ? "Material" : "Материал";
  const labelCountertop = lang === "ro" ? "Blat" : "Столешница";
  const labelExtras = lang === "ro" ? "Opțiuni extra" : "Доп. опции";
  const labelNotes = lang === "ro" ? "Comentarii / corecții" : "Комментарии / корректировки";
  const btnSave = lang === "ro" ? "Salvează corecțiile" : "Сохранить корректировки";
  const btnCancel = lang === "ro" ? "Anulează" : "Отмена";

  const toggleExtra = (id: string) => {
    setEdit(prev => ({
      ...prev,
      extras: prev.extras.includes(id)
        ? prev.extras.filter(e => e !== id)
        : [...prev.extras, id],
    }));
  };

  return (
    <div className="mx-10 space-y-3 p-4 rounded-xl" style={{ background: "rgba(168,130,80,0.04)", border: "1px solid rgba(214,193,163,0.12)" }}>
      <div className="text-xs font-medium" style={{ color: "#D6C1A3", letterSpacing: "1px", textTransform: "uppercase" }}>
        {lang === "ro" ? "Editare parametri" : "Редактирование параметров"}
      </div>

      {/* Размер */}
      <div className="space-y-1">
        <label className="text-xs block" style={{ color: "rgba(245,242,237,0.6)" }}>{labelSize}</label>
        <input
          type="text"
          inputMode="decimal"
          value={sizeInput}
          onChange={e => {
            let val = e.target.value.replace(",", ".");
            // Allow: empty, "3", "3.", "3.5" — block second dot
            const parts = val.split(".");
            if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
            // Allow only digits and one dot
            if (!/^\d*\.?\d*$/.test(val)) return;
            setSizeInput(val);
            const num = parseFloat(val);
            setEdit(prev => ({ ...prev, size: isNaN(num) ? 0 : num }));
          }}
          placeholder={lang === "ro" ? "ex: 3.5 sau 4,2" : "например: 3.5 или 4,2"}
          className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ background: "rgba(245,242,237,0.05)", color: "#F5F2ED", border: "1px solid rgba(214,193,163,0.1)" }}
        />
      </div>

      {/* Высота */}
      <div className="space-y-1">
        <label className="text-xs block" style={{ color: "rgba(245,242,237,0.6)" }}>{labelHeight}</label>
        <input
          type="text"
          value={edit.height}
          onChange={e => setEdit(prev => ({ ...prev, height: e.target.value }))}
          className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ background: "rgba(245,242,237,0.05)", color: "#F5F2ED", border: "1px solid rgba(214,193,163,0.1)" }}
        />
      </div>

      {/* Стиль */}
      <div className="space-y-1">
        <label className="text-xs block" style={{ color: "rgba(245,242,237,0.6)" }}>{labelStyle}</label>
        <select
          value={edit.style}
          onChange={e => setEdit(prev => ({ ...prev, style: e.target.value }))}
          className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ background: "rgba(245,242,237,0.05)", color: "#F5F2ED", border: "1px solid rgba(214,193,163,0.1)" }}
        >
          {CALC_STYLES.map(s => (
            <option key={s.id} value={s.id} style={{ background: "#1a1a1a" }}>
              {lang === "ro" ? s.ro : s.ru}
            </option>
          ))}
        </select>
      </div>

      {/* Материал */}
      <div className="space-y-1">
        <label className="text-xs block" style={{ color: "rgba(245,242,237,0.6)" }}>{labelMaterial}</label>
        <select
          value={edit.material}
          onChange={e => setEdit(prev => ({ ...prev, material: e.target.value }))}
          className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ background: "rgba(245,242,237,0.05)", color: "#F5F2ED", border: "1px solid rgba(214,193,163,0.1)" }}
        >
          {CALC_MATERIALS.map(m => (
            <option key={m.id} value={m.id} style={{ background: "#1a1a1a" }}>
              {lang === "ro" ? m.ro : m.ru}
            </option>
          ))}
        </select>
      </div>

      {/* Столешница */}
      <div className="space-y-1">
        <label className="text-xs block" style={{ color: "rgba(245,242,237,0.6)" }}>{labelCountertop}</label>
        <select
          value={edit.countertop}
          onChange={e => setEdit(prev => ({ ...prev, countertop: e.target.value }))}
          className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ background: "rgba(245,242,237,0.05)", color: "#F5F2ED", border: "1px solid rgba(214,193,163,0.1)" }}
        >
          {CALC_COUNTERtops.map(c => (
            <option key={c.id} value={c.id} style={{ background: "#1a1a1a" }}>
              {lang === "ro" ? c.ro : c.ru}
            </option>
          ))}
        </select>
      </div>

      {/* Доп. опции — чекбоксы */}
      <div className="space-y-1.5">
        <label className="text-xs block" style={{ color: "rgba(245,242,237,0.6)" }}>{labelExtras}</label>
        <div className="flex flex-wrap gap-2">
          {CALC_EXTRAS.map(ex => (
            <label key={ex.id} className="flex items-center gap-1.5 text-xs cursor-pointer px-2 py-1 rounded-lg" style={{ background: edit.extras.includes(ex.id) ? "rgba(168,130,80,0.12)" : "rgba(245,242,237,0.03)", color: edit.extras.includes(ex.id) ? "#D6C1A3" : "rgba(245,242,237,0.4)", border: "1px solid rgba(214,193,163,0.1)" }}>
              <input
                type="checkbox"
                checked={edit.extras.includes(ex.id)}
                onChange={() => toggleExtra(ex.id)}
                className="rounded"
              />
              {lang === "ro" ? ex.ro : ex.ru}
            </label>
          ))}
        </div>
      </div>

      {/* Комментарии */}
      <div className="space-y-1">
        <label className="text-xs block" style={{ color: "rgba(245,242,237,0.6)" }}>{labelNotes}</label>
        <textarea
          value={edit.notes}
          onChange={e => setEdit(prev => ({ ...prev, notes: e.target.value }))}
          rows={2}
          className="w-full px-3 py-1.5 rounded-lg text-sm outline-none resize-none"
          style={{ background: "rgba(245,242,237,0.05)", color: "#F5F2ED", border: "1px solid rgba(214,193,163,0.1)" }}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave(edit)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all hover:scale-[1.02] font-medium"
          style={{ background: "linear-gradient(135deg, #D6C1A3, #C4A882)", color: "#111" }}
        >
          {btnSave}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all hover:scale-[1.02]"
          style={{ background: "rgba(245,242,237,0.05)", color: "rgba(245,242,237,0.5)", border: "1px solid rgba(245,242,237,0.1)" }}
        >
          {btnCancel}
        </button>
      </div>
    </div>
  );
}

// ===== CLOSET EDIT FORM =====
function ClosetEditForm({
  calculator,
  lang,
  onSave,
  onCancel,
}: {
  calculator: CalculatorState;
  lang: "ru" | "ro";
  onSave: (updated: CalculatorState) => void;
  onCancel: () => void;
}) {
  const [edit, setEdit] = useState<CalculatorState>({ ...calculator });
  const [sizeInput, setSizeInput] = useState<string>(String(calculator.size));

  const lSize = lang === "ro" ? "Dimensiune (m)" : "Размер (м)";
  const lHeight = lang === "ro" ? "Înălțime" : "Высота";
  const lType = lang === "ro" ? "Tip" : "Тип";
  const lMaterial = lang === "ro" ? "Material" : "Материал";
  const lColor = lang === "ro" ? "Culoare" : "Цвет";
  const lDoors = lang === "ro" ? "Tip uși" : "Тип фасадов";
  const lNotes = lang === "ro" ? "Comentarii" : "Комментарии";
  const btnSave = lang === "ro" ? "Salvează corecțiile" : "Сохранить корректировки";
  const btnCancel = lang === "ro" ? "Anulează" : "Отмена";

  const TYPES = lang === "ro"
    ? [{ id: "встроенный", label: "Încorporat" }, { id: "отдельностоящий", label: "Independent" }]
    : [{ id: "встроенный", label: "Встроенный" }, { id: "отдельностоящий", label: "Отдельностоящий" }];

  const MATERIALS = lang === "ro"
    ? [{ id: "egger", label: "PAL EGGER" }, { id: "agt", label: "AGT MDF laminat" }, { id: "matte", label: "MDF vopsit mat" }, { id: "glossy", label: "MDF vopsit lucios" }, { id: "veneer", label: "MDF furnir" }, { id: "mirror", label: "Oglindă" }, { id: "glass", label: "Sticlă" }]
    : [{ id: "egger", label: "ДСП EGGER" }, { id: "agt", label: "AGT МДФ ламинат" }, { id: "matte", label: "МДФ крашенный мат" }, { id: "glossy", label: "МДФ крашенный глянец" }, { id: "veneer", label: "МДФ шпон" }, { id: "mirror", label: "Зеркало" }, { id: "glass", label: "Стекло" }];

  const DOORS = lang === "ro"
    ? [{ id: "распашные", label: "Batante" }, { id: "раздвижные", label: "Glisante" }]
    : [{ id: "распашные", label: "Распашные" }, { id: "раздвижные", label: "Раздвижные" }];

  return (
    <div className="mx-10 space-y-3 p-4 rounded-xl" style={{ background: "rgba(168,130,80,0.04)", border: "1px solid rgba(214,193,163,0.12)" }}>
      <div className="text-xs font-medium" style={{ color: "#D6C1A3", letterSpacing: "1px", textTransform: "uppercase" }}>
        {lang === "ro" ? "Editare parametri dulap" : "Редактирование параметров шкафа"}
      </div>

      {/* Размер */}
      <div className="space-y-1">
        <label className="text-xs block" style={{ color: "rgba(245,242,237,0.6)" }}>{lSize}</label>
        <input type="text" inputMode="decimal" value={sizeInput}
          onChange={e => {
            let val = e.target.value.replace(",", ".");
            const parts = val.split(".");
            if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
            if (!/^\d*\.?\d*$/.test(val)) return;
            setSizeInput(val);
            const num = parseFloat(val);
            setEdit(prev => ({ ...prev, size: isNaN(num) ? 0 : num }));
          }}
          className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ background: "rgba(245,242,237,0.05)", color: "#F5F2ED", border: "1px solid rgba(214,193,163,0.1)" }}
        />
      </div>

      {/* Высота */}
      <div className="space-y-1">
        <label className="text-xs block" style={{ color: "rgba(245,242,237,0.6)" }}>{lHeight}</label>
        <input type="text" value={edit.height}
          onChange={e => setEdit(prev => ({ ...prev, height: e.target.value }))}
          className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ background: "rgba(245,242,237,0.05)", color: "#F5F2ED", border: "1px solid rgba(214,193,163,0.1)" }}
        />
      </div>

      {/* Тип */}
      <div className="space-y-1">
        <label className="text-xs block" style={{ color: "rgba(245,242,237,0.6)" }}>{lType}</label>
        <select value={edit.type}
          onChange={e => setEdit(prev => ({ ...prev, type: e.target.value }))}
          className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ background: "rgba(245,242,237,0.05)", color: "#F5F2ED", border: "1px solid rgba(214,193,163,0.1)" }}>
          {TYPES.map(t => <option key={t.id} value={t.id} style={{ background: "#1a1a1a" }}>{t.label}</option>)}
        </select>
      </div>

      {/* Материал */}
      <div className="space-y-1">
        <label className="text-xs block" style={{ color: "rgba(245,242,237,0.6)" }}>{lMaterial}</label>
        <select value={edit.material}
          onChange={e => setEdit(prev => ({ ...prev, material: e.target.value }))}
          className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ background: "rgba(245,242,237,0.05)", color: "#F5F2ED", border: "1px solid rgba(214,193,163,0.1)" }}>
          {MATERIALS.map(m => <option key={m.id} value={m.id} style={{ background: "#1a1a1a" }}>{m.label}</option>)}
        </select>
      </div>

      {/* Цвет */}
      <div className="space-y-1">
        <label className="text-xs block" style={{ color: "rgba(245,242,237,0.6)" }}>{lColor}</label>
        <input type="text" value={edit.style}
          onChange={e => setEdit(prev => ({ ...prev, style: e.target.value }))}
          className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ background: "rgba(245,242,237,0.05)", color: "#F5F2ED", border: "1px solid rgba(214,193,163,0.1)" }}
        />
      </div>

      {/* Фасады */}
      <div className="space-y-1">
        <label className="text-xs block" style={{ color: "rgba(245,242,237,0.6)" }}>{lDoors}</label>
        <select value={edit.extras[0] || ""}
          onChange={e => setEdit(prev => ({ ...prev, extras: [e.target.value] }))}
          className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ background: "rgba(245,242,237,0.05)", color: "#F5F2ED", border: "1px solid rgba(214,193,163,0.1)" }}>
          {DOORS.map(d => <option key={d.id} value={d.id} style={{ background: "#1a1a1a" }}>{d.label}</option>)}
        </select>
      </div>

      {/* Комментарии */}
      <div className="space-y-1">
        <label className="text-xs block" style={{ color: "rgba(245,242,237,0.6)" }}>{lNotes}</label>
        <textarea value={edit.notes} rows={2}
          onChange={e => setEdit(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-3 py-1.5 rounded-lg text-sm outline-none resize-none"
          style={{ background: "rgba(245,242,237,0.05)", color: "#F5F2ED", border: "1px solid rgba(214,193,163,0.1)" }}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(edit)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all hover:scale-[1.02] font-medium"
          style={{ background: "linear-gradient(135deg, #D6C1A3, #C4A882)", color: "#111" }}>
          {btnSave}
        </button>
        <button onClick={onCancel}
          className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all hover:scale-[1.02]"
          style={{ background: "rgba(245,242,237,0.05)", color: "rgba(245,242,237,0.5)", border: "1px solid rgba(245,242,237,0.1)" }}>
          {btnCancel}
        </button>
      </div>
    </div>
  );
}

// ===== SUB-COMPONENTS =====
function CalculatorOptions({ options, onSelect, lang: _lang, title }: { options: { id: string; label: string }[]; onSelect: (id: string) => void; lang: "ru" | "ro"; title: string }) {
  return (
    <div className="mx-10 space-y-2">
      <div className="text-xs" style={{ color: "rgba(214,193,163,0.5)" }}>{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button key={opt.id} onClick={() => onSelect(opt.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105" style={{ background: "rgba(168,130,80,0.08)", color: "#D6C1A3", border: "1px solid rgba(214,193,163,0.12)" }}>
            <ChevronRight className="w-3 h-3" />
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ===== UTILS =====
function loadMessages(lang: "ru" | "ro"): Message[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return [{ role: "assistant", content: lang === "ro" ? WELCOME_RO : WELCOME_RU, timestamp: Date.now() }];
}
