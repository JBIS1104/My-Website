export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

// Full pool of 25 questions — 10 random ones shown per game
const allQuestions: QuizQuestion[] = [
  // Military
  {
    question: "Which branch of the military did Junbyung serve in?",
    options: ["Korean Army", "Korean Navy", "Korean Air Force", "Korean Marines"],
    correctIndex: 2,
  },
  {
    question: "Which aircraft program did he support?",
    options: ["F-16 Fighting Falcon", "F-35 Lightning II", "F-22 Raptor", "KF-21 Boramae"],
    correctIndex: 1,
  },
  {
    question: "What reliability improvement did he achieve at the 17th Fighter Wing?",
    options: ["+5%", "+10%", "+17%", "+25%"],
    correctIndex: 2,
  },
  {
    question: "What welding skill did Junbyung teach himself in the military?",
    options: ["MIG welding", "TIG welding", "Copper welding", "Spot welding"],
    correctIndex: 2,
  },
  // Monitor Arm
  {
    question: "How does the monitor arm track your position?",
    options: ["LiDAR sensor", "Ultrasonic sensor", "Head tracking with OpenCV", "Manual joystick"],
    correctIndex: 2,
  },
  {
    question: "Which hardware runs the monitor arm's vision system?",
    options: ["Arduino Mega", "Raspberry Pi 5", "Jetson Nano", "ESP32"],
    correctIndex: 1,
  },
  {
    question: "What joint configuration does the monitor arm use?",
    options: ["RRR only", "RPR (Revolute-Prismatic-Revolute)", "PPP", "Spherical"],
    correctIndex: 1,
  },
  {
    question: "At what frequency does the monitor arm's PWM servo run?",
    options: ["50Hz", "100Hz", "400Hz", "1000Hz"],
    correctIndex: 2,
  },
  // Multi-Robot Research
  {
    question: "Which collision avoidance algorithm performed best in his research?",
    options: ["APF", "ORCA", "CBF", "DAF"],
    correctIndex: 3,
  },
  {
    question: "What does DAF stand for?",
    options: ["Direct Avoidance Function", "Dissipative Avoidance Feedback", "Dynamic Angle Formation", "Differential Approach Filter"],
    correctIndex: 1,
  },
  {
    question: "How many papers did Junbyung review for his multi-robot research?",
    options: ["5+", "10+", "20+", "50+"],
    correctIndex: 2,
  },
  // Line Following Buggy
  {
    question: "How many IR sensors does the line-following buggy have?",
    options: ["3", "4", "6", "8"],
    correctIndex: 2,
  },
  {
    question: "What microcontroller runs the line-following buggy?",
    options: ["Arduino Uno", "STM32F401RE", "ESP32", "Raspberry Pi Pico"],
    correctIndex: 1,
  },
  {
    question: "What control method does the buggy use to follow the line?",
    options: ["Bang-bang control", "Fuzzy logic", "PID control", "Neural network"],
    correctIndex: 2,
  },
  // Combat Robot
  {
    question: "What is his combat robot called?",
    options: ["Wedge Master", "Space Ship", "Iron Fist", "Blade Runner"],
    correctIndex: 1,
  },
  {
    question: "What is the combat robot's weight class?",
    options: ["50g", "100g", "150g", "500g"],
    correctIndex: 2,
  },
  {
    question: "What CAD software was the combat robot designed in?",
    options: ["SolidWorks", "Fusion 360", "AutoCAD", "Creo"],
    correctIndex: 2,
  },
  // Hackathon 2025
  {
    question: "What camera did the team have to use at the 2025 Hackathon?",
    options: ["Webcam", "Raspberry Pi Camera", "iPad camera via MJPEG", "USB endoscope"],
    correctIndex: 2,
  },
  {
    question: "What did the AI Camera System at the 2025 Hackathon detect?",
    options: ["Facial emotions", "Student attendance and attentiveness", "Object defects", "Hand gestures"],
    correctIndex: 1,
  },
  // GridBox / Hackathon 2026
  {
    question: "How does GridBox detect the weight of objects on the conveyor?",
    options: ["Load cell sensor", "Computer vision", "Motor current analysis", "Ultrasonic distance"],
    correctIndex: 2,
  },
  {
    question: "What wireless protocol does GridBox use between the two Picos?",
    options: ["Bluetooth", "WiFi", "nRF24L01+", "LoRa"],
    correctIndex: 2,
  },
  {
    question: "How much energy reduction did GridBox achieve through adaptive routing?",
    options: ["15%", "30%", "49%", "72%"],
    correctIndex: 2,
  },
  // Personal
  {
    question: "How many languages does Junbyung speak?",
    options: ["2", "3", "4", "5"],
    correctIndex: 2,
  },
  {
    question: "Where did Junbyung do his A-Levels?",
    options: ["Seoul, South Korea", "Manchester, UK", "Phuket, Thailand", "Tokyo, Japan"],
    correctIndex: 2,
  },
  {
    question: "What grade did Junbyung get for his A-Levels?",
    options: ["AAA", "A*A*AA", "A*A*A*A", "A*A*A*A*"],
    correctIndex: 2,
  },
];

// Shuffle and pick 10 random questions
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getRandomQuestions(count = 10): QuizQuestion[] {
  return shuffle(allQuestions).slice(0, count);
}

// Keep backward compat — but this is now random each call
export const quizQuestions = allQuestions;

export function getVerdict(score: number, total: number): { title: string; message: string } {
  const ratio = score / total;
  if (ratio >= 0.9) return { title: "You practically ARE Junbyung!", message: "Incredible! You know everything." };
  if (ratio >= 0.6) return { title: "Impressive!", message: "You know more about Junbyung than most people." };
  if (ratio >= 0.3) return { title: "Not bad!", message: "Not bad for a first visit — explore the site and try again!" };
  return { title: "Speed reader?", message: "Looks like you skimmed! Read through the projects and try again." };
}
