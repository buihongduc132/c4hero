import * as fs from 'fs'
import { parseDSL } from './src/lib/dsl/parser'
import { serializeDSL } from './src/lib/dsl/serializer'

const sourcePath = '/home/bhd/Documents/Projects/bhd/dy-flow/flow/diagrams/workspace.dsl'
const dslContent = fs.readFileSync(sourcePath, 'utf8')

const parsed1 = parseDSL(dslContent)
const serialized1 = serializeDSL(parsed1)
const parsed2 = parseDSL(serialized1)
const serialized2 = serializeDSL(parsed2)

const isEqual = serialized1 === serialized2
const bytes = new TextEncoder().encode(serialized1).length

console.log(`Models equal (normalized per Option-B): ${isEqual}`)
console.log(`Exact bytes of canonical serialization: ${bytes}`)
