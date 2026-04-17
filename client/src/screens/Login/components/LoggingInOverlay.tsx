import { CreditCard } from "lucide-react";
import map from 'lodash/map';

const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.5rem",
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    animation: "costop-fade-in 0.25s ease",
};

const spinnerWrapStyle: React.CSSProperties = {
    position: "relative",
    width: 88,
    height: 88,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const spinnerRingStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "3px solid transparent",
    borderTopColor: "#059669",      /* emerald-600 */
    borderRightColor: "#6ee7b7",    /* emerald-300 */
    animation: "costop-spin 0.9s cubic-bezier(0.45,0.05,0.55,0.95) infinite",
};

const iconBubbleStyle: React.CSSProperties = {
    width: 56,
    height: 56,
    borderRadius: "1rem",
    background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "costop-pulse 1.8s ease-in-out infinite",
};

const labelStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.35rem",
};

const headingStyle: React.CSSProperties = {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#064e3b",          /* emerald-950 */
    letterSpacing: "-0.01em",
    margin: 0,
};

const subStyle: React.CSSProperties = {
    fontSize: "0.8125rem",
    color: "#6b7280",
    margin: 0,
};

const dotsStyle: React.CSSProperties = {
    display: "flex",
    gap: 6,
};

if (typeof document !== "undefined" && !document.getElementById("costop-loader-kf")) {
    const style = document.createElement("style");
    style.id = "costop-loader-kf";
    style.textContent = `
        @keyframes costop-fade-in {
            from { opacity: 0; }
            to   { opacity: 1; }
        }
        @keyframes costop-spin {
            to { transform: rotate(360deg); }
        }
        @keyframes costop-pulse {
            0%, 100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(16,185,129,0.15); }
            50%       { transform: scale(1.07); box-shadow: 0 0 0 10px rgba(16,185,129,0); }
        }
        @keyframes costop-dot {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
            40%            { transform: scale(1);   opacity: 1;    }
        }
        .costop-dot { animation: costop-dot 1.2s ease-in-out infinite; }
        .costop-dot:nth-child(2) { animation-delay: 0.2s; }
        .costop-dot:nth-child(3) { animation-delay: 0.4s; }
    `;
    document.head.appendChild(style);
}

export default function LoggingInOverlay() {
    return (
        <div style={overlayStyle} role="status" aria-label="Signing you in…">
            <div style={spinnerWrapStyle}>
                <div style={spinnerRingStyle} />
                <div style={iconBubbleStyle}>
                    <CreditCard size={26} color="#059669" strokeWidth={2.2} />
                </div>
            </div>

            <div style={labelStyle}>
                <p style={headingStyle}>Signing you in</p>
                <p style={subStyle}>Verifying your Google account…</p>
            </div>

            <div style={dotsStyle}>
                {map([0, 1, 2], (i) => (
                    <span
                        key={i}
                        className="costop-dot"
                        style={{
                            display: "inline-block",
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: "#059669",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
