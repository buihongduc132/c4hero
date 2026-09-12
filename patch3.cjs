const fs = require('fs');
let code = fs.readFileSync('src/lib/dsl/parser-model.ts', 'utf8');

const relRegex = /if \(p\.looksLikeRelationship\(\)\) \{\s*const rel = parseRelationship\(p\)\s*if \(rel\) model\.relationships\.push\(rel\)\s*continue\s*\}/g;

const relReplacement = `if (p.looksLikeRelationship()) {
                const rel = parseRelationship(p)
                if (rel) {
                    const sourceCustom = model.customElements?.find(c => c.id === rel.sourceId)
                    if (sourceCustom) {
                        sourceCustom.relationships.push(rel)
                    } else {
                        model.relationships.push(rel)
                    }
                }
                continue
            }`;

code = code.replace(relRegex, relReplacement);
fs.writeFileSync('src/lib/dsl/parser-model.ts', code);
