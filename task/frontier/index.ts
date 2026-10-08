// The frontier audit of the physics ledger. For every ledger row that is not
// held it asks one question: what single condition stands between the row and
// its next status up, and which keystone does that condition wait on. Then it
// ranks the keystones by how many rows each would free.
//
// It reads three notes and nothing else, so it cannot drift from them:
//
//   everything.md  the ledger: rows A to Q, their status, their evidence
//                  (the same pipe tables `make:vibe` turns into physics.json)
//   open.md        the open items OPEN-XXX-NN, each with "what closing it
//                  takes", "depends on" and the ledger rows it names
//   gaps.md        the seven decisions only the user can make (and the items
//                  each one gates), and the per-area "waits on" kind
//
// How a row is tied to its condition, in order, and nothing past that:
//
//   1. An open item QUOTES the row: `ledger D "the value of α"`. Strongest.
//   2. An open item cites the row's section (`ledger D`) and its title names
//      the row: every content word of the shorter of title and fact appears
//      in the other (`title`), or two of three do (`title-partial`, weakest,
//      never chosen over a stronger link). Among strong links the item that
//      links the fewest rows wins, so a row's own item beats an umbrella.
//   3. The row's own evidence states its gap with a marker sentence
//      (`Open: ...`, `Partial: ...`, `Not ...`, `Needs ...`, `Still ...`).
//
// The condition is the linked item's "what closing it takes". open.md says a
// condition marked "(proposed)" is one the notes do not name, so it is shown
// but counted as `unstated`, as is a row nothing links. Those rows are listed
// at the end: their ledger text needs a stated promotion condition.
//
// The keystone is read off "depends on". Only the field's first sentence is
// a dependency. A later sentence that qualifies its ids ("OPEN-FND-02 for the
// full-rule version"), notes a loop, or says an item "is done" is recorded as
// secondary and does not gate. Parentheticals are dropped, since they list
// options ("the working rule, R*, C*, or ... OPEN-MOT-03") rather than
// dependencies. An item a gaps.md decision names waits on that decision. A
// row's keystones are the roots of its item's dependency closure (closed
// items drop out). Its headline keystone is the root that reaches the most
// rows. A keystone's kind (run, idea, decision) comes from gaps.md: a decision
// is a decision, an item takes the "waits on" of the area row that lists it,
// and anything else prints `unstated`.
//
// Compute only: a row whose condition is a rerun (the text says "rerun" or
// "read again") with no proposed condition. Tier `now` has no open
// dependency at all. Tier `after decision 4` has only decision 4 (adopt one
// rule) and run-kind items among its roots, which is "rerun on the adopted
// rule".
//
// Run (from the package root):
//   pnpm call task/frontier/index.ts
//   pnpm call task/frontier/index.ts --json
//   pnpm call task/frontier/index.ts --area P
//   pnpm call task/frontier/index.ts --notes <dir holding everything.md>
//
// Flags:
//   --json        machine-readable output, every section
//   --area, -a    limit the per-row listing to ledger section letters (A,B)
//   --notes       the roadmap directory. Default: found by walking up from
//                 the package to note/project/vibe/roadmap

import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { parseArgs } from 'node:util'

const PACKAGE_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../..',
)

/** Where the roadmap notes sit below a repository root. */
const ROADMAP_PATH = 'note/project/vibe/roadmap'

/** A lettered ledger section heading: `A. Quantum foundations`. */
const SECTION_HEADING = /^([A-Z])\.\s+(.+)$/

/** One cell of the delimiter row under a table header. */
const DELIMITER_CELL = /^:?-{3,}:?$/

/** The heading of the ledger section that defines the statuses. */
const RULES_HEADING = 'How to read a row'

/** The status that ends the ladder. A held row has no frontier. */
const HELD = 'held'

/** A status the ledger defines that is a review state, not a rung. */
const NOT_A_RUNG = new Set(['audit'])

/** The two ledger table shapes, as `make:vibe` accepts them. */
const FACT_HEADERS = new Set([
  'fact|the test on the model|status|codes',
  'fact|the test|status|codes',
])
const NUMBER_HEADER = 'number|value|status'

/** An open item's first line: `- [ ] **OPEN-FND-01** One rule for every row`. */
const ITEM_LINE = /^- \[( |x)\] \*\*(OPEN-[A-Z]{3}-\d{2})\*\*\s*(.*)$/

/** A field line inside an item: `  - **depends on:** ...`. */
const FIELD_LINE = /^ {2}- \*\*([^*]+?):\*\*\s*(.*)$/

/** An open item id, full or as a bare number after a joiner (`OPEN-GRV-01, 03`). */
const OPEN_TOKEN = /OPEN-([A-Z]{3})-(\d{2})|\b(\d{2})\b/g

/** A short item id as gaps.md writes it in its table: `QTM-06`. */
const SHORT_ITEM = /\b([A-Z]{3})-(\d{2})\b/g

/** An experiment code, full or as a bare number after a joiner (`E-FRC-0269, 0270`). */
const CODE_TOKEN = /E-([A-Z]{3})-(\d{4})|\b(\d{4})\b/g

/** What may sit between two ids for the second to inherit the first's prefix. */
const JOINER = /^(?:\s*(?:\.\.|\/|,|&|and|or|to|through|–|-)\s*)+$/

/** A range between two ids: `OPEN-MND-01 to 17`, `ENG-01 to ENG-06`. */
const RANGE_JOINER = /^\s*(?:to|through|–)\s*$/

/** A sentence in a row's evidence that states its own gap. */
const GAP_MARKER = /^(?:Open|Partial|Not|Needs|Still)\b/

/** Words that say a condition is a rerun of something already built. */
const RERUN_WORDS = /\brerun\b|\bre-run\b|\bread again\b/i

/** open.md's marker for a condition the notes do not name. */
const PROPOSED = /\(proposed\)/i

/** Words a dependency sentence uses for a decision only the user makes. */
const USER_DECISION = /\buser's (?:decision|go-ahead)\b/i

/** Words too common to identify a row by. */
const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'by',
  'every',
  'for',
  'from',
  'in',
  'its',
  'of',
  'on',
  'one',
  'or',
  'the',
  'to',
  'with',
])

/** The decision that adopts one rule, which a "rerun on the adopted rule" waits for. */
const RULE_DECISION = 4

/**
 * Least share of the shorter word set (the row's fact or the item's title)
 * that the other must hold for the title to name the row. Two of three words:
 * "The Lorentz dispersion of a body" names "Lorentz invariance of the
 * dispersion", and "The binding problem" names "the binding problem: unified
 * yet distributed". One shared word of two does not.
 */
const TITLE_COVERAGE = 2 / 3

/** One ledger row, as everything.md holds it. */
type LedgerRow = {
  /** `<letter>-<fact in kebab case>`, the anchor /vibe/ledger uses */
  id: string
  letter: string
  area: string
  fact: string
  status: string
  evidence: string
  codes: string[]
}

/** One open item of open.md. */
type OpenItem = {
  id: string
  closed: boolean
  title: string
  fields: Map<string, string>
  /** ids in the first sentence of "depends on", parentheticals dropped */
  primary: string[]
  /** ids in later sentences: qualified, noted or done, never gating */
  secondary: string[]
  /** the first sentence names a decision only the user makes */
  wantsDecision: boolean
  /** ledger section letters the item cites */
  letters: Set<string>
  /** quoted row names, each with the letter it was cited under */
  quotes: { letter: string; name: string }[]
}

/** One of gaps.md's numbered decisions. */
type Decision = { number: number; title: string; items: string[] }

/**
 * How a row was tied to its condition. `title` is a full match (every word
 * of the shorter set is in the other), `title-partial` meets TITLE_COVERAGE
 * only and is the weakest link, never chosen over a stronger one.
 */
type LinkMethod = 'quoted' | 'title' | 'title-partial' | 'evidence' | 'none'

/** Where a row's condition comes from, and whether it counts as stated. */
type ConditionSource = 'item' | 'evidence' | 'proposed' | 'none'

/** The kind of wait a keystone is. */
type KeystoneKind = 'run' | 'idea' | 'decision' | 'unstated'

/** Whether a row's blocker is compute alone, and when it can run. */
type ComputeTier = 'now' | 'after decision 4' | null

/** A keystone node: an open item or a numbered decision. */
type KeystoneId = string

/** The audit of one non-held row. */
type Frontier = {
  id: string
  area: string
  fact: string
  status: string
  next: string
  link: LinkMethod
  item: string | null
  others: string[]
  condition: string
  conditionSource: ConditionSource
  proposed: string | null
  keystone: KeystoneId | null
  keystoneKind: KeystoneKind | null
  roots: KeystoneId[]
  compute: ComputeTier
  rerun: string[]
  rerunSource: RerunSource | null
}

/**
 * Where a compute-only row's rerun list comes from: the codes the condition
 * names after its word "rerun", every held row's codes when the condition is
 * "rerun every held row", or else the row's own evidence codes (the readings
 * the row stands on, which a rerun repeats).
 */
type RerunSource = 'condition' | 'held rows' | 'evidence'

/** A condition that asks for every held row again. */
const EVERY_HELD_ROW = /\brerun every held row\b/i

/** Find the roadmap: the --notes flag, else walk up from the package. */
function findRoadmap(flag: string | undefined): string {
  if (flag) {
    return resolve(flag)
  }

  let directory = PACKAGE_ROOT

  for (;;) {
    const candidate = resolve(directory, ROADMAP_PATH)

    if (existsSync(resolve(candidate, 'everything.md'))) {
      return candidate
    }

    const parent = dirname(directory)

    if (parent === directory) {
      console.error(
        `no ${ROADMAP_PATH}/everything.md above ${PACKAGE_ROOT}, pass --notes`,
      )
      process.exit(1)
    }

    directory = parent
  }
}

/** A pipe table row's cells, `**` dropped. An escaped `\|` stays in its cell. */
function splitRow(line: string): string[] {
  const text = line.trim()
  const cells: string[] = []
  let cell: string[] = []

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]!

    if (character === '\\' && text[index + 1] === '|') {
      cell.push('|')
      index += 1
    } else if (character === '|') {
      cells.push(cell.join(''))
      cell = []
    } else {
      cell.push(character)
    }
  }

  cells.push(cell.join(''))

  if (text.startsWith('|')) {
    cells.shift()
  }

  if (text.endsWith('|') && !text.endsWith('\\|')) {
    cells.pop()
  }

  return cells.map(value => value.replace(/\*\*/g, '').trim())
}

function isDelimiter(line: string): boolean {
  const cells = splitRow(line)

  return (
    line.trim().startsWith('|') &&
    cells.length > 0 &&
    cells.every(value => DELIMITER_CELL.test(value))
  )
}

/** One `## ` section of a note: its heading, its body lines, its tables. */
type NoteSection = {
  heading: string
  lines: string[]
  tables: { header: string[]; rows: string[][] }[]
}

/** Every `## ` section of a markdown note, with its pipe tables. */
function readSections(text: string): NoteSection[] {
  const lines = text.split('\n')
  const sections: NoteSection[] = []
  let current: NoteSection | null = null

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]!

    if (line.startsWith('## ')) {
      current = { heading: line.slice(3).trim(), lines: [], tables: [] }
      sections.push(current)
      continue
    }

    if (!current) {
      continue
    }

    current.lines.push(line)

    if (
      line.trim().startsWith('|') &&
      isDelimiter(lines[index + 1] ?? '')
    ) {
      const table = { header: splitRow(line), rows: [] as string[][] }

      index += 2

      while (
        index < lines.length &&
        lines[index]!.trim().startsWith('|')
      ) {
        table.rows.push(splitRow(lines[index]!))
        index += 1
      }

      index -= 1
      current.tables.push(table)
    }
  }

  return sections
}

/** Every id a text names, full or as a bare number joined to the last full one. */
function idsIn({
  text,
  pattern,
  make,
}: {
  text: string
  pattern: RegExp
  make: (prefix: string, number: string) => string
}): string[] {
  const ids: string[] = []
  let prefix: string | null = null
  let lastNumber: number | null = null
  let lastEnd = -1

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0

    if (match[1] && match[2]) {
      ids.push(make(match[1], match[2]))
      prefix = match[1]
      lastNumber = Number(match[2])
      lastEnd = index + match[0].length
      continue
    }

    if (
      !match[3] ||
      !prefix ||
      lastEnd < 0 ||
      !JOINER.test(text.slice(lastEnd, index))
    ) {
      continue
    }

    const number = Number(match[3])
    const width = match[3].length

    // `A to B` is every id between, not the two ends.
    if (
      RANGE_JOINER.test(text.slice(lastEnd, index)) &&
      lastNumber !== null &&
      number > lastNumber
    ) {
      for (let step = lastNumber + 1; step <= number; step += 1) {
        ids.push(make(prefix, String(step).padStart(width, '0')))
      }
    } else {
      ids.push(make(prefix, match[3]))
    }

    lastNumber = number
    lastEnd = index + match[0].length
  }

  return [...new Set(ids)]
}

function openIdsIn(text: string): string[] {
  return idsIn({
    text,
    pattern: OPEN_TOKEN,
    make: (prefix, number) => `OPEN-${prefix}-${number}`,
  })
}

function codesIn(text: string): string[] {
  return idsIn({
    text,
    pattern: CODE_TOKEN,
    make: (prefix, number) => `E-${prefix}-${number}`,
  })
}

/** A fact in kebab case, as `make:vibe` writes a row's anchor. */
function kebab(fact: string): string {
  return fact
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Text reduced to lowercase words, for comparing a quote or title to a fact. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']s\b/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

/** A text's content words, a plural `s` dropped. */
function contentWords(text: string): Set<string> {
  return new Set(
    normalize(text)
      .split(' ')
      .filter(word => word.length > 0 && !STOP_WORDS.has(word))
      .map(word =>
        word.length > 3 && word.endsWith('s') && !word.endsWith('ss')
          ? word.slice(0, -1)
          : word,
      ),
  )
}

/** The statuses in ladder order, top first, from the ledger's own table. */
type Ladder = string[]

/** Every ledger row, and the status ladder, from everything.md. */
function readLedger(path: string): { rows: LedgerRow[]; ladder: Ladder } {
  const sections = readSections(readFileSync(path, 'utf8'))
  const rules = sections.find(section => section.heading === RULES_HEADING)
  const statusTable = rules?.tables[0]

  if (!statusTable || statusTable.header.join('|') !== 'status|meaning') {
    console.error(`${path} has no "${RULES_HEADING}" status table`)
    process.exit(1)
  }

  const statuses = statusTable.rows.map(([status]) => status!)
  const ladder = statuses.filter(status => !NOT_A_RUNG.has(status))
  const leading = new RegExp(
    `^(${statuses.map(name => name.replace(/-/g, '\\-')).join('|')})\\b[.,]?\\s*(.*)$`,
  )
  const rows: LedgerRow[] = []
  const problems: string[] = []

  for (const section of sections) {
    const heading = SECTION_HEADING.exec(section.heading)

    if (!heading) {
      continue
    }

    const letter = heading[1]!
    const area = heading[2]!
    const table = section.tables[0]
    const header = table?.header.join('|') ?? ''
    const shape = FACT_HEADERS.has(header)
      ? 'fact'
      : header === NUMBER_HEADER
        ? 'number'
        : null

    if (!table || !shape) {
      problems.push(`section ${letter} has no ledger table`)
      continue
    }

    for (const cells of table.rows) {
      const [fact, , statusCell, evidenceCell] = cells
      const parsed = leading.exec(statusCell ?? '')

      if (!fact || !parsed) {
        problems.push(`section ${letter}, row "${fact ?? ''}": no status`)
        continue
      }

      const evidence =
        shape === 'fact' ? (evidenceCell ?? '') : (parsed[2] ?? '')

      rows.push({
        id: `${letter.toLowerCase()}-${kebab(fact)}`,
        letter,
        area,
        fact,
        status: parsed[1]!,
        evidence,
        codes: codesIn(evidence),
      })
    }
  }

  if (problems.length > 0) {
    console.error(`the ledger did not parse whole:\n${problems.join('\n')}`)
    process.exit(1)
  }

  return { rows, ladder }
}

/** The first sentence of a text, and the rest. */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=\.)\s+(?=[A-Z(])/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0)
}

/** A text with every parenthetical removed, nested ones included. */
function dropParentheticals(text: string): string {
  let result = text
  let previous = ''

  while (result !== previous) {
    previous = result
    result = result.replace(/\([^()]*\)/g, '')
  }

  return result
}

/**
 * The ledger letters and quoted row names an item cites. A citation is the
 * word `ledger` followed by section letters and quoted names in one sentence:
 * `ledger C "spin-orbit coupling" none, "Thomas precession" none`, or
 * `ledger D "the value of α" and O "α" are open`. A quote binds to the letter
 * before it.
 */
function readCitations(text: string): {
  letters: Set<string>
  quotes: { letter: string; name: string }[]
} {
  const letters = new Set<string>()
  const quotes: { letter: string; name: string }[] = []

  for (const match of text.matchAll(/\b[Ll]edger\s+/g)) {
    const start = (match.index ?? 0) + match[0].length
    const rest = text.slice(start)
    const end = rest.search(/\.(?:\s|$)/)
    const span = end < 0 ? rest : rest.slice(0, end)
    const token =
      /"([^"]+)"|(?:^|,\s+|\band\s+|\bledger\s+)([A-Q])(?=[\s,"]|$)/g
    let letter: string | null = null

    for (const part of span.matchAll(token)) {
      if (part[2]) {
        letter = part[2]
        letters.add(letter)
      } else if (part[1] && letter) {
        quotes.push({ letter, name: part[1] })
      }
    }
  }

  return { letters, quotes }
}

/** Every open item of open.md, with its fields read and its citations found. */
function readItems(path: string): Map<string, OpenItem> {
  const lines = readFileSync(path, 'utf8').split('\n')
  const items = new Map<string, OpenItem>()
  let current: OpenItem | null = null
  let field: string | null = null

  const finish = () => {
    if (!current) {
      return
    }

    const depends = current.fields.get('depends on') ?? ''
    const sentences = splitSentences(depends)
    const first = dropParentheticals(sentences[0] ?? '')
    const later = sentences.slice(1).map(dropParentheticals)
    const citable = [
      current.fields.get('what is open') ?? '',
      current.fields.get('status now') ?? '',
      current.fields.get('what closing it takes') ?? '',
      current.fields.get('where') ?? '',
    ].join(' ')
    const citations = readCitations(citable)

    current.primary = /^none\b/i.test(first) ? [] : openIdsIn(first)
    current.secondary = later
      .flatMap(sentence => openIdsIn(sentence))
      .filter(id => !current!.primary.includes(id))
    current.wantsDecision = USER_DECISION.test(first)
    current.letters = citations.letters
    current.quotes = citations.quotes
    items.set(current.id, current)
  }

  for (const line of lines) {
    const head = ITEM_LINE.exec(line)

    if (head) {
      finish()
      current = {
        id: head[2]!,
        closed: head[1] === 'x',
        title: head[3]!.trim(),
        fields: new Map(),
        primary: [],
        secondary: [],
        wantsDecision: false,
        letters: new Set(),
        quotes: [],
      }
      field = null
      continue
    }

    if (line.startsWith('## ') || line.startsWith('- [')) {
      finish()
      current = null
      field = null
      continue
    }

    if (!current) {
      continue
    }

    const fieldMatch = FIELD_LINE.exec(line)

    if (fieldMatch) {
      field = fieldMatch[1]!.trim()
      current.fields.set(field, fieldMatch[2]!.trim())
    } else if (field && line.trim().length > 0) {
      current.fields.set(
        field,
        `${current.fields.get(field)!} ${line.trim()}`.trim(),
      )
    }
  }

  finish()

  return items
}

/** gaps.md: the numbered decisions and the "waits on" kind of each listed item. */
function readGaps(path: string): {
  decisions: Decision[]
  kinds: Map<string, KeystoneKind>
} {
  const sections = readSections(readFileSync(path, 'utf8'))
  const decisionSection = sections.find(section =>
    section.heading.startsWith('Decisions only you can make'),
  )
  const areaSection = sections.find(
    section => section.heading === 'Every area',
  )

  if (!decisionSection || !areaSection?.tables[0]) {
    console.error(`${path} lacks its decisions list or its area table`)
    process.exit(1)
  }

  // A numbered list item, with its indented continuation lines joined on.
  const entries: string[] = []

  for (const line of decisionSection.lines) {
    if (/^\d+\.\s/.test(line)) {
      entries.push(line.trim())
    } else if (/^\s{2,}\S/.test(line) && entries.length > 0) {
      entries[entries.length - 1] = `${entries.at(-1)!} ${line.trim()}`
    }
  }

  const decisions = entries.map(entry => {
    const match = /^(\d+)\.\s+\*\*(.+?)\*\*/.exec(entry)

    return {
      number: Number(match?.[1] ?? 0),
      title: (match?.[2] ?? entry).replace(/[.,]$/, ''),
      items: openIdsIn(entry),
    }
  })

  const table = areaSection.tables[0]
  const waitsColumn = table.header.indexOf('waits on')
  const itemsColumn = table.header.indexOf('items')
  const kinds = new Map<string, KeystoneKind>()

  for (const cells of table.rows) {
    const waits = cells[waitsColumn] ?? ''
    const first = /\b(run|idea|decision)\b/.exec(waits)?.[1] as
      | KeystoneKind
      | undefined

    if (!first) {
      continue
    }

    const listed = idsIn({
      text: cells[itemsColumn] ?? '',
      pattern: SHORT_ITEM,
      make: (prefix, number) => `OPEN-${prefix}-${number}`,
    })

    // The area table names its items by short id, so a range is spelled
    // with the prefix both times (`ENG-01 to ENG-06`).
    const range = /([A-Z]{3})-(\d{2})\s+to\s+\1-(\d{2})/.exec(
      cells[itemsColumn] ?? '',
    )

    if (range) {
      for (
        let step = Number(range[2]);
        step <= Number(range[3]);
        step += 1
      ) {
        listed.push(`OPEN-${range[1]}-${String(step).padStart(2, '0')}`)
      }
    }

    for (const id of listed) {
      if (!kinds.has(id)) {
        kinds.set(id, first)
      }
    }
  }

  return { decisions, kinds }
}

function decisionId(number: number): KeystoneId {
  return `decision ${number}`
}

/** The open items each row is tied to, strongest link first. */
function linkRows({
  rows,
  items,
}: {
  rows: LedgerRow[]
  items: Map<string, OpenItem>
}): Map<string, { item: OpenItem; method: LinkMethod }[]> {
  const links = new Map<string, { item: OpenItem; method: LinkMethod }[]>()
  const add = (row: LedgerRow, item: OpenItem, method: LinkMethod) => {
    const list = links.get(row.id) ?? []

    if (!list.some(entry => entry.item.id === item.id)) {
      list.push({ item, method })
      links.set(row.id, list)
    }
  }

  for (const item of items.values()) {
    if (item.closed) {
      continue
    }

    for (const quote of item.quotes) {
      const name = normalize(quote.name)

      for (const row of rows) {
        const fact = normalize(row.fact)

        if (
          row.letter === quote.letter &&
          name.length > 0 &&
          (fact === name ||
            fact.startsWith(`${name} `) ||
            name.startsWith(`${fact} `))
        ) {
          add(row, item, 'quoted')
        }
      }
    }
  }

  for (const item of items.values()) {
    if (item.closed) {
      continue
    }

    const title = contentWords(item.title)

    for (const row of rows) {
      if (!item.letters.has(row.letter)) {
        continue
      }

      const words = contentWords(row.fact)
      const smaller = Math.min(words.size, title.size)

      if (smaller === 0) {
        continue
      }

      const shared = [...words].filter(word => title.has(word)).length

      if (shared === smaller) {
        add(row, item, 'title')
      } else if (shared / smaller >= TITLE_COVERAGE) {
        add(row, item, 'title-partial')
      }
    }
  }

  // A strong link (a quote or a full title match) before a partial one.
  // Among strong links the item about this row comes first: the one that
  // links the fewest rows, since an umbrella item (OPEN-FND-03 lists nine
  // rows) names a row's wait and the row's own item names its test. Then a
  // quote before a title, then file order.
  const breadth = new Map<string, number>()

  for (const list of links.values()) {
    for (const entry of list) {
      breadth.set(entry.item.id, (breadth.get(entry.item.id) ?? 0) + 1)
    }
  }

  for (const list of links.values()) {
    list.sort(
      (left, right) =>
        Number(left.method === 'title-partial') -
          Number(right.method === 'title-partial') ||
        breadth.get(left.item.id)! - breadth.get(right.item.id)! ||
        Number(left.method !== 'quoted') - Number(right.method !== 'quoted'),
    )
  }

  return links
}

/** The keystone graph: each open item to the open items and decisions it waits on. */
function buildGraph({
  items,
  decisions,
}: {
  items: Map<string, OpenItem>
  decisions: Decision[]
}): Map<KeystoneId, KeystoneId[]> {
  const gatedBy = new Map<string, number[]>()

  for (const decision of decisions) {
    for (const id of decision.items) {
      gatedBy.set(id, [...(gatedBy.get(id) ?? []), decision.number])
    }
  }

  const graph = new Map<KeystoneId, KeystoneId[]>()

  for (const item of items.values()) {
    if (item.closed) {
      continue
    }

    const edges = item.primary.filter(id => {
      const target = items.get(id)
      return target !== undefined && !target.closed && id !== item.id
    })

    for (const number of gatedBy.get(item.id) ?? []) {
      edges.push(decisionId(number))
    }

    // A first sentence that wants the user's decision, on an item no
    // numbered decision names, waits on an unnumbered one.
    if (item.wantsDecision && !gatedBy.has(item.id)) {
      edges.push(`decision (unnumbered, ${item.id})`)
    }

    graph.set(item.id, [...new Set(edges)])
  }

  for (const decision of decisions) {
    graph.set(decisionId(decision.number), [])
  }

  return graph
}

/** Every node a start reaches, and the roots among them (nodes that wait on nothing). */
function closure({
  graph,
  start,
}: {
  graph: Map<KeystoneId, KeystoneId[]>
  start: KeystoneId
}): { reached: Set<KeystoneId>; roots: KeystoneId[] } {
  const reached = new Set<KeystoneId>([start])
  const stack = [start]

  while (stack.length > 0) {
    const node = stack.pop()!

    for (const next of graph.get(node) ?? []) {
      if (!reached.has(next)) {
        reached.add(next)
        stack.push(next)
      }
    }
  }

  const roots = [...reached].filter(
    node => (graph.get(node) ?? []).length === 0,
  )

  // A closure that is all cycle has no root: its own start stands for it.
  return { reached, roots: roots.length > 0 ? roots : [start] }
}

/** The marker sentences in which a row's evidence states its own gap. */
function evidenceGap(evidence: string): string | null {
  const sentences = splitSentences(evidence).filter(sentence =>
    GAP_MARKER.test(sentence),
  )

  return sentences.length > 0 ? sentences.join(' ') : null
}

/** The experiments a rerun condition asks for, and where the list came from. */
function rerunList({
  condition,
  row,
  heldCodes,
}: {
  condition: string
  row: LedgerRow
  heldCodes: string[]
}): { codes: string[]; source: RerunSource } {
  if (EVERY_HELD_ROW.test(condition)) {
    return { codes: heldCodes, source: 'held rows' }
  }

  const named = splitSentences(condition).flatMap(sentence => {
    const at = sentence.search(RERUN_WORDS)
    return at < 0 ? [] : codesIn(sentence.slice(at))
  })

  return named.length > 0
    ? { codes: [...new Set(named)], source: 'condition' }
    : { codes: row.codes, source: 'evidence' }
}

function kindOf({
  node,
  kinds,
}: {
  node: KeystoneId
  kinds: Map<string, KeystoneKind>
}): KeystoneKind {
  if (node.startsWith('decision')) {
    return 'decision'
  }

  return kinds.get(node) ?? 'unstated'
}

const parsed = parseArgs({
  options: {
    json: { type: 'boolean', default: false },
    area: { type: 'string', short: 'a', multiple: true },
    notes: { type: 'string' },
  },
})

const roadmap = findRoadmap(parsed.values.notes)
const { rows, ladder } = readLedger(resolve(roadmap, 'everything.md'))
const items = readItems(resolve(roadmap, 'open.md'))
const { decisions, kinds } = readGaps(resolve(roadmap, 'gaps.md'))
const links = linkRows({ rows, items })
const graph = buildGraph({ items, decisions })

const frontierRows = rows.filter(
  row => row.status !== HELD && ladder.includes(row.status),
)

/** Every code the held rows stand on, for a condition that reruns them all. */
const heldCodes = [
  ...new Set(
    rows.filter(row => row.status === HELD).flatMap(row => row.codes),
  ),
].sort()

// First pass: each row's item, condition and dependency closure.
const firsts = frontierRows.map(row => {
  const linked = links.get(row.id) ?? []
  const primary = linked[0] ?? null
  const item = primary?.item ?? null
  const closing = item?.fields.get('what closing it takes') ?? null
  const gap = evidenceGap(row.evidence)
  const proposed = closing && PROPOSED.test(closing) ? closing : null
  const condition =
    closing && !proposed ? closing : gap && !closing ? gap : 'unstated'
  const conditionSource: ConditionSource =
    closing && !proposed
      ? 'item'
      : proposed
        ? 'proposed'
        : gap
          ? 'evidence'
          : 'none'
  const reach = item ? closure({ graph, start: item.id }) : null

  return {
    row,
    linked,
    item,
    closing,
    condition,
    conditionSource,
    proposed,
    link: (primary?.method ??
      (gap ? 'evidence' : 'none')) as LinkMethod,
    reach,
  }
})

// Keystone tallies over the rows: direct (the row's item is the keystone or
// waits on it directly), transitive (anywhere in the closure), sole (the
// keystone is the row's only root).
const tally = new Map<
  KeystoneId,
  { direct: Set<string>; transitive: Set<string>; sole: Set<string> }
>()
const tallyOf = (node: KeystoneId) => {
  const entry = tally.get(node) ?? {
    direct: new Set<string>(),
    transitive: new Set<string>(),
    sole: new Set<string>(),
  }
  tally.set(node, entry)
  return entry
}

for (const first of firsts) {
  if (!first.item || !first.reach) {
    continue
  }

  const direct = new Set([first.item.id, ...(graph.get(first.item.id) ?? [])])

  for (const node of first.reach.reached) {
    tallyOf(node).transitive.add(first.row.id)

    if (direct.has(node)) {
      tallyOf(node).direct.add(first.row.id)
    }
  }

  if (first.reach.roots.length === 1) {
    tallyOf(first.reach.roots[0]!).sole.add(first.row.id)
  }
}

const reachOf = (node: KeystoneId) => tally.get(node)?.transitive.size ?? 0

// Second pass: headline keystone, kind, and compute tier.
const frontier: Frontier[] = firsts.map(first => {
  const index = ladder.indexOf(first.row.status)
  const roots = (first.reach?.roots ?? []).sort(
    (left, right) => reachOf(right) - reachOf(left) || left.localeCompare(right),
  )
  const isRerun =
    first.conditionSource === 'item' && RERUN_WORDS.test(first.condition)
  const openDependencies = (graph.get(first.item?.id ?? '') ?? []).length
  const rootsAllowRule = roots.every(
    root =>
      root === decisionId(RULE_DECISION) ||
      (!root.startsWith('decision') &&
        kindOf({ node: root, kinds }) === 'run'),
  )
  const compute: ComputeTier = !isRerun
    ? null
    : openDependencies === 0
      ? 'now'
      : rootsAllowRule
        ? 'after decision 4'
        : null
  const rerun = compute
    ? rerunList({ condition: first.condition, row: first.row, heldCodes })
    : null
  const keystone =
    compute === 'now'
      ? 'compute only: rerun on the adopted rule'
      : (roots[0] ?? null)

  return {
    id: first.row.id,
    area: first.row.letter,
    fact: first.row.fact,
    status: first.row.status,
    next: index > 0 ? ladder[index - 1]! : HELD,
    link: first.link,
    item: first.item?.id ?? null,
    others: first.linked.slice(1).map(entry => entry.item.id),
    condition: first.condition,
    conditionSource: first.conditionSource,
    proposed: first.proposed,
    keystone,
    keystoneKind:
      compute === 'now'
        ? 'run'
        : keystone
          ? kindOf({ node: keystone, kinds })
          : null,
    roots,
    compute,
    rerun: rerun?.codes ?? [],
    rerunSource: rerun?.source ?? null,
  }
})

// A decision no row waits on is still listed, at zero: that is a finding.
for (const decision of decisions) {
  tallyOf(decisionId(decision.number))
}

const keystones = [...tally.entries()]
  .map(([node, entry]) => ({
    keystone: node,
    kind: kindOf({ node, kinds }),
    title: node.startsWith('decision ')
      ? (decisions.find(d => decisionId(d.number) === node)?.title ?? null)
      : (items.get(node)?.title ?? null),
    direct: entry.direct.size,
    transitive: entry.transitive.size,
    sole: entry.sole.size,
    isRoot: (graph.get(node) ?? []).length === 0,
  }))
  .sort(
    (left, right) =>
      right.transitive - left.transitive ||
      right.direct - left.direct ||
      left.keystone.localeCompare(right.keystone),
  )

const computeOnly = frontier.filter(row => row.compute !== null)
const unstated = frontier.filter(
  row => row.conditionSource === 'none' || row.conditionSource === 'proposed',
)
const statusCounts = Object.fromEntries(
  ladder.map(status => [
    status,
    rows.filter(row => row.status === status).length,
  ]),
)
const linkCounts = Object.fromEntries(
  (
    ['quoted', 'title', 'title-partial', 'evidence', 'none'] as LinkMethod[]
  ).map(method => [
    method,
    frontier.filter(row => row.link === method).length,
  ]),
)

const areas = (parsed.values.area ?? [])
  .flatMap(value => value.split(','))
  .map(value => value.trim().toUpperCase())
  .filter(value => value.length > 0)
const shown =
  areas.length > 0
    ? frontier.filter(row => areas.includes(row.area))
    : frontier

if (parsed.values.json) {
  console.log(
    JSON.stringify(
      {
        source: roadmap,
        ladder,
        statuses: statusCounts,
        rows: rows.length,
        frontier: frontier.length,
        links: linkCounts,
        decisions,
        keystones: keystones.map(entry => ({
          keystone: entry.keystone,
          kind: entry.kind,
          title: entry.title,
          rows_direct: entry.direct,
          rows_transitive: entry.transitive,
          rows_sole: entry.sole,
          is_root: entry.isRoot,
        })),
        compute_only: computeOnly.map(row => ({
          id: row.id,
          tier: row.compute,
          item: row.item,
          rerun: row.rerun,
          rerun_source: row.rerunSource,
        })),
        unstated: unstated.map(row => ({
          id: row.id,
          status: row.status,
          reason:
            row.conditionSource === 'proposed'
              ? 'proposed only'
              : 'no linked item and no gap sentence',
          item: row.item,
        })),
        rows_audit: shown.map(row => ({
          id: row.id,
          area: row.area,
          fact: row.fact,
          status: row.status,
          next: row.next,
          link: row.link,
          item: row.item,
          other_items: row.others,
          condition: row.condition,
          condition_source: row.conditionSource,
          proposed: row.proposed,
          keystone: row.keystone,
          keystone_kind: row.keystoneKind,
          roots: row.roots,
          compute: row.compute,
          rerun: row.rerun,
        })),
      },
      null,
      2,
    ),
  )
} else {
  const out: string[] = []
  const clip = (text: string, width: number) =>
    text.length > width ? `${text.slice(0, width - 3)}...` : text
  const listCodes = (codes: string[]) =>
    codes.length === 0
      ? 'no code named'
      : codes.length > 8
        ? `${codes.length} codes (${codes.slice(0, 4).join(', ')}, ...)`
        : codes.join(', ')

  out.push(
    `ledger ${rows.length} rows: ${ladder.map(status => `${statusCounts[status]} ${status}`).join(', ')}`,
  )
  out.push(
    `frontier ${frontier.length} rows not held. linked by quote ${linkCounts.quoted}, by full title ${linkCounts.title}, by partial title ${linkCounts['title-partial']}, by evidence only ${linkCounts.evidence}, not at all ${linkCounts.none}`,
  )
  out.push('')
  out.push('1. ROWS')

  for (const row of shown) {
    out.push('')
    out.push(
      `${row.id}  [${row.area}] ${row.status} -> ${row.next}  (${row.link}${row.item ? ` ${row.item}` : ''}${row.others.length > 0 ? `, also ${row.others.join(' ')}` : ''})`,
    )
    out.push(
      `  condition (${row.conditionSource}): ${clip(row.condition, 220)}`,
    )

    if (row.proposed) {
      out.push(`  proposed, not stated: ${clip(row.proposed, 200)}`)
    }

    out.push(
      `  keystone: ${row.keystone ?? 'unstated'}${row.keystoneKind ? ` (${row.keystoneKind})` : ''}${row.roots.length > 1 ? `  all roots: ${row.roots.join(', ')}` : ''}`,
    )

    if (row.compute) {
      out.push(
        `  compute only, ${row.compute}: rerun ${listCodes(row.rerun)} (from the ${row.rerunSource})`,
      )
    }
  }

  out.push('')
  out.push('2. KEYSTONES, by rows freed (transitive, direct, sole)')
  out.push('')

  for (const entry of keystones) {
    out.push(
      `${String(entry.transitive).padStart(3)} ${String(entry.direct).padStart(3)} ${String(entry.sole).padStart(3)}  ${entry.keystone.padEnd(12)} ${entry.kind.padEnd(8)} ${entry.isRoot ? 'root' : '    '}  ${clip(entry.title ?? '', 70)}`,
    )
  }

  out.push('')
  out.push(
    `3. COMPUTE ONLY: ${computeOnly.length} rows (${computeOnly.filter(row => row.compute === 'now').length} now, ${computeOnly.filter(row => row.compute === 'after decision 4').length} after decision 4)`,
  )

  for (const row of computeOnly) {
    out.push(
      `  ${row.id}  ${row.compute}  ${row.item ?? ''}  rerun ${listCodes(row.rerun)} (${row.rerunSource})`,
    )
  }

  out.push('')
  out.push(
    `4. UNSTATED: ${unstated.length} of ${frontier.length} rows have no stated promotion condition (${unstated.filter(row => row.conditionSource === 'none').length} unlinked, ${unstated.filter(row => row.conditionSource === 'proposed').length} proposed only)`,
  )

  for (const row of unstated) {
    out.push(
      `  ${row.id}  ${row.status}  ${row.conditionSource === 'proposed' ? `proposed only, ${row.item}` : 'no item, no gap sentence'}`,
    )
  }

  console.log(out.join('\n'))
}
