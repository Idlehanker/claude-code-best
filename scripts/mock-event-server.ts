/**
 * Mock 1P event logging server for local development.
 *
 * Accepts POST /api/event_logging/batch with the FirstPartyEventLoggingPayload
 * format and pretty-prints every event to stdout.
 *
 * Usage:
 *   bun run scripts/mock-event-server.ts
 *
 * Then in .env:
 *   CLAUDE_1P_EVENT_BASE_URL=http://localhost:3101
 */

const PORT = Number(process.env.MOCK_EVENT_PORT ?? 3101)

let eventCount = 0

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)

    // Health check
    if (url.pathname === '/health') {
      return Response.json({ ok: true })
    }

    // Event logging endpoint
    if (
      (url.pathname === '/api/event_logging/batch' ||
        url.pathname === '/api/event_logging/v2/batch') &&
      req.method === 'POST'
    ) {
      let body: unknown
      try {
        body = await req.json()
      } catch {
        return Response.json({ error: 'invalid JSON' }, { status: 400 })
      }

      const payload = body as { events?: unknown[] }
      const events = payload?.events ?? []
      eventCount += events.length

      console.log(
        `\n${'═'.repeat(70)}\n📨  Received batch: ${events.length} event(s)  [total: ${eventCount}]\n${'═'.repeat(70)}`,
      )

      for (const [i, event] of events.entries()) {
        const e = event as {
          event_type?: string
          event_data?: Record<string, unknown>
        }
        console.log(`\n[${i + 1}] event_type: ${e.event_type ?? 'unknown'}`)

        const data = e.event_data ?? {}
        const eventName = data.event_name ?? data.body ?? '(no name)'
        console.log(`    event_name: ${eventName}`)

        // Decode additional_metadata if base64-encoded
        if (typeof data.additional_metadata === 'string') {
          try {
            const decoded = JSON.parse(
              Buffer.from(data.additional_metadata, 'base64').toString('utf8'),
            )
            console.log(
              '    additional_metadata:',
              JSON.stringify(decoded, null, 6).replace(/\n/g, '\n    '),
            )
          } catch {
            console.log(
              '    additional_metadata (raw):',
              data.additional_metadata,
            )
          }
        }

        // Print other top-level fields
        const skip = new Set(['event_name', 'additional_metadata', 'body'])
        for (const [k, v] of Object.entries(data)) {
          if (!skip.has(k) && v !== undefined && v !== null && v !== '') {
            console.log(
              `    ${k}:`,
              typeof v === 'object' ? JSON.stringify(v) : v,
            )
          }
        }
      }

      return Response.json({ ok: true, received: events.length })
    }

    console.warn(
      `[mock-event-server] Unknown route: ${req.method} ${url.pathname}`,
    )
    return Response.json({ message: 'Unknown API endpoint' }, { status: 404 })
  },
})

console.log(`
🚀  Mock event logging server running at http://localhost:${PORT}
    Listening on: POST /api/event_logging/batch

    Add to .env:
      CLAUDE_1P_EVENT_BASE_URL=http://localhost:${PORT}

    Test with curl:
      curl http://localhost:${PORT}/health
`)

process.on('SIGINT', () => {
  console.log(`\n✅  Received ${eventCount} event(s) total. Goodbye.`)
  server.stop()
  process.exit(0)
})
