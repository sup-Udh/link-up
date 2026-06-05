export interface LanguageConfig {
  id: string; 
  name: string; 
  monacoLanguage: string; 
  wandboxCompiler: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { id: "javascript", name: "JavaScript", monacoLanguage: "javascript", wandboxCompiler: "nodejs-20.17.0" },
  { id: "typescript", name: "TypeScript", monacoLanguage: "typescript", wandboxCompiler: "typescript-5.6.2" },
  { id: "python", name: "Python", monacoLanguage: "python", wandboxCompiler: "cpython-3.12.7" },
  { id: "java", name: "Java", monacoLanguage: "java", wandboxCompiler: "openjdk-jdk-22+36" },
  { id: "cpp", name: "C++", monacoLanguage: "cpp", wandboxCompiler: "gcc-13.2.0" },
];

export function getLanguageConfig(id: string): LanguageConfig {
  return SUPPORTED_LANGUAGES.find((lang) => lang.id === id) || SUPPORTED_LANGUAGES[0];
}
