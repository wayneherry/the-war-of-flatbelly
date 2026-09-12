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

  // Parse date difference in days
  const toDays = dateStr => Math.floor(new Date(dateStr).getTime() / (1000 * 60 * 60 * 24));
  const todayDays = toDays(today);
  const latestDays = toDays(dates[0]);

  // Grace window: every 1~2 days allowed (diff <= 2)
  if (todayDays - latestDays > 2) {
    return 0; // Streak broken
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
      p.vy += 0.45; // gravity
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
  // Navigation: "battle" | "rewards" | "logs" | "settings"
  const [activeTab, setActiveTab] = useState("battle");

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
  const [victoryModal, setVictoryModal] = useState(null); // { medalsGained: number, alreadyDone: boolean }
  const [showAddReward, setShowAddReward] = useState(false);
  const [showWaistModal, setShowWaistModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const canvasRef = useRef(null);

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

  // Today's Battle Status
  const todayStr = getTodayStr();
  const completedToday = history.some(h => h.date === todayStr);
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
          // Advance to next step
          advanceStep();
          return 0;
        }
        // Beep at 3, 2, 1
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
      // Workout Finished!
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
      say(`戰功勳章不足！還差 ${reward.cost - medals.balance} 枚 🏅`);
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
    say(`🎉 成功兌換：「${reward.title}」！去享受您的犒賞吧！`);
  }

  function handleAddReward(newItem) {
    if (!newItem.title || !newItem.cost) return;
    setRewards(p => [
      ...p,
      {
        id: `rew_${Date.now()}`,
        title: newItem.title,
        emoji: newItem.emoji || "🎁",
        cost: Number(newItem.cost) || 3,
        redeemedCount: 0
      }
    ]);
    setShowAddReward(false);
    say("✨ 願望獎勵已成功加入軍需清單！");
  }

  function handleDeleteReward(id) {
    setRewards(p => p.filter(r => r.id !== id));
    say("已刪除該項獎勵。");
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
    say("📏 圍度記錄已更新！平肚進化中！");
  }

  function handleDeleteHistory(id) {
    const item = history.find(h => h.id === id);
    if (!item) return;
    if (!confirm(`確定要刪除「${item.routineTitle}」這筆測試紀錄嗎？`)) return;

    if (item.medalsAwarded > 0) {
      setMedals(p => ({
        balance: Math.max(0, p.balance - item.medalsAwarded),
        total: Math.max(0, p.total - item.medalsAwarded)
      }));
    }
    setHistory(p => p.filter(h => h.id !== id));
    say("已刪除該筆測試紀錄，勳章已扣回！");
  }

  function handleResetAllData() {
    if (!confirm("確定要將所有測試作戰紀錄與勳章歸零重設嗎？")) return;
    setMedals({ balance: 0, total: 0 });
    setHistory([]);
    setRedemptions([]);
    try {
      localStorage.removeItem("flatbelly_medals");
      localStorage.removeItem("flatbelly_history");
      localStorage.removeItem("flatbelly_redemptions");
    } catch (e) {}
    say("✅ 勳章與測試紀錄已歸零！");
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
    say("📥 備份檔案已成功匯出下載！");
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
        say("✅ 備份資料已順利還原！");
      } catch (err) {
        say("⚠️ 檔案格式錯誤，還原失敗。");
      }
    };
    reader.readAsText(file);
  }

  // Latest Waist summary
  const latestWaist = waistLogs.length > 0 ? waistLogs[0].waistCm : null;
  const initialWaist = waistLogs.length > 0 ? waistLogs[waistLogs.length - 1].waistCm : null;
  const waistDiff = latestWaist && initialWaist ? (latestWaist - initialWaist).toFixed(1) : null;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingBottom: 88, position: "relative" }}>
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
            padding: "12px 22px",
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
          background: "rgba(253, 240, 244, 0.88)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: `1.5px solid ${T.border}`,
          position: "sticky",
          top: 0,
          zIndex: 40,
          padding: "14px 20px"
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Brand Logo & Name */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  background: T.lime,
                  color: T.textDeep,
                  fontWeight: 900,
                  fontSize: 11,
                  padding: "3px 7px",
                  borderRadius: 6,
                  letterSpacing: 0.8
                }}
              >
                WAR FOR FITNESS
              </span>
              <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 700 }}>
                {todayStr}
              </span>
            </div>
            <h1
              style={{
                fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: T.textDeep,
                letterSpacing: -0.5,
                lineHeight: 1.2,
                marginTop: 2
              }}
            >
              The War of FlatBelly
            </h1>
          </div>

          {/* Top Stat Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Streak Flame */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                border: `1.5px solid ${T.border}`,
                borderRadius: 14,
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: 5
              }}
              title="隔日寬限連勝：每1~2天運動一次即可維持！"
            >
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={{ fontWeight: 800, fontSize: 14, color: T.textDeep }}>{streak}</span>
              <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 700 }}>連勝</span>
            </div>

            {/* Medals Wallet Badge */}
            <button
              type="button"
              onClick={() => setActiveTab("rewards")}
              style={{
                background: T.lime,
                color: T.textDeep,
                border: `1.5px solid ${T.limeHover}`,
                borderRadius: 14,
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontWeight: 900,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(188, 227, 0, 0.35)",
                transition: "transform 0.15s ease"
              }}
            >
              <span style={{ fontSize: 16 }}>🏅</span>
              <span>{medals.balance}</span>
            </button>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => {
                setSoundOn(!soundOn);
                say(soundOn ? "靜音模式" : "音效已開啟 🔊");
              }}
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 15
              }}
              title="切換音效"
            >
              {soundOn ? "🔊" : "🔇"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "18px 16px 30px" }}>
        {/* ─── TAB 1: WAR ROOM (今日作戰) ─────────────────────────────────── */}
        {activeTab === "battle" && (
          <div>
            {/* Daily Battle Status Banner */}
            <div
              className="icy-card"
              style={{
                padding: 18,
                marginBottom: 20,
                background: completedToday
                  ? "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(188, 227, 0, 0.15))"
                  : "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(253, 240, 244, 0.9))",
                borderColor: completedToday ? T.lime : T.borderStrong
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span
                      style={{
                        background: completedToday ? T.lime : T.textMain,
                        color: completedToday ? T.textDeep : "#FFFFFF",
                        fontSize: 11,
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: 6
                      }}
                    >
                      {completedToday ? "今日已戰勝 🏆" : "今日戰令生效中 ⚔️"}
                    </span>
                    <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 700 }}>
                      每 1~2 天動一次即可
                    </span>
                  </div>

                  <h2 style={{ fontSize: 18, fontWeight: 800, color: T.textDeep, lineHeight: 1.3 }}>
                    {completedToday
                      ? "今日平肚戰功已達成！勳章已入袋 🏅"
                      : "消滅肚腩！今天花 8 分鐘動一下？"}
                  </h2>
                  <p style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>
                    {completedToday
                      ? "身體正在持續燃燒脂肪。如果精力充沛，隨時可以加練突破！"
                      : "不想動也沒關係，即使選擇 3 分鐘躺平模式，也能守住連勝並獲得勳章！"}
                  </p>
                </div>

                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    background: completedToday ? T.lime : T.bgSubtle,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    flexShrink: 0,
                    boxShadow: completedToday ? `0 6px 16px ${T.limeGlow}` : "none"
                  }}
                >
                  {completedToday ? "🏅" : "⚔️"}
                </div>
              </div>
            </div>

            {/* Battle Routines Selection Title */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: T.textDeep, display: "flex", alignItems: "center", gap: 6 }}>
                <span>🎯</span> 今日作戰模式選單
              </h3>
              <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 700 }}>點擊立即出戰</span>
            </div>

            {/* Routine Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {ROUTINES.map(rt => {
                const isLazy = rt.id === "emergency_save";
                return (
                  <div
                    key={rt.id}
                    className="icy-card icy-card-hover"
                    style={{
                      padding: "18px 20px",
                      position: "relative",
                      overflow: "hidden",
                      border: isLazy ? `1.5px solid ${T.lime}` : `1.5px solid ${T.border}`
                    }}
                  >
                    {/* Top Badges */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 28 }}>{rt.icon}</span>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: T.textBright, textTransform: "uppercase" }}>
                            {rt.enTitle}
                          </div>
                          <h4 style={{ fontSize: 18, fontWeight: 800, color: T.textDeep }}>{rt.title}</h4>
                        </div>
                      </div>

                      <span
                        style={{
                          background: isLazy ? T.lime : T.bgSubtle,
                          color: T.textDeep,
                          fontWeight: 800,
                          fontSize: 12,
                          padding: "4px 10px",
                          borderRadius: 8
                        }}
                      >
                        ⏱️ {rt.badge}
                      </span>
                    </div>

                    <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 16, lineHeight: 1.4 }}>
                      {rt.summary}
                    </p>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => startRoutine(rt)}
                      className={isLazy ? "btn-lime pulse-lime" : "btn-lime"}
                      style={{ width: "100%", fontSize: 15 }}
                    >
                      <span>⚔️ 立即開始 {rt.title}</span>
                      <span style={{ fontSize: 12, opacity: 0.8 }}>({rt.durationMinutes} 分鐘)</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── TAB 2: REWARDS ARMORY (自我獎勵兌換所) ───────────────────── */}
        {activeTab === "rewards" && (
          <div>
            {/* Medal Bank Card */}
            <div
              className="icy-card"
              style={{
                padding: "24px 20px",
                textAlign: "center",
                marginBottom: 22,
                background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(188, 227, 0, 0.18))",
                borderColor: T.lime
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: T.textBright, letterSpacing: 1, textTransform: "uppercase" }}>
                MEDAL TREASURY · 戰利品軍需庫
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "10px 0" }}>
                <span style={{ fontSize: 42 }}>🏅</span>
                <span style={{ fontSize: 52, fontWeight: 900, color: T.textDeep, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {medals.balance}
                </span>
                <span style={{ fontSize: 16, fontWeight: 800, color: T.textMuted, alignSelf: "flex-end", marginBottom: 12 }}>
                  枚可用勳章
                </span>
              </div>
              <p style={{ fontSize: 13, color: T.textMuted, fontWeight: 600 }}>
                累計斬獲 {medals.total} 枚 · 每滴流下的汗水，都能名正言順換成快樂！
              </p>
            </div>

            {/* Wishlist Header & Add Button */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: T.textDeep }}>🎁 慾望願望清單</h3>
                <div style={{ fontSize: 12, color: T.textMuted }}>累積勳章解鎖犒賞</div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddReward(true)}
                className="btn-raspberry"
                style={{ fontSize: 13, padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <span>➕ 新增願望</span>
              </button>
            </div>

            {/* Rewards Grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 26 }}>
              {rewards.map(item => {
                const canAfford = medals.balance >= item.cost;
                const progressPct = Math.min(100, Math.round((medals.balance / item.cost) * 100));

                return (
                  <div
                    key={item.id}
                    className="icy-card"
                    style={{
                      padding: "16px 18px",
                      border: canAfford ? `2px solid ${T.lime}` : `1.5px solid ${T.border}`,
                      boxShadow: canAfford ? `0 6px 20px ${T.limeGlow}` : "none"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 32 }}>{item.emoji}</span>
                        <div>
                          <h4 style={{ fontSize: 16, fontWeight: 800, color: T.textDeep }}>{item.title}</h4>
                          <div style={{ fontSize: 12, color: T.textMuted, display: "flex", alignItems: "center", gap: 6 }}>
                            <span>需要 <strong>{item.cost}</strong> 🏅</span>
                            <span>·</span>
                            <span>已兌換 {item.redeemedCount || 0} 次</span>
                          </div>
                        </div>
                      </div>

                      {/* Delete Custom Button */}
                      {!INITIAL_REWARDS.some(r => r.id === item.id) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteReward(item.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: T.textMuted,
                            cursor: "pointer",
                            fontSize: 14,
                            padding: 4
                          }}
                          title="刪除願望"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div style={{ background: T.bgSubtle, height: 7, borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
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
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: canAfford ? T.textDeep : T.textMuted }}>
                        {canAfford ? "✨ 勳章已備足，隨時兌換！" : `還差 ${item.cost - medals.balance} 枚 🏅 (${progressPct}%)`}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRedeem(item)}
                        disabled={!canAfford}
                        className={canAfford ? "btn-lime" : ""}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 12,
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: canAfford ? "pointer" : "not-allowed",
                          background: canAfford ? T.lime : T.bgSubtle,
                          color: canAfford ? T.textDeep : T.textMuted,
                          border: canAfford ? `1px solid ${T.limeHover}` : "none"
                        }}
                      >
                        {canAfford ? "🎉 立即兌換" : "鎖定中"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Redemption History Section */}
            <div className="icy-card" style={{ padding: 18 }}>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: T.textDeep, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <span>📜</span> 戰利品兌換存摺 ({redemptions.length})
              </h4>
              {redemptions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "16px 0", color: T.textMuted, fontSize: 13 }}>
                  尚未有兌換紀錄，快去運動賺取勳章犒賞自己吧！
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {redemptions.slice(0, 8).map(rd => (
                    <div
                      key={rd.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        background: T.bgSubtle,
                        borderRadius: 10,
                        fontSize: 13
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span>{rd.emoji}</span>
                        <span style={{ fontWeight: 700, color: T.textDeep }}>{rd.title}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: T.textBright, fontWeight: 800 }}>-{rd.cost} 🏅</span>
                        <span style={{ color: T.textMuted, fontSize: 11 }}>{rd.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 3: LOGS & WAIST (平肚日誌與圍度) ───────────────────────── */}
        {activeTab === "logs" && (
          <div>
            {/* Waist Tracker Banner */}
            <div
              className="icy-card"
              style={{
                padding: 20,
                marginBottom: 20,
                background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(253, 240, 244, 0.9))"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: T.textBright, textTransform: "uppercase" }}>
                    BELLY TRANSFORMATION · 小腹圍度追蹤
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: T.textDeep }}>
                    {latestWaist ? `${latestWaist} cm` : "尚未登記圍度"}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setShowWaistModal(true)}
                  className="btn-lime"
                  style={{ fontSize: 13, padding: "8px 14px" }}
                >
                  <span>📏 記錄新圍度</span>
                </button>
              </div>

              {waistDiff !== null && (
                <div
                  style={{
                    background: T.limeDim,
                    border: `1px solid ${T.lime}`,
                    borderRadius: 12,
                    padding: "8px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: T.textDeep,
                    fontWeight: 700
                  }}
                >
                  <span>🔥</span>
                  <span>
                    累計進步：{parseFloat(waistDiff) <= 0 ? `縮小了 ${Math.abs(waistDiff)} cm 🎉` : `變化 ${waistDiff} cm`}
                  </span>
                </div>
              )}
            </div>

            {/* Calendar & Battle History */}
            <div className="icy-card" style={{ padding: 18, marginBottom: 20 }}>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: T.textDeep, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <span>📅</span> 戰役日誌 ({history.length} 次完賽)
              </h4>

              {history.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: T.textMuted, fontSize: 13 }}>
                  尚未有出戰紀錄！今天就開始您的第一場平肚戰役吧！
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
                        padding: "10px 14px",
                        background: T.bgSubtle,
                        borderRadius: 12
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: T.textDeep }}>
                          {h.routineTitle}
                        </div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>
                          {h.date} · 耗時 {h.durationMinutes} 分鐘
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {h.medalsAwarded > 0 ? (
                          <span
                            style={{
                              background: T.lime,
                              color: T.textDeep,
                              fontWeight: 900,
                              fontSize: 12,
                              padding: "3px 8px",
                              borderRadius: 6
                            }}
                          >
                            +1 🏅 戰功
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 700 }}>
                            加練燃脂 ⚡
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
                            fontSize: 14,
                            padding: "2px 4px"
                          }}
                          title="刪除此筆測試紀錄並扣回勳章"
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

        {/* ─── TAB 4: SETTINGS (系統設定與備份) ───────────────────────────── */}
        {activeTab === "settings" && (
          <div className="icy-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: T.textDeep, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <span>⚙️</span> 系統設定與資料備份
            </h3>

            {/* Sound Switch */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
              <div>
                <div style={{ fontWeight: 800, color: T.textDeep, fontSize: 15 }}>伴練計時音效</div>
                <div style={{ fontSize: 12, color: T.textMuted }}>倒數 3-2-1 嗶嗶聲與換動作哨音</div>
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
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                {soundOn ? "🔊 已開啟" : "🔇 已靜音"}
              </button>
            </div>

            {/* Streak Rule Info */}
            <div style={{ padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontWeight: 800, color: T.textDeep, fontSize: 15, marginBottom: 4 }}>
                隔日打卡寬限規則 (Every 1~2 Days)
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>
                專為「隔一兩天動一次」設計。只要前後兩次作戰相隔在 48 小時內（即昨天或今天有動），連勝紀錄便會持續累計，休兵日完全合法無壓力！
              </div>
            </div>

            {/* Backup & Restore */}
            <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontWeight: 800, color: T.textDeep, fontSize: 15 }}>資料本機備份</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="btn-raspberry"
                  style={{ flex: 1, fontSize: 13, padding: "10px 0" }}
                >
                  📥 匯出備份 JSON
                </button>

                <label
                  className="btn-lime"
                  style={{ flex: 1, fontSize: 13, padding: "10px 0", textAlign: "center", cursor: "pointer" }}
                >
                  📤 還原備份
                  <input type="file" accept=".json" onChange={handleImportData} style={{ display: "none" }} />
                </label>
              </div>
              <div style={{ fontSize: 11, color: T.textMuted }}>
                所有作戰數據、勳章與圍度紀錄皆保存在您的手機本機中，安全無虞、離線秒開。
              </div>
            </div>

            {/* Reset / Clear Test Data Section */}
            <div style={{ padding: "16px 0", borderTop: `1.5px dashed ${T.border}`, marginTop: 6 }}>
              <div style={{ fontWeight: 800, color: T.textBright, fontSize: 15, marginBottom: 4 }}>
                🗑️ 測試紀錄與勳章清除
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12, lineHeight: 1.4 }}>
                剛才僅是測試功能？點擊下方按鈕即可將測試產生的作戰歷史與戰功勳章全部歸零，重新乾淨開始！
              </div>
              <button
                type="button"
                onClick={handleResetAllData}
                style={{
                  background: "rgba(212, 43, 102, 0.1)",
                  color: T.textBright,
                  border: `1.5px solid ${T.textBright}`,
                  borderRadius: 12,
                  padding: "12px 18px",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8
                }}
              >
                <span>🔄 一鍵歸零勳章與作戰紀錄</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ─── BOTTOM NAVIGATION BAR ─────────────────────────────────────────── */}
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
            { id: "battle", label: "今日作戰", icon: "⚔️" },
            { id: "rewards", label: "軍需兌換", icon: "🎁" },
            { id: "logs", label: "平肚日誌", icon: "📊" },
            { id: "settings", label: "系統設定", icon: "⚙️" }
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
                  fontWeight: isCurr ? 900 : 600,
                  fontSize: 11,
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
              <span style={{ fontSize: 11, fontWeight: 800, color: T.textBright, textTransform: "uppercase" }}>
                {activeRoutine.title}
              </span>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.textDeep }}>
                動作 {stepIndex + 1} / {activeRoutine.steps.length}
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
                  if (confirm("確定要提前中斷作戰嗎？")) {
                    setActiveRoutine(null);
                  }
                }}
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: "0 12px",
                  fontSize: 13,
                  fontWeight: 800,
                  color: T.textMuted,
                  cursor: "pointer"
                }}
              >
                放棄退場
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
                          fontSize: 12,
                          fontWeight: 900,
                          padding: "3px 10px",
                          borderRadius: 8,
                          marginBottom: 4,
                          letterSpacing: 0.5
                        }}
                      >
                        {isWork ? "⚡ WORK 燃脂出擊" : "🍃 REST 調息放鬆"}
                      </span>
                      <span
                        style={{
                          fontSize: 52,
                          fontWeight: 900,
                          color: T.textDeep,
                          fontFamily: "'Space Grotesk', sans-serif",
                          lineHeight: 1
                        }}
                      >
                        {String(timeLeft).padStart(2, "0")}
                      </span>
                      <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 700, marginTop: 4 }}>
                        SECONDS
                      </span>
                    </div>
                  </div>

                  {/* Current Movement Card */}
                  <div className="icy-card" style={{ padding: 18, marginBottom: 14 }}>
                    <div style={{ fontSize: 32, marginBottom: 6 }}>{currentStep.illustration || (isWork ? "🔥" : "🍃")}</div>
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: T.textDeep, marginBottom: 4 }}>
                      {currentStep.title}
                    </h2>
                    {currentStep.target && (
                      <div style={{ fontSize: 12, fontWeight: 800, color: T.textBright, marginBottom: 8 }}>
                        目標部位：{currentStep.target}
                      </div>
                    )}
                    {currentStep.tips && (
                      <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.4 }}>
                        💡 {currentStep.tips}
                      </p>
                    )}
                  </div>

                  {/* Next Step Preview */}
                  {stepIndex + 1 < activeRoutine.steps.length && (
                    <div style={{ fontSize: 12, color: T.textMuted }}>
                      下一動作：<strong>{activeRoutine.steps[stepIndex + 1].title}</strong> ({activeRoutine.steps[stepIndex + 1].duration}秒)
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
              style={{ flex: 1, padding: "14px 0", fontSize: 16 }}
            >
              {isPaused ? "▶️ 繼續戰役" : "⏸️ 暫停休息"}
            </button>
            <button
              type="button"
              onClick={advanceStep}
              style={{
                background: "rgba(255,255,255,0.9)",
                border: `1.5px solid ${T.border}`,
                borderRadius: 14,
                padding: "14px 20px",
                fontWeight: 800,
                color: T.textDeep,
                fontSize: 15,
                cursor: "pointer"
              }}
            >
              ⏭️ 跳過此步
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
              padding: "32px 24px",
              textAlign: "center",
              position: "relative",
              border: `2px solid ${T.lime}`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 10 }}>🏆</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: T.textDeep, marginBottom: 6 }}>
              VICTORY! 平肚戰役大獲全勝！
            </h2>
            <p style={{ fontSize: 14, color: T.textMuted, marginBottom: 20 }}>
              {victoryModal.medalsGained > 0
                ? "成功消滅脂肪！今日戰功勳章已入帳！"
                : "加練成功！汗水正在加速收平小腹！"}
            </p>

            {/* Medal Award Badge */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(188, 227, 0, 0.25))",
                border: `2px solid ${T.lime}`,
                borderRadius: 18,
                padding: "16px 20px",
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 24
              }}
            >
              <span style={{ fontSize: 36 }}>🏅</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: T.textDeep }}>
                  {victoryModal.medalsGained > 0 ? "+1 枚戰功勳章！" : "今日勳章已入袋"}
                </div>
                <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 700 }}>
                  目前可用結餘：{medals.balance} 🏅
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
                🎁 前往軍需所兌換獎勵
              </button>
              <button
                type="button"
                onClick={() => setVictoryModal(null)}
                className="btn-raspberry"
                style={{ width: "100%", fontSize: 15 }}
              >
                ⚔️ 返回作戰指揮部
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD REWARD MODAL ─────────────────────────────────────────────── */}
      {showAddReward && (
        <AddRewardModal
          onClose={() => setShowAddReward(false)}
          onAdd={handleAddReward}
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

// ─── Modal: Add Custom Reward ────────────────────────────────────────────────
function AddRewardModal({ onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState(3);
  const [emoji, setEmoji] = useState("🧋");

  const emojiOptions = ["🧋", "🎮", "🍣", "🎬", "👕", "👟", "☕", "🍕", "💆", "🏖️", "📚", "🎁"];

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
      <div className="icy-card" style={{ maxWidth: 390, width: "100%", padding: 22 }}>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: T.textDeep, marginBottom: 14 }}>
          ➕ 新增自我獎勵願望
        </h3>

        {/* Emoji Selector */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: T.textMuted, display: "block", marginBottom: 6 }}>
            選擇圖示：
          </label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
            願望犒賞名稱：
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="例如：喝一杯微糖鮮奶茶、買新球鞋"
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

        {/* Cost Input */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: T.textMuted, display: "block", marginBottom: 6 }}>
            所需勳章枚數 (🏅)：
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {[3, 5, 10, 20, 50].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => setCost(amt)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 800,
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
              padding: "10px 0",
              borderRadius: 12,
              border: `1px solid ${T.border}`,
              background: "transparent",
              color: T.textMuted,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer"
            }}
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => onAdd({ title, cost, emoji })}
            disabled={!title.trim()}
            className="btn-lime"
            style={{ flex: 1, fontSize: 14 }}
          >
            確定加入
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Waist Log ────────────────────────────────────────────────────────
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
      <div className="icy-card" style={{ maxWidth: 380, width: "100%", padding: 22 }}>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: T.textDeep, marginBottom: 14 }}>
          📏 登記最新小腹圍度
        </h3>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 800, color: T.textMuted, display: "block", marginBottom: 6 }}>
            肚臍水平腰圍 (cm) *
          </label>
          <input
            type="number"
            step="0.1"
            value={waistCm}
            onChange={e => setWaistCm(e.target.value)}
            placeholder="例如：78.5"
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
            體重 (kg，選填)：
          </label>
          <input
            type="number"
            step="0.1"
            value={weightKg}
            onChange={e => setWeightKg(e.target.value)}
            placeholder="例如：65.0"
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

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
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
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer"
            }}
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => onSave({ waistCm, weightKg, notes })}
            disabled={!waistCm}
            className="btn-lime"
            style={{ flex: 1, fontSize: 14 }}
          >
            儲存紀錄
          </button>
        </div>
      </div>
    </div>
  );
}
