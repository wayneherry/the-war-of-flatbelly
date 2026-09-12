// The War of FlatBelly - Bilingual Localization Dictionary (EN / 繁體中文)

export const TRANSLATIONS = {
  en: {
    // Header & Brand
    app_title: "The War of FlatBelly",
    war_for_fitness: "WAR FOR FITNESS",
    streak_tooltip: "Every-other-day grace rule: Workout every 1-2 days to keep your streak!",
    toggle_audio: "Toggle Audio",

    // Navigation
    nav_battle: "WAR ROOM",
    nav_rewards: "SPOILS",
    nav_logbook: "LOGBOOK",
    nav_settings: "SETTINGS",

    // War Room Choices
    choice_home: "HOME CORE BLITZ",
    choice_outdoor: "OUTDOOR CARDIO RAID",
    choice_emergency: "EMERGENCY 3-MIN SAVE",

    // Workout HUD
    workout_in_progress: "WORKOUT IN PROGRESS",
    movement_counter: "MOVEMENT {current} OF {total}",
    surrender_btn: "SURRENDER",
    surrender_confirm: "Are you sure you want to surrender this battle early?",
    paused_badge: "PAUSED",
    work_status: "⚡ WORK: IGNITE CORE",
    rest_status: "🍃 REST: BREATHE & RECOVER",
    seconds_label: "SECONDS",
    target_label: "Target:",
    tips_label: "Form Cue:",
    up_next: "UP NEXT:",
    btn_pause: "⏸️ PAUSE BATTLE",
    btn_resume: "▶️ RESUME BATTLE",
    btn_skip: "SKIP >>",

    // Victory Modal
    victory_won: "VICTORY! FLATBELLY BATTLE WON",
    victory_fat_eradicated: "Fat eradicated! Your daily battle medal is deposited!",
    victory_extra_burn: "Extra burn completed! Sweating away stubborn core fat!",
    victory_medal_plus_one: "+1 FLATBELLY MEDAL!",
    victory_medal_secured: "DAILY MEDAL SECURED",
    victory_current_treasury: "Current Treasury: {balance} 🏅",
    victory_visit_spoils: "🎁 VISIT SPOILS ARMORY",
    victory_close: "CONTINUE TO WAR ROOM",

    // Spoils Armory
    treasury_title: "MEDAL TREASURY · EARNED GLORY",
    medals_label: "MEDALS",
    all_time_earned: "All-Time Earned:",
    sweat_currency: "Every drop of sweat is your currency for joy!",
    wishlist_title: "WISHLIST REWARDS",
    wishlist_subtitle: "Earn medals & redeem joyful treats",
    btn_reset: "↺ RESET",
    btn_new: "➕ NEW",
    card_cost: "Cost:",
    card_redeemed: "Redeemed:",
    need_more_medals: "Need {n} more 🏅 ({pct}%)",
    ready_to_claim: "✨ Medals ready to claim!",
    btn_redeem_now: "🎉 REDEEM NOW",
    btn_need_medals: "🔒 NEED {n} 🏅",
    redeemed_history_title: "REDEEMED HISTORY",
    no_rewards_redeemed: "No rewards redeemed yet. Complete workouts to earn medals and treat yourself!",

    // Reward Modal
    modal_edit_title: "✏️ EDIT WISHLIST REWARD",
    modal_add_title: "➕ ADD NEW WISHLIST REWARD",
    modal_select_icon: "Select Icon:",
    modal_reward_name: "Reward Name / Treat:",
    modal_reward_placeholder: "e.g., Bubble Tea, Movie Night, Spa Day",
    modal_required_medals: "Required Medals (🏅):",
    modal_cancel: "Cancel",
    modal_save: "💾 SAVE CHANGES",
    modal_add_btn: "➕ ADD REWARD",

    // Logbook
    belly_transformation: "BELLY TRANSFORMATION · NAVEL WAISTLINE",
    no_waist_records: "No records logged",
    btn_log_waist: "📏 LOG WAISTLINE",
    slimmed_by: "Slimmed by {cm} cm 🎉",
    waist_changed: "Changed {cm} cm",
    total_progress: "Total Progress:",
    battle_log_title: "BATTLE LOG ({count} VICTORIES)",
    no_victories_logged: "No battle victories logged yet! Start your first battle in the War Room today!",
    mins_unit: "mins",
    medal_awarded_badge: "+1 🏅 MEDAL",
    extra_burn_badge: "EXTRA BURN ⚡",
    remove_log_btn: "Delete test record and revoke medal",
    remove_log_confirm: "Remove this workout record? 1 medal will be deducted from your treasury.",

    // Waist Modal
    waist_modal_title: "📏 LOG NAVEL WAISTLINE",
    waist_modal_desc: "Track real belly fat loss! Measure across your navel at morning for best accuracy.",
    waist_input_label: "Navel Waistline (cm):",
    waist_date_label: "Measurement Date:",
    waist_cancel: "Cancel",
    waist_save: "💾 SAVE MEASUREMENT",

    // Settings
    settings_title: "PREFERENCES & DATA BACKUP",
    lang_setting_title: "Display Language / 顯示語言",
    sound_setting_title: "Workout Sound Effects",
    sound_setting_desc: "Countdown 3-2-1 beeps, whistle start, and rest chimes",
    btn_sound_enabled: "🔊 ENABLED",
    btn_sound_muted: "🔇 MUTED",
    grace_rule_title: "Every-Other-Day Grace Rule (48h Window)",
    grace_rule_desc: "Tailored for working out every 1-2 days. As long as your last battle was within 48 hours (yesterday or today), your streak flame stays ablaze—rest days are completely guilt-free!",
    backup_title: "Local Data Backup",
    btn_export_json: "📥 EXPORT BACKUP JSON",
    btn_restore_json: "📤 RESTORE BACKUP",
    backup_note: "All workout logs, medals, and waistline measurements are saved privately on your device. 100% offline-first and free forever.",

    // Toasts
    toast_sound_enabled: "Sound Enabled 🔊",
    toast_sound_muted: "Muted 🔇",
    toast_lang_switched: "Language switched to English! 🇺🇸",
    toast_redeemed: "🎉 Redeemed: {title}!",
    toast_default_restored: "✨ Restored original default rewards!",
    toast_backup_exported: "📥 Backup file exported successfully!",
    toast_backup_restored: "✅ Backup restored successfully!",
    toast_record_removed: "🗑️ Record removed and 1 medal deducted",
    toast_waist_saved: "📏 Waistline record saved: {val} cm",

    // Routines Translations
    routine_home_blitz_title: "Home Core Blitz",
    routine_home_blitz_sub: "8-Min Deep Core Burn",
    routine_home_blitz_summary: "Targets deep transversus abdominis & stubborn belly fat. Zero back strain, floor-ready.",
    
    routine_outdoor_raid_title: "Outdoor Cardio Raid",
    routine_outdoor_raid_sub: "25-Min HIIT Jog / Walk Interval",
    routine_outdoor_raid_summary: "Combines steady brisk walking with high-intensity jogging surges. Ignites maximum post-workout calorie afterburn.",

    routine_quick_save_title: "Emergency 3-Min Save",
    routine_quick_save_sub: "3-Min Ultra Express Core",
    routine_quick_save_summary: "Busy day? 3 compact high-efficiency moves to protect your streak flame and keep metabolic momentum alive."
  },

  zh: {
    // Header & Brand
    app_title: "The War of FlatBelly",
    war_for_fitness: "腹仇者作戰",
    streak_tooltip: "兩天一練寬限法則：每 1-2 天運動一次即可維持連續燃燒天數！",
    toggle_audio: "切換音效開關",

    // Navigation
    nav_battle: "作戰主廳",
    nav_rewards: "戰利犒賞",
    nav_logbook: "戰報紀錄",
    nav_settings: "系統設定",

    // War Room Choices
    choice_home: "居家核心閃電戰",
    choice_outdoor: "戶外有氧突襲",
    choice_emergency: "緊急 3 分鐘保命救贖",

    // Workout HUD
    workout_in_progress: "作戰進行中",
    movement_counter: "動作第 {current} / {total} 動",
    surrender_btn: "放棄作戰",
    surrender_confirm: "確定要提前放棄本次作戰嗎？未完成的進度將不會計入獎牌與戰報。",
    paused_badge: "已暫停",
    work_status: "⚡ 動作執行：全力燃燒核心",
    rest_status: "🍃 深呼吸調節：放鬆調勻心率",
    seconds_label: "秒",
    target_label: "鍛鍊部位：",
    tips_label: "動作要領：",
    up_next: "下一個動作：",
    btn_pause: "⏸️ 暫停作戰",
    btn_resume: "▶️ 繼續作戰",
    btn_skip: "跳過動作 >>",

    // Victory Modal
    victory_won: "大獲全勝！腹仇戰役告捷",
    victory_fat_eradicated: "頑固脂肪退散！今日戰鬥獎牌已存入國庫！",
    victory_extra_burn: "額外加練完成！持續燃燒深層腹部脂肪！",
    victory_medal_plus_one: "+1 腹仇者作戰獎牌！",
    victory_medal_secured: "今日獎牌已達標入庫",
    victory_current_treasury: "當前國庫存量：{balance} 🏅",
    victory_visit_spoils: "🎁 前往戰利犒賞區",
    victory_close: "返回作戰主廳",

    // Spoils Armory
    treasury_title: "獎牌國庫 · 榮耀積蓄",
    medals_label: "戰鬥獎牌",
    all_time_earned: "歷史累計獲得：",
    sweat_currency: "每一滴汗水，都是換取快樂的硬通貨！",
    wishlist_title: "願望清單犒賞",
    wishlist_subtitle: "累積運動獎牌，兌換喜悅犒賞享受",
    btn_reset: "↺ 重設預設",
    btn_new: "➕ 新增願望",
    card_cost: "兌換消耗：",
    card_redeemed: "已兌換：",
    need_more_medals: "尚需 {n} 枚 🏅 ({pct}%)",
    ready_to_claim: "✨ 獎牌已達標，隨時可兌換！",
    btn_redeem_now: "🎉 立即兌換",
    btn_need_medals: "🔒 尚需 {n} 🏅",
    redeemed_history_title: "已兌換歷史紀錄",
    no_rewards_redeemed: "尚未兌換過任何犒賞。完成訓練賺取獎牌，好好犒勞自己吧！",

    // Reward Modal
    modal_edit_title: "✏️ 編輯願望犒賞",
    modal_add_title: "➕ 新增願望犒賞",
    modal_select_icon: "選擇圖示圖章：",
    modal_reward_name: "獎勵名稱 / 犒賞內容：",
    modal_reward_placeholder: "例如：珍珠奶茶、電影夜、SPA 按摩、放空半天",
    modal_required_medals: "所需獎牌數 (🏅)：",
    modal_cancel: "取消",
    modal_save: "💾 儲存變更",
    modal_add_btn: "➕ 新增犒賞",

    // Logbook
    belly_transformation: "肚肚逆襲紀錄 · 肚臍圍量測",
    no_waist_records: "尚未記錄過腰圍",
    btn_log_waist: "📏 測量記錄腰圍",
    slimmed_by: "已縮減 {cm} cm 🎉",
    waist_changed: "變化 {cm} cm",
    total_progress: "累計成果：",
    battle_log_title: "作戰戰報 ({count} 場勝利)",
    no_victories_logged: "尚無作戰紀錄！前往作戰主廳挑選任務，開啟您的減脂傳奇！",
    mins_unit: "分鐘",
    medal_awarded_badge: "+1 🏅 戰鬥獎牌",
    extra_burn_badge: "加練燃脂 ⚡",
    remove_log_btn: "刪除紀錄並扣除獎牌",
    remove_log_confirm: "確定要移除這筆作戰紀錄嗎？系統將從國庫扣除 1 枚獎牌。",

    // Waist Modal
    waist_modal_title: "📏 測量記錄肚臍腰圍",
    waist_modal_desc: "記錄最真實的腹部減脂成果！建議於清晨空腹、經由肚臍水平位置測量，數據最為精準客觀。",
    waist_input_label: "肚臍腰圍（公分 cm）：",
    waist_date_label: "測量日期：",
    waist_cancel: "取消",
    waist_save: "💾 儲存測量數據",

    // Settings
    settings_title: "個人偏好與資料備份",
    lang_setting_title: "Display Language / 顯示語言",
    sound_setting_title: "鍛鍊計時音效",
    sound_setting_desc: "倒數 3-2-1 逼逼聲、開始高音哨音與休息溫和提示音",
    btn_sound_enabled: "🔊 音效開啟",
    btn_sound_muted: "🔇 靜音模式",
    grace_rule_title: "兩天一練寬限法則 (48 小時週期)",
    grace_rule_desc: "專為每 1-2 天鍛鍊一次貼心設計。只要前一次作戰在 48 小時內（昨天或今天），連擊火苗就不會熄滅——休息日零罪惡感！",
    backup_title: "本機資料備份與還原",
    btn_export_json: "📥 匯出備份 JSON",
    btn_restore_json: "📤 匯入還原備份",
    backup_note: "所有訓練紀錄、獎牌與腰圍數據皆私密儲存於您的本機裝置中。100% 離線優先，永久免費。",

    // Toasts
    toast_sound_enabled: "鍛鍊音效已開啟 🔊",
    toast_sound_muted: "鍛鍊音效已靜音 🔇",
    toast_lang_switched: "語言已切換為繁體中文！ 🇹🇼",
    toast_redeemed: "🎉 恭喜兌換：{title}！好好享受！",
    toast_default_restored: "✨ 已恢復預設願望清單！",
    toast_backup_exported: "📥 備份檔案已成功匯出下載！",
    toast_backup_restored: "✅ 備份資料已成功還原入庫！",
    toast_record_removed: "🗑️ 紀錄已移除，並扣除 1 枚獎牌",
    toast_waist_saved: "📏 腰圍數據已儲存：{val} cm",

    // Routines Translations
    routine_home_blitz_title: "居家核心閃電戰",
    routine_home_blitz_sub: "8分鐘深層核心燃脂",
    routine_home_blitz_summary: "精準鍛鍊深層腹橫肌與下腹頑固脂肪，保護下背零負擔，鋪墊即練。",

    routine_outdoor_raid_title: "戶外有氧突襲",
    routine_outdoor_raid_sub: "25分鐘間歇快走慢跑",
    routine_outdoor_raid_summary: "結合穩態快走與高強度慢跑衝刺，啟動運動後過量氧耗（EPOC）後燃效應。",

    routine_quick_save_title: "緊急 3 分鐘保命救贖",
    routine_quick_save_sub: "3分鐘極速核心保火苗",
    routine_quick_save_summary: "今天太忙？3個超高效率動作守護您的連續鍛鍊火苗，維持代謝動能不中斷！"
  }
};

// Step Translation mapping
export const STEP_TRANSLATIONS = {
  zh: {
    "Dead Bug": {
      title: "死蟲式核心啟動",
      target: "深層腹橫肌與核心穩定",
      tips: "下背務必緊貼地面不留縫隙！對側手腳緩慢下放，吐氣收緊腹部。"
    },
    "Mountain Climbers": {
      title: "登山者快速跑",
      target: "全身燃脂與下腹部收緊",
      tips: "臀部保持低位不要翹起，膝蓋有節奏地朝胸口快速交替提拉！"
    },
    "Russian Twists": {
      title: "俄羅斯轉體",
      target: "腹內外斜肌（人魚線與側腰）",
      tips: "上身後傾45度保持平衡，肋骨帶動肩膀左右轉動，感受側腹緊繃收縮。"
    },
    "Bicycle Crunches": {
      title: "空中腳踏車捲腹",
      target: "腹直肌與旋轉核心群",
      tips: "用肩胛骨帶動旋轉，雙手放耳旁切勿硬拉頸部！感受腹部扭轉發力。"
    },
    "Plank Hold": {
      title: "經典棒式核心支撐",
      target: "腹壁收緊與核心肌耐力",
      tips: "手肘垂直位於肩膀下方，夾緊臀部，肚臍往脊椎方向主動內收提緊！"
    },
    "Breathe & Recover": {
      title: "深呼吸調節放鬆",
      tips: "鼻子吸氣胸腹展開，嘴巴緩慢吐氣，調節心率準備下個動作。"
    },
    "Hydrate & Catch Breath": {
      title: "小口補水與呼吸調節",
      tips: "小口抿水，放鬆肩膀，保持微幅走動不要立刻坐下。"
    },
    "Brisk Walking Warm-Up": {
      title: "戶外快走熱身",
      target: "全身血液循環與關節喚醒",
      tips: "抬頭挺胸，雙臂自然前後擺動，步幅平穩加快！"
    },
    "Brisk Walk Recovery": {
      title: "快走調節心率",
      target: "有氧心肺與乳酸代謝",
      tips: "深長呼吸，保持大步快走節奏，讓心率平穩回落。"
    },
    "Jogging Surge #1": {
      title: "慢跑燃脂衝刺 #1",
      target: "心肺強化與卡路里大量燃燒",
      tips: "前腳掌輕盈著地，步頻維持每分鐘 165-175 步，均勻呼吸。"
    },
    "Jogging Surge #2": {
      title: "慢跑燃脂衝刺 #2",
      target: "乳酸閾值刺激與後燃效應",
      tips: "維持穩定速度不要突然減速，注意擺臂帶動身體前進！"
    },
    "Jogging Surge #3": {
      title: "慢跑終極加速 #3",
      target: "心肺極限挑戰與頑固脂肪突破",
      tips: "最後一輪跑步衝刺！專注前方，維持核心穩定，堅持到底！"
    },
    "Cool Down Stroll & Deep Breathing": {
      title: "緩和漫步與拉伸深呼吸",
      target: "心率恢復與肌肉放鬆",
      tips: "放慢腳步，做幾次深長均勻的呼吸，讓身體平靜下來。"
    },
    "Standing High Knees March": {
      title: "原地站姿高抬腿",
      target: "快速拉升心率與下腹啟動",
      tips: "站立挺直，膝蓋抬至髖關節高度，核心主動收縮，雙臂自然協同！"
    },
    "Standing Cross Crunches": {
      title: "站姿對角肘碰膝捲腹",
      target: "腹直肌與側腰斜肌",
      tips: "單腳站穩，對側手肘向提起的膝蓋收攏碰觸，頂峰感受腹肌緊收！"
    },
    "Rapid High Knees Finish": {
      title: "快速高抬腿終極燃脂",
      target: "燃脂爆發與核心全速衝刺",
      tips: "最後衝刺！在原地快速交替提膝，把剩餘體能完全釋放！"
    }
  }
};

export function getTranslation(lang, key, params = {}) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  let text = dict[key] || TRANSLATIONS.en[key] || key;
  Object.keys(params).forEach(p => {
    text = text.replace(new RegExp(`\\{${p}\\}`, "g"), params[p]);
  });
  return text;
}
