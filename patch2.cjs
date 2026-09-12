const fs = require('fs');
let code = fs.readFileSync('src/lib/dsl/parser-model.ts', 'utf8');

const replacement = `function parseCustomElement(p: ContextAwareParser, varName?: string, model?: Model, parentPath?: string): import('@/types/model').CustomElement | null {
    p.advance() // consume 'element'
    const name = p.readString()
    const metadata = p.readOptionalString() || undefined
    const tagsStr = p.readOptionalString()
    const description = p.readOptionalString()

    const id = p.allocateId(varName, parentPath)
    const ce: import('@/types/model').CustomElement = {
        id,
        type: 'custom',
        name,
        properties: {},
        relationships: [],
    }
    if (metadata !== undefined) ce.metadata = metadata
    if (description !== undefined) ce.description = description
    
    ce.tags = p.buildTags('Element', metadata || '', tagsStr).filter(Boolean)
    
    p.registerElement(id, name, 'custom', varName, parentPath)

    p.skipNewlines()
    if (p.check('LBRACE')) {
        p.advance()
        parseCustomElementBody(p, ce, model)
        p.skipNewlines()
        p.expect('RBRACE')
    }

    return ce
}`;

code = code.replace(/function parseCustomElement[\s\S]+?return ce\n}/, replacement);
fs.writeFileSync('src/lib/dsl/parser-model.ts', code);

let testCode = fs.readFileSync('src/lib/dsl/custom-elements-roundtrip.test.ts', 'utf8');
const testReplacement = `
      // 4. Assert custom elements exist and match expected
      expect(parsed1.model.customElements).toBeDefined()
      const expectedCustoms = expectedJson.model.customElements.map(e => ({
         ...e,
         tags: e.tags ? e.tags.split(',') : []
      }))
      expect(parsed1.model.customElements).toEqual(expectedCustoms)
      
      // 5. Assert custom views exist and match expected (if applicable)
      if (expectedJson.views?.customViews) {
        expect(parsed1.views.customViews).toBeDefined()
        expect(parsed1.views.customViews).toEqual(expectedJson.views.customViews)
      }
`;
testCode = testCode.replace(/\/\/ 4\. Assert[\s\S]+/, testReplacement + '    })\n  }\n})\n');
fs.writeFileSync('src/lib/dsl/custom-elements-roundtrip.test.ts', testCode);
