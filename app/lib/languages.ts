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
  { id: "c", name: "C", monacoLanguage: "c", wandboxCompiler: "gcc-13.2.0" },
  { id: "csharp", name: "C#", monacoLanguage: "csharp", wandboxCompiler: "dotnetcore-8.0.402" },
  { id: "go", name: "Go", monacoLanguage: "go", wandboxCompiler: "go-1.23.2" },
  { id: "rust", name: "Rust", monacoLanguage: "rust", wandboxCompiler: "rust-1.82.0" },
  { id: "kotlin", name: "Kotlin", monacoLanguage: "kotlin", wandboxCompiler: "openjdk-jdk-22+36" }, // Wandbox doesn't support Kotlin directly
  { id: "swift", name: "Swift", monacoLanguage: "swift", wandboxCompiler: "swift-6.0.1" },
  { id: "php", name: "PHP", monacoLanguage: "php", wandboxCompiler: "php-8.3.12" },
  { id: "ruby", name: "Ruby", monacoLanguage: "ruby", wandboxCompiler: "ruby-3.4.9" },
  { id: "scala", name: "Scala", monacoLanguage: "scala", wandboxCompiler: "scala-3.5.1" },
  { id: "dart", name: "Dart", monacoLanguage: "dart", wandboxCompiler: "nodejs-20.17.0" }, // Wandbox doesn't support Dart directly
];

export function getLanguageConfig(id: string): LanguageConfig {
  return SUPPORTED_LANGUAGES.find((lang) => lang.id === id) || SUPPORTED_LANGUAGES[0];
}
