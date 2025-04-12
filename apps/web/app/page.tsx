import Image from 'next/image';
import Link from 'next/link';

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
              <div className="flex flex-col justify-center space-y-4 order-2 lg:order-1">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-50 dark:to-gray-400">
                    Your Daily News, Transformed into Podcasts
                  </h1>
                  <p className="max-w-[600px] text-gray-600 md:text-xl dark:text-gray-300">
                    Ecocast creates personalized, AI-generated podcasts from
                    yesterday&apos;s top news stories. Listen to what matters
                    most, effortlessly.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                    href="/signup"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
                    href="#features"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <Image
                alt="Podcast waves illustration"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-contain sm:w-full order-1 lg:order-2 filter drop-shadow-lg dark:brightness-90"
                height="550"
                src="/waves-7409254_1280.jpg"
                width="550"
              />
            </div>
          </div>
        </section>

        {/* Podcast Showcase Section - Moved before Features */}
        <section id="podcasts" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                  Latest Episodes
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Hear What&apos;s New & Popular
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Check out some of the latest AI-generated podcasts created by
                  Ecocast.
                </p>
              </div>
            </div>
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-card text-card-foreground shadow-sm dark:bg-gray-950 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                >
                  <div className="aspect-square relative w-full">
                    <Image
                      src={`https://picsum.photos/seed/${i + 1}/300/300`}
                      alt={`Podcast Artwork ${i + 1}`}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5 p-6">
                    <h3 className="text-lg font-semibold leading-none tracking-tight">
                      Popular Podcast #{i + 1}
                    </h3>
                    <p className="text-sm text-muted-foreground dark:text-foreground">
                      Generated: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-6 pt-0">
                    <p className="text-sm text-gray-600">
                      Brief description of the podcast content goes here...
                    </p>
                  </div>
                  <div className="flex items-center p-6 pt-0">
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-200 px-3 py-1 text-sm dark:bg-gray-700">
                  How it Works
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Intelligent Audio News, Tailored For You
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-foreground">
                  Select your favorite news sources, and our AI crafts a unique
                  podcast summarizing the key stories from the previous day.
                  Stay informed on the go.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-2 text-center lg:text-left">
                <div className="flex justify-center lg:justify-start text-blue-500 dark:text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8 mb-2"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M7 3v18" />
                    <path d="M17 3v18" />
                    <path d="M3 7h18" />
                    <path d="M3 12h18" />
                    <path d="M3 17h18" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Curated News Selection</h3>
                <p className="text-sm text-gray-500 dark:text-foreground">
                  Choose from a wide range of reputable news sources globally.
                </p>
              </div>
              <div className="grid gap-2 text-center lg:text-left">
                <div className="flex justify-center lg:justify-start text-green-500 dark:text-green-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8 mb-2"
                  >
                    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.5A4.5 4.5 0 0 0 18 5.5c0 1.5-1.5 3.5-3 5.5-1.5 2-3 4-3 6z" />
                    <path d="M6 15.5c0 1.5-1.5 3.5-3 5.5-1.5 2-3 4-3 6A4.5 4.5 0 0 0 6 5.5c1.25 0 2.75 1.06 4 1.06 3 0 6-8 6-12.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">AI-Powered Summarization</h3>
                <p className="text-sm text-gray-500 dark:text-foreground">
                  Intelligent algorithms extract the core information and
                  insights from articles.
                </p>
              </div>
              <div className="grid gap-2 text-center lg:text-left">
                <div className="flex justify-center lg:justify-start text-purple-500 dark:text-purple-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8 mb-2"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="23" />
                    <line x1="8" x2="16" y1="23" y2="23" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Natural Voice Generation</h3>
                <p className="text-sm text-gray-500 dark:text-foreground">
                  Listen to your news summary in a clear, engaging, and
                  natural-sounding AI voice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Overview Section */}
        <section
          id="pricing"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800"
        >
          <div className="container mx-auto grid items-center justify-center gap-4 px-4 md:px-6 text-center lg:gap-10">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Simple, Transparent Pricing
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-foreground">
                Choose the plan that fits your listening habits. Start for free!
              </p>
            </div>
            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
              <div className="rounded-lg border bg-background text-card-foreground shadow-sm p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                <div>
                  <h3 className="text-2xl font-semibold leading-none tracking-tight mb-2">
                    Free
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-foreground mb-4">
                    Perfect for trying things out.
                  </p>
                  <p className="text-4xl font-bold mb-4">
                    $0
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground text-left mb-6">
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>{' '}
                      1 Daily Podcast
                    </li>
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>{' '}
                      Limited News Sources
                    </li>
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>{' '}
                      Standard AI Voice
                    </li>
                  </ul>
                </div>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full mt-4"
                >
                  Get Started
                </Link>
              </div>
              <div className="rounded-lg border-2 border-primary bg-background text-card-foreground shadow-lg p-6 flex flex-col justify-between relative transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
                <div className="absolute top-0 right-0 -mt-3 mr-3">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80">
                    Popular
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold leading-none tracking-tight mb-2">
                    Pro
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-foreground mb-4">
                    For the avid news listener.
                  </p>
                  <p className="text-4xl font-bold mb-4">
                    $10
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground text-left mb-6">
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>{' '}
                      Up to 5 Daily Podcasts
                    </li>
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>{' '}
                      Wider Range of Sources
                    </li>
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>{' '}
                      Premium AI Voices
                    </li>
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>{' '}
                      Early Access to Features
                    </li>
                  </ul>
                </div>
                <Link
                  href="/signup?plan=pro"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-4"
                >
                  Go Pro
                </Link>
              </div>
              <div className="rounded-lg border bg-background text-card-foreground shadow-sm p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                <div>
                  <h3 className="text-2xl font-semibold leading-none tracking-tight mb-2">
                    Enterprise
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-foreground mb-4">
                    For teams and organizations.
                  </p>
                  <p className="text-4xl font-bold mb-4">Custom</p>
                  <ul className="space-y-2 text-sm text-muted-foreground text-left mb-6">
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>{' '}
                      Unlimited Podcasts
                    </li>
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>{' '}
                      Custom Integrations
                    </li>
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>{' '}
                      Dedicated Support
                    </li>
                    <li className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>{' '}
                      Volume Licensing
                    </li>
                  </ul>
                </div>
                <Link
                  href="/contact-sales"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full mt-4"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-foreground mt-4">
              Need more details? Check out the full{' '}
              <Link href="/pricing" className="underline">
                Pricing Page
              </Link>
              .
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Listen Smarter?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Sign up for Ecocast today and start receiving your personalized
                daily news podcasts, generated just for you.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                href="/signup"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
