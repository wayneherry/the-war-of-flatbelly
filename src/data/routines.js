// The War of FlatBelly - Scientific Core & Cardio Routines (English)
export const ROUTINES = [
  {
    id: "home_blitz",
    title: "Home Core Blitz",
    subtitle: "8-Min Deep Core Burn",
    badge: "8 MIN BURN",
    durationMinutes: 8,
    category: "home",
    icon: "🏠",
    summary: "Targets deep transversus abdominis & stubborn belly fat. Zero back strain, floor-ready.",
    steps: [
      {
        id: "step_1",
        title: "Dead Bug",
        duration: 30,
        type: "work",
        target: "Deep Transversus Abdominis",
        tips: "Glue lower back flat against floor! Slowly lower opposite arm and leg, exhaling to brace core.",
        illustration: "🪲"
      },
      { id: "rest_1", title: "Breathe & Recover", duration: 15, type: "rest" },
      {
        id: "step_2",
        title: "Mountain Climbers",
        duration: 30,
        type: "work",
        target: "Full Body Burn & Lower Abs",
        tips: "Keep hips low, drive knees rapidly toward chest at a rhythmic, controlled tempo!",
        illustration: "🧗"
      },
      { id: "rest_2", title: "Breathe & Recover", duration: 15, type: "rest" },
      {
        id: "step_3",
        title: "Russian Twists",
        duration: 30,
        type: "work",
        target: "Internal & External Obliques",
        tips: "Lean torso back 45 degrees, rotate ribs from side to side while squeezing obliques.",
        illustration: "🌪️"
      },
      { id: "rest_3", title: "Hydrate & Catch Breath", duration: 15, type: "rest" },
      {
        id: "step_4",
        title: "Bicycle Crunches",
        duration: 30,
        type: "work",
        target: "Rectus Abdominis & Rotational Core",
        tips: "Lead with your shoulder blade, never pull on your neck! Feel the rotational squeeze.",
        illustration: "🚴"
      },
      { id: "rest_4", title: "Breathe & Recover", duration: 15, type: "rest" },
      {
        id: "step_5",
        title: "Plank Hold",
        duration: 35,
        type: "work",
        target: "Core Wall Tightening & Endurance",
        tips: "Elbows under shoulders, squeeze glutes, pull belly button straight to spine!",
        illustration: "🧱"
      },
      { id: "rest_5", title: "Halftime Break (20s)", duration: 20, type: "rest" },
      // Round 2
      {
        id: "step_6",
        title: "Dead Bug (Round 2)",
        duration: 30,
        type: "work",
        target: "Deep Transversus Abdominis",
        tips: "Slow it down—slower means more fire! Lower back firmly sealed to floor.",
        illustration: "🪲"
      },
      { id: "rest_6", title: "Breathe & Recover", duration: 15, type: "rest" },
      {
        id: "step_7",
        title: "Mountain Climbers (Final Push)",
        duration: 30,
        type: "work",
        target: "Cardio Fat Melt",
        tips: "Sprint pace! Keep core stable, feel heart rate surge and core ignite!",
        illustration: "🧗"
      },
      { id: "rest_7", title: "Prepare for Finisher", duration: 15, type: "rest" },
      {
        id: "step_8",
        title: "Plank Finisher",
        duration: 40,
        type: "work",
        target: "Final Core Lockdown",
        tips: "Hold strong for the final 40s! Imagine your waist cinched by an invisible belt!",
        illustration: "🧱"
      }
    ]
  },
  {
    id: "outdoor_raid",
    title: "Outdoor Cardio Raid",
    subtitle: "9-Min Fat Annihilator",
    badge: "9 MIN CARDIO",
    durationMinutes: 9,
    category: "outdoor",
    icon: "🏃",
    summary: "Jump rope intervals or outdoor run. High-output calorie surge to eliminate belly fat.",
    steps: [
      {
        id: "step_c1",
        title: "Interval 1: High Jump Rope / Sprint",
        duration: 60,
        type: "work",
        target: "Heart Rate Surge & Full-Body Calorie Deficit",
        tips: "Bounce lightly on the balls of your feet, keep core braced and posture tall.",
        illustration: "⚡"
      },
      { id: "rest_c1", title: "Walk & Catch Breath", duration: 30, type: "rest" },
      {
        id: "step_c2",
        title: "Interval 2: Cadence Skips / Fast Jog",
        duration: 60,
        type: "work",
        target: "Sustained Metabolic Burn",
        tips: "Turn rope from wrists close to body, keep breathing two in, two out.",
        illustration: "⚡"
      },
      { id: "rest_c2", title: "Deep Belly Breathing", duration: 30, type: "rest" },
      {
        id: "step_c3",
        title: "Interval 3: Deep Cardio Surge",
        duration: 60,
        type: "work",
        target: "Visceral Fat Oxidation",
        tips: "Halfway through! Lock in your rhythm, chest open, look straight ahead.",
        illustration: "⚡"
      },
      { id: "rest_c3", title: "Sip Water & Reset", duration: 30, type: "rest" },
      {
        id: "step_c4",
        title: "Interval 4: Power Cadence",
        duration: 60,
        type: "work",
        target: "Endurance & Calorie Deficit",
        tips: "Focus on crisp footwork. Maintain intensity without slowing down!",
        illustration: "⚡"
      },
      { id: "rest_c4", title: "Final Recovery", duration: 30, type: "rest" },
      {
        id: "step_c5",
        title: "Interval 5: All-Out Sprint Finish",
        duration: 60,
        type: "work",
        target: "Maximum Afterburn (EPOC)",
        tips: "Final set! Empty the tank and sprint for glory—victory is seconds away!",
        illustration: "🔥"
      }
    ]
  },
  {
    id: "emergency_save",
    title: "Emergency 3-Min Save",
    subtitle: "Bed & Couch Rescue",
    badge: "LAZY RESCUE",
    durationMinutes: 3,
    category: "lazy",
    icon: "🛟",
    summary: "Built for days when you feel exhausted. Bed-friendly, saves your streak and medal in 3 minutes.",
    steps: [
      {
        id: "step_l1",
        title: "Pelvic Tilt & Bed Hollow",
        duration: 45,
        type: "work",
        target: "Pelvic Tilt Correction & Core Draw-in",
        tips: "Lie on back with knees bent. Inhale deep, exhale fully and press lower back hard into bed for 5s.",
        illustration: "🛌"
      },
      { id: "rest_l1", title: "Relax & Breathe", duration: 15, type: "rest" },
      {
        id: "step_l2",
        title: "Supine Knee Tucks",
        duration: 45,
        type: "work",
        target: "Lower Belly Activation & Lumbar Relief",
        tips: "Gently hug knees toward chest with lower abdominal contraction, breathing smoothly.",
        illustration: "🧘"
      },
      { id: "rest_l2", title: "Deep Exhale", duration: 15, type: "rest" },
      {
        id: "step_l3",
        title: "Stomach Vacuum Breathing",
        duration: 45,
        type: "work",
        target: "Waistline Slimming Deep Squeeze",
        tips: "Exhale every bit of air out of your lungs, then draw your belly button up and under ribs. Hold 8-10s!",
        illustration: "🌬️"
      }
    ]
  }
];
