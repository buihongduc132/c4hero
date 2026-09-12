const fs = require('fs');

let testCode = fs.readFileSync('src/lib/dsl/custom-elements-roundtrip.test.ts', 'utf8');
testCode = testCode.replace(/if \(cleaned\.relationships && cleaned\.relationships\.length === 0\) delete cleaned\.relationships;\n         if \(cleaned\.relationships\) \{/, 
`
         if (cleaned.relationships && cleaned.relationships.length === 0) {
            const exp = expectedJson.model.customElements.find(e => e.id === cleaned.id)
            if (exp && !exp.relationships) delete cleaned.relationships
         }
         if (cleaned.relationships) {
`);
fs.writeFileSync('src/lib/dsl/custom-elements-roundtrip.test.ts', testCode);
