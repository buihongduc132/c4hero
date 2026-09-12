const fs = require('fs');
let code = fs.readFileSync('src/lib/dsl/parser-views.ts', 'utf8');

// 1. Add parseCustomView function
const parseCustomViewCode = `
function parseCustomView(p: ContextAwareParser, model: Model): View | null {
    p.advance() // consume 'custom'
    const key = p.readOptionalStringOrIdentifier() ?? ''
    const positionalDescription = p.readOptionalString()

    const view: View = {
        type: 'custom' as any,
        key,
        title: positionalDescription,
        description: positionalDescription,
        elements: [],
        relationships: [],
    }

    p.skipNewlines()
    if (p.match('LBRACE')) {
        parseViewBody(p, view, model)
        p.skipNewlines()
        p.expect('RBRACE')
    }

    return view
}
`;
code = code.replace(/function parseSystemLandscapeView/, parseCustomViewCode + '\nfunction parseSystemLandscapeView');

// 2. Change the handling of 'custom' in parseViewsBody
code = code.replace(/if \(kw === 'filtered' \|\| kw === 'custom'\) \{/, `if (kw === 'custom') {
                const view = parseCustomView(p, model)
                if (view) {
                    if (!views.customViews) views.customViews = []
                    ensureViewKey(view, views, undefined)
                    views.customViews.push(view)
                }
                continue
            }
            if (kw === 'filtered') {`);

// 3. ensureViewKey should check customViews
// wait, ensureViewKey has:
/*
    const existing = [
        ...viewsContainer.systemLandscapeViews,
        ...viewsContainer.systemContextViews,
        ...viewsContainer.containerViews,
        ...viewsContainer.componentViews,
        ...viewsContainer.dynamicViews,
        ...viewsContainer.deploymentViews,
    ]
*/
code = code.replace(/...viewsContainer.deploymentViews,\n    \]/, `...viewsContainer.deploymentViews,\n        ...(viewsContainer.customViews || []),\n    ]`);
code = code.replace(/view.type === 'dynamic' \? 'Dynamic'\n        : 'Deployment'/, `view.type === 'dynamic' ? 'Dynamic'\n        : view.type === 'custom' ? 'Custom'\n        : 'Deployment'`);

fs.writeFileSync('src/lib/dsl/parser-views.ts', code);
