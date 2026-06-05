const fs = require('fs');
const files = [
  'app/lib/problem-engine/adapters/transpiler.ts',
  'app/lib/problem-engine/wrappers/c.ts',
  'app/lib/problem-engine/wrappers/csharp.ts',
  'app/lib/problem-engine/wrappers/go.ts',
  'app/lib/problem-engine/wrappers/php.ts',
  'app/lib/problem-engine/wrappers/ruby.ts',
  'app/lib/problem-engine/wrappers/rust.ts',
  'app/lib/problem-engine/wrappers/scala.ts',
  'app/lib/problem-engine/wrappers/swift.ts'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/\\\$\{/g, '${');
  fs.writeFileSync(file, content);
}
console.log('Fixed interpolation syntax');
