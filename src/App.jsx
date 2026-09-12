import React, { useState, useEffect, useRef } from "react";
import { ROUTINES } from "./data/routines";
import { INITIAL_REWARDS } from "./data/rewards";
import { sound } from "./audio";

// ─── Theme Tokens (Icy Pink + Raspberry Sorbet + Lime Punch) ─────────────────
const T = {
  bg: "#FDF0F4",
  bgCard: "rgba(255, 255, 255, 0.90)",
  bgCardSolid: "#FFFFFF",
  bgSubtle: "#F9E5ED",
  textDeep: "#680C2B",
  textMain: "#961B48",
  textBright: "#D42B66",
  textMuted: "#B85579",
  border: "rgba(150, 27, 72, 0.14)",
  borderStrong: "rgba(150, 27, 72, 0.28)",
  lime: "#BCE300",
  limeHover: "#A6C900",
  limeGlow: "rgba(188, 227, 0, 0.45)",
  limeDim: "rgba(188, 227, 0, 0.18)",
  gold: "#F59E0B",
};

// ─── Helper Functions ────────────────────────────────────────────────────────
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function calculateStreak(history) {
  if (!history || history.length === 0) return 0;
  const dates = Array.from(new Set(history.map(h => h.date))).sort().reverse();
  const today = getTodayStr();

  const toDays = dateStr => Math.floor(new Date(dateStr).getTime() / (1000 * 60 * 60 * 24));
  const todayDays = toDays(today);
  const latestDays = toDays(dates[0]);

  // Grace window: every 1~2 days allowed (diff <= 2)
  if (todayDays - latestDays > 2) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const curr = toDays(dates[i]);
    const prev = toDays(dates[i + 1]);
    const diff = curr - prev;
    if (diff >= 1 && diff <= 2) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ─── Confetti Canvas Effect ──────────────────────────────────────────────────
function triggerConfetti(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = [];
  const colors = ["#BCE300", "#D42B66", "#961B48", "#FFD700", "#FFFFFF", "#A6C900"];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 12,
      opacity: 1
    });
  }

  let animFrame;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45;
      p.rotation += p.vRot;
      p.opacity -= 0.012;
      if (p.opacity > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        ctx.restore();
      }
    });
    if (alive) {
      animFrame = requestAnimationFrame(update);
    }
  }
  update();
}

// ─── Main Application Component ──────────────────────────────────────────────
export default function App() {
  // Opening Intro Splash Screen (2 seconds)
  const [showSplash, setShowSplash] = useState(true);

  // Navigation: "battle" | "rewards" | "logs" | "settings"
  const [activeTab, setActiveTab] = useState("battle");

  // Selection animation state for the 3 battle options
  const [selectedRoutineId, setSelectedRoutineId] = useState(null);

  // State with Local-First persistence
  const [medals, setMedals] = useState(() => {
    try {
      const s = localStorage.getItem("flatbelly_medals");
      return s ? JSON.parse(s) : { balance: 0, total: 0 };
    } catch (e) {
      return { balance: 0, total: 0 };
    }
  });

  const [history, setHistory] = useState(() => {
    try {
      const s = localStorage.getItem("flatbelly_history");
      return s ? JSON.parse(s) : [];
    } catch (e) {
      return [];
    }
  });

  const [rewards, setRewards] = useState(() => {
    try {
      const s = localStorage.getItem("flatbelly_rewards");
      return s ? JSON.parse(s) : INITIAL_REWARDS;
    } catch (e) {
      return INITIAL_REWARDS;
    }
  });

  const [redemptions, setRedemptions] = useState(() => {
    try {
      const s = localStorage.getItem("flatbelly_redemptions");
      return s ? JSON.parse(s) : [];
    } catch (e) {
      return [];
    }
  });

  const [waistLogs, setWaistLogs] = useState(() => {
    try {
      const s = localStorage.getItem("flatbelly_waist_logs");
      return s ? JSON.parse(s) : [];
    } catch (e) {
      return [];
    }
  });

  const [soundOn, setSoundOn] = useState(() => {
    try {
      const s = localStorage.getItem("flatbelly_sound");
      return s !== null ? JSON.parse(s) : true;
    } catch (e) {
      return true;
    }
  });

  // Active Workout HUD State
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Modals
  const [victoryModal, setVictoryModal] = useState(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [showWaistModal, setShowWaistModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const canvasRef = useRef(null);

  // 2-second splash timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Sync sound settings
  useEffect(() => {
    sound.enabled = soundOn;
    try {
      localStorage.setItem("flatbelly_sound", JSON.stringify(soundOn));
    } catch (e) {}
  }, [soundOn]);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("flatbelly_medals", JSON.stringify(medals));
    } catch (e) {}
  }, [medals]);

  useEffect(() => {
    try {
      localStorage.setItem("flatbelly_history", JSON.stringify(history));
    } catch (e) {}
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem("flatbelly_rewards", JSON.stringify(rewards));
    } catch (e) {}
  }, [rewards]);

  useEffect(() => {
    try {
      localStorage.setItem("flatbelly_redemptions", JSON.stringify(redemptions));
    } catch (e) {}
  }, [redemptions]);

  useEffect(() => {
    try {
      localStorage.setItem("flatbelly_waist_logs", JSON.stringify(waistLogs));
    } catch (e) {}
  }, [waistLogs]);

  // Toast Helper
  function say(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3200);
  }

  const todayStr = getTodayStr();
  const streak = calculateStreak(history);

  // ─── Workout Engine ──────────────────────────────────────────────────────────
  function startRoutine(routine) {
    sound.init();
    setActiveRoutine(routine);
    setStepIndex(0);
    setTimeLeft(routine.steps[0].duration);
    setIsPaused(false);
    if (routine.steps[0].type === "work") {
      sound.playGoWhistle();
    } else {
      sound.playRestChime();
    }
  }

  // Workout Timer Tick
  useEffect(() => {
    if (!activeRoutine || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          advanceStep();
          return 0;
        }
        if (prev <= 4 && prev > 1) {
          sound.playBeep(prev === 2 ? 800 : 600, 0.1);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeRoutine, isPaused, stepIndex]);

  function advanceStep() {
    if (!activeRoutine) return;
    const nextIdx = stepIndex + 1;
    if (nextIdx < activeRoutine.steps.length) {
      setStepIndex(nextIdx);
      const nextStep = activeRoutine.steps[nextIdx];
      setTimeLeft(nextStep.duration);
      if (nextStep.type === "work") {
        sound.playGoWhistle();
      } else {
        sound.playRestChime();
      }
    } else {
      finishWorkout();
    }
  }

  function finishWorkout() {
    const routine = activeRoutine;
    setActiveRoutine(null);

    const isFirstToday = !history.some(h => h.date === todayStr);
    const medalsToAward = isFirstToday ? 1 : 0;

    const newRecord = {
      id: Date.now(),
      date: todayStr,
      routineId: routine.id,
      routineTitle: routine.title,
      durationMinutes: routine.durationMinutes,
      medalsAwarded: medalsToAward,
      timestamp: Date.now()
    };

    setHistory(prev => [newRecord, ...prev]);

    if (medalsToAward > 0) {
      setMedals(prev => ({
        balance: prev.balance + medalsToAward,
        total: prev.total + medalsToAward
      }));
    }

    sound.playMedalFanfare();
    setVictoryModal({ medalsGained: medalsToAward, alreadyDone: !isFirstToday });
  }

  // Confetti trigger when modal opens
  useEffect(() => {
    if (victoryModal && canvasRef.current) {
      triggerConfetti(canvasRef.current);
    }
  }, [victoryModal]);

  // ─── Reward Redemption Handlers ─────────────────────────────────────────────
  function handleRedeem(reward) {
    if (medals.balance < reward.cost) {
      say(`Not enough medals! Need ${reward.cost - medals.balance} more 🏅`);
      return;
    }

    sound.playRedeemChime();
    setMedals(p => ({ ...p, balance: p.balance - reward.cost }));
    setRewards(p =>
      p.map(r => (r.id === reward.id ? { ...r, redeemedCount: (r.redeemedCount || 0) + 1 } : r))
    );

    const redemptionRecord = {
      id: Date.now(),
      rewardId: reward.id,
      title: reward.title,
      emoji: reward.emoji,
      cost: reward.cost,
      date: getTodayStr(),
      timestamp: Date.now()
    };
    setRedemptions(p => [redemptionRecord, ...p]);
    say(`🎉 Redeemed: "${reward.title}"! Enjoy your reward!`);
  }

  function handleSaveReward(item) {
    if (!item.title || !item.cost) return;
    const costNum = Math.max(1, parseInt(item.cost, 10) || 1);
    
    if (item.id) {
      // Edit existing reward
      setRewards(p =>
        p.map(r =>
          r.id === item.id
            ? { ...r, title: item.title, emoji: item.emoji || "🎁", cost: costNum }
            : r
        )
      );
      say(`✏️ Reward "${item.title}" updated!`);
    } else {
      // Add new reward
      setRewards(p => [
        ...p,
        {
          id: `rew_${Date.now()}`,
          title: item.title,
          emoji: item.emoji || "🎁",
          cost: costNum,
          redeemedCount: 0
        }
      ]);
      say(`✨ New reward "${item.title}" added to Wishlist!`);
    }
    setShowRewardModal(false);
    setEditingReward(null);
  }

  function handleDeleteReward(id) {
    const item = rewards.find(r => r.id === id);
    if (!item) return;
    if (!confirm(`Delete reward "${item.title}"?`)) return;
    setRewards(p => p.filter(r => r.id !== id));
    say(`Reward "${item.title}" deleted.`);
  }

  function handleRestoreDefaultRewards() {
    if (!confirm("Reset Wishlist rewards back to original defaults?")) return;
    setRewards(INITIAL_REWARDS);
    say("✨ Restored original default rewards!");
  }

  // ─── Waistline Handlers ─────────────────────────────────────────────────────
  function handleAddWaistLog(entry) {
    if (!entry.waistCm) return;
    const item = {
      id: Date.now(),
      date: entry.date || todayStr,
      waistCm: parseFloat(entry.waistCm),
      weightKg: entry.weightKg ? parseFloat(entry.weightKg) : null,
      notes: entry.notes || ""
    };
    setWaistLogs(p => [item, ...p]);
    setShowWaistModal(false);
    say("📏 Measurement recorded! FlatBelly in progress!");
  }

  // ─── Reset & Delete Handlers ────────────────────────────────────────────────
  function handleDeleteHistory(id) {
    const item = history.find(h => h.id === id);
    if (!item) return;
    if (!confirm(`Delete test record "${item.routineTitle}"?`)) return;

    if (item.medalsAwarded > 0) {
      setMedals(p => ({
        balance: Math.max(0, p.balance - item.medalsAwarded),
        total: Math.max(0, p.total - item.medalsAwarded)
      }));
    }
    setHistory(p => p.filter(h => h.id !== id));
    say("Test record removed. Medal deducted.");
  }

  function handleResetAllData() {
    if (!confirm("Are you sure you want to clear all test records and reset medals to 0?")) return;
    setMedals({ balance: 0, total: 0 });
    setHistory([]);
    setRedemptions([]);
    try {
      localStorage.removeItem("flatbelly_medals");
      localStorage.removeItem("flatbelly_history");
      localStorage.removeItem("flatbelly_redemptions");
    } catch (e) {}
    say("✅ All medals and workout history have been reset!");
  }

  // ─── Data Export / Import ───────────────────────────────────────────────────
  function handleExportData() {
    const data = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      medals,
      history,
      rewards,
      redemptions,
      waistLogs
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FlatBellyWar_Backup_${todayStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    say("📥 Backup file downloaded successfully!");
  }

  function handleImportData(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const d = JSON.parse(evt.target.result);
        if (d.medals) setMedals(d.medals);
        if (d.history) setHistory(d.history);
        if (d.rewards) setRewards(d.rewards);
        if (d.redemptions) setRedemptions(d.redemptions);
        if (d.waistLogs) setWaistLogs(d.waistLogs);
        say("✅ Backup data restored!");
      } catch (err) {
        say("⚠️ Invalid backup file.");
      }
    };
    reader.readAsText(file);
  }

  // Latest Waist summary
  const latestWaist = waistLogs.length > 0 ? waistLogs[0].waistCm : null;
  const initialWaist = waistLogs.length > 0 ? waistLogs[waistLogs.length - 1].waistCm : null;
  const waistDiff = latestWaist && initialWaist ? (latestWaist - initialWaist).toFixed(1) : null;

  // ─── 1. INTRO SPLASH SCREEN (2 SECONDS DYNAMIC SCALE) ──────────────────────
  if (showSplash) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: T.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999999,
          padding: 24,
          textAlign: "center",
          userSelect: "none"
        }}
        onClick={() => setShowSplash(false)}
      >
        <div
          className="splash-text"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(52px, 13vw, 92px)",
            color: T.lime,
            letterSpacing: "0.06em",
            lineHeight: 0.95,
            textShadow: `0 8px 36px ${T.limeGlow}, 0 2px 4px rgba(104, 12, 43, 0.28)`,
            maxWidth: 680
          }}
        >
          THE WAR OF FLATBELLY
        </div>
      </div>
    );
  }

  // ─── 2. MAIN APPLICATION INTERFACE ──────────────────────────────────────────
  return (
    <div style={{ minHeight: "100dvh", background: T.bg, paddingBottom: activeTab === "battle" ? 64 : 88, position: "relative" }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 99999,
            background: T.textDeep,
            color: "#FFFFFF",
            padding: "12px 24px",
            borderRadius: 30,
            fontSize: 14,
            fontWeight: 700,
            boxShadow: "0 10px 28px rgba(104, 12, 43, 0.35)",
            border: `1.5px solid ${T.lime}`,
            display: "flex",
            alignItems: "center",
            gap: 8,
            animation: "fadeIn 0.2s ease"
          }}
        >
          <span>⚡</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <header
        style={{
          background: "rgba(253, 240, 244, 0.90)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: `1.5px solid ${T.border}`,
          position: "sticky",
          top: 0,
          zIndex: 40,
          padding: "8px 12px"
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          {/* Brand Logo & Name */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  background: T.lime,
                  color: T.textDeep,
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontWeight: 900,
                  fontSize: 11,
                  padding: "1px 6px",
                  borderRadius: 5,
                  letterSpacing: "0.06em"
                }}
              >
                WAR FOR FITNESS
              </span>
              <span style={{ fontSize: 10, color: T.textMuted, fontWeight: 700 }}>
                {todayStr}
              </span>
            </div>
            <h1
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(20px, 5.2vw, 26px)",
                letterSpacing: "0.04em",
                color: T.textDeep,
                lineHeight: 1.1,
                margin: "1px 0 0",
                whiteSpace: "nowrap"
              }}
            >
              The War of FlatBelly
            </h1>
          </div>

          {/* Top Stat Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {/* Streak Flame */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.92)",
                border: `1.5px solid ${T.border}`,
                borderRadius: 12,
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}
              title="Every-other-day grace rule: Workout every 1-2 days to keep your streak!"
            >
              <span style={{ fontSize: 14 }}>🔥</span>
              <span className="font-num" style={{ fontWeight: 800, fontSize: 16, color: T.textDeep }}>{streak}</span>
            </div>

            {/* Medals Wallet Badge */}
            <button
              type="button"
              onClick={() => setActiveTab("rewards")}
              style={{
                background: T.lime,
                color: T.textDeep,
                border: `1.5px solid ${T.limeHover}`,
                borderRadius: 12,
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "'Bebas Neue', sans-serif",
                fontWeight: 900,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(188, 227, 0, 0.35)",
                transition: "transform 0.15s ease"
              }}
            >
              <span style={{ fontSize: 14 }}>🏅</span>
              <span className="font-num">{medals.balance}</span>
            </button>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => {
                setSoundOn(!soundOn);
                say(soundOn ? "Muted" : "Sound Enabled 🔊");
              }}
              style={{
                background: "rgba(255, 255, 255, 0.85)",
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 14
              }}
              title="Toggle Audio"
            >
              {soundOn ? "🔊" : "🔇"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ width: "100%", maxWidth: 640, margin: "0 auto", padding: activeTab === "battle" ? "8px 14px 2px" : "14px 14px 28px", height: activeTab === "battle" ? "calc(100dvh - 128px)" : "auto", boxSizing: "border-box", overflow: activeTab === "battle" ? "hidden" : "visible" }}>
        {/* ─── TAB 1: WAR ROOM (3 BIG CHOICES WITH REPEATING WORKOUT ART WALLPAPER BEHIND) ─────── */}
        {activeTab === "battle" && (
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "100%",
              minHeight: "calc(100dvh - 140px)",
              padding: "16px 0",
              boxSizing: "border-box",
              overflow: "hidden"
            }}
          >
            {/* Repeating Cute Workout Illustrations Wallpaper BEHIND the 3 Options */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url('/workout-illustrations.webp')",
                backgroundSize: "clamp(320px, 80vw, 420px) auto",
                backgroundRepeat: "repeat",
                backgroundPosition: "center top",
                opacity: selectedRoutineId !== null ? 0.15 : 0.40,
                filter: "saturate(1.25)",
                pointerEvents: "none",
                zIndex: 0,
                userSelect: "none",
                transition: "opacity 0.4s ease"
              }}
            />

            {/* 3 Action Buttons Placed Proudly IN FRONT */}
            <div
              style={{
                position: "relative",
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                gap: "clamp(12px, 2.2vh, 18px)",
                width: "100%"
              }}
            >
              {ROUTINES.map(rt => {
                const isSelected = selectedRoutineId === rt.id;
                const isOtherSelected = selectedRoutineId !== null && !isSelected;

                const routineTitleText =
                  rt.id === "emergency_save"
                    ? "EMERGENCY 3-MIN SAVE"
                    : rt.id === "home_blitz"
                    ? "HOME CORE BLITZ"
                    : "OUTDOOR CARDIO RAID";

                return (
                  <div
                    key={rt.id}
                    onClick={() => {
                      if (selectedRoutineId !== null) return;
                      setSelectedRoutineId(rt.id);
                      setTimeout(() => {
                        startRoutine(rt);
                        setSelectedRoutineId(null);
                      }, 420);
                    }}
                    style={{
                      background: isSelected ? T.lime : "rgba(255, 255, 255, 0.92)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      color: T.textDeep,
                      border: isSelected ? `2.5px solid ${T.limeHover}` : `2px solid ${T.border}`,
                      borderRadius: 22,
                      padding: "clamp(24px, 4vh, 34px) 14px",
                      textAlign: "center",
                      cursor: "pointer",
                      userSelect: "none",
                      boxShadow: isSelected
                        ? `0 18px 48px ${T.limeGlow}`
                        : "0 10px 30px rgba(150, 27, 72, 0.08)",
                      transform: isSelected
                        ? "scale(1.08)"
                        : isOtherSelected
                        ? "scale(0.92)"
                        : "scale(1)",
                      opacity: isOtherSelected ? 0 : 1,
                      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                      zIndex: isSelected ? 20 : 1,
                      pointerEvents: isOtherSelected ? "none" : "auto"
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: "clamp(26px, 7vw, 40px)",
                        letterSpacing: "0.05em",
                        lineHeight: 1.05,
                        color: T.textDeep,
                        whiteSpace: "nowrap"
                      }}
                    >
                      {routineTitleText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── TAB 2: SPOILS ARMORY (Self-Reward Store) ───────────────────── */}
        {activeTab === "rewards" && (
          <div>
            {/* Medal Bank Card */}
            <div
              className="icy-card"
              style={{
                padding: "26px 20px",
                textAlign: "center",
                marginBottom: 24,
                background: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(188, 227, 0, 0.18))",
                borderColor: T.lime
              }}
            >
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: T.textBright, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                MEDAL TREASURY · EARNED GLORY
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "10px 0" }}>
                <span style={{ fontSize: 44 }}>🏅</span>
                <span className="font-num" style={{ fontSize: 66, color: T.textDeep, letterSpacing: "0.02em", lineHeight: 1 }}>
                  {medals.balance}
                </span>
                <span style={{ fontSize: 15, fontWeight: 800, color: T.textMuted, alignSelf: "flex-end", marginBottom: 10 }}>
                  MEDALS
                </span>
              </div>
              <p style={{ fontSize: 13, color: T.textMuted, fontWeight: 600 }}>
                All-Time Earned: <strong>{medals.total}</strong> 🏅 · Every drop of sweat is your currency for joy!
              </p>
            </div>

            {/* Wishlist Header & Add Button */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <div style={{ minWidth: 160, flex: 1 }}>
                <h3 style={{ fontSize: 20, color: T.textDeep, margin: 0 }}>🎁 WISHLIST REWARDS</h3>
                <div style={{ fontSize: 11, color: T.textMuted }}>Earn medals & redeem joyful treats</div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={handleRestoreDefaultRewards}
                  style={{
                    fontSize: 11,
                    padding: "6px 8px",
                    background: "rgba(150, 27, 72, 0.05)",
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    color: T.textMuted,
                    cursor: "pointer",
                    fontWeight: 700,
                    whiteSpace: "nowrap"
                  }}
                  title="Reset to default items"
                >
                  ↺ RESET
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingReward(null);
                    setShowRewardModal(true);
                  }}
                  className="btn-raspberry"
                  style={{ fontSize: 12, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
                >
                  <span>➕ NEW</span>
                </button>
              </div>
            </div>

            {/* Rewards Grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 26 }}>
              {rewards.map(item => {
                const canAfford = medals.balance >= item.cost;
                const progressPct = Math.min(100, Math.round((medals.balance / item.cost) * 100));

                return (
                  <div
                    key={item.id}
                    className="icy-card"
                    style={{
                      padding: "14px 14px",
                      border: canAfford ? `2px solid ${T.lime}` : `1.5px solid ${T.border}`,
                      boxShadow: canAfford ? `0 8px 24px ${T.limeGlow}` : "none"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 28, flexShrink: 0 }}>{item.emoji}</span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h4 style={{ fontSize: 16, color: T.textDeep, wordBreak: "break-word", lineHeight: 1.15, margin: 0 }}>{item.title}</h4>
                          <div style={{ fontSize: 11, color: T.textMuted, display: "flex", alignItems: "center", gap: 5, marginTop: 2, flexWrap: "wrap" }}>
                            <span>Cost: <strong>{item.cost}</strong> 🏅</span>
                            <span>·</span>
                            <span>Redeemed: {item.redeemedCount || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingReward(item);
                            setShowRewardModal(true);
                          }}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 9,
                            background: "rgba(150, 27, 72, 0.06)",
                            border: `1px solid ${T.border}`,
                            color: T.textDeep,
                            cursor: "pointer",
                            fontSize: 14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.15s ease"
                          }}
                          title="Edit this reward"
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteReward(item.id)}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 9,
                            background: "rgba(150, 27, 72, 0.06)",
                            border: `1px solid ${T.border}`,
                            color: T.textMuted,
                            cursor: "pointer",
                            fontSize: 14,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.15s ease"
                          }}
                          title="Delete this reward"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ background: T.bgSubtle, height: 8, borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
                      <div
                        style={{
                          background: canAfford ? T.lime : T.textBright,
                          width: `${progressPct}%`,
                          height: "100%",
                          borderRadius: 10,
                          transition: "width 0.4s ease"
                        }}
                      />
                    </div>

                    {/* Redeem Action Button */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: canAfford ? T.textDeep : T.textMuted, minWidth: 120, flex: 1 }}>
                        {canAfford ? "✨ Medals ready to claim!" : `Need ${item.cost - medals.balance} more 🏅 (${progressPct}%)`}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRedeem(item)}
                        disabled={!canAfford}
                        className={canAfford ? "btn-lime" : ""}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 12,
                          fontSize: 13,
                          cursor: canAfford ? "pointer" : "not-allowed",
                          background: canAfford ? T.lime : T.bgSubtle,
                          color: canAfford ? T.textDeep : T.textMuted,
                          border: canAfford ? `1px solid ${T.limeHover}` : "none",
                          whiteSpace: "nowrap",
                          flexShrink: 0
                        }}
                      >
                        {canAfford ? "🎉 REDEEM NOW" : `🔒 NEED ${item.cost - medals.balance} 🏅`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Redemption History Section */}
            <div className="icy-card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 18, color: T.textDeep, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <span>📜</span> SPOILS REDEMPTION VAULT ({redemptions.length})
              </h4>
              {redemptions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "18px 0", color: T.textMuted, fontSize: 13 }}>
                  No rewards redeemed yet. Complete workouts to earn medals and treat yourself!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {redemptions.slice(0, 10).map(rd => (
                    <div
                      key={rd.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        background: T.bgSubtle,
                        borderRadius: 12,
                        fontSize: 13
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{rd.emoji}</span>
                        <span style={{ fontWeight: 700, color: T.textDeep }}>{rd.title}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: T.textBright, fontFamily: "'Bebas Neue', sans-serif", fontSize: 16 }}>-{rd.cost} 🏅</span>
                        <span style={{ color: T.textMuted, fontSize: 11 }}>{rd.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 3: LOGS & WAIST (Belly Tracker & History) ───────────────── */}
        {activeTab === "logs" && (
          <div>
            {/* Waist Tracker Banner */}
            <div
              className="icy-card"
              style={{
                padding: 22,
                marginBottom: 22,
                background: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(253, 240, 244, 0.95))"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: T.textBright, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    BELLY TRANSFORMATION · NAVEL WAISTLINE
                  </div>
                  <h3 className="font-num" style={{ fontSize: 34, color: T.textDeep, letterSpacing: "0.03em", marginTop: 2 }}>
                    {latestWaist ? `${latestWaist} cm` : "No records logged"}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowWaistModal(true)}
                  className="btn-lime"
                  style={{ fontSize: 14, padding: "8px 16px" }}
                >
                  <span>📏 LOG WAISTLINE</span>
                </button>
              </div>

              {waistDiff !== null && (
                <div
                  style={{
                    background: T.limeDim,
                    border: `1px solid ${T.lime}`,
                    borderRadius: 12,
                    padding: "10px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: T.textDeep,
                    fontWeight: 800
                  }}
                >
                  <span>🔥</span>
                  <span>
                    Total Progress: {parseFloat(waistDiff) <= 0 ? `Slimmed by ${Math.abs(waistDiff)} cm 🎉` : `Changed ${waistDiff} cm`}
                  </span>
                </div>
              )}
            </div>

            {/* Calendar & Battle History */}
            <div className="icy-card" style={{ padding: 20, marginBottom: 20 }}>
              <h4 style={{ fontSize: 18, color: T.textDeep, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                <span>📅</span> BATTLE LOG ({history.length} VICTORIES)
              </h4>

              {history.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: T.textMuted, fontSize: 13 }}>
                  No battle victories logged yet! Start your first battle in the War Room today!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {history.slice(0, 15).map(h => (
                    <div
                      key={h.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        background: T.bgSubtle,
                        borderRadius: 14
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 16, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em", color: T.textDeep }}>
                          {h.routineTitle}
                        </div>
                        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
                          {h.date} · {h.durationMinutes} mins
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {h.medalsAwarded > 0 ? (
                          <span
                            style={{
                              background: T.lime,
                              color: T.textDeep,
                              fontFamily: "'Bebas Neue', sans-serif",
                              fontSize: 13,
                              padding: "3px 8px",
                              borderRadius: 6,
                              letterSpacing: "0.03em"
                            }}
                          >
                            +1 🏅 MEDAL
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 800 }}>
                            EXTRA BURN ⚡
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteHistory(h.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: T.textMuted,
                            cursor: "pointer",
                            fontSize: 15,
                            padding: "2px 4px"
                          }}
                          title="Delete test record and revoke medal"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 4: SETTINGS (Preferences & Danger Zone) ────────────────── */}
        {activeTab === "settings" && (
          <div className="icy-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 20, color: T.textDeep, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <span>⚙️</span> PREFERENCES & DATA BACKUP
            </h3>

            {/* Sound Switch */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
              <div>
                <div style={{ fontWeight: 800, color: T.textDeep, fontSize: 15 }}>Workout Sound Effects</div>
                <div style={{ fontSize: 12, color: T.textMuted }}>Countdown 3-2-1 beeps, whistle start, and rest chimes</div>
              </div>
              <button
                type="button"
                onClick={() => setSoundOn(!soundOn)}
                style={{
                  background: soundOn ? T.lime : T.bgSubtle,
                  color: T.textDeep,
                  border: `1px solid ${soundOn ? T.limeHover : T.border}`,
                  borderRadius: 20,
                  padding: "6px 14px",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 14,
                  cursor: "pointer"
                }}
              >
                {soundOn ? "🔊 ENABLED" : "🔇 MUTED"}
              </button>
            </div>

            {/* Streak Rule Info */}
            <div style={{ padding: "16px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontWeight: 800, color: T.textDeep, fontSize: 15, marginBottom: 4 }}>
                Every-Other-Day Grace Rule (48h Window)
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>
                Tailored for working out every 1-2 days. As long as your last battle was within 48 hours (yesterday or today), your streak flame stays ablaze—rest days are completely guilt-free!
              </div>
            </div>

            {/* Backup & Restore */}
            <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontWeight: 800, color: T.textDeep, fontSize: 15 }}>Local Data Backup</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="btn-raspberry"
                  style={{ flex: 1, fontSize: 14, padding: "10px 0" }}
                >
                  📥 EXPORT BACKUP JSON
                </button>

                <label
                  className="btn-lime"
                  style={{ flex: 1, fontSize: 14, padding: "10px 0", textAlign: "center", cursor: "pointer" }}
                >
                  📤 RESTORE BACKUP
                  <input type="file" accept=".json" onChange={handleImportData} style={{ display: "none" }} />
                </label>
              </div>
              <div style={{ fontSize: 11, color: T.textMuted }}>
                All workout logs, medals, and waistline measurements are saved privately on your device. 100% offline-first and free forever.
              </div>
            </div>

            {/* Reset / Clear Test Data Section */}
            <div style={{ padding: "18px 0", borderTop: `1.5px dashed ${T.border}`, marginTop: 6 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: T.textBright, marginBottom: 4 }}>
                🗑️ DANGER ZONE: CLEAR TEST DATA & RESET MEDALS
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 14, lineHeight: 1.45 }}>
                Just finished testing the app? Click below to wipe all test workout records and reset your medals back to 0 for a fresh start:
              </div>
              <button
                type="button"
                onClick={handleResetAllData}
                style={{
                  background: "rgba(212, 43, 102, 0.1)",
                  color: T.textBright,
                  border: `1.5px solid ${T.textBright}`,
                  borderRadius: 14,
                  padding: "13px 18px",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 16,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8
                }}
              >
                <span>🔄 RESET ALL MEDALS & TEST LOGS</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ─── BOTTOM NAVIGATION BAR (ALWAYS ACCESSIBLE) ─────────────────────── */}
      {!activeRoutine && (
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(253, 240, 244, 0.95)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderTop: `1.5px solid ${T.border}`,
            display: "flex",
            justifyContent: "space-around",
            padding: "10px 0 14px",
            zIndex: 50,
            maxWidth: 640,
            margin: "0 auto"
          }}
        >
          {[
            { id: "battle", label: "WAR ROOM", icon: "⚔️" },
            { id: "rewards", label: "SPOILS", icon: "🎁" },
            { id: "logs", label: "LOGBOOK", icon: "📊" },
            { id: "settings", label: "SETTINGS", icon: "⚙️" }
          ].map(tab => {
            const isCurr = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isCurr ? T.lime : "transparent",
                  color: isCurr ? T.textDeep : T.textMuted,
                  border: isCurr ? `1px solid ${T.limeHover}` : "none",
                  borderRadius: 14,
                  padding: "6px 14px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  cursor: "pointer",
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 13,
                  letterSpacing: "0.04em",
                  transition: "all 0.2s ease",
                  boxShadow: isCurr ? `0 4px 12px ${T.limeGlow}` : "none"
                }}
              >
                <span style={{ fontSize: 18 }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* ─── FULLSCREEN BATTLEFIELD HUD TIMER OVERLAY ───────────────────────── */}
      {activeRoutine && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: T.bg,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "24px 20px 32px",
            boxSizing: "border-box"
          }}
        >
          {/* HUD Top Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 520, margin: "0 auto", width: "100%" }}>
            <div>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: T.textBright, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {activeRoutine.title}
              </span>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.textDeep }}>
                MOVEMENT {stepIndex + 1} OF {activeRoutine.steps.length}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => setSoundOn(!soundOn)}
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  width: 38,
                  height: 38,
                  cursor: "pointer",
                  fontSize: 16
                }}
              >
                {soundOn ? "🔊" : "🔇"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to surrender this battle early?")) {
                    setActiveRoutine(null);
                  }
                }}
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: "0 12px",
                  fontSize: 13,
                  fontFamily: "'Bebas Neue', sans-serif",
                  color: T.textMuted,
                  cursor: "pointer"
                }}
              >
                SURRENDER
              </button>
            </div>
          </div>

          {/* HUD Center Progress Ring & Exercise Display */}
          <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto", width: "100%" }}>
            {(() => {
              const currentStep = activeRoutine.steps[stepIndex];
              const isWork = currentStep.type === "work";
              const totalSec = currentStep.duration;
              const radius = 90;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (timeLeft / totalSec) * circumference;

              return (
                <div>
                  {/* Circular Radial Timer */}
                  <div style={{ position: "relative", width: 220, height: 220, margin: "0 auto 20px" }}>
                    <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
                      <circle
                        cx="110"
                        cy="110"
                        r={radius}
                        stroke="rgba(150, 27, 72, 0.12)"
                        strokeWidth="14"
                        fill="transparent"
                      />
                      <circle
                        cx="110"
                        cy="110"
                        r={radius}
                        stroke={isWork ? T.lime : T.textBright}
                        strokeWidth="14"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        style={{ transition: "stroke-dashoffset 0.8s linear" }}
                      />
                    </svg>

                    {/* Timer Inside Text */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <span
                        style={{
                          background: isWork ? T.lime : T.bgSubtle,
                          color: T.textDeep,
                          fontFamily: "'Bebas Neue', sans-serif",
                          fontSize: 14,
                          padding: "2px 10px",
                          borderRadius: 8,
                          marginBottom: 4,
                          letterSpacing: "0.05em"
                        }}
                      >
                        {isWork ? "⚡ WORK: IGNITE CORE" : "🍃 REST: BREATHE & RECOVER"}
                      </span>
                      <span
                        className="font-num"
                        style={{
                          fontSize: 70,
                          letterSpacing: "0.02em",
                          color: T.textDeep,
                          lineHeight: 1
                        }}
                      >
                        {String(timeLeft).padStart(2, "0")}
                      </span>
                      <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 800, letterSpacing: "0.06em", marginTop: 4 }}>
                        SECONDS
                      </span>
                    </div>
                  </div>

                  {/* Current Movement Card */}
                  <div className="icy-card" style={{ padding: 20, marginBottom: 14 }}>
                    <div style={{ fontSize: 34, marginBottom: 6 }}>{currentStep.illustration || (isWork ? "🔥" : "🍃")}</div>
                    <h2 style={{ fontSize: 26, color: T.textDeep, marginBottom: 4 }}>
                      {currentStep.title}
                    </h2>
                    {currentStep.target && (
                      <div style={{ fontSize: 12, fontWeight: 800, color: T.textBright, marginBottom: 8 }}>
                        Target: {currentStep.target}
                      </div>
                    )}
                    {currentStep.tips && (
                      <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.45 }}>
                        💡 {currentStep.tips}
                      </p>
                    )}
                  </div>

                  {/* Next Step Preview */}
                  {stepIndex + 1 < activeRoutine.steps.length && (
                    <div style={{ fontSize: 12, color: T.textMuted }}>
                      UP NEXT: <strong>{activeRoutine.steps[stepIndex + 1].title}</strong> ({activeRoutine.steps[stepIndex + 1].duration}s)
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* HUD Bottom Controls */}
          <div style={{ display: "flex", gap: 12, maxWidth: 520, margin: "0 auto", width: "100%" }}>
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className={isPaused ? "btn-lime" : "btn-raspberry"}
              style={{ flex: 1, padding: "14px 0", fontSize: 18 }}
            >
              {isPaused ? "▶️ RESUME BATTLE" : "⏸️ PAUSE BATTLE"}
            </button>
            <button
              type="button"
              onClick={advanceStep}
              style={{
                background: "rgba(255,255,255,0.9)",
                border: `1.5px solid ${T.border}`,
                borderRadius: 14,
                padding: "14px 22px",
                fontFamily: "'Bebas Neue', sans-serif",
                color: T.textDeep,
                fontSize: 16,
                letterSpacing: "0.04em",
                cursor: "pointer"
              }}
            >
              ⏭️ SKIP STEP
            </button>
          </div>
        </div>
      )}

      {/* ─── VICTORY CELEBRATION MODAL ────────────────────────────────────── */}
      {victoryModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(104, 12, 43, 0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none"
            }}
          />

          <div
            className="icy-card"
            style={{
              maxWidth: 420,
              width: "100%",
              padding: "34px 24px",
              textAlign: "center",
              position: "relative",
              border: `2px solid ${T.lime}`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
            }}
          >
            <div style={{ fontSize: 58, marginBottom: 10 }}>🏆</div>
            <h2 style={{ fontSize: 26, color: T.textDeep, marginBottom: 6 }}>
              VICTORY! FLATBELLY BATTLE WON
            </h2>
            <p style={{ fontSize: 14, color: T.textMuted, marginBottom: 20 }}>
              {victoryModal.medalsGained > 0
                ? "Fat eradicated! Your daily battle medal is deposited!"
                : "Extra burn completed! Sweating away stubborn core fat!"}
            </p>

            {/* Medal Award Badge */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(188, 227, 0, 0.25))",
                border: `2px solid ${T.lime}`,
                borderRadius: 18,
                padding: "16px 22px",
                display: "inline-flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 24
              }}
            >
              <span style={{ fontSize: 38 }}>🏅</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: T.textDeep }}>
                  {victoryModal.medalsGained > 0 ? "+1 FLATBELLY MEDAL!" : "DAILY MEDAL SECURED"}
                </div>
                <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 700 }}>
                  Current Treasury: {medals.balance} 🏅
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setVictoryModal(null);
                  setActiveTab("rewards");
                }}
                className="btn-lime"
                style={{ width: "100%", fontSize: 16 }}
              >
                🎁 VISIT SPOILS ARMORY
              </button>
              <button
                type="button"
                onClick={() => setVictoryModal(null)}
                className="btn-raspberry"
                style={{ width: "100%", fontSize: 15 }}
              >
                ⚔️ RETURN TO WAR ROOM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD / EDIT REWARD MODAL ───────────────────────────────────────── */}
      {showRewardModal && (
        <RewardModal
          initialData={editingReward}
          onClose={() => {
            setShowRewardModal(false);
            setEditingReward(null);
          }}
          onSave={handleSaveReward}
        />
      )}

      {/* ─── WAIST MEASUREMENT MODAL ───────────────────────────────────────── */}
      {showWaistModal && (
        <WaistModal
          onClose={() => setShowWaistModal(false)}
          onSave={handleAddWaistLog}
          todayStr={todayStr}
        />
      )}
    </div>
  );
}

// ─── Modal: Add & Edit Wishlist Reward (English) ──────────────────────────────
function RewardModal({ initialData, onClose, onSave }) {
  const isEditing = Boolean(initialData?.id);
  const [title, setTitle] = useState(initialData?.title || "");
  const [cost, setCost] = useState(initialData?.cost || 3);
  const [emoji, setEmoji] = useState(initialData?.emoji || "🥤");

  const emojiOptions = [
    "🥤", "🎮", "🍣", "🎬", "👕", "👟", "☕", "🍕", "💆", "🏖️", "📚", "🎁",
    "🍰", "🍦", "🍔", "🍻", "🎧", "🚲", "✈️", "🛋️", "📱", "🏆"
  ];

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: initialData?.id,
      title: title.trim(),
      emoji: emoji || "🎁",
      cost: Math.max(1, parseInt(cost, 10) || 1)
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(104, 12, 43, 0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20
      }}
    >
      <div className="icy-card" style={{ maxWidth: 410, width: "100%", padding: "26px 22px" }}>
        <h3 style={{ fontSize: 22, color: T.textDeep, marginBottom: 14 }}>
          {isEditing ? "✏️ EDIT WISHLIST REWARD" : "➕ ADD NEW WISHLIST REWARD"}
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Emoji Selector */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: T.textMuted, display: "block", marginBottom: 6 }}>
              Select Icon:
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxHeight: 105, overflowY: "auto", padding: "4px 2px" }}>
              {emojiOptions.map(em => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    fontSize: 20,
                    border: emoji === em ? `2px solid ${T.lime}` : `1px solid ${T.border}`,
                    background: emoji === em ? T.limeDim : "transparent",
                    cursor: "pointer"
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: T.textMuted, display: "block", marginBottom: 6 }}>
              Reward Name / Treat:
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Iced Bubble Tea, Night Out"
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 12,
                border: `1.5px solid ${T.border}`,
                background: "#FFFFFF",
                color: T.textDeep,
                fontSize: 15,
                fontWeight: 700,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Cost Input (Manual number + quick presets) */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: T.textMuted }}>
                Required Medals (🏅):
              </label>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: T.textBright }}>
                {cost} 🏅
              </span>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input
                type="number"
                min="1"
                max="9999"
                value={cost}
                onChange={e => setCost(Math.max(1, parseInt(e.target.value, 10) || 1))}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${T.border}`,
                  background: "#FFFFFF",
                  color: T.textDeep,
                  fontSize: 16,
                  fontWeight: 800,
                  fontFamily: "'Bebas Neue', sans-serif",
                  boxSizing: "border-box",
                  outline: "none"
                }}
              />
            </div>

            {/* Quick preset chips */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[1, 2, 3, 5, 10, 20, 30, 50, 100].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCost(amt)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontFamily: "'Bebas Neue', sans-serif",
                    background: cost === amt ? T.lime : T.bgSubtle,
                    color: T.textDeep,
                    border: cost === amt ? `1px solid ${T.limeHover}` : `1px solid ${T.border}`,
                    cursor: "pointer"
                  }}
                >
                  {amt} 🏅
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "11px 0",
                borderRadius: 12,
                border: `1px solid ${T.border}`,
                background: "transparent",
                color: T.textMuted,
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-lime"
              style={{
                flex: 2,
                padding: "11px 0",
                borderRadius: 12,
                fontSize: 15,
                cursor: "pointer"
              }}
            >
              {isEditing ? "💾 SAVE CHANGES" : "➕ ADD REWARD"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal: Waist Log (English) ──────────────────────────────────────────────
function WaistModal({ onClose, onSave, todayStr }) {
  const [waistCm, setWaistCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(104, 12, 43, 0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20
      }}
    >
      <div className="icy-card" style={{ maxWidth: 380, width: "100%", padding: 24 }}>
        <h3 style={{ fontSize: 22, color: T.textDeep, marginBottom: 14 }}>
          📏 LOG NAVEL WAISTLINE
        </h3>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: T.textMuted, display: "block", marginBottom: 6 }}>
            Navel Horizontal Waist (cm) *
          </label>
          <input
            type="number"
            step="0.1"
            value={waistCm}
            onChange={e => setWaistCm(e.target.value)}
            placeholder="e.g. 78.5"
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 12,
              border: `1.5px solid ${T.border}`,
              background: "#FFFFFF",
              color: T.textDeep,
              fontSize: 16,
              fontWeight: 800,
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: T.textMuted, display: "block", marginBottom: 6 }}>
            Body Weight (kg, optional):
          </label>
          <input
            type="number"
            step="0.1"
            value={weightKg}
            onChange={e => setWeightKg(e.target.value)}
            placeholder="e.g. 65.0"
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 12,
              border: `1.5px solid ${T.border}`,
              background: "#FFFFFF",
              color: T.textDeep,
              fontSize: 14,
              fontWeight: 700,
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 12,
              border: `1px solid ${T.border}`,
              background: "transparent",
              color: T.textMuted,
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 16,
              cursor: "pointer"
            }}
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={() => onSave({ waistCm, weightKg, notes })}
            disabled={!waistCm}
            className="btn-lime"
            style={{ flex: 1, fontSize: 16 }}
          >
            SAVE RECORD
          </button>
        </div>
      </div>
    </div>
  );
}
