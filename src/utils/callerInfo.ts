import { relative } from 'path'
import { fileURLToPath } from 'url'

/**
 * Converts a raw stack-frame path (file:// URL or absolute FS path) to a
 * forward-slash path relative to process.cwd() (the project root).
 * Falls back to the basename if the conversion fails.
 */
export function toRelativePath(raw: string): string {
  try {
    const fsPath = raw.startsWith('file://') ? fileURLToPath(raw) : raw
    const rel = relative(process.cwd(), fsPath)
    // Replace backslashes on Windows and guard against empty string
    return rel ? rel.replaceAll('\\', '/') : (raw.split('/').at(-1) ?? raw)
  } catch {
    return raw.split('/').at(-1) ?? raw
  }
}

/**
 * Extracts a compact caller location string from the V8/Bun stack trace.
 * Returns a bare "src/path/file.ts:42 functionName" string (no brackets),
 * so callers can format it as needed. Returns "" if parsing fails.
 *
 * Depth counts (0-based lines of Error.stack):
 *   0 = "Error"
 *   1 = getCallerLocation itself
 *   2 = the function that called getCallerLocation
 *   3 = direct caller of that function
 *   4+ = wrappers / indirect callers
 */
export function getCallerLocation(depth: number): string {
  const lines = new Error().stack?.split('\n')
  const frame = lines?.[depth] ?? ''
  // Named function:  "    at fnName (file:///path/file.ts:42:10)"
  const named = frame.match(/at (\S+) \((.+):(\d+):\d+\)/)
  if (named) {
    const [, fn, file, line] = named
    return `${toRelativePath(file ?? '')}:${line} ${fn}`
  }
  // Anonymous / top-level:  "    at file:///path/file.ts:42:10"
  const anon = frame.match(/at (.+):(\d+):\d+/)
  if (anon) {
    const [, file, line] = anon
    return `${toRelativePath(file ?? '')}:${line}`
  }
  return ''
}
