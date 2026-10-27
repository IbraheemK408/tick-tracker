import Link from "next/link";

// Placeholder until the Report a Sighting form is built.
export default function ReportPage() {
  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Report a sighting</h1>
      <p className="mt-2">The report form is coming soon.</p>
      <Link href="/" className="mt-4 inline-block underline">
        Back to the map
      </Link>
    </main>
  );
}
