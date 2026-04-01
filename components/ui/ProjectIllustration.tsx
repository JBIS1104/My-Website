"use client";

import { motion } from "motion/react";

const illustrations: Record<string, React.FC<{ className?: string }>> = {
  "multi-robot-control": ({ className }) => (
    <svg viewBox="0 0 400 300" className={className} fill="none">
      {/* Connection lines */}
      {[[200, 80, 120, 180], [200, 80, 280, 180], [120, 180, 280, 180], [120, 180, 200, 250], [280, 180, 200, 250]].map(([x1, y1, x2, y2], i) => (
        <motion.line
          key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.4 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
        />
      ))}
      {/* Robot nodes */}
      {[[200, 80], [120, 180], [280, 180], [200, 250], [160, 130]].map(([cx, cy], i) => (
        <motion.g key={i}>
          <motion.circle
            cx={cx} cy={cy} r="18"
            stroke="var(--color-accent)" strokeWidth="1.5" fill="none"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
          />
          <motion.circle
            cx={cx} cy={cy} r="5"
            fill="var(--color-accent)"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.7 + i * 0.1 }}
          />
          <motion.circle
            cx={cx} cy={cy} r="28"
            stroke="var(--color-accent)" strokeWidth="0.5" fill="none" opacity="0.2"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 + i * 0.1 }}
          />
        </motion.g>
      ))}
      {/* Labels */}
      <text x="200" y="30" textAnchor="middle" fill="var(--color-accent)" fontSize="9" fontFamily="monospace" opacity="0.5">CONSENSUS PROTOCOL</text>
    </svg>
  ),

  "monitor-arm": ({ className }) => (
    <svg viewBox="0 0 400 300" className={className} fill="none">
      {/* Base */}
      <motion.rect x="160" y="250" width="80" height="20" rx="4" stroke="var(--color-accent)" strokeWidth="1.5"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} />
      {/* Arm segment 1 */}
      <motion.line x1="200" y1="250" x2="200" y2="170" stroke="var(--color-accent)" strokeWidth="2"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} />
      {/* Joint 1 */}
      <motion.circle cx="200" cy="170" r="8" stroke="var(--color-accent)" strokeWidth="1.5" fill="var(--color-bg)"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.4 }} />
      {/* Arm segment 2 */}
      <motion.line x1="200" y1="170" x2="280" y2="110" stroke="var(--color-accent)" strokeWidth="2"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.5 }} />
      {/* Joint 2 */}
      <motion.circle cx="280" cy="110" r="8" stroke="var(--color-accent)" strokeWidth="1.5" fill="var(--color-bg)"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.7 }} />
      {/* Monitor */}
      <motion.rect x="250" y="50" width="100" height="65" rx="6" stroke="var(--color-accent)" strokeWidth="1.5"
        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.9 }} />
      {/* Screen */}
      <motion.rect x="258" y="58" width="84" height="42" rx="2" fill="var(--color-accent)" opacity="0.08"
        initial={{ opacity: 0 }} whileInView={{ opacity: 0.08 }} viewport={{ once: true }} transition={{ delay: 1.1 }} />
      {/* DOF labels */}
      <text x="200" y="290" textAnchor="middle" fill="var(--color-accent)" fontSize="9" fontFamily="monospace" opacity="0.5">RRR / RPR JOINTS</text>
      {/* Angle arc */}
      <motion.path d="M200,155 A15,15 0 0,1 210,148" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="2 2" opacity="0.4"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} />
    </svg>
  ),

  "line-following-buggy": ({ className }) => (
    <svg viewBox="0 0 400 300" className={className} fill="none">
      {/* Track line */}
      <motion.path
        d="M50,250 Q100,250 150,200 Q200,150 250,150 Q300,150 320,200 Q340,250 380,220"
        stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" opacity="0.3"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }}
      />
      {/* Buggy body */}
      <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }}>
        <rect x="140" y="135" width="35" height="25" rx="4" stroke="var(--color-accent)" strokeWidth="1.5" />
        <circle cx="148" cy="165" r="5" stroke="var(--color-accent)" strokeWidth="1" />
        <circle cx="168" cy="165" r="5" stroke="var(--color-accent)" strokeWidth="1" />
        {/* Sensor array */}
        {[0, 1, 2, 3, 4, 5].map((j) => (
          <motion.rect key={j} x={141 + j * 5} y="131" width="3" height="5" fill="var(--color-accent)" opacity="0.6"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: j * 0.15 }}
          />
        ))}
      </motion.g>
      {/* PID label */}
      <text x="200" y="30" textAnchor="middle" fill="var(--color-accent)" fontSize="9" fontFamily="monospace" opacity="0.5">PID CONTROL LOOP</text>
      {/* Error signal */}
      <motion.path d="M200,50 L200,80 Q210,90 200,100 Q190,110 200,120" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="3 3" opacity="0.3"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 }} />
    </svg>
  ),

  "rfl-robot": ({ className }) => (
    <svg viewBox="0 0 400 300" className={className} fill="none">
      {/* Arena circle */}
      <motion.circle cx="200" cy="150" r="120" stroke="var(--color-accent)" strokeWidth="1" opacity="0.2" strokeDasharray="4 4"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} />
      {/* Ground line */}
      <motion.line x1="80" y1="200" x2="320" y2="200" stroke="var(--color-accent)" strokeWidth="1" opacity="0.3"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} />
      {/* Wedge body - flat aggressive shape */}
      <motion.polygon points="140,200 260,200 280,185 120,185" stroke="var(--color-accent)" strokeWidth="2" fill="var(--color-accent)" fillOpacity="0.1"
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} />
      {/* Wedge front lip */}
      <motion.line x1="115" y1="188" x2="285" y2="188" stroke="var(--color-accent)" strokeWidth="2.5"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} />
      {/* Wheels */}
      <motion.circle cx="155" cy="195" r="8" stroke="var(--color-accent)" strokeWidth="1.5"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} />
      <motion.circle cx="245" cy="195" r="8" stroke="var(--color-accent)" strokeWidth="1.5"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.65 }} />
      {/* Motor blocks */}
      <motion.rect x="148" y="188" width="14" height="6" rx="1" fill="var(--color-accent)" opacity="0.4"
        initial={{ opacity: 0 }} whileInView={{ opacity: 0.4 }} viewport={{ once: true }} transition={{ delay: 0.7 }} />
      <motion.rect x="238" y="188" width="14" height="6" rx="1" fill="var(--color-accent)" opacity="0.4"
        initial={{ opacity: 0 }} whileInView={{ opacity: 0.4 }} viewport={{ once: true }} transition={{ delay: 0.75 }} />
      {/* CG marker */}
      <motion.text x="200" y="196" textAnchor="middle" fill="var(--color-accent)" fontSize="7" fontFamily="monospace" opacity="0.5"
        initial={{ opacity: 0 }} whileInView={{ opacity: 0.5 }} viewport={{ once: true }} transition={{ delay: 0.8 }}>CG</motion.text>
      {/* Ground clearance annotation */}
      <motion.line x1="290" y1="200" x2="290" y2="188" stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.4"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.9 }} />
      <motion.text x="305" y="196" fill="var(--color-accent)" fontSize="6" fontFamily="monospace" opacity="0.4"
        initial={{ opacity: 0 }} whileInView={{ opacity: 0.4 }} viewport={{ once: true }} transition={{ delay: 1 }}>~0mm</motion.text>
      {/* Name */}
      <motion.text x="200" y="168" textAnchor="middle" fill="var(--color-accent)" fontSize="10" fontFamily="monospace" opacity="0.3"
        initial={{ opacity: 0 }} whileInView={{ opacity: 0.3 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>SPACE SHIP</motion.text>
      <text x="200" y="260" textAnchor="middle" fill="var(--color-accent)" fontSize="9" fontFamily="monospace" opacity="0.5">150g ANTWEIGHT WEDGE</text>
    </svg>
  ),

  "ai-camera": ({ className }) => (
    <svg viewBox="0 0 400 300" className={className} fill="none">
      {/* Camera body */}
      <motion.rect x="130" y="80" width="140" height="100" rx="12" stroke="var(--color-accent)" strokeWidth="1.5"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} />
      {/* Lens */}
      <motion.circle cx="200" cy="130" r="30" stroke="var(--color-accent)" strokeWidth="1.5"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} />
      <motion.circle cx="200" cy="130" r="18" stroke="var(--color-accent)" strokeWidth="1" opacity="0.5"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} />
      <motion.circle cx="200" cy="130" r="6" fill="var(--color-accent)"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} />
      {/* AI scan lines */}
      {[0, 1, 2].map((i) => (
        <motion.line key={i} x1="130" y1={210 + i * 15} x2="270" y2={210 + i * 15}
          stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="6 3" opacity="0.3"
          initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 + i * 0.15 }} />
      ))}
      {/* Detection boxes */}
      <motion.rect x="155" y="215" width="30" height="30" rx="2" stroke="var(--color-accent)" strokeWidth="1" opacity="0.6" strokeDasharray="4 2"
        initial={{ opacity: 0 }} whileInView={{ opacity: 0.6 }} viewport={{ once: true }} transition={{ delay: 1 }} />
      <motion.rect x="215" y="218" width="25" height="25" rx="2" stroke="var(--color-accent)" strokeWidth="1" opacity="0.6" strokeDasharray="4 2"
        initial={{ opacity: 0 }} whileInView={{ opacity: 0.6 }} viewport={{ once: true }} transition={{ delay: 1.1 }} />
      {/* Flash */}
      <motion.circle cx="245" cy="90" r="5" fill="var(--color-accent)" opacity="0.3"
        animate={{ opacity: [0.1, 0.5, 0.1] }} transition={{ duration: 2, repeat: Infinity }} />
      <text x="200" y="280" textAnchor="middle" fill="var(--color-accent)" fontSize="9" fontFamily="monospace" opacity="0.5">COMPUTER VISION</text>
    </svg>
  ),

  "gridbox": ({ className }) => (
    <svg viewBox="0 0 400 300" className={className} fill="none">
      {/* Factory conveyor */}
      <motion.line x1="80" y1="180" x2="320" y2="180" stroke="var(--color-accent)" strokeWidth="2"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
      {/* Conveyor rollers */}
      {[100, 140, 180, 220, 260, 300].map((x, i) => (
        <motion.circle key={i} cx={x} cy="185" r="4" stroke="var(--color-accent)" strokeWidth="1" opacity="0.4"
          initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.08 }} />
      ))}
      {/* Pico A (factory controller) */}
      <motion.rect x="90" y="100" width="50" height="35" rx="4" stroke="var(--color-accent)" strokeWidth="1.5"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} />
      <motion.text x="115" y="122" textAnchor="middle" fill="var(--color-accent)" fontSize="8" fontFamily="monospace" opacity="0.6"
        initial={{ opacity: 0 }} whileInView={{ opacity: 0.6 }} viewport={{ once: true }} transition={{ delay: 0.7 }}>PICO A</motion.text>
      {/* Pico B (SCADA) */}
      <motion.rect x="260" y="100" width="50" height="35" rx="4" stroke="var(--color-accent)" strokeWidth="1.5"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} />
      <motion.text x="285" y="122" textAnchor="middle" fill="var(--color-accent)" fontSize="8" fontFamily="monospace" opacity="0.6"
        initial={{ opacity: 0 }} whileInView={{ opacity: 0.6 }} viewport={{ once: true }} transition={{ delay: 0.8 }}>PICO B</motion.text>
      {/* Wireless signal between Picos */}
      {[0, 1, 2].map((i) => (
        <motion.path key={i} d={`M155,115 Q200,${95 - i * 10} 245,115`} stroke="var(--color-accent)" strokeWidth="1" fill="none" opacity="0.3"
          strokeDasharray="3 3" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.9 + i * 0.15, duration: 0.5 }} />
      ))}
      <motion.text x="200" y="85" textAnchor="middle" fill="var(--color-accent)" fontSize="7" fontFamily="monospace" opacity="0.4"
        initial={{ opacity: 0 }} whileInView={{ opacity: 0.4 }} viewport={{ once: true }} transition={{ delay: 1.2 }}>nRF24 50Hz</motion.text>
      {/* Bottles on conveyor */}
      {[130, 200, 260].map((x, i) => (
        <motion.rect key={i} x={x - 6} y={165} width={12} height={15} rx={2} stroke="var(--color-accent)" strokeWidth="1" opacity="0.5"
          initial={{ y: 145, opacity: 0 }} whileInView={{ y: 165, opacity: 0.5 }} viewport={{ once: true }}
          transition={{ delay: 1.0 + i * 0.2 }} />
      ))}
      {/* Servo arm */}
      <motion.line x1="170" y1="160" x2="190" y2="140" stroke="var(--color-accent)" strokeWidth="1.5"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 1.3 }} />
      <motion.circle cx="190" cy="140" r="3" fill="var(--color-accent)" opacity="0.5"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.4 }} />
      {/* Energy indicator */}
      <motion.text x="200" y="220" textAnchor="middle" fill="var(--color-accent)" fontSize="8" fontFamily="monospace" opacity="0.4"
        initial={{ opacity: 0 }} whileInView={{ opacity: 0.4 }} viewport={{ once: true }} transition={{ delay: 1.5 }}>-49% ENERGY</motion.text>
      <text x="200" y="270" textAnchor="middle" fill="var(--color-accent)" fontSize="9" fontFamily="monospace" opacity="0.5">SMART FACTORY</text>
    </svg>
  ),
};

interface ProjectIllustrationProps {
  projectId: string;
  className?: string;
}

export function ProjectIllustration({ projectId, className = "" }: ProjectIllustrationProps) {
  const Illustration = illustrations[projectId];
  if (!Illustration) return null;
  return <Illustration className={className} />;
}
