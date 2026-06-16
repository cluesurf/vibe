import { Links, Meta, Outlet, Scripts, ScrollRestoration, type LinksFunction } from 'react-router'
import appCss from './style/app.css?url'

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: appCss }]

export function Layout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Vibe — hyperbolic renderer</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App(): React.ReactElement {
  return <Outlet />
}
