import type { Metadata } from "next";
import { Suspense } from "react";
import ReportForm from "@/components/ReportForm";

export const metadata: Metadata = {
  title: "Report a sighting | UK Tick Tracker",
};

export default function ReportPage() {
  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Report a sighting</h1>
      <p className="mt-1 text-sm opacity-70">
        Seen a tick? Tell us when and where, and add a photo if you have one. Every report helps build a
        clearer picture of tick activity across the UK.
      </p>
      <div className="mt-6">
        {/* The form reads ?city= from the address, which needs a Suspense boundary. */}
        <Suspense fallback={<p>Loading form…</p>}>
          <ReportForm />
        </Suspense>
      </div>
    </main>
  );
}
