export const metadata = {
  title: 'Cookie Policy | QuoteCraft',
  description: 'Learn how QuoteCraft uses cookies and similar technologies.',
};

export default function CookiesPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 15, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They
            help websites remember your preferences and provide a better user experience.
          </p>

          <h2>How We Use Cookies</h2>
          <p>QuoteCraft uses cookies for the following purposes:</p>

          <h3>Essential Cookies</h3>
          <p>
            These cookies are necessary for the website to function properly. They enable core
            functionality such as security, authentication, and session management.
          </p>
          <ul>
            <li>
              <strong>Session cookies:</strong> Keep you logged in during your session
            </li>
            <li>
              <strong>Security cookies:</strong> Protect against cross-site request forgery
            </li>
          </ul>

          <h3>Preference Cookies</h3>
          <p>
            These cookies remember your preferences, such as your preferred theme (light/dark
            mode) and language settings.
          </p>

          <h3>Analytics Cookies</h3>
          <p>
            We use analytics cookies to understand how visitors interact with our website. This
            helps us improve our services.
          </p>
          <ul>
            <li>Pages visited and time spent</li>
            <li>Features used</li>
            <li>Error reports</li>
          </ul>

          <h2>Third-Party Cookies</h2>
          <p>We may use third-party services that set their own cookies:</p>
          <ul>
            <li>
              <strong>Stripe:</strong> For payment processing
            </li>
            <li>
              <strong>Analytics providers:</strong> For usage statistics (if enabled)
            </li>
          </ul>

          <h2>Managing Cookies</h2>
          <p>
            You can control and manage cookies in several ways. Most browsers allow you to:
          </p>
          <ul>
            <li>View and delete cookies</li>
            <li>Block all cookies</li>
            <li>Block third-party cookies</li>
            <li>Clear all cookies when you close the browser</li>
          </ul>
          <p>
            Note that blocking cookies may affect the functionality of our services, particularly
            authentication features.
          </p>

          <h2>Self-Hosted Instances</h2>
          <p>
            If you self-host QuoteCraft, you have complete control over cookie usage. No
            third-party analytics cookies are included by default in self-hosted installations.
          </p>

          <h2>Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time. Any changes will be posted on
            this page with an updated revision date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about our use of cookies, please contact us at{' '}
            <a href="mailto:privacy@quote.persuado.tech" className="text-primary hover:underline">
              privacy@quote.persuado.tech
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
