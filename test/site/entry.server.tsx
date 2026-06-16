// A minimal SPA server entry. Because the app is client-only (ssr: false), this is used only to emit the static
// shell, so it renders synchronously with react-dom's renderToString and needs no platform server runtime
// (@react-router/node). That keeps the sample app's dependencies to just react, react-dom, react-router.

import type { EntryContext } from 'react-router'
import { ServerRouter } from 'react-router'
import { renderToString } from 'react-dom/server'

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
): Response {
  const html = renderToString(<ServerRouter context={routerContext} url={request.url} />)
  responseHeaders.set('Content-Type', 'text/html')
  return new Response(`<!DOCTYPE html>${html}`, {
    status: responseStatusCode,
    headers: responseHeaders,
  })
}
