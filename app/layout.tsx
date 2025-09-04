import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "StudySync - Focus Study Tracker",
  description: "A focused study tracker for seamless learning sessions",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StudySync",
  },
  icons: {
    icon: [
      { url: "/Minimalist Logo for StudySync App (Version 1).png", sizes: "192x192", type: "image/png" },
      { url: "/placeholder-logo.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/Minimalist Logo for StudySync App (Version 1).png", sizes: "180x180", type: "image/png" }
    ]
  },
  other: {
    "msapplication-TileColor": "#3b82f6",
    "msapplication-config": "/browserconfig.xml"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="StudySync" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="StudySync" />
        <meta name="description" content="A focused study tracker for seamless learning sessions" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />
        
        <link rel="apple-touch-icon" href="/Minimalist Logo for StudySync App (Version 1).png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/Minimalist Logo for StudySync App (Version 1).png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/Minimalist Logo for StudySync App (Version 1).png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/Minimalist Logo for StudySync App (Version 1).png" color="#3b82f6" />
        <link rel="shortcut icon" href="/Minimalist Logo for StudySync App (Version 1).png" />
        {/* Global hard hide to make all pages invisible and non-interactive */}
        <style
          dangerouslySetInnerHTML={{
            __html:
              `html,body{opacity:0!important;pointer-events:none!important;user-select:none!important}`,
          }}
        />
      </head>
      <body className={inter.className} style={{ opacity: 0, pointerEvents: "none", userSelect: "none" }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                      
                      // Check if there's an update available
                      registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', function() {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content is available, refresh the page
                            if (confirm('New version available! Reload to update?')) {
                              window.location.reload();
                            }
                          }
                        });
                      });
                    })
                    .catch(function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                });
                
                // Handle offline/online events
                window.addEventListener('online', function() {
                  console.log('App is online');
                  document.body.classList.remove('offline');
                  // Reload the page to get fresh content
                  if (window.location.pathname === '/offline') {
                    window.location.href = '/';
                  }
                });
                
                window.addEventListener('offline', function() {
                  console.log('App is offline');
                  document.body.classList.add('offline');
                });
                
                // Check initial connection status
                if (!navigator.onLine) {
                  console.log('App started offline');
                  document.body.classList.add('offline');
                }
              }
            `
          }}
        />

        {/* Aggressive auto-refresh and cache/data purge every 1s */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                async function clearAllData() {
                  try { localStorage.clear(); } catch(e) {}
                  try { sessionStorage.clear(); } catch(e) {}
                  try {
                    document.cookie.split(';').forEach(function(cookie) {
                      var eqPos = cookie.indexOf('=');
                      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
                    });
                  } catch(e) {}
                  try {
                    if ('caches' in window) {
                      const keys = await caches.keys();
                      await Promise.all(keys.map((k) => caches.delete(k)));
                    }
                  } catch(e) {}
                  try {
                    if ('indexedDB' in window && indexedDB.databases) {
                      const dbs = await indexedDB.databases();
                      await Promise.all(
                        dbs.map((db) => db && db.name ? new Promise((resolve) => {
                          const req = indexedDB.deleteDatabase(db.name);
                          req.onsuccess = req.onerror = req.onblocked = function() { resolve(undefined); };
                        }) : Promise.resolve(undefined))
                      );
                    }
                  } catch(e) {}
                  try {
                    if ('serviceWorker' in navigator) {
                      const regs = await navigator.serviceWorker.getRegistrations();
                      await Promise.all(regs.map((r) => r.unregister()));
                    }
                  } catch(e) {}
                }

                setInterval(function() {
                  clearAllData().finally(function() {
                    try { window.location.reload(); } catch(e) { location.href = location.href; }
                  });
                }, 1000);
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
