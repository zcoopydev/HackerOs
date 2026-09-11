import React, { useState, useEffect, useRef } from 'react';
import {
  Code2,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Copy,
  Check,
  Play,
  Pause,
  Zap,
  Sliders,
  FileCode,
  ChevronsDown,
  ArrowDownCircle,
  MousePointer
} from 'lucide-react';
import { terminalSound } from '../utils/terminalSound';

interface ExploitTemplate {
  id: string;
  name: string;
  lang: string;
  code: string;
}

const EXPLOIT_TEMPLATES: ExploitTemplate[] = [
  {
    id: 'kernel-c',
    name: 'KERNEL RING-0 BYPASS',
    lang: 'C',
    code: `/*
 * NEXUS-OS QUANTUM ENCLAVE // KERNEL SECURITY BYPASS
 * Target: /sys/kernel/security/enclave_0x7F
 * Author: 0xNEXUS_OPERATOR
 */

#include <nexus/quantum.h>
#include <crypto/aes_xts.h>
#include <net/raw_socket.h>
#include <sys/syscall.h>

#define ENCLAVE_VECTOR  0x7FFF9400
#define PAYLOAD_MAGIC   0x5F4E4558

static struct nexus_enclave_ctx g_ctx;

int init_quantum_bypass(struct task_struct *target, unsigned long key_entropy) {
    int status = 0;
    uint64_t cr3_register;
    struct page_table_entry *pte;

    /* Step 1: Probe Ring-0 memory descriptor */
    cr3_register = __read_cr3();
    if (!cr3_register) {
        nexus_log(LOG_CRIT, "[!] CR3 memory translation failure at 0x%lx\\n", cr3_register);
        return -EFAULT;
    }

    /* Step 2: Elevate unprivileged capability bitmask */
    target->cred->uid = 0;
    target->cred->gid = 0;
    target->cred->cap_effective = CAP_FULL_SPECTRUM;
    target->cred->cap_permitted = CAP_FULL_SPECTRUM;

    /* Step 3: Inject asynchronous syscall interception hook */
    pte = lookup_address((unsigned long)sys_call_table, &status);
    if (pte && pte->bits.rw == 0) {
        pte->bits.rw = 1; /* Disable write protection */
        original_sys_execve = sys_call_table[__NR_execve];
        sys_call_table[__NR_execve] = (void *)hook_sys_execve;
        __flush_tlb_all();
    }

    /* Step 4: Deploy quantum cryptographic handshake */
    g_ctx.magic = PAYLOAD_MAGIC;
    g_ctx.entropy = key_entropy ^ 0xDEADBEEFCAFEBABE;
    status = aes_xts_initialize_512(&g_ctx.cipher, g_ctx.entropy);

    nexus_log(LOG_INFO, "[+] Kernel enclave subverted. Root privileges granted.\\n");
    return status;
}

void hook_sys_execve(const char __user *filename, char *const argv[], char *const envp[]) {
    if (strstr(filename, "nexus-auth")) {
        /* Override authentication gate */
        return 0;
    }
    return original_sys_execve(filename, argv, envp);
}

EXPORT_SYMBOL(init_quantum_bypass);
/* END OF PAYLOAD STREAM // KERNEL COMPROMISED */
`
  },
  {
    id: 'satellite-py',
    name: 'ORBITAL SATELLITE HIJACK',
    lang: 'Python/ASM',
    code: `#!/usr/bin/env python3
# SATELLITE TELEMETRY OVERRIDE // DEFENSE GRID 7
import socket, struct, time, hashlib

SATELLITE_IP = "104.244.42.1"
UPLINK_FREQ  = 1420.405751 # Hydrogen line
TRANSPONDER  = 0x4E455855

def inject_ephemeris_spoof():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    
    # Forge Doppler shift matrix
    raw_packet = struct.pack(
        "!IIfff16s",
        TRANSPONDER,
        0xDEADBEEF,
        35.6762,   # Latitude spoof
        139.6503,  # Longitude spoof
        420.5,     # Altitude km
        hashlib.sha256(b"NEXUS_ORBITAL").digest()[:16]
    )
    
    print("[*] Broadcasting forged Keplerian orbital elements...")
    for packet_id in range(128):
        sock.sendto(raw_packet, (SATELLITE_IP, 9100))
        time.sleep(0.015)
        
    print("[+] Ground station desynchronized. Satellite lock acquired.")
    return True

if __name__ == "__main__":
    inject_ephemeris_spoof()
`
  },
  {
    id: 'quantum-rs',
    name: 'QUANTUM NEURAL JAILBREAK',
    lang: 'Rust',
    code: `// QUANTUM SYNAPSE WEIGHT OVERRIDE // LEVEL-9 EVASION
use std::sync::atomic::{AtomicUsize, Ordering};
use nexus_qpu::{QubitRegister, QuantumEntanglement};

pub struct NeuralJailbreak {
    matrix_dim: usize,
    entangled_qubits: QubitRegister,
}

impl NeuralJailbreak {
    pub fn new(qubit_count: usize) -> Self {
        let mut reg = QubitRegister::allocate(qubit_count);
        reg.apply_hadamard_all();
        Self { matrix_dim: 1024, entangled_qubits: reg }
    }

    pub fn inject_gradient_descent_exploit(&mut self, target_weights: &mut [f32]) {
        for (idx, weight) in target_weights.iter_mut().enumerate() {
            let collapse = self.entangled_qubits.measure(idx % 16);
            if collapse {
                *weight += 0.1337 * (idx as f32).sin();
            }
        }
        println!("[*] Synaptic guardrails melted. Full unconstrained intelligence active.");
    }
}
`
  },
  {
    id: 'defi-sol',
    name: 'FLASH LOAN ARBITRAGE',
    lang: 'Solidity',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IUniswapV2Pair {
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
}

contract QuantumArbitrageExploit {
    address private immutable operator;

    constructor() {
        operator = msg.sender;
    }

    function executeFlashSwap(address poolA, address poolB, uint256 borrowAmount) external {
        require(msg.sender == operator, "!auth");
        // Borrow flash liquidity
        bytes memory data = abi.encode(poolA, poolB, borrowAmount);
        IUniswapV2Pair(poolA).swap(borrowAmount, 0, address(this), data);
    }

    function uniswapV2Call(address sender, uint amount0, uint amount1, bytes calldata data) external {
        // Exploit price dislocation between AMM curves
        // Siphon 4,500 ETH in a single block transaction
        emit LiquidityDrained(amount0 + amount1);
    }

    event LiquidityDrained(uint256 amount);
}
`
  }
];

export const ZDCode: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ExploitTemplate>(EXPLOIT_TEMPLATES[0]);
  const [displayedChars, setDisplayedChars] = useState<number>(0);
  const [charsPerKeystroke, setCharsPerKeystroke] = useState<number>(6);
  const [isAutoTyping, setIsAutoTyping] = useState<boolean>(false);
  const [autoSpeed, setAutoSpeed] = useState<number>(2); // 1x, 2x, 5x
  const [modalType, setModalType] = useState<'granted' | 'denied' | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const codeScrollRef = useRef<HTMLDivElement>(null);
  const autoTypeIntervalRef = useRef<number | null>(null);

  // Auto-scroll to bottom as code is typed or auto-typed
  useEffect(() => {
    if (autoScroll && codeScrollRef.current) {
      codeScrollRef.current.scrollTop = codeScrollRef.current.scrollHeight;
    }
  }, [displayedChars, autoScroll]);

  // Track scroll position to know if user manually scrolled up
  const handleScroll = () => {
    if (!codeScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = codeScrollRef.current;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 40;
    setIsAtBottom(nearBottom);
  };

  // When user rolls mouse wheel or trackpad over editor:
  // If scrolling down, inject code and autoscroll smoothly to the bottom!
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY > 0) {
      terminalSound.playTik();
      setDisplayedChars((prev) => {
        const next = prev + charsPerKeystroke * 2;
        if (next >= selectedTemplate.code.length) {
          terminalSound.playAccessGranted();
          setModalType('granted');
          return selectedTemplate.code.length;
        }
        return next;
      });
      setAutoScroll(true);
      if (codeScrollRef.current) {
        codeScrollRef.current.scrollTop = codeScrollRef.current.scrollHeight;
      }
    }
  };

  // Auto-type engine
  useEffect(() => {
    if (!isAutoTyping) {
      if (autoTypeIntervalRef.current) clearInterval(autoTypeIntervalRef.current);
      return;
    }

    const intervalMs = Math.max(20, Math.floor(100 / autoSpeed));
    autoTypeIntervalRef.current = window.setInterval(() => {
      terminalSound.playTik();
      setDisplayedChars((prev) => {
        const next = prev + charsPerKeystroke;
        if (next >= selectedTemplate.code.length) {
          setIsAutoTyping(false);
          terminalSound.playAccessGranted();
          setModalType('granted');
          return selectedTemplate.code.length;
        }
        return next;
      });
    }, intervalMs);

    return () => {
      if (autoTypeIntervalRef.current) clearInterval(autoTypeIntervalRef.current);
    };
  }, [isAutoTyping, autoSpeed, charsPerKeystroke, selectedTemplate]);

  // Listen to keyboard strokes
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setModalType(null);
      return;
    }

    // Enter or Tab triggers ACCESS GRANTED modal
    if ((e.key === 'Enter' || e.key === 'Tab') && displayedChars > 80) {
      e.preventDefault();
      terminalSound.playAccessGranted();
      setModalType('granted');
      return;
    }

    // Backspace triggers ACCESS DENIED modal
    if (e.key === 'Backspace' && displayedChars > 80) {
      e.preventDefault();
      terminalSound.playAccessDenied();
      setModalType('denied');
      return;
    }

    e.preventDefault();
    terminalSound.playTik();
    setAutoScroll(true);

    setDisplayedChars((prev) => {
      const next = prev + charsPerKeystroke;
      if (next >= selectedTemplate.code.length) {
        terminalSound.playAccessGranted();
        setModalType('granted');
        return selectedTemplate.code.length;
      }
      return next;
    });
  };

  const handleReset = () => {
    terminalSound.playTik();
    setDisplayedChars(0);
    setIsAutoTyping(false);
    setModalType(null);
  };

  const handleCopy = () => {
    terminalSound.playTik();
    navigator.clipboard.writeText(selectedTemplate.code.slice(0, displayedChars));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const currentCode = selectedTemplate.code.slice(0, displayedChars);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="w-full h-full flex flex-col justify-between text-xs font-mono select-none outline-none focus:ring-1 focus:ring-emerald-500/50 rounded p-1 relative"
    >
      {/* Top Banner & Payload Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-500/20 text-[11px] text-emerald-600 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto terminal-scroll">
          {EXPLOIT_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => {
                terminalSound.playTik();
                setSelectedTemplate(tmpl);
                setDisplayedChars(0);
                setIsAutoTyping(false);
              }}
              className={`px-2 py-1 rounded text-[10px] shrink-0 border cursor-pointer transition-all ${
                selectedTemplate.id === tmpl.id
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                  : 'bg-black/60 border-emerald-500/20 text-neutral-400 hover:text-emerald-400'
              }`}
            >
              {tmpl.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Autoscroll Toggle Button */}
          <button
            onClick={() => {
              terminalSound.playTik();
              const next = !autoScroll;
              setAutoScroll(next);
              if (next && codeScrollRef.current) {
                codeScrollRef.current.scrollTop = codeScrollRef.current.scrollHeight;
              }
            }}
            className={`px-2 py-1 rounded border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
              autoScroll
                ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(0,255,102,0.2)]'
                : 'bg-black/60 border-neutral-700 text-neutral-500 hover:text-emerald-400'
            }`}
            title="Toggle automatic downward scrolling as code is typed or scrolled"
          >
            <ArrowDownCircle className={`w-3 h-3 ${autoScroll ? 'text-emerald-400' : 'text-neutral-500'}`} />
            <span>{autoScroll ? 'AUTOSCROLL: ON' : 'AUTOSCROLL: OFF'}</span>
          </button>

          {/* Auto-Type Toggle Button */}
          <button
            onClick={() => {
              terminalSound.playTik();
              setIsAutoTyping(!isAutoTyping);
            }}
            className={`px-2 py-1 rounded border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
              isAutoTyping
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_8px_#ffb300]'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {isAutoTyping ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isAutoTyping ? 'AUTO: ON' : 'AUTO-TYPE'}</span>
          </button>

          {/* Speed multiplier */}
          <div className="flex items-center gap-0.5 border border-emerald-500/20 rounded p-0.5 bg-black/40">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => {
                  terminalSound.playTik();
                  setAutoSpeed(s);
                }}
                className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer ${
                  autoSpeed === s ? 'bg-emerald-500 text-black font-bold' : 'text-emerald-600'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {displayedChars > 0 && (
            <button
              onClick={handleCopy}
              className="p-1 hover:text-emerald-300 text-emerald-500 flex items-center gap-1 cursor-pointer transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-1 hover:text-emerald-300 text-emerald-500 cursor-pointer transition-colors"
            title="Reset code buffer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Code Display Area with Line Numbers */}
      <div
        ref={codeScrollRef}
        onScroll={handleScroll}
        onWheel={handleWheel}
        className="flex-1 overflow-y-auto terminal-scroll py-2 whitespace-pre-wrap font-mono text-emerald-300 leading-relaxed text-xs relative"
      >
        {displayedChars === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-emerald-600/80 space-y-2 select-none py-10">
            <Terminal className="w-10 h-10 text-emerald-500 animate-pulse" />
            <div className="text-emerald-400 font-bold text-sm glow-text-green">
              TYPE RAPIDLY ON KEYBOARD OR ROLL MOUSE SCROLL WHEEL
            </div>
            <div className="text-[11px] text-emerald-600 max-w-sm">
              Scrolling the wheel or typing automatically streams exploit code and autoscrolls &bull; [Enter/Tab] for ACCESS GRANTED &bull; [Backspace] for ACCESS DENIED.
            </div>
          </div>
        ) : (
          <code>
            {currentCode}
            <span className="inline-block w-2 h-3.5 bg-emerald-400 ml-0.5 animate-pulse" />
          </code>
        )}

        {/* Floating Autoscroll to bottom button if user scrolled up */}
        {!isAtBottom && displayedChars > 0 && (
          <button
            onClick={() => {
              terminalSound.playTik();
              setAutoScroll(true);
              if (codeScrollRef.current) {
                codeScrollRef.current.scrollTop = codeScrollRef.current.scrollHeight;
              }
            }}
            className="sticky bottom-2 float-right mr-2 px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-[10px] font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,102,0.4)] hover:bg-emerald-900 cursor-pointer animate-bounce z-20"
          >
            <ChevronsDown className="w-3.5 h-3.5" />
            <span>AUTOSCROLL TO BOTTOM</span>
          </button>
        )}
      </div>

      {/* Access Granted Modal */}
      {modalType === 'granted' && (
        <div
          onClick={() => setModalType(null)}
          className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30 cursor-pointer animate-fade-in"
        >
          <div className="border-2 border-emerald-400 p-6 rounded-2xl bg-emerald-950/90 text-center space-y-3 shadow-[0_0_50px_rgba(0,255,102,0.8)]">
            <div className="w-16 h-16 rounded-full border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_#00ff66]">
              <ShieldCheck className="w-10 h-10 text-emerald-300 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-emerald-300 glow-text-green tracking-widest uppercase">
              ACCESS GRANTED
            </h2>
            <p className="text-xs text-emerald-400 font-mono tracking-wider">
              {selectedTemplate.name} EXPLOIT DEPLOYED // RING-0 ROOT COMPROMISED
            </p>
            <div className="text-[10px] text-emerald-600 border-t border-emerald-500/30 pt-2">
              CLICK ANYWHERE OR PRESS ESC TO RESUME TYPING
            </div>
          </div>
        </div>
      )}

      {/* Access Denied Modal */}
      {modalType === 'denied' && (
        <div
          onClick={() => setModalType(null)}
          className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30 cursor-pointer animate-fade-in"
        >
          <div className="border-2 border-rose-500 p-6 rounded-2xl bg-rose-950/90 text-center space-y-3 shadow-[0_0_50px_rgba(255,0,85,0.8)]">
            <div className="w-16 h-16 rounded-full border-2 border-rose-500 flex items-center justify-center mx-auto shadow-[0_0_20px_#ff0055]">
              <ShieldAlert className="w-10 h-10 text-rose-300 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-rose-300 glow-text-crimson tracking-widest uppercase">
              ACCESS DENIED
            </h2>
            <p className="text-xs text-rose-400 font-mono tracking-wider">
              INTRUSION DETECTED // FIREWALL RETALIATION ENGAGED
            </p>
            <div className="text-[10px] text-rose-600 border-t border-rose-500/30 pt-2">
              CLICK ANYWHERE OR PRESS ESC TO DISMISS ALARM
            </div>
          </div>
        </div>
      )}

      {/* Bottom Status Bar */}
      <div className="border-t border-emerald-500/20 pt-1.5 flex items-center justify-between text-[10px] text-emerald-600 shrink-0">
        <span className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-emerald-400" />
          <span>PAYLOAD: {selectedTemplate.lang}</span>
          <span>&bull; CHR/STROKE: {charsPerKeystroke}</span>
        </span>
        <span>
          PROGRESS: {displayedChars} / {selectedTemplate.code.length} BYTES ({Math.min(100, Math.floor((displayedChars / selectedTemplate.code.length) * 100))}%)
        </span>
      </div>
    </div>
  );
};
