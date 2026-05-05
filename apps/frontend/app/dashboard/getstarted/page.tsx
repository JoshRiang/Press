"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ChevronRight, Target, Cpu, Dumbbell, Zap, CheckCircle2, ShieldAlert, Terminal, Layers, PlusSquare, ListChecks, Ruler, Info } from "lucide-react";
import { useProfileStore } from "@/src/store/useProfileStore";

const GetStarted = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, metrics, updateMetrics, updateSettings } = useProfileStore();
  const [step, setStep] = useState(() => {
    const state = searchParams?.get("state");
    return state ? Math.max(1, Math.min(4, parseInt(state))) : 1;
  });
  const [data, setData] = useState({
    username: "User",
    currentHeight: 170,
    targetWeight: 65,
    focus: "Hypertrophy",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user || metrics) {
      setData((prev) => ({
        ...prev,
        username: user?.full_name || prev.username,
        currentHeight: metrics?.height || prev.currentHeight,
        targetWeight: metrics?.targetWeight || prev.targetWeight,
      }));
    }
  }, [user, metrics]);

  const updateStep = (newStep: number) => {
    setStep(newStep);
    router.push(`/dashboard/getstarted?state=${newStep}`);
  };

  const nextStep = () => updateStep(Math.min(step + 1, 4));

  const prevStep = () => updateStep(Math.max(step - 1, 1));

  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      await updateMetrics({
        height: data.currentHeight,
        targetWeight: data.targetWeight,
      });

      let repThreshold = 10;
      let volumeOverload = 5.0;
      let weightIncrement = 2.5;

      if (data.focus === "Hypertrophy") {
        repThreshold = 12;
        volumeOverload = 5.0;
      } else if (data.focus === "Strength") {
        repThreshold = 5;
        volumeOverload = 2.5;
        weightIncrement = 5.0;
      } else if (data.focus === "Endurance") {
        repThreshold = 20;
        volumeOverload = 10.0;
      }

      await updateSettings({
        repThreshold,
        volumeOverload,
        weightIncrement,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save getting started data", error);
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-white leading-none">Your body</h2>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Step 01 // Setting up your body data</p>
            </div>

            <div className="space-y-6">
              <div className="group">
                <label className="text-[10px] font-black uppercase text-sky-500 mb-2 block ml-1 tracking-widest">CURRENT HEIGHT (CM)</label>
                <div className="relative">
                  <input type="number" value={data.currentHeight} onChange={(e) => setData({ ...data, currentHeight: parseInt(e.target.value) || 0 })} className="w-full bg-slate-950 border border-sky-500/30 rounded-2xl p-4 pl-12 font-mono text-white text-2xl font-black outline-none focus:border-sky-500 transition-all shadow-[0_0_15px_rgba(56,189,248,0.1)]" />
                  <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500/50" size={20} />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black uppercase text-sky-500 mb-2 block ml-1 tracking-widest">TARGET BODY WEIGHT (KG)</label>
                <div className="relative">
                  <input type="number" value={data.targetWeight} onChange={(e) => setData({ ...data, targetWeight: parseInt(e.target.value) || 0 })} className="w-full bg-slate-950 border border-sky-500/30 rounded-2xl p-4 pl-12 font-mono text-white text-2xl font-black outline-none focus:border-sky-500 transition-all shadow-[0_0_15px_rgba(56,189,248,0.1)]" />
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500/50" size={20} />
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-white leading-none">Workout Type</h2>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Step 02 // Choose the type of exercise according to your goal</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {["Hypertrophy", "Strength", "Endurance"].map((mode) => (
                <button key={mode} onClick={() => setData({ ...data, focus: mode })} className={`p-6 rounded-3xl border text-left transition-all flex justify-between items-center ${data.focus === mode ? "bg-sky-500/10 border-sky-500 text-white shadow-[0_0_20px_rgba(56,189,248,0.15)]" : "bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700"}`}>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">{mode}</p>
                    <p className="text-[10px] font-mono opacity-50 mt-1 italic">{mode === "Hypertrophy" ? "Grow your muscles." : mode === "Strength" ? "Grow your lift strength." : "Grow your stamina."}</p>
                  </div>
                  {data.focus === mode && <CheckCircle2 size={20} className="text-sky-500 animate-in zoom-in" />}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 max-h-[60vh] md:max-h-[70vh] overflow-y-auto no-scrollbar pb-4 md:pb-0">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-white leading-none">How To Start?</h2>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Step 03 // How to log your first gym session</p>
            </div>

            <div className="bg-sky-500/5 border border-sky-500/20 rounded-3xl p-5 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Info size={16} className="text-sky-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">What is PRESS?</span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 leading-relaxed uppercase">
                PRESS is a <span className="text-sky-400">Progression Engine</span> based on your exercise's in a <span className="text-white">session</span>. Every session can have many exercise.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-3xl flex gap-5">
                <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-sky-400 shrink-0">
                  <PlusSquare size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Step 1: Start Your Session</h4>
                  <p className="text-[10px] font-mono text-slate-500 leading-relaxed uppercase">
                    Your logging start from creating a <span className="text-white">Session</span>. Name it "Leg Day", "Pull Day", or anything you like.
                  </p>
                </div>
              </div>

              <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-3xl flex gap-5">
                <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-sky-400 shrink-0">
                  <Layers size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-1">Step 2: Add Your Exercise</h4>
                  <p className="text-[10px] font-mono text-slate-500 leading-relaxed uppercase">In a session, you can add many type of exercises.</p>
                </div>
              </div>

              <div className="p-5 bg-sky-500/5 border border-sky-500/20 rounded-3xl flex gap-5">
                <div className="w-10 h-10 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center justify-center text-sky-400 shrink-0">
                  <ListChecks size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-400 mb-1">Step 3: Validate your Log</h4>
                  <p className="text-[10px] font-mono text-sky-500/60 leading-relaxed uppercase">
                    Make sure your input format is in <span className="text-white font-bold tracking-tighter">weight x sets x reps </span>. For example 30x3x12, for 30 kg, 3 sets, 12 reps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 md:space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="space-y-2 text-center">
              <div className="w-16 h-16 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-sky-500/20">
                <Zap size={28} className="text-sky-500 animate-pulse" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-white leading-none">You are READY</h2>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Start your own session now</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 space-y-6">
              <div className="flex items-start gap-4 border-t border-white/5">
                <ShieldAlert size={18} className="text-amber-500 mt-1" />
                <p className="text-[10px] font-mono text-slate-500 leading-relaxed uppercase tracking-tighter">The progression engine will start working after your first exercise log are added.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-slate-200 font-sans flex flex-col items-center justify-start p-4 md:p-6 py-6 md:py-2 relative overflow-hidden">
      {/* Background Decorative */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-sky-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Progress Indicator */}
      <div className="relative z-10 w-full max-w-[450px] mb-8 md:mb-12 flex justify-between items-center px-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-[10px] font-black transition-all duration-500 ${step >= s ? "bg-sky-500 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.4)]" : "bg-slate-900 text-slate-600 border border-slate-800"}`}>0{s}</div>
            {s < 4 && <div className={`h-[1px] flex-1 mx-4 transition-all duration-700 ${step > s ? "bg-sky-500" : "bg-slate-900"}`} />}
          </div>
        ))}
      </div>

      {/* Main Form Area */}
      <div className="relative z-10 w-full max-w-[450px] min-h-[350px] md:min-h-[420px]">{renderStep()}</div>

      {/* Control Buttons */}
      <div className="relative z-10 w-full max-w-[450px] mt-2 md:mt-2 grid grid-cols-2 gap-3 md:gap-4">
        {step > 1 ? (
          <button onClick={prevStep} disabled={isSubmitting} className="py-5 rounded-2xl border border-slate-800 text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] hover:text-white transition-all active:scale-95 disabled:opacity-50">
            Back
          </button>
        ) : (
          <div />
        )}

        <button onClick={step === 4 ? handleLaunch : nextStep} disabled={isSubmitting} className="py-5 rounded-2xl bg-sky-500 text-slate-950 font-black uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50">
          {isSubmitting ? "Saving..." : step === 4 ? "Launch Dashboard" : "Continue"}
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
};

export default GetStarted;
