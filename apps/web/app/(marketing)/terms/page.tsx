export const metadata = {
  title: 'Terms of Service | QuoteCraft',
  description: 'Terms and conditions for using QuoteCraft.',
};

export default function TermsPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 15, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using QuoteCraft, you agree to be bound by these Terms of Service. If
            you do not agree to these terms, please do not use our services.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            QuoteCraft is an open-source quote and invoice management platform. We provide both a
            cloud-hosted version and a self-hosted option.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            To use certain features, you must create an account. You are responsible for
            maintaining the confidentiality of your account credentials and for all activities
            that occur under your account.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the service for any illegal purpose</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on the rights of others</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with the proper functioning of the service</li>
            <li>Upload malicious code or content</li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>
            QuoteCraft is open-source software licensed under the MIT License. You are free to
            use, modify, and distribute the software in accordance with the license terms.
          </p>

          <h2>6. Payment Terms</h2>
          <p>
            For cloud-hosted plans, subscription fees are billed in advance on a monthly basis.
            All fees are non-refundable except as required by law.
          </p>

          <h2>7. Data Ownership</h2>
          <p>
            You retain all rights to your data. We do not claim ownership of any content you
            create or upload to QuoteCraft.
          </p>

          <h2>8. Service Availability</h2>
          <p>
            We strive to maintain high availability but do not guarantee uninterrupted access.
            Self-hosted instances are entirely under your control and responsibility.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, QuoteCraft shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages resulting from your
            use of the service.
          </p>

          <h2>10. Termination</h2>
          <p>
            We may terminate or suspend your account at any time for violation of these terms.
            You may terminate your account at any time by contacting support.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. We will notify you of any material
            changes by posting the new terms on this page.
          </p>

          <h2>12. Contact</h2>
          <p>
            If you have questions about these Terms of Service, please contact us at{' '}
            <a href="mailto:legal@quotecraft.app" className="text-primary hover:underline">
              legal@quotecraft.app
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
