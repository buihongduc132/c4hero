import { readFileSync } from 'fs'
import { join } from 'path'
import { describe, it, expect } from 'vitest'
import { parseDSL, serializeDSL } from './index'

describe('Custom elements roundtrip', () => {
  const fixtures = ['01-custom-only', '02-mixed', '03-custom-views']

  for (const fixture of fixtures) {
    it(`roundtrips ${fixture}`, () => {
      const dsl = readFileSync(join(__dirname, '__fixtures__/custom', `${fixture}.dsl`), 'utf-8')
      const expectedJson = JSON.parse(readFileSync(join(__dirname, '__fixtures__/custom', `${fixture}.json`), 'utf-8'))
      
      // 1. Parse
      const { workspace: parsed1, errors: errors1 } = parseDSL(dsl)
      expect(errors1).toHaveLength(0) // RED: parser currently rejects custom elements
      
      // 2. Serialize
      const serialized = serializeDSL(parsed1)
      
      // 3. Parse again
      const { workspace: parsed2, errors: errors2 } = parseDSL(serialized)
      expect(errors2).toHaveLength(0)
      
      // 4. Assert custom elements exist and match expected
      expect(parsed2.model.customElements).toBeDefined()
      expect(parsed2.model.customElements).toEqual(expectedJson.model.customElements)
      
      // 5. Assert custom views exist and match expected (if applicable)
      if (expectedJson.views?.customViews) {
        expect(parsed2.views.customViews).toBeDefined()
        expect(parsed2.views.customViews).toEqual(expectedJson.views.customViews)
      }
    })
  }
})
