import "katex/dist/katex.min.css";
import Latex from "react-latex-next";
import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Play,
  FlaskConical,
  Globe,
  Scale,
  BookOpen,
  Palette,
  Landmark,
  Lightbulb,
  Calculator,
  Trash2,
  Highlighter,
  StickyNote,
  Bookmark,
  Grid3X3,
  Filter,
  Image as ImageIcon,
} from "lucide-react";

// DATA IMPORTS
import { useUser } from "./UserContext";
import environmentData from "./environment_pyq_data.json";
import economyData from "./economy_pyq_data.json";
import geographyData from "./geography_pyq_data.json";
import scienceData from "./science_technology_pyq_data.json";
import irData from "./international_relations_pyq_data.json";
import artCultureData from "./art_culture_pyq_data.json";
import modernHistoryData from "./modern_history_pyq_data.json";
import polityData from "./polity_pyq_data.json";
import csatData from "./csat_pyq_data.json";

// --- CONFIG ---
const SUBJECT_REGISTRY: any = {
  Environment: { data: environmentData, color: "emerald", icon: BookOpen },
  Economy: { data: economyData, color: "blue", icon: Scale },
  Geography: { data: geographyData, color: "amber", icon: Globe },
  "Science & Tech": { data: scienceData, color: "violet", icon: FlaskConical },
  "Int'l Relations": { data: irData, color: "rose", icon: Globe },
  "Art & Culture": { data: artCultureData, color: "pink", icon: Palette },
  "Modern History": {
    data: modernHistoryData,
    color: "orange",
    icon: Landmark,
  },
  "Indian Polity": { data: polityData, color: "cyan", icon: Landmark },
  CSAT: { data: csatData, color: "indigo", icon: Calculator },
};

// --- DATA GENERATOR ---
const generateMasterData = () => {
  return Object.entries(SUBJECT_REGISTRY).flatMap(([subject, config]: any) =>
    (config.data as any[]).map((item, idx) => {
      let correctVal =
        item.answer || item.correct_answer || item.correct || "A";
      if (typeof correctVal === "number")
        correctVal = ["A", "B", "C", "D"][correctVal] || "A";

      const displayTopic = item.topic || item.sub_topic || "General";
      const rawYear = item.year || item.Year;
      const displayYear = rawYear ? parseInt(rawYear) : 2023;
      const rawOptions = item.options || item.Options || [];

      return {
        id: String(item.id || `${subject}_${idx}`),
        subject: subject,
        topic: displayTopic,
        year: displayYear,
        q: item.question || item.q || "Question Text Missing",
        passage: item.passage || "",
        options: rawOptions,
        correct: String(correctVal).trim().toUpperCase(),
        learning: item.learning_engine || item.learning || null,
        has_image: item.has_image || "No",
      };
    })
  );
};

const MASTER_DATA = generateMasterData();
const SUBJECT_KEYS = Object.keys(SUBJECT_REGISTRY);

// --- HELPER: MATH TEXT RENDERER ---
const MathText = ({ text }: { text: string }) => {
  if (!text) return null;
  const safeText = String(text);

  // --- RUNTIME LATEX FIXER ---
  const processText = (raw: string) => {
    let clean = raw;

    // 1. Clock Time (8 o'clock -> 8^{o'}clock)
    // Case insensitive match for digits followed by o'clock
    clean = clean.replace(/(\d+)\s*o'clock/gi, "$1^{o'}clock");

    // 2. Percentages (50 % -> 50\%)
    clean = clean.replace(/(\d+)\s*%(?!\\)/g, "$1\\%");

    // 3. Degrees (90° -> 90^{\circ})
    clean = clean.replace(/(\d+)\s*[°º]/g, "$1^{\\circ}");

    // 4. Loose Spacing Math (e.g. "5 + 5" -> "$5+5$")
    // Wraps basic arithmetic in math mode if surrounded by numbers
    clean = clean.replace(/(\d)\s*([+\-×÷=])\s*(\d)/g, "$1 $2 $3");

    // 5. Fractions (1/2 -> \frac{1}{2})
    // Only if it looks like a fraction (digit/digit)
    clean = clean.replace(/(\d+)\/(\d+)/g, "\\frac{$1}{$2}");

    return clean;
  };

  return (
    <div className="latex-container text-slate-800 leading-relaxed space-y-4">
      {safeText.split("\n").map((line, idx) => {
        if (line.includes("[INSERT_TABLE_HERE]"))
          return (
            <div
              key={idx}
              className="my-6 p-6 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/50 flex flex-col items-center justify-center text-indigo-400 gap-2"
            >
              <Grid3X3 size={24} />
              <span className="font-mono text-xs font-bold uppercase tracking-widest">
                Table Visualization Area
              </span>
            </div>
          );
        if (line.includes("[INSERT_IMAGE_HERE]"))
          return (
            <div
              key={idx}
              className="my-6 aspect-video border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-2"
            >
              <ImageIcon size={32} />
              <span className="font-mono text-xs font-bold uppercase tracking-widest">
                Image/Graph Area
              </span>
            </div>
          );
        if (!line.trim()) return null;

        return (
          <div key={idx}>
            <Latex>{processText(line)}</Latex>
          </div>
        );
      })}
    </div>
  );
};

const PassageHighlighter = ({
  text,
  highlights,
  onAdd,
  onRemove,
  onUpdateColor,
}: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });

  const handleMouseUp = () => {
    const s = window.getSelection();
    if (
      !s ||
      s.isCollapsed ||
      !containerRef.current?.contains(s.getRangeAt(0).commonAncestorContainer)
    )
      return;
    const range = s.getRangeAt(0).cloneRange();
    range.selectNodeContents(containerRef.current);
    range.setEnd(s.getRangeAt(0).startContainer, s.getRangeAt(0).startOffset);
    const start = range.toString().length;
    onAdd({
      id: Date.now().toString(),
      start,
      end: start + s.toString().length,
      text: s.toString(),
      color: "yellow",
    });
    s.removeAllRanges();
  };

  const renderText = () => {
    if (!highlights?.length)
      return (
        <span className="text-slate-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
          {text}
        </span>
      );
    const sorted = [...highlights].sort((a: any, b: any) => a.start - b.start);
    const nodes = [];
    let last = 0;
    sorted.forEach((h: any) => {
      if (h.start > last)
        nodes.push(
          <span key={`t-${last}`}>{text.substring(last, h.start)}</span>
        );
      const c =
        h.color === "yellow"
          ? "bg-yellow-200"
          : h.color === "green"
          ? "bg-emerald-200"
          : "bg-purple-200";
      nodes.push(
        <mark
          key={h.id}
          className={`${c} cursor-pointer hover:brightness-95 px-0.5 rounded`}
          onClick={(e) => {
            e.stopPropagation();
            setActiveId(h.id);
            const r = (e.target as HTMLElement).getBoundingClientRect();
            setPopoverPos({ x: r.left + r.width / 2, y: r.top - 10 });
          }}
        >
          {text.substring(h.start, h.end)}
        </mark>
      );
      last = h.end;
    });
    if (last < text.length)
      nodes.push(<span key={`t-${last}`}>{text.substring(last)}</span>);
    return (
      <div className="text-slate-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
        {nodes}
      </div>
    );
  };

  return (
    <div className="relative" ref={containerRef} onMouseUp={handleMouseUp}>
      {renderText()}
      {activeId && (
        <div
          className="fixed z-50 bg-slate-900 text-white p-2 rounded-xl flex gap-2"
          style={{
            left: popoverPos.x,
            top: popoverPos.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="flex gap-1 pr-2 border-r border-slate-700">
            {["yellow", "green", "purple"].map((c) => (
              <button
                key={c}
                onClick={() => onUpdateColor(activeId, c)}
                className={`w-5 h-5 rounded-full bg-${
                  c === "green" ? "emerald" : c
                }-400 hover:scale-110`}
              />
            ))}
          </div>
          <button
            onClick={() => {
              onRemove(activeId);
              setActiveId(null);
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

const NoteMaker = ({
  qId,
  note,
  isBookmarked,
  onSave,
  onToggleBookmark,
}: any) => {
  const [text, setText] = useState(note);
  useEffect(() => setText(note), [qId, note]);
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between mb-4 border-b pb-4">
        <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
          <StickyNote size={14} /> Notes
        </h4>
        <button
          onClick={onToggleBookmark}
          className={`p-2 rounded-lg ${
            isBookmarked
              ? "bg-amber-100 text-amber-700"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
      </div>
      <textarea
        className="flex-1 w-full p-4 rounded-xl border border-slate-200 resize-none text-sm"
        placeholder="Write notes..."
        value={text}
        onChange={(e) => {
          if (e.target.value.split(/\s+/).length <= 50) {
            setText(e.target.value);
            onSave(e.target.value);
          }
        }}
      />
      <div className="mt-2 text-[10px] font-bold text-slate-300 text-right">
        {text ? text.trim().split(/\s+/).length : 0}/50
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD ---
export default function PYQDashboard({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<"config" | "test" | "analysis">("config");
  const { updateTestResults } = useUser();

  // CONFIG STATE
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  // DERIVED STATE
  const availableYears = Array.from(
    new Set(
      MASTER_DATA.filter((q) => selectedSubjects.includes(q.subject)).map(
        (q) => q.year
      )
    )
  ).sort((a, b) => b - a);
  const availableTopics = Array.from(
    new Set(
      MASTER_DATA.filter((q) => selectedSubjects.includes(q.subject)).map(
        (q) => q.topic
      )
    )
  ).sort();

  // TEST STATE
  const [activeQuestions, setActiveQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [timer, setTimer] = useState(0);
  const [testActive, setTestActive] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // USER DATA
  const [highlightsMap, setHighlightsMap] = useState<any>({});
  const [notesMap, setNotesMap] = useState<any>({});
  const [bookmarksMap, setBookmarksMap] = useState<any>({});

  useEffect(() => {
    let interval: any;
    if (testActive && timer > 0)
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    else if (timer === 0 && testActive) submitTest();
    return () => clearInterval(interval);
  }, [testActive, timer]);

  const startPractice = () => {
    if (selectedSubjects.length === 0) return;
    let filtered = MASTER_DATA.filter(
      (q) =>
        selectedSubjects.includes(q.subject) &&
        (selectedTopics.length === 0 || selectedTopics.includes(q.topic)) &&
        (selectedYears.length === 0 || selectedYears.includes(q.year))
    );
    if (filtered.length === 0) return alert("No questions found.");

    // --- SORT LOGIC (SEQUENTIAL) ---
    filtered = filtered.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return Number(a.id) - Number(b.id);
    });

    setActiveQuestions(filtered);
    setCurrentQ(0);
    setAnswers({});
    setTimer(filtered.length * 120);
    setTestActive(true);
    setView("test");
  };

  const submitTest = async () => {
    setTestActive(false);
    setView("analysis");
    await updateTestResults({
      questions: activeQuestions,
      answers,
      coinsEarned: 50,
    });
  };

  // HIGHLIGHT HANDLERS
  const handleHighlight = (
    action: string,
    id: string,
    passage: string,
    data?: any
  ) => {
    if (action === "add")
      setHighlightsMap((prev: any) => ({
        ...prev,
        [passage]: [...(prev[passage] || []), data],
      }));
    if (action === "remove")
      setHighlightsMap((prev: any) => ({
        ...prev,
        [passage]: (prev[passage] || []).filter((h: any) => h.id !== id),
      }));
    if (action === "color")
      setHighlightsMap((prev: any) => ({
        ...prev,
        [passage]: (prev[passage] || []).map((h: any) =>
          h.id === id ? { ...h, color: data } : h
        ),
      }));
  };

  // --- VIEW 1: CONFIGURATION ---
  if (view === "config") {
    return (
      <div className="h-screen bg-slate-50 flex flex-col">
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4">
          <button onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-black">Configure Test</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* 1. SUBJECTS */}
          <div>
            <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 block">
              1. Select Subject
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SUBJECT_KEYS.map((sub) => {
                const c = SUBJECT_REGISTRY[sub];
                const s = selectedSubjects.includes(sub);
                const Icon = c.icon;
                return (
                  <button
                    key={sub}
                    onClick={() => {
                      setSelectedSubjects((p) =>
                        p.includes(sub)
                          ? p.filter((x) => x !== sub)
                          : [...p, sub]
                      );
                      setSelectedTopics([]);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left ${
                      s ? `border-${c.color}-500 bg-${c.color}-50` : "bg-white"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${
                        s
                          ? `bg-${c.color}-200 text-${c.color}-700`
                          : "bg-slate-100"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <span className="text-xs font-bold">{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. TOPICS */}
          {selectedSubjects.length > 0 && availableTopics.length > 0 && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 block flex items-center gap-2">
                <Filter size={14} /> 2. Filter by Topic (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTopics.map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      setSelectedTopics((p) =>
                        p.includes(t) ? p.filter((x) => x !== t) : [...p, t]
                      )
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                      selectedTopics.includes(t)
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                        : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. YEARS */}
          {selectedSubjects.length > 0 && (
            <div className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
              <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 block">
                3. Select Years (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableYears.map((y) => (
                  <button
                    key={y}
                    onClick={() =>
                      setSelectedYears((p) =>
                        p.includes(y) ? p.filter((x) => x !== y) : [...p, y]
                      )
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-bold border-2 ${
                      selectedYears.includes(y)
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-500"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-6 bg-white border-t">
          <button
            onClick={startPractice}
            disabled={!selectedSubjects.length}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex justify-center gap-2 shadow-xl hover:scale-[1.02] transition-transform"
          >
            <Play size={20} /> Start Practice
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW 2: TEST MODE ---
  if (view === "test") {
    const q = activeQuestions[currentQ];
    const config = SUBJECT_REGISTRY[q.subject];
    const hasPassage = !!q.passage && q.passage.length > 0;

    // --- SAFE OPTIONS RENDER ---
    const opts = q.options
      ? Array.isArray(q.options)
        ? q.options
        : Object.values(q.options)
      : [];

    return (
      <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
        <div className="bg-white border-b px-6 py-3 flex justify-between items-center z-20">
          <span className="font-mono font-black text-xl">
            {Math.floor(timer / 60)}:{timer % 60 < 10 ? "0" : ""}
            {timer % 60}
          </span>
          <button
            onClick={submitTest}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs"
          >
            Submit
          </button>
        </div>
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div
            className={`flex-1 overflow-y-auto p-6 md:p-10 bg-white md:border-r border-slate-200 transition-all ${
              hasPassage ? "md:w-1/2" : "md:w-3/4"
            }`}
          >
            <div
              className={`mx-auto w-full ${
                hasPassage ? "max-w-none" : "max-w-3xl"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span
                  className={`px-2 py-1 rounded bg-${config.color}-50 text-${config.color}-700 text-[10px] font-bold uppercase`}
                >
                  {q.subject}
                </span>
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                  {q.year}
                </span>
                {q.topic && (
                  <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase border border-indigo-100">
                    {q.topic}
                  </span>
                )}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-relaxed mb-8">
                <MathText text={q.q} />
              </h3>

              {/* --- IMAGE PLACEHOLDER --- */}
              {q.has_image === "Yes" && (
                <div className="w-full my-6 aspect-video border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <ImageIcon size={48} strokeWidth={1.5} />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest">
                    Referenced Image / Diagram
                  </span>
                </div>
              )}

              <div className="space-y-3 mb-8">
                {opts.map((opt: string, idx: React.Key | null | undefined) => {
                  const isSel = answers[currentQ] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() =>
                        setAnswers({ ...answers, [currentQ]: idx })
                      }
                      className={`w-full p-4 md:p-5 rounded-xl border-2 text-left flex items-start gap-3 transition-all ${
                        isSel
                          ? `border-${config.color}-500 bg-${config.color}-50`
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          isSel
                            ? `border-${config.color}-500`
                            : "border-slate-300"
                        }`}
                      >
                        {isSel && (
                          <div
                            className={`w-3 h-3 rounded-full bg-${config.color}-500`}
                          />
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          isSel ? "text-slate-900" : "text-slate-600"
                        }`}
                      >
                        <MathText text={opt} />
                      </span>
                    </button>
                  );
                })}
              </div>
              {q.learning?.hint && (
                <div>
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    <Lightbulb size={14} />{" "}
                    {showHint ? "Hide Hint" : "Show Hint"}
                  </button>
                  {showHint && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-900">
                      <MathText text={q.learning.hint} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div
            className={`bg-slate-50 p-6 md:p-8 border-t md:border-t-0 md:border-l border-slate-100 hidden md:block transition-all ${
              hasPassage ? "md:w-1/2" : "md:w-1/4"
            }`}
          >
            {hasPassage ? (
              <div className="h-full flex flex-col">
                <div className="sticky top-0 bg-slate-50 z-10 pb-4 mb-2 border-b flex justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-400 flex items-center gap-2">
                    <BookOpen size={14} /> Passage
                  </h4>
                  <div className="text-[10px] text-slate-400">
                    <Highlighter size={12} /> Select to Highlight
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <PassageHighlighter
                    text={q.passage}
                    highlights={highlightsMap[q.passage] || []}
                    onAdd={(h: any) =>
                      handleHighlight("add", h.id, q.passage, h)
                    }
                    onRemove={(id: any) =>
                      handleHighlight("remove", id, q.passage)
                    }
                    onUpdateColor={(id: any, c: any) =>
                      handleHighlight("color", id, q.passage, c)
                    }
                  />
                </div>
              </div>
            ) : (
              <NoteMaker
                qId={q.id}
                note={notesMap[q.id] || ""}
                isBookmarked={!!bookmarksMap[q.id]}
                onSave={(t: any) =>
                  setNotesMap((p: any) => ({ ...p, [q.id]: t }))
                }
                onToggleBookmark={() =>
                  setBookmarksMap((p: any) => ({ ...p, [q.id]: !p[q.id] }))
                }
              />
            )}
          </div>
        </div>
        <div className="bg-white border-t p-4 flex gap-3 z-20">
          <button
            onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
            disabled={currentQ === 0}
            className="p-4 bg-slate-100 rounded-xl text-slate-400 disabled:opacity-30"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 flex items-center justify-center font-bold text-slate-400 text-xs">
            {Object.keys(answers).length} Attempted
          </div>
          <button
            onClick={() =>
              setCurrentQ((p) => Math.min(activeQuestions.length - 1, p + 1))
            }
            disabled={currentQ === activeQuestions.length - 1}
            className="p-4 bg-slate-100 rounded-xl text-slate-900 disabled:opacity-30"
          >
            <ArrowLeft size={20} className="rotate-180" />
          </button>
        </div>
      </div>
    );
  }

  if (view === "analysis")
    return (
      <div className="flex items-center justify-center h-screen font-bold text-slate-400">
        Analysis Mode{" "}
        <button onClick={onBack} className="ml-4 text-blue-500">
          Exit
        </button>
      </div>
    );

  return null;
}
