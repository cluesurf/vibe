// The SPA server entry. It renders only the static shell (ssr: false), but it MUST use a STREAMING renderer:
// React Router's client hydration reads `window.__reactRouterContext.stream`, which the server entry has to feed
// and close. renderToString is synchronous and cannot drive that stream or the Suspense boundary that wraps the
// HydrateFallback, so the client would wait forever and never mount (a blank page). renderToPipeableStream both
// supports Suspense and feeds the hydration stream, and it needs no @react-router/node, only node:stream, so the
// sample app's dependencies stay at react, react-dom, react-router. React's stream renderer also emits the
// <!DOCTYPE html> for a full-document render, so we do not prepend it by hand.

import { PassThrough, Readable } from 'node:stream'
import { renderToPipeableStream } from 'react-dom/server'
import { ServerRouter } from 'react-router'
import type { EntryContext } from 'react-router'

const ABORT_DELAY = 10_000

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    let shellRendered = false
    let status = responseStatusCode
    const { pipe, abort } = renderToPipeableStream(<ServerRouter context={routerContext} url={request.url} />, {
      onShellReady() {
        shellRendered = true
        const body = new PassThrough()
        responseHeaders.set('Content-Type', 'text/html')
        resolve(new Response(Readable.toWeb(body) as unknown as ReadableStream, { status, headers: responseHeaders }))
        pipe(body)
      },
      onShellError(error) {
        reject(error)
      },
      onError(error) {
        status = 500
        // log only after the shell rendered, so a shell error is not double-reported (it rejects above)
        if (shellRendered) console.error(error)
      },
    })
    setTimeout(abort, ABORT_DELAY)
  })
}
