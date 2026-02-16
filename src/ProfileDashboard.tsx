import React from "react";
import { useUser } from "./UserContext";
import {
  ArrowLeft,
  TrendingUp,
  Award,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Disclosure } from "@headlessui/react";

// --- HELPER: Get encouraging messages based on score ---
const getFeedback = (acc: number) => {
  if (acc === 0) return { msg: "Start your journey!", color: "slate" };
  if (acc < 40) return { msg: "Needs Revision. Keep going!", color: "red" };
  if (acc < 60)
    return { msg: "Good start! Push a little harder.", color: "amber" };
  if (acc < 80)
    return { msg: "Impressive! You are getting strong.", color: "blue" };
  return { msg: "Outstanding! Expert Level.", color: "emerald" };
};

// --- COMPONENT: Circular Accuracy Meter ---
const AccuracyGauge = ({
  accuracy,
  size = 60,
  stroke = 6,
}: {
  accuracy: number;
  size?: number;
  stroke?: number;
}) => {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (accuracy / 100) * circumference;
  const { color } = getFeedback(accuracy);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Background Circle */}
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-slate-100"
          strokeWidth={stroke}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <circle
          className={`text-${color}-500 transition-all duration-1000 ease-out`}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Percentage Text */}
      <span
        className={`absolute text-${color}-900 font-black ${
          size > 50 ? "text-lg" : "text-xs"
        }`}
      >
        {accuracy}%
      </span>
    </div>
  );
};

export default function ProfileDashboard({ onBack }: { onBack: () => void }) {
  const { profile } = useUser();

  // Safety check: if data isn't loaded yet
  if (!profile) return null;

  const stats = profile.stats || {};
  const subjects = Object.entries(stats);
  const totalTests = profile.testHistory?.length || 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 animate-in fade-in zoom-in-95 duration-300">
      {/* Navbar */}
      <div className="bg-white sticky top-0 z-20 border-b border-slate-100 px-6 py-4 flex items-center gap-4 shadow-sm">
        <button
          onClick={onBack}
          className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg font-black text-slate-900">Performance</h2>
          <p className="text-xs text-slate-500 font-medium">
            Your analytics dashboard
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* 1. Top Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600 mb-2">
              <TrendingUp size={20} />
            </div>
            <div className="text-xl font-black text-slate-900">
              {subjects.length}
            </div>
            <div className="text-[10px] font-bold uppercase text-slate-400">
              Subjects
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600 mb-2">
              <Award size={20} />
            </div>
            <div className="text-xl font-black text-slate-900">
              {profile.coins}
            </div>
            <div className="text-[10px] font-bold uppercase text-slate-400">
              Coins
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600 mb-2">
              <Clock size={20} />
            </div>
            <div className="text-xl font-black text-slate-900">
              {totalTests}
            </div>
            <div className="text-[10px] font-bold uppercase text-slate-400">
              Tests
            </div>
          </div>
        </div>

        {/* 2. Subject Breakdown List */}
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">
          Subject Breakdown
        </h3>

        {subjects.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium text-sm">
              No practice data yet.
            </p>
            <button
              onClick={onBack}
              className="mt-2 text-indigo-600 font-bold text-sm hover:underline"
            >
              Start a test now!
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {subjects.map(([subjectName, data]) => {
              const feedback = getFeedback(data.accuracy);

              return (
                <Disclosure
                  as="div"
                  key={subjectName}
                  className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  {({ open }) => (
                    <>
                      <Disclosure.Button
                        className={`w-full p-5 flex items-center justify-between cursor-pointer ${
                          open ? "bg-slate-50" : "bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <AccuracyGauge accuracy={data.accuracy} />
                          <div className="text-left">
                            <h4 className="text-base font-black text-slate-900">
                              {subjectName}
                            </h4>
                            <p
                              className={`text-xs font-bold text-${feedback.color}-600`}
                            >
                              {feedback.msg}
                            </p>
                          </div>
                        </div>
                        {open ? (
                          <ChevronUp className="text-slate-400" />
                        ) : (
                          <ChevronDown className="text-slate-400" />
                        )}
                      </Disclosure.Button>

                      <Disclosure.Panel className="p-5 pt-2 border-t border-slate-100 bg-slate-50 grid grid-cols-1 gap-3">
                        {Object.entries(data.topics).map(
                          ([topicName, topicData]) => (
                            <div
                              key={topicName}
                              className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between"
                            >
                              <div>
                                <h5 className="text-xs font-bold text-slate-800 mb-0.5">
                                  {topicName}
                                </h5>
                                <p className="text-[10px] text-slate-500 font-medium">
                                  {topicData.correct}/{topicData.attempts}{" "}
                                  Correct ({topicData.attempts} attempts)
                                </p>
                              </div>
                              <AccuracyGauge
                                accuracy={topicData.accuracy}
                                size={40}
                                stroke={4}
                              />
                            </div>
                          )
                        )}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
