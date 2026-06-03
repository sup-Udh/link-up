export interface LanguageConfig {
  id: string; // The internal slug we use
  name: string; // Display name for the UI
  monacoLanguage: string; // The string Monaco uses for syntax highlighting
  judge0Id: number; // The Judge0 API language ID
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { id: "javascript", name: "JavaScript", monacoLanguage: "javascript", judge0Id: 102 },
  { id: "typescript", name: "TypeScript", monacoLanguage: "typescript", judge0Id: 101 },
  { id: "python", name: "Python", monacoLanguage: "python", judge0Id: 113 },
  { id: "java", name: "Java", monacoLanguage: "java", judge0Id: 91 },
  { id: "cpp", name: "C++", monacoLanguage: "cpp", judge0Id: 105 },
  { id: "c", name: "C", monacoLanguage: "c", judge0Id: 103 },
  { id: "csharp", name: "C#", monacoLanguage: "csharp", judge0Id: 51 },
  { id: "go", name: "Go", monacoLanguage: "go", judge0Id: 107 },
  { id: "rust", name: "Rust", monacoLanguage: "rust", judge0Id: 108 },
  { id: "kotlin", name: "Kotlin", monacoLanguage: "kotlin", judge0Id: 111 },
  { id: "swift", name: "Swift", monacoLanguage: "swift", judge0Id: 83 },
  { id: "php", name: "PHP", monacoLanguage: "php", judge0Id: 98 },
  { id: "ruby", name: "Ruby", monacoLanguage: "ruby", judge0Id: 72 },
  { id: "scala", name: "Scala", monacoLanguage: "scala", judge0Id: 112 },
  { id: "dart", name: "Dart", monacoLanguage: "dart", judge0Id: 90 },
];

export function getLanguageConfig(id: string): LanguageConfig {
  return SUPPORTED_LANGUAGES.find((lang) => lang.id === id) || SUPPORTED_LANGUAGES[0];
}
