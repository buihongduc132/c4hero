const fs = require('fs');
let code = fs.readFileSync('src/lib/dsl/parser-model.ts', 'utf8');

code = code.replace(/if \(token\.type !== 'STRING' && token\.type !== 'IDENTIFIER'\) \{ p\.advance\(\); continue \}/g, `if (token.type !== 'STRING' && token.type !== 'IDENTIFIER' && token.type !== 'KEYWORD') { p.advance(); continue }`);

fs.writeFileSync('src/lib/dsl/parser-model.ts', code);
