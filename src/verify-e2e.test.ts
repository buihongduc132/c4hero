import { test, expect } from 'vitest'
import * as fs from 'fs'
import { parseDSL, serializeDSL } from './lib/dsl/index'

test('e2e verify', () => {
  const sourcePath = '/home/bhd/Documents/Projects/bhd/dy-flow/flow/diagrams/workspace.dsl'
  const dslContent = fs.readFileSync(sourcePath, 'utf8')

  const parsed1 = parseDSL(dslContent)
  const serialized1 = serializeDSL(parsed1.workspace)
  const parsed2 = parseDSL(serialized1)
  const serialized2 = serializeDSL(parsed2.workspace)

  const isEqual = serialized1 === serialized2
  const bytes = new TextEncoder().encode(serialized1).length

  console.log(`\n\n=== E2E RESULT ===`)
  console.log(`Models equal (normalized per Option-B): ${isEqual}`)
  console.log(`Exact bytes of canonical serialization: ${bytes}`)
  console.log(`==================\n\n`)
  
  expect(isEqual).toBe(true)
})
