export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  xp: number;
  unlocked: boolean;
}

export const achievements: Achievement[] = [
  {
    id: 1,
    title: "First Login",
    description: "Login to CyberSecDev for the first time.",
    icon: "👋",
    color: "bg-cyan-500",
    xp: 10,
    unlocked: true,
  },
  {
    id: 2,
    title: "Course Starter",
    description: "Enroll in your first cybersecurity course.",
    icon: "📚",
    color: "bg-green-500",
    xp: 25,
    unlocked: true,
  },
  {
    id: 3,
    title: "Lesson Complete",
    description: "Complete your first lesson.",
    icon: "✅",
    color: "bg-blue-500",
    xp: 50,
    unlocked: true,
  },
  {
    id: 4,
    title: "Knowledge Hunter",
    description: "Complete 10 lessons.",
    icon: "🧠",
    color: "bg-purple-500",
    xp: 150,
    unlocked: false,
  },
  {
    id: 5,
    title: "Course Master",
    description: "Finish an entire course.",
    icon: "🎓",
    color: "bg-yellow-500",
    xp: 250,
    unlocked: false,
  },
  {
    id: 6,
    title: "Lab Explorer",
    description: "Complete your first security lab.",
    icon: "🧪",
    color: "bg-pink-500",
    xp: 100,
    unlocked: false,
  },
  {
    id: 7,
    title: "Bug Hunter",
    description: "Solve your first vulnerable machine.",
    icon: "🐞",
    color: "bg-red-500",
    xp: 200,
    unlocked: false,
  },
  {
    id: 8,
    title: "CTF Player",
    description: "Capture your first flag.",
    icon: "🚩",
    color: "bg-orange-500",
    xp: 200,
    unlocked: false,
  },
  {
    id: 9,
    title: "Quiz Master",
    description: "Score 100% in a quiz.",
    icon: "🏆",
    color: "bg-indigo-500",
    xp: 150,
    unlocked: false,
  },
  {
    id: 10,
    title: "Level 10",
    description: "Reach Level 10.",
    icon: "⭐",
    color: "bg-amber-500",
    xp: 500,
    unlocked: false,
  },
  {
    id: 11,
    title: "1000 XP",
    description: "Earn 1000 XP.",
    icon: "⚡",
    color: "bg-lime-500",
    xp: 1000,
    unlocked: false,
  },
  {
    id: 12,
    title: "Cyber Legend",
    description: "Unlock every achievement.",
    icon: "👑",
    color: "bg-emerald-500",
    xp: 5000,
    unlocked: false,
  },
];