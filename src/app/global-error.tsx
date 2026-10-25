"use client";

/** Last-resort error page when the root layout itself fails. Self-contained styling. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f3efe6", color: "#2a221d", fontFamily: "Georgia, serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: "2rem" }}>
          <div>
            <p style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#63674f" }}>Harlow Brook Flowers</p>
            <h1 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 400, margin: "1rem 0" }}>Something went wrong.</h1>
            <p style={{ fontFamily: "system-ui, sans-serif", color: "#463c34" }}>Please try again in a moment. No payment was taken.</p>
            <button
              type="button"
              onClick={reset}
              style={{ marginTop: "1.5rem", height: 44, padding: "0 24px", borderRadius: 999, border: 0, background: "#2a221d", color: "#faf8f3", fontWeight: 600 }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
