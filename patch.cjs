const fs = require('fs');
let code = fs.readFileSync('src/lib/dsl/parser-model.ts', 'utf8');

// 1. Add parseCustomElement
const parseCustomElementCode = `
function parseCustomElement(p: ContextAwareParser, varName?: string, model?: Model, parentPath?: string): import('@/types/model').CustomElement | null {
    p.advance() // consume 'element'
    const name = p.readString()
    const metadata = p.readOptionalString() || undefined
    const tagsStr = p.readOptionalString()

    const id = p.allocateId(varName, parentPath)
    const ce: import('@/types/model').CustomElement = {
        id,
        type: 'custom',
        name,
        relationships: [],
    }
    if (metadata !== undefined) ce.metadata = metadata
    
    // tags: Custom elements get Element and whatever was passed.
    // Wait, the test expects "Element,Intention,Locked" when "Intention,Locked" is passed.
    ce.tags = p.buildTags('Element', undefined, tagsStr)
    
    p.registerElement(id, name, 'custom', varName, parentPath)

    p.skipNewlines()
    if (p.check('LBRACE')) {
        p.advance()
        parseCustomElementBody(p, ce, model)
        p.skipNewlines()
        p.expect('RBRACE')
    }

    return ce
}

function parseCustomElementBody(p: ContextAwareParser, ce: import('@/types/model').CustomElement, model?: Model): void {
    p.depth++
    if (p.depth > MAX_DEPTH) { p.addError('Maximum nesting depth exceeded', p.peek()); p.depth--; return }
    while (!p.check('RBRACE') && p.peekType() !== 'EOF') {
        p.skipNewlines()
        if (p.check('RBRACE') || p.peekType() === 'EOF') break

        const token = p.peek()
        if (token.type === 'COMMENT') { p.advance(); continue }
        if (token.type === 'KEYWORD' && token.value.startsWith('!')) { p.advance(); p.skipToNextLine(); continue }

        if (token.type === 'KEYWORD') {
            const kw = token.value.toLowerCase()
            if (kw === 'description') {
                p.advance()
                const val = p.readOptionalString()
                if (val !== undefined) ce.description = val
                continue
            }
            if (kw === 'url') {
                p.advance()
                const val = p.readOptionalString()
                if (val !== undefined) ce.url = val
                continue
            }
            if (kw === 'properties') {
                p.advance()
                p.skipNewlines()
                if (p.match('LBRACE')) {
                    if (!ce.properties) ce.properties = {}
                    parsePropertiesBlock(p, ce as any)
                    p.skipNewlines()
                    p.expect('RBRACE')
                }
                continue
            }
            if (kw === 'tags') {
                p.advance()
                while (p.check('STRING') || p.check('IDENTIFIER')) {
                    const tagVal = p.advance().value
                    for (const t of tagVal.split(',')) {
                        const trimmed = t.trim()
                        if (trimmed && !ce.tags.includes(trimmed)) {
                            ce.tags.push(trimmed)
                        }
                    }
                }
                continue
            }
            p.advance()
            p.skipUnknownDirective()
            continue
        }

        if (token.type === 'IDENTIFIER') {
            if (p.looksLikeRelationship()) {
                const rel = parseRelationship(p)
                if (rel) ce.relationships.push(rel)
                continue
            }
            p.advance()
            p.skipUnknownDirective()
            continue
        }
        
        p.advance()
    }
    p.depth--
}

function parseModelPropertiesBlock(p: ContextAwareParser, model: Model): void {
    while (!p.check('RBRACE') && p.peekType() !== 'EOF') {
        p.skipNewlines()
        if (p.check('RBRACE') || p.peekType() === 'EOF') break
        const token = p.peek()
        if (token.type === 'COMMENT') { p.advance(); continue }
        if (token.type !== 'STRING' && token.type !== 'IDENTIFIER') { p.advance(); continue }
        const key = p.advance().value
        const valTok = p.peek()
        let val: string | undefined
        if (valTok.type === 'STRING' || valTok.type === 'IDENTIFIER' || valTok.type === 'NUMBER') {
            val = p.advance().value
        }
        if (val === undefined) continue
        setUserProperty(model.properties!, key, val)
    }
}
`;

code = code.replace(/export type \{ Workspace \}/, parseCustomElementCode + '\nexport type { Workspace }');

// 2. Add properties handling in parseModelBody
code = code.replace(/if \(kw === 'properties'\) \{\s*p\.advance\(\)\s*p\.skipNewlines\(\)\s*p\.skipBraceBlock\(\)\s*continue\s*\}/, `if (kw === 'properties') {
                p.advance()
                p.skipNewlines()
                if (p.match('LBRACE')) {
                    if (!model.properties) model.properties = {}
                    parseModelPropertiesBlock(p, model)
                    p.skipNewlines()
                    p.expect('RBRACE')
                }
                continue
            }
            if (kw === 'element') {
                const ce = parseCustomElement(p, undefined, model)
                if (ce) {
                    if (!model.customElements) model.customElements = []
                    model.customElements.push(ce)
                }
                continue
            }`);

// 3. Add element keyword handling in EQUALS branch
code = code.replace(/} else if \(elementKw === 'deploymentenvironment'\) {[^}]+}/, `} else if (elementKw === 'deploymentenvironment') {
                        parseDeploymentEnvironment(p, model, varName)
                    } else if (elementKw === 'element') {
                        const ce = parseCustomElement(p, varName, model)
                        if (ce) {
                            if (!model.customElements) model.customElements = []
                            model.customElements.push(ce)
                        }
                    }`);

fs.writeFileSync('src/lib/dsl/parser-model.ts', code);
