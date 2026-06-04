export interface LanguageConfig {
  id: string; 
  name: string; 
  monacoLanguage: string; 
  pistonLanguage: string;
  pistonVersion: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { id: "javascript", name: "JavaScript", monacoLanguage: "javascript", pistonLanguage: "javascript", pistonVersion: "18.15.0" },
  { id: "typescript", name: "TypeScript", monacoLanguage: "typescript", pistonLanguage: "typescript", pistonVersion: "5.0.3" },
  { id: "python", name: "Python", monacoLanguage: "python", pistonLanguage: "python", pistonVersion: "3.10.0" },
  { id: "java", name: "Java", monacoLanguage: "java", pistonLanguage: "java", pistonVersion: "15.0.2" },
  { id: "cpp", name: "C++", monacoLanguage: "cpp", pistonLanguage: "c++", pistonVersion: "10.2.0" },
  { id: "c", name: "C", monacoLanguage: "c", pistonLanguage: "c", pistonVersion: "10.2.0" },
  { id: "csharp", name: "C#", monacoLanguage: "csharp", pistonLanguage: "csharp", pistonVersion: "6.12.0" },
  { id: "go", name: "Go", monacoLanguage: "go", pistonLanguage: "go", pistonVersion: "1.16.2" },
  { id: "rust", name: "Rust", monacoLanguage: "rust", pistonLanguage: "rust", pistonVersion: "1.68.2" },
  { id: "kotlin", name: "Kotlin", monacoLanguage: "kotlin", pistonLanguage: "kotlin", pistonVersion: "1.8.20" },
  { id: "swift", name: "Swift", monacoLanguage: "swift", pistonLanguage: "swift", pistonVersion: "5.3.3" },
  { id: "php", name: "PHP", monacoLanguage: "php", pistonLanguage: "php", pistonVersion: "8.2.3" },
  { id: "ruby", name: "Ruby", monacoLanguage: "ruby", pistonLanguage: "ruby", pistonVersion: "3.0.1" },
  { id: "scala", name: "Scala", monacoLanguage: "scala", pistonLanguage: "scala", pistonVersion: "3.2.2" },
  { id: "dart", name: "Dart", monacoLanguage: "dart", pistonLanguage: "dart", pistonVersion: "2.19.6" },
];

export function getLanguageConfig(id: string): LanguageConfig {
  return SUPPORTED_LANGUAGES.find((lang) => lang.id === id) || SUPPORTED_LANGUAGES[0];
}
