"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResultsPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job_id");

  useEffect(() => {
    if (!jobId) return;

    fetch(`http://localhost:5000/results/${jobId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch job results");
        return res.json();
      })
      .then((data) => {
        setSummary(data.summary);
      })
      .catch((err) => setError(err.message));
  }, [jobId]);

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">📊 Analysis Results</h1>

      <div className="mb-10 flex justify-center">
        {summary ? (
          <img
            src={`http://localhost:5000/static/${jobId}_histogram.png`}
            alt="Histogram"
            className="rounded-lg shadow-lg w-full max-w-2xl"
          />
        ) : (
          <p className="text-gray-500">Loading image...</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">📈 Summary Statistics</h2>
        {error && <p className="text-red-500">{error}</p>}
        {summary ? (
          <pre className="bg-gray-100 text-sm p-4 rounded-lg overflow-x-auto border border-gray-300">
            {JSON.stringify(summary, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500">Loading summary...</p>
        )}
      </div>
    </div>
  );
}
