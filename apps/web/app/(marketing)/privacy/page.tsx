export const metadata = {
  title: 'Privacy Policy | Oreko',
  description: 'Learn how Oreko handles your data and protects your privacy.',
};

export default function PrivacyPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 15, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Introduction</h2>
          <p>
            Oreko (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to
            protecting your privacy. This Privacy Policy explains how we collect, use, and share
            information about you when you use our services.
          </p>

          <h2>Information We Collect</h2>
          <h3>Information You Provide</h3>
          <ul>
            <li>Account information (name, email, password)</li>
            <li>Business information (company name, address, logo)</li>
            <li>Client information you add to the platform</li>
            <li>Quote and invoice content</li>
            <li>Payment information (processed by Stripe)</li>
          </ul>

          <h3>Information Collected Automatically</h3>
          <ul>
            <li>Usage data (pages visited, features used)</li>
            <li>Device information (browser type, operating system)</li>
            <li>IP address and location data</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain the Oreko service</li>
            <li>Process transactions and send related information</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Detect, investigate, and prevent fraudulent transactions</li>
          </ul>

          <h2>Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share your information with:
          </p>
          <ul>
            <li>Service providers who assist in our operations (hosting, payment processing)</li>
            <li>Law enforcement when required by law</li>
            <li>Other parties with your consent</li>
          </ul>

          <h2>Self-Hosted Instances</h2>
          <p>
            If you self-host Oreko, we do not have access to any of your data. All
            information is stored on your own servers and is entirely under your control.
          </p>

          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your information, including
            encryption in transit and at rest, regular security audits, and access controls.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and associated data</li>
            <li>Export your data</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@oreko.app" className="text-primary hover:underline">
              privacy@oreko.app
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
