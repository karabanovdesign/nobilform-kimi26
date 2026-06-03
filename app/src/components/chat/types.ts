export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

export type ChatMode =
  | "chat"
  | "awaiting_phone"
  // === КАЛЬКУЛЯТОР КУХНИ ===
  | "calculator_size"
  | "calculator_height"
  | "calculator_style"
  | "calculator_material"
  | "calculator_countertop"
  | "calculator_extras"
  | "calculator_notes"
  | "calculator_edit"
  | "calculator_result"
  // === КАЛЬКУЛЯТОР ШКАФА ===
  | "closet_size"
  | "closet_height"
  | "closet_type"
  | "closet_material"
  | "closet_color"
  | "closet_doors"
  | "closet_notes"
  | "closet_edit"
  | "closet_result"
  // === ТВ-ЗОНА И ДЕКОРАТИВНЫЕ ПАНЕЛИ ===
  | "tv_wall_inquiry"
  // === ВЫЗОВ ДИЗАЙНЕРА НА ДОМ ===
  | "designer_visit"
  // === ОБЩИЕ ===
  | "generating_design";

export interface CalculatorState {
  size: number;        // ширина/длина в погонных метрах
  height: string;      // высота (стандартная/высокая/под потолок)
  style: string;
  material: string;
  countertop: string;
  extras: string[];
  notes: string;       // комментарии / пожелания / корректировки
  type: string;        // шкаф: встроенный / отдельностоящий
}

export interface RAGDocument {
  id: string;
  content: string;
  contentRo: string;
  category: string;
  keywords: string[];
}

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  supported: boolean;
}

export interface ChatContext {
  messages: Message[];
  mode: ChatMode;
  calculator: CalculatorState;
  lang: "ru" | "ro";
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}
