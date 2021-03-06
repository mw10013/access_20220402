import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "remix";
import type { MetaFunction } from "remix";
import styles from "./tailwind.css";
import React from "react";
import { GenericCatchBoundary, GenericErrorBoundary } from "./components/lib";

export const meta: MetaFunction = () => {
  return { title: "Access" };
};

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

function Document({ children }: { children: React.ReactNode }) {
  // https://tailwindui.com/components/application-ui/page-examples/settings-screens
  // With sidebar navigation and two-column form
  // <html class="h-full bg-gray-100">
  // <body class="h-full">
  return (
    <html lang="en" className="h-full bg-gray-100">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function CatchBoundary() {
  return (
    <Document>
      <GenericCatchBoundary />
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document>
      <GenericErrorBoundary error={error} />
    </Document>
  );
}
