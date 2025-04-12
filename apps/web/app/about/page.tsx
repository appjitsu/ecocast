import Link from 'next/link';

export default function AboutPage() {
  const GITHUB_REPO_URL = 'https://github.com/your-username/ecocast';
  const AUTHOR_LINK_URL = '#';

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4 text-center">
        About Ecocast
      </h1>
      <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-10">
        Your daily news, transformed into personalized podcasts.
      </p>

      <div className="prose prose-lg dark:prose-invert max-w-3xl mx-auto space-y-8">
        {/* --- Mission --- */}
        <section>
          <h2 className="text-2xl font-semibold tracking-tight mt-0 mb-4">
            Our Mission
          </h2>
          <p>
            To make staying informed effortless and engaging by leveraging AI to
            deliver personalized audio news digests. We believe in transforming
            information consumption for busy lives.
          </p>
        </section>

        <hr className="dark:border-gray-700" />

        {/* --- What it Does --- */}
        <section>
          <h2 className="text-2xl font-semibold tracking-tight mt-0 mb-4">
            What Ecocast Does
          </h2>
          <p>
            Ecocast allows you to curate your news experience. Simply select
            your preferred news sources from our extensive list. Every day, our
            system gathers the latest articles from your selections, uses
            advanced AI to identify the most important stories, summarizes them,
            and then generates a high-quality audio podcast using
            natural-sounding voices. Wake up to a personalized news briefing
            waiting for you, perfect for commuting, working out, or just
            catching up.
          </p>
        </section>

        <hr className="dark:border-gray-700" />

        {/* --- Technology --- */}
        <section>
          <h2 className="text-2xl font-semibold tracking-tight mt-0 mb-4">
            The Technology Behind Ecocast
          </h2>
          <p>
            We leverage a modern, robust tech stack to deliver a seamless and
            scalable experience:
          </p>
          <ul className="list-none pl-0 space-y-3 !mt-4">
            <li className="flex items-center gap-3">
              <span className="inline-block w-6 h-6 text-center text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                {' '}
                L{' '}
              </span>
              <span>
                <strong>Frontend:</strong> Built with{' '}
                <a
                  href="https://nextjs.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Next.js
                </a>{' '}
                and{' '}
                <a
                  href="https://react.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-600 dark:hover:text-blue-400"
                >
                  React
                </a>
                .
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-block w-6 h-6 text-center text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                {' '}
                L{' '}
              </span>
              <span>
                <strong>Backend:</strong> Powered by{' '}
                <a
                  href="https://nestjs.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-600 dark:hover:text-blue-400"
                >
                  NestJS
                </a>
                .
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-block w-6 h-6 text-center text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                {' '}
                L{' '}
              </span>
              <span>
                <strong>Styling:</strong>{' '}
                <a
                  href="https://tailwindcss.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Tailwind CSS
                </a>
                .
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-block w-6 h-6 text-center text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                {' '}
                L{' '}
              </span>
              <span>
                <strong>AI & ML:</strong> Using NLP for summarization and TTS
                for voice generation.
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-block w-6 h-6 text-center text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                {' '}
                L{' '}
              </span>
              <span>
                <strong>Containerization:</strong> Packaged using{' '}
                <a
                  href="https://www.docker.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Docker
                </a>
                .
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-block w-6 h-6 text-center text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                {' '}
                L{' '}
              </span>
              <span>
                <strong>Deployment:</strong> Hosted on{' '}
                <a
                  href="https://aws.amazon.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-600 dark:hover:text-blue-400"
                >
                  AWS
                </a>
                .
              </span>
            </li>
          </ul>
        </section>

        <hr className="dark:border-gray-700" />

        {/* --- Future Plans --- */}
        <section>
          <h2 className="text-2xl font-semibold tracking-tight mt-0 mb-4">
            Future Plans
          </h2>
          <p>
            We are constantly working to improve Ecocast. Some features
            currently in development or under consideration include:
          </p>
          <ul className="list-disc pl-6 space-y-1 !mt-4">
            <li>More diverse AI voice options.</li>
            <li>Integration with a wider range of news sources.</li>
            <li>User-managed playlists and episode archiving.</li>
            <li>Premium features for subscribers.</li>
          </ul>
          <p>Stay tuned for updates!</p>
        </section>

        <hr className="dark:border-gray-700" />

        {/* --- Open Source --- */}
        <section>
          <h2 className="text-2xl font-semibold tracking-tight mt-0 mb-4">
            Open Source & Contribution
          </h2>
          <p>
            Ecocast is an open-source project because we believe in transparency
            and the power of community collaboration. You can explore the source
            code, report issues, or suggest features on our GitHub repository.
          </p>
          <p>
            If you&apos;d like to contribute code, please feel free to fork the
            repository and submit a pull request. We welcome contributions that
            help improve the application!
          </p>
          <p className="!mt-4">
            <Link
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              View Project on GitHub
              <svg
                className="ml-2 h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.379.202 2.398.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </p>
        </section>

        <hr className="dark:border-gray-700" />

        {/* --- Author --- */}
        <section>
          <h2 className="text-2xl font-semibold tracking-tight mt-0 mb-4">
            About the Author
          </h2>
          <p>
            Ecocast was created by Jason Cochran, a Full Stack Web Developer
            with 26 years of experience in designing, building, and deploying
            robust web applications. His expertise spans the entire development
            lifecycle, from frontend user interfaces to backend systems and
            infrastructure.
            {/* Optional: Add link */}
            {AUTHOR_LINK_URL !== '#' && (
              <Link
                href={AUTHOR_LINK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Learn more about Jason.
              </Link>
            )}
          </p>
        </section>

        <hr className="dark:border-gray-700" />

        {/* --- Contact --- */}
        <section>
          <h2 className="text-2xl font-semibold tracking-tight mt-0 mb-4">
            Contact Us
          </h2>
          <p>
            Have questions, feedback, or partnership inquiries? We&apos;d love
            to hear from you! Reach out to us at:{' '}
            <a
              href="mailto:contact@ecocast.example.com"
              className="underline hover:text-blue-600 dark:hover:text-blue-400"
            >
              contact@ecocast.example.com
            </a>{' '}
            {/* <<<--- REPLACE WITH ACTUAL EMAIL */}
          </p>
        </section>
      </div>
    </div>
  );
}
