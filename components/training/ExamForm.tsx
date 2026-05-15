"use client";

import { useState } from "react";
import { Send } from "lucide-react";

type Question = {
  id: string;
  type: "MCQ" | "TRUE_FALSE" | "SHORT_TEXT";
  prompt: string;
  options: string[] | null;
  score: number;
};

type Result = {
  score: number;
  totalScore: number;
  passed: boolean;
};

export function ExamForm({ questions }: { questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/exam/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: questions.map((question) => ({
          questionId: question.id,
          answerText: answers[question.id] ?? ""
        }))
      })
    });

    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "提交失败。");
      return;
    }

    setResult(payload.result);
  }

  if (result) {
    return (
      <div className="surface rounded-lg p-6">
        <p className="text-sm font-bold uppercase text-bridge-gold">Submitted</p>
        <h2 className="mt-3 text-3xl font-black text-white">
          {result.score}/{result.totalScore}
        </h2>
        <p className="mt-3 text-blue-100">{result.passed ? "考试已通过，管理员可查看完整答卷。" : "考试未通过，可联系管理员安排复训。"}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {questions.map((question, index) => (
        <section key={question.id} className="surface rounded-lg p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="max-w-3xl text-base font-black text-white">
              {index + 1}. {question.prompt}
            </h2>
            <span className="badge">{question.score} 分</span>
          </div>
          {question.type === "SHORT_TEXT" ? (
            <textarea
              className="input mt-4 min-h-28"
              value={answers[question.id] ?? ""}
              onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
              required
            />
          ) : (
            <div className="mt-4 grid gap-3">
              {(question.options ?? []).map((option) => (
                <label key={option} className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-blue-50">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
                    required
                  />
                  {option}
                </label>
              ))}
            </div>
          )}
        </section>
      ))}
      {error ? <div className="rounded-lg border border-red-300/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
      <button className="btn-primary" disabled={loading} type="submit">
        <Send className="h-4 w-4" />
        {loading ? "正在提交..." : "提交综合考试"}
      </button>
    </form>
  );
}
