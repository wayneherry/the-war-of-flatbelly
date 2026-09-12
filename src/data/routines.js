// The War of FlatBelly - Scientific Core & Cardio Routines
export const ROUTINES = [
  {
    id: "home_blitz",
    title: "居家核心速燃戰",
    enTitle: "Home Core Blitz",
    badge: "8分鐘爆燃",
    durationMinutes: 8,
    category: "home",
    icon: "🏠",
    summary: "專攻深層腹橫肌與小腹脂肪，不傷腰椎、免器械地板秒練",
    steps: [
      {
        id: "step_1",
        title: "Dead Bug 死蟲式",
        duration: 30,
        type: "work",
        target: "深層腹橫肌 (收平小腹之王)",
        tips: "下背緊貼瑜珈墊不可懸空！對角手腳緩慢向下延展，吐氣收緊腹部。",
        illustration: "🪲"
      },
      { id: "rest_1", title: "深呼吸放鬆", duration: 15, type: "rest" },
      {
        id: "step_2",
        title: "Mountain Climbers 登山者式",
        duration: 30,
        type: "work",
        target: "全身高燃脂 + 下腹啟動",
        tips: "雙手撐地，臀部不要抬太高，膝蓋輪流朝胸口快速推擠，保持節奏！",
        illustration: "🧗"
      },
      { id: "rest_2", title: "緩和調息", duration: 15, type: "rest" },
      {
        id: "step_3",
        title: "Russian Twists 俄羅斯轉體",
        duration: 30,
        type: "work",
        target: "腹內外斜肌 (消滅腰間贅肉)",
        tips: "上身後傾45度保持平衡，雙手併攏帶動胸椎左右轉動，眼睛看著雙手。",
        illustration: "🌪️"
      },
      { id: "rest_3", title: "喝口水放鬆", duration: 15, type: "rest" },
      {
        id: "step_4",
        title: "Bicycle Crunches 空中自行車",
        duration: 30,
        type: "work",
        target: "腹直肌與側腹交替轟炸",
        tips: "用肩膀帶動對角膝蓋，不要用手死命拉扯脖子！感受腹部扭轉發力。",
        illustration: "🚴"
      },
      { id: "rest_4", title: "緩和調息", duration: 15, type: "rest" },
      {
        id: "step_5",
        title: "Plank Hold 棒式支撐",
        duration: 35,
        type: "work",
        target: "腹壁內收與全身核心耐力",
        tips: "手肘垂直於肩膀下方，夾緊臀部，肚臍用力往脊椎方向縮緊！",
        illustration: "🧱"
      },
      { id: "rest_5", title: "中場休息 20 秒", duration: 20, type: "rest" },
      // Round 2
      {
        id: "step_6",
        title: "Dead Bug 死蟲式 (第二輪)",
        duration: 30,
        type: "work",
        target: "深層腹橫肌",
        tips: "動作放慢，越慢肚子越有灼熱感！確保下背死死貼地。",
        illustration: "🪲"
      },
      { id: "rest_6", title: "深呼吸放鬆", duration: 15, type: "rest" },
      {
        id: "step_7",
        title: "Mountain Climbers 登山者式 (第二輪)",
        duration: 30,
        type: "work",
        target: "衝刺燃脂",
        tips: "最後衝刺！維持核心穩定，感受心跳加速與體溫飆升！",
        illustration: "🧗"
      },
      { id: "rest_7", title: "調息準備尾聲", duration: 15, type: "rest" },
      {
        id: "step_8",
        title: "Plank Finisher 棒式終極收尾",
        duration: 40,
        type: "work",
        target: "平肚最終封印",
        tips: "堅持最後40秒！想像肚子像被緊身腰帶緊緊束住！",
        illustration: "🧱"
      }
    ]
  },
  {
    id: "outdoor_raid",
    title: "戶外跳繩/跑步突擊",
    enTitle: "Outdoor Cardio Raid",
    badge: "9分鐘有氧",
    durationMinutes: 9,
    category: "outdoor",
    icon: "🏃",
    summary: "跳繩高燃脂 or 戶外間歇跑，全身性高功率瓦解腹部脂肪",
    steps: [
      {
        id: "step_c1",
        title: "第 1 組：跳繩衝刺 / 快跑",
        duration: 60,
        type: "work",
        target: "心肺拉升 + 全身燃脂",
        tips: "保持雙腳前腳掌輕盈彈跳（或快步跑），核心微收緊。",
        illustration: "⚡"
      },
      { id: "rest_c1", title: "慢走調整呼吸", duration: 30, type: "rest" },
      {
        id: "step_c2",
        title: "第 2 組：節奏跳繩 / 快跑",
        duration: 60,
        type: "work",
        target: "熱量高效消耗",
        tips: "手臂靠近身體兩側手腕發力，呼吸保持兩吸一呼。",
        illustration: "⚡"
      },
      { id: "rest_c2", title: "深呼吸放鬆", duration: 30, type: "rest" },
      {
        id: "step_c3",
        title: "第 3 組：深層心肺推進",
        duration: 60,
        type: "work",
        target: "加速內臟脂肪代謝",
        tips: "過半了！保持平穩步調，抬頭挺胸不駝背。",
        illustration: "⚡"
      },
      { id: "rest_c3", title: "喝口水補充", duration: 30, type: "rest" },
      {
        id: "step_c4",
        title: "第 4 組：高燃脂維持",
        duration: 60,
        type: "work",
        target: "持續燃燒",
        tips: "專注於腳步的節奏，不要中斷！",
        illustration: "⚡"
      },
      { id: "rest_c4", title: "調息最後準備", duration: 30, type: "rest" },
      {
        id: "step_c5",
        title: "第 5 組：全力衝刺終點",
        duration: 60,
        type: "work",
        target: "燃脂後燃效應 (EPOC)",
        tips: "最後一組！榨乾最後能量，今日戰役勝利就在眼前！",
        illustration: "🔥"
      }
    ]
  },
  {
    id: "emergency_save",
    title: "3分鐘躺平救贖戰",
    enTitle: "Emergency 3-Min Save",
    badge: "累癱救星",
    durationMinutes: 3,
    category: "lazy",
    icon: "🛟",
    summary: "專為極度不想動設計！床上或沙發就能做，3分鐘守護連勝與勳章",
    steps: [
      {
        id: "step_l1",
        title: "仰臥骨盆後傾貼床",
        duration: 45,
        type: "work",
        target: "骨盆前傾校正 + 腹橫肌收合",
        tips: "雙膝彎曲躺平，深吸一口氣，吐氣時用腹部力量將下背死死貼住床面保持5秒，再放鬆重複。",
        illustration: "🛌"
      },
      { id: "rest_l1", title: "平躺放鬆", duration: 15, type: "rest" },
      {
        id: "step_l2",
        title: "仰臥屈膝微抱胸",
        duration: 45,
        type: "work",
        target: "放鬆腰椎 + 下腹微縮",
        tips: "雙手輕扶雙膝往胸口帶，同時用下腹力量收縮，保持呼吸均勻。",
        illustration: "🧘"
      },
      { id: "rest_l2", title: "深長呼氣", duration: 15, type: "rest" },
      {
        id: "step_l3",
        title: "真空腹呼吸收腹 (Vacuum)",
        duration: 45,
        type: "work",
        target: "緊縮腰圍最神動作",
        tips: "把肺部空氣完全吐光，然後屏住呼吸，想像肚臍往內往上吸進肋骨裡，維持8-10秒！",
        illustration: "🌬️"
      }
    ]
  }
];
