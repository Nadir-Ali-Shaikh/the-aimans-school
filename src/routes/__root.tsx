import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { Preloader } from "@/components/site/Preloader";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-primary">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">You can try refreshing or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
          <a href="/" className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "The Aiman's School Umerkot",
  description: "Premier English-medium school and college in Umerkot offering Montessori, Primary, Secondary and Intermediate education.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Umerkot",
    addressRegion: "Sindh",
    addressCountry: "PK",
  },
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "The Aiman's School Umerkot | Premier English-Medium Education" },
      { name: "description", content: "Premier English-medium school and college in Umerkot — Montessori to Intermediate. Smart classes, experienced teachers, Islamic values and modern facilities." },
      { name: "author", content: "The Aiman's School Umerkot" },
      { property: "og:site_name", content: "The Aiman's School Umerkot" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0B1F3A" },
      { property: "og:title", content: "The Aiman's School Umerkot | Premier English-Medium Education" },
      { name: "twitter:title", content: "The Aiman's School Umerkot | Premier English-Medium Education" },
      { property: "og:description", content: "Premier English-medium school and college in Umerkot — Montessori to Intermediate. Smart classes, experienced teachers, Islamic values and modern facilities." },
      { name: "twitter:description", content: "Premier English-medium school and college in Umerkot — Montessori to Intermediate. Smart classes, experienced teachers, Islamic values and modern facilities." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a709993b-66f0-4706-a47b-9911e04c8feb/id-preview-e3a896c8--0f1491f4-28cf-435e-87fe-20a8d4b9931f.lovable.app-1779951434642.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a709993b-66f0-4706-a47b-9911e04c8feb/id-preview-e3a896c8--0f1491f4-28cf-435e-87fe-20a8d4b9931f.lovable.app-1779951434642.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preload", href: "/logo.png", as: "image" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(orgJsonLd) },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {/* Instant Static Preloader Screen */}
        <div
          id="root-preloader"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0B1F3A",
            transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Background elegant lighting glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at center, rgba(255,255,255,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          
          <div
            className="animate-preloader-intro"
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              maxWidth: "24rem",
              paddingLeft: "1.5rem",
              paddingRight: "1.5rem",
              textAlign: "center",
            }}
          >
            {/* Glowing aura ring behind logo */}
            <div
              style={{
                position: "absolute",
                height: "16rem",
                width: "16rem",
                borderRadius: "9999px",
                background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)",
                filter: "blur(24px)",
                animation: "pulse 2s infinite",
              }}
            />
            
            {/* School Logo */}
            <div
              style={{
                position: "relative",
                marginBottom: "2rem",
                overflow: "hidden",
                borderRadius: "1rem",
                padding: "1.25rem",
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "0 0 50px rgba(255,255,255,0.05)",
              }}
            >
              <img
                src="/logo.png"
                alt="The Aiman's School Logo"
                style={{
                  width: "15rem",
                  height: "15rem",
                  objectFit: "contain",
                  filter: "drop-shadow(0 4px 20px rgba(255,255,255,0.15))",
                }}
                width="240"
                height="240"
              />
              {/* Golden sweep reflection line */}
              <div
                className="animate-preloader-shine"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)",
                }}
              />
            </div>

            {/* Brand tagline progress indicator */}
            <div
              style={{
                width: "12rem",
                height: "2px",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "9999px",
                overflow: "hidden",
                position: "relative",
                marginBottom: "1rem",
              }}
            >
              <div
                className="animate-preloader-bar"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: "0%",
                  backgroundColor: "white",
                  borderRadius: "9999px",
                }}
              />
            </div>
            
            <span
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.35em",
                color: "rgba(255,255,255,0.7)",
                fontWeight: 600,
                display: "inline-block",
              }}
            >
              LEARN • LEAD • ACHIEVE
            </span>
          </div>
        </div>

        {/* JS Controller to hide preloader natively */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var preloader = document.getElementById("root-preloader");
                document.body.style.overflow = "hidden";
                setTimeout(function() {
                  if (preloader) {
                    preloader.style.opacity = "0";
                    preloader.style.transform = "scale(1.08) translateY(0)";
                    preloader.style.filter = "blur(12px)";
                    preloader.style.pointerEvents = "none";
                  }
                }, 2000);
                setTimeout(function() {
                  if (preloader) {
                    preloader.style.display = "none";
                  }
                  document.body.style.overflow = "";
                }, 2700);
              })();
            `,
          }}
        />

        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </QueryClientProvider>
  );
}
