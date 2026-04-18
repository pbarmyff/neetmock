"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import questionsData from "@/data/questions.json";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"questions" | "results">("questions");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    if (!supabase) {
      setError("Supabase is not configured. Results cannot be fetched.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('test_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      setResults(data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch results.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "results") {
      // In a real app we'd use SWR or React Query. Using a local async wrapper to avoid the sync-setState-in-effect warning.
      const load = async () => {
        await fetchResults();
      };
      void load();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-ui-bg text-ui-fg p-4 md:p-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12 border-b-4 border-ui-border pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="text-ui-accent font-bold tracking-widest text-xs mb-2">SYS_ADMIN_OVR</div>
            <h1 className="text-4xl md:text-6xl font-bold leading-none tracking-tighter uppercase">Admin Panel</h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("questions")}
              className={`px-6 py-3 font-bold uppercase transition-all ${activeTab === 'questions' ? 'bg-ui-fg text-ui-bg' : 'bg-ui-surface border-2 border-ui-border hover:bg-gray-200'}`}
            >
              Questions DB
            </button>
            <button
              onClick={() => setActiveTab("results")}
              className={`px-6 py-3 font-bold uppercase transition-all ${activeTab === 'results' ? 'bg-ui-fg text-ui-bg' : 'bg-ui-surface border-2 border-ui-border hover:bg-gray-200'}`}
            >
              Test Results
            </button>
          </div>
        </header>

        {activeTab === "questions" && (
          <div className="brutal-panel flex flex-col">
            <h2 className="text-xl font-bold uppercase tracking-widest border-b-4 border-ui-border p-4 bg-ui-fg text-ui-bg flex justify-between">
              <span>Local Question Database</span>
              <span>Count: {questionsData.length}</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b-4 border-ui-border bg-ui-surface text-xs uppercase tracking-widest">
                    <th className="p-4 font-bold">ID</th>
                    <th className="p-4 font-bold border-l-2 border-ui-border">Subject</th>
                    <th className="p-4 font-bold border-l-2 border-ui-border">Topic</th>
                    <th className="p-4 font-bold border-l-2 border-ui-border">Difficulty</th>
                    <th className="p-4 font-bold border-l-2 border-ui-border w-1/2">Question Snippet</th>
                  </tr>
                </thead>
                <tbody>
                  {questionsData.map((q) => (
                    <tr key={q.id} className="border-b-2 border-ui-border hover:bg-ui-surface">
                      <td className="p-4 font-mono font-bold text-xs">{q.id.split('-')[0]}</td>
                      <td className="p-4 border-l-2 border-ui-border text-sm font-bold uppercase">{q.subject}</td>
                      <td className="p-4 border-l-2 border-ui-border text-xs uppercase tracking-wider">{q.topic}</td>
                      <td className="p-4 border-l-2 border-ui-border text-xs font-bold uppercase">
                        <span className={`px-2 py-1 ${q.difficulty === 'Easy' ? 'bg-[#00CC44]' : q.difficulty === 'Medium' ? 'bg-[#0033FF]' : 'bg-[#FF3B00]'} text-white`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="p-4 border-l-2 border-ui-border text-sm truncate max-w-[300px]">
                        {q.question.substring(0, 80)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "results" && (
          <div className="brutal-panel flex flex-col">
            <h2 className="text-xl font-bold uppercase tracking-widest border-b-4 border-ui-border p-4 bg-ui-fg text-ui-bg flex justify-between items-center">
              <span>Supabase Test Results</span>
              <button
                onClick={fetchResults}
                className="text-xs border-2 border-ui-bg px-3 py-1 hover:bg-ui-bg hover:text-ui-fg transition-colors"
              >
                REFRESH
              </button>
            </h2>

            <div className="p-6">
              {error && (
                <div className="bg-[#FF3B00]/10 border-l-4 border-[#FF3B00] p-4 mb-6 font-bold text-[#FF3B00]">
                  ERR: {error}
                </div>
              )}

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="text-xl font-bold animate-pulse uppercase tracking-widest">Loading Records...</div>
                </div>
              ) : results.length === 0 && !error ? (
                <div className="flex justify-center py-12">
                  <div className="text-xl font-bold text-ui-fg-muted uppercase tracking-widest">No Records Found</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((r, i) => (
                    <div key={r.id || i} className="border-4 border-ui-border p-4 flex flex-col bg-ui-surface">
                      <div className="flex justify-between items-start mb-4 border-b-2 border-ui-border pb-2">
                        <span className="font-mono text-xs font-bold">{new Date(r.created_at).toLocaleString()}</span>
                        <span className="text-[10px] bg-ui-fg text-ui-bg px-2 py-1 font-bold uppercase tracking-widest">
                          ID: {r.id ? r.id.toString().substring(0, 8) : 'N/A'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-ui-fg-muted uppercase font-bold tracking-widest">Difficulty</span>
                          <span className="font-bold">{r.config?.difficulty || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-ui-fg-muted uppercase font-bold tracking-widest">Questions</span>
                          <span className="font-bold">{r.questionIds?.length || 0}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-ui-fg-muted uppercase font-bold tracking-widest">Answers</span>
                          <span className="font-bold text-ui-accent">{Object.keys(r.answers || {}).length}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-ui-fg-muted uppercase font-bold tracking-widest">Time Remaining</span>
                          <span className="font-bold">{Math.floor((r.timeRemaining || 0) / 60)}m</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
