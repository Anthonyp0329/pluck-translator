export const QUIZ_THRESHOLD = 3;
export const QUIZ_SIZE = 5;

export const LANG_NAMES: Record<string, string> = {
  en: "English", es: "Español", fr: "Français", de: "Deutsch",
  it: "Italiano", pt: "Português", nl: "Nederlands", ru: "Русский",
  zh: "中文", "zh-Hans": "中文(简体)", "zh-Hant": "中文(繁體)",
  ja: "日本語", ko: "한국어", ar: "العربية", hi: "हिन्दी",
  tr: "Türkçe", pl: "Polski", sv: "Svenska", da: "Dansk",
  fi: "Suomi", no: "Norsk", cs: "Čeština", ro: "Română",
  uk: "Українська", vi: "Tiếng Việt",
};

export function langName(code: string): string {
  return LANG_NAMES[code] ?? code.toUpperCase();
}
