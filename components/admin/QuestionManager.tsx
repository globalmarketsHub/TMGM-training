"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, PlusCircle } from "lucide-react";

type Question = {
  id: string;
  type: "MCQ" | "TRUE_FALSE" | "SHORT_TEXT";
  prompt: string;
  options: string[] | null;
  correctAnswer: string | null;
  score: number;
  sortOrder: number;
  isActive: boolean;
};

const blankQuestion: Omit<Question, "id"> = {
  type: "MCQ",
  prompt: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  score: 10,
  sortOrder: 11,
  isActive: true
};

export function QuestionManager({ initialQuestions }: { initialQuestions: Question[] }) {
  const router = useRouter();
  const [questions, setQuestions] = useState(initialQuestions);
  const [draft, setDraft] = useState(blankQuestion);
  const [message, setMessage] = useState("");

  function updateQuestion(id: string, patch: Partial<Question>) {
    setQuestions((current) => current.map((question) => (question.id === id ? { ...question, ...patch } : question)));
  }

  async function saveQuestion(question: Question) {
    setMessage("");
    const response = await fetch(`/api/admin/exam-questions/${question.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(question)
    });
    setMessage(response.ok ? "题目已保存。" : "保存失败。");
    router.refresh();
  }

  async function addQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/admin/exam-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    });
    setMessage(response.ok ? "新题目已创建。" : "创建失败，检查排序号是否重复。");
    if (response.ok) {
      setDraft({ ...blankQuestion, sortOrder: draft.sortOrder + 1 });
      router.refresh();
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={addQuestion} className="surface rounded-lg p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black text-white">新增题目</h2>
          <PlusCircle className="h-5 w-5 text-bridge-cyan" />
        </div>
        <div className="grid gap-3 md:grid-cols-[160px_1fr_100px_100px]">
          <select className="input" value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as Question["type"] }))}>
            <option value="MCQ">选择题</option>
            <option value="TRUE_FALSE">判断题</option>
            <option value="SHORT_TEXT">简答题</option>
          </select>
          <input className="input" placeholder="题目" value={draft.prompt} onChange={(event) => setDraft((current) => ({ ...current, prompt: event.target.value }))} required />
          <input className="input" type="number" value={draft.score} onChange={(event) => setDraft((current) => ({ ...current, score: Number(event.target.value) }))} />
          <input className="input" type="number" value={draft.sortOrder} onChange={(event) => setDraft((current) => ({ ...current, sortOrder: Number(event.target.value) }))} />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input className="input" placeholder="选项，用英文逗号分隔；简答题可留空" value={(draft.options ?? []).join(",")} onChange={(event) => setDraft((current) => ({ ...current, options: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))} />
          <input className="input" placeholder="标准答案" value={draft.correctAnswer ?? ""} onChange={(event) => setDraft((current) => ({ ...current, correctAnswer: event.target.value }))} />
        </div>
        <button className="btn-primary mt-4" type="submit">
          <PlusCircle className="h-4 w-4" />
          添加题目
        </button>
      </form>

      {message ? <p className="text-sm text-blue-100">{message}</p> : null}

      <div className="space-y-4">
        {questions.map((question) => (
          <section key={question.id} className="surface rounded-lg p-5">
            <div className="grid gap-3 md:grid-cols-[140px_1fr_90px_90px]">
              <select className="input" value={question.type} onChange={(event) => updateQuestion(question.id, { type: event.target.value as Question["type"] })}>
                <option value="MCQ">选择题</option>
                <option value="TRUE_FALSE">判断题</option>
                <option value="SHORT_TEXT">简答题</option>
              </select>
              <input className="input" value={question.prompt} onChange={(event) => updateQuestion(question.id, { prompt: event.target.value })} />
              <input className="input" type="number" value={question.score} onChange={(event) => updateQuestion(question.id, { score: Number(event.target.value) })} />
              <input className="input" type="number" value={question.sortOrder} onChange={(event) => updateQuestion(question.id, { sortOrder: Number(event.target.value) })} />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input className="input" value={(question.options ?? []).join(",")} onChange={(event) => updateQuestion(question.id, { options: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} />
              <input className="input" value={question.correctAnswer ?? ""} onChange={(event) => updateQuestion(question.id, { correctAnswer: event.target.value })} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn-primary px-3 py-2 text-xs" type="button" onClick={() => saveQuestion(question)}>
                <Save className="h-4 w-4" />
                保存
              </button>
              <button className="btn-secondary px-3 py-2 text-xs" type="button" onClick={() => updateQuestion(question.id, { isActive: !question.isActive })}>
                {question.isActive ? "设为停用后保存" : "设为启用后保存"}
              </button>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
