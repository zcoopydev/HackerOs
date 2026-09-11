import React, { useState, useEffect, useRef } from 'react';
import { Code2, Terminal, ShieldCheck, RefreshCw, Copy, Check } from 'lucide-react';
import { terminalSound } from '../utils/terminalSound';

const CODE_PAYLOAD = `/*
 * NEXUS-OS QUANTUM ENCLAVE // KERNEL SECURITY BYPASS
 * Module: lib_neural_payload.c
 * Target: /sys/kernel/security/enclave_0x7F
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
/* END OF PAYLOAD STREAM // SYSTEM PENETRATED */
`;

export const ZDCode: React.FC = () => {
  const [displayedChars, setDisplayedChars] = useState<number>(0);
  const [accessGrantedCount, setAccessGrantedCount] = useState<number>(0);
  const [showAccessModal, setShowAccessModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const charsPerKeystroke = 5;

  // Auto-scroll as code types
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedChars]);

  // Listen to keyboard strokes
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // If user presses Escape, dismiss access granted modal
    if (e.key === 'Escape' && showAccessModal) {
      setShowAccessModal(false);
      return;
    }

    // Trigger access granted popup on Alt, Tab, or Enter if enough code has been typed
    if ((e.key === 'Enter' || e.key === 'Tab' || e.key === 'Alt') && displayedChars > 120) {
      e.preventDefault();
      terminalSound.playAccessGranted();
      setShowAccessModal(true);
      setAccessGrantedCount((prev) => prev + 1);
      return;
    }

    // Normal typing: advance code characters
    e.preventDefault();
    terminalSound.playTik();

    setDisplayedChars((prev) => {
      const next = prev + charsPerKeystroke;
      if (next >= CODE_PAYLOAD.length) {
        // Loop back with another block
        return CODE_PAYLOAD.length;
      }
      return next;
    });
  };

  const handleReset = () => {
    terminalSound.playTik();
    setDisplayedChars(0);
    setShowAccessModal(false);
  };

  const handleCopy = () => {
    terminalSound.playTik();
    navigator.clipboard.writeText(CODE_PAYLOAD.slice(0, displayedChars));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const currentCode = CODE_PAYLOAD.slice(0, displayedChars);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="w-full h-full flex flex-col justify-between text-xs font-mono select-none outline-none focus:ring-1 focus:ring-emerald-500/50 rounded p-1 relative"
    >
      {/* Top Banner & Instructions */}
      <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 text-[11px] text-emerald-600 shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold text-emerald-300">ZD CODE // HACKER TYPER</span>
          <span className="text-[10px] text-emerald-500">[PRESS ANY KEYS TO WRITE EXPLOIT]</span>
        </div>

        <div className="flex items-center gap-2">
          {displayedChars > 0 && (
            <button
              onClick={handleCopy}
              className="hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED' : 'COPY'}</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
            title="Reset code buffer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="flex-1 overflow-y-auto terminal-scroll py-3 whitespace-pre-wrap font-mono text-emerald-300 leading-relaxed text-xs">
        {displayedChars === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-emerald-600/80 space-y-2 select-none">
            <Terminal className="w-8 h-8 text-emerald-500 animate-pulse" />
            <div className="text-emerald-400 font-bold text-sm">
              CLICK HERE & TYPE RAPIDLY ON YOUR KEYBOARD
            </div>
            <div className="text-[11px] text-emerald-600 max-w-sm">
              Authentic Kernel C Exploit code will stream automatically. Press [Enter] or [Tab] for ACCESS GRANTED banner.
            </div>
          </div>
        ) : (
          <code>
            {currentCode}
            <span className="inline-block w-2 h-3.5 bg-emerald-400 ml-0.5 animate-pulse" />
          </code>
        )}
      </div>

      {/* Access Granted Cyber Modal Overlay */}
      {showAccessModal && (
        <div
          onClick={() => setShowAccessModal(false)}
          className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30 cursor-pointer animate-fade-in"
        >
          <div className="border-2 border-emerald-400 p-6 rounded-2xl bg-emerald-950/80 text-center space-y-3 shadow-[0_0_50px_rgba(0,255,102,0.6)]">
            <div className="w-16 h-16 rounded-full border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_#00ff66]">
              <ShieldCheck className="w-10 h-10 text-emerald-300 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-emerald-300 glow-text-green tracking-widest uppercase">
              ACCESS GRANTED
            </h2>
            <p className="text-xs text-emerald-400 font-mono tracking-wider">
              KERNEL ENCLAVE PENETRATION COMPLETE // LEVEL-0 OVERRIDE
            </p>
            <div className="text-[10px] text-emerald-600 border-t border-emerald-500/30 pt-2">
              EXPLOITS INJECTED: {accessGrantedCount} &bull; CLICK ANYWHERE OR PRESS ESC TO RESUME
            </div>
          </div>
        </div>
      )}

      {/* Bottom Status Bar */}
      <div className="border-t border-emerald-500/20 pt-1.5 flex items-center justify-between text-[10px] text-emerald-600 shrink-0">
        <span>STATUS: {displayedChars > 0 ? 'STREAMING ACTIVE' : 'AWAITING KEYSTROKES'}</span>
        <span>
          BYTES: {displayedChars} / {CODE_PAYLOAD.length}
        </span>
      </div>
    </div>
  );
};
