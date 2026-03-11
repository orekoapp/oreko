// Bug #396: Dynamic Twitter card image (PNG) — reuses OG image design
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'QuoteCraft - Beautiful Invoices. No Expensive Subscription.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          padding: '60px 80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
          }}
        />

        {/* Logo + Title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.9)',
              }}
            />
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: 'white',
              letterSpacing: -1,
            }}
          >
            QuoteCraft
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 4,
            borderRadius: 2,
            background: '#F59E0B',
            marginTop: 24,
            marginBottom: 24,
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.85)',
            fontWeight: 400,
          }}
        >
          Beautiful Invoices. No Expensive Subscription.
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
          {['Visual Builder', 'Quote to Invoice', 'Self-Hosted', 'Open Source'].map(
            (label) => (
              <div
                key={label}
                style={{
                  padding: '10px 24px',
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                {label}
              </div>
            ),
          )}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 40,
            background: 'rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 80px',
            fontSize: 14,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          <span>github.com/WisdmLabs/quote-software</span>
          <span>Open Source &amp; Self-Hosted</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
