import React, { useState, useRef, useEffect } from 'react';
import { Terminal, CornerDownLeft } from 'lucide-react';
import { terminalSound } from '../utils/terminalSound';

interface CmdTerminalProps {
  username: string;
  onOpenApp: (appId: string) => void;
  onLockSystem: () => void;
  onRebootSystem: () => void;
  onChangeTheme: (theme: string) => void;
}

interface HistoryLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'banner' | 'ascii';
  text: string;
}

export const CmdTerminal: React.FC<CmdTerminalProps> = ({
  username,
  onOpenApp,
  onLockSystem,
  onRebootSystem,
  onChangeTheme
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryLine[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [commandArchive, setCommandArchive] = useState<string[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate ASCII Neofetch display
  const getNeofetchLines = (): HistoryLine[] => {
    const cores = navigator.hardwareConcurrency || 8;
    const ram = (navigator as unknown as { deviceMemory?: number }).deviceMemory
      ? `${(navigator as unknown as { deviceMemory?: number }).deviceMemory} GB`
      : '8.0 GB (Virtual)';
    const res = `${window.screen.width}x${window.screen.height}`;
    const userAgentPlatform = navigator.platform || 'x86_64';

    return [
      {
        id: 'fetch-1',
        type: 'ascii',
        text: `     .---.          ${username}@nexus-mainframe`
      },
      {
        id: 'fetch-2',
        type: 'ascii',
        text: `    /     \\         -----------------------`
      },
      {
        id: 'fetch-3',
        type: 'ascii',
        text: `   | () () |        OS: NEXUS // OS Quantum-Kernel v9.4 x86_64`
      },
      {
        id: 'fetch-4',
        type: 'ascii',
        text: `    \\  -  /         Host: Cyber Enclave Workstation (Terminal TTY1)`
      },
      {
        id: 'fetch-5',
        type: 'ascii',
        text: `   /       \\        Kernel: 9.4.2-quantum-smp`
      },
      {
        id: 'fetch-6',
        type: 'ascii',
        text: `  |  [NEX]  |       Uptime: 2 hours, 48 mins`
      },
      {
        id: 'fetch-7',
        type: 'ascii',
        text: `  |         |       Shell: nexus-sh 5.2.21`
      },
      {
        id: 'fetch-8',
        type: 'ascii',
        text: `   \\       /        Display: ${res}`
      },
      {
        id: 'fetch-9',
        type: 'ascii',
        text: `    \`-----\`         CPU: Quantum Hyper-Threaded [${cores} Cores]`
      },
      {
        id: 'fetch-10',
        type: 'ascii',
        text: `                    Memory: 3842MiB / ${ram}`
      },
      {
        id: 'fetch-11',
        type: 'ascii',
        text: `                    Platform: ${userAgentPlatform}`
      },
      {
        id: 'fetch-12',
        type: 'ascii',
        text: `                    Palettes: [███][███][███][███][███][███]`
      },
      {
        id: 'fetch-13',
        type: 'banner',
        text: `Welcome, Operator. Type 'help' for commands or click any desktop launcher.`
      }
    ];
  };

  // Launch with Neofetch on startup
  useEffect(() => {
    setHistory(getNeofetchLines());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const addLine = (text: string, type: 'input' | 'output' | 'error' | 'success' | 'banner' | 'ascii' = 'output') => {
    setHistory((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, text, type }]);
  };

  const handleCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    terminalSound.playTik();
    setCommandArchive((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    // Display user command in history
    addLine(`${username}@nexus:~# ${trimmed}`, 'input');
    setInput('');

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        addLine('--- NEXUS-OS COMMAND MATRIX ---', 'banner');
        addLine('neofetch / fetch : Print complete OS system specs & ASCII logo', 'output');
        addLine('zdcode           : Launch ZD Code (Hacker Typer exploit editor)', 'output');
        addLine('cracker          : Open Brute-Force Password Cracker Matrix', 'output');
        addLine('bomb             : Open DEFCON Warhead Detonator Console', 'output');
        addLine('miner            : Open Quantum Crypto Mining Hash Engine', 'output');
        addLine('files            : Open visual File Manager & Hex Previewer', 'output');
        addLine('globe            : Open 3D rotating neural globe radar', 'output');
        addLine('monitor          : Open live hardware telemetry dashboard', 'output');
        addLine('crypto           : Open Cryptographic Hash & Key Encoder', 'output');
        addLine('matrix           : Launch Matrix Digital Rain visualizer', 'output');
        addLine('notes            : Open encrypted local data scratchpad', 'output');
        addLine('settings         : Open system preferences & account purge', 'output');
        addLine('scan / nmap <ip> : Run advanced network reconnaissance scan', 'output');
        addLine('brute <user>     : Brute-force password attack against target', 'output');
        addLine('inject <target>  : Deploy SQLi / Buffer Overflow exploit payload', 'output');
        addLine('ddos <ip>        : Simulate SYN flood stress attack on gateway', 'output');
        addLine('ping <host>      : Ping remote neural server node', 'output');
        addLine('ls               : List files in current working directory', 'output');
        addLine('cat <filename>   : Display file content to stdout', 'output');
        addLine('calc <math>      : Evaluate arithmetic expression', 'output');
        addLine('theme <color>    : Switch CRT phosphor (emerald, cyan, amber, crimson)', 'output');
        addLine('lock             : Return to Lock Screen', 'output');
        addLine('reboot           : Restart the operating system', 'output');
        addLine('clear            : Clear screen buffer', 'output');
        break;

      case 'neofetch':
      case 'fetch':
        setHistory((prev) => [...prev, ...getNeofetchLines()]);
        break;

      case 'cracker':
      case 'bruteforce':
      case 'passcracker':
        addLine('Launching Password Cracker Matrix...', 'success');
        onOpenApp('cracker');
        break;

      case 'bomb':
      case 'warhead':
      case 'detonate':
        addLine('WARNING: Arming DEFCON Detonation System...', 'error');
        onOpenApp('bomb');
        break;

      case 'miner':
      case 'mining':
        addLine('Launching Quantum Crypto Mining Engine...', 'success');
        onOpenApp('miner');
        break;

      case 'zdcode':
      case 'hackertyper':
      case 'typer':
        addLine('Launching ZD Code (Hacker Typer)...', 'success');
        onOpenApp('zdcode');
        break;

      case 'files':
      case 'filemanager':
        addLine('Launching File Manager...', 'success');
        onOpenApp('files');
        break;

      case 'crypto':
      case 'hash':
        addLine('Launching Cryptographic Hash & Key Encoder...', 'success');
        onOpenApp('crypto');
        break;

      case 'matrix':
      case 'rain':
        addLine('Launching Digital Matrix Rain Visualizer...', 'success');
        onOpenApp('matrix');
        break;

      case 'globe':
        addLine('Launching 3D Rotating Neural Globe...', 'success');
        onOpenApp('globe');
        break;

      case 'monitor':
      case 'top':
      case 'sys':
        addLine('Launching Hardware Telemetry Monitor...', 'success');
        onOpenApp('monitor');
        break;

      case 'settings':
        addLine('Opening System Settings & Data Purge window...', 'success');
        onOpenApp('settings');
        break;

      case 'notes':
      case 'vault':
        addLine('Opening Local Data Vault & Scratchpad...', 'success');
        onOpenApp('notes');
        break;

      case 'scan':
      case 'nmap':
        const target = args[0] || '133.242.18.9';
        addLine(`Starting NMAP Reconnaissance against host [${target}]...`, 'banner');
        setTimeout(() => {
          addLine(`[+] SYN Stealth Scan (8192 ports) in progress...`, 'output');
          terminalSound.playTik();
        }, 300);
        setTimeout(() => {
          addLine(`[+] Host ${target} is UP (RTT: 18.4ms)`, 'success');
          addLine(`PORT      STATE    SERVICE         VERSION`, 'banner');
          addLine(`22/tcp    open     ssh             OpenSSH 9.4 (AES-CTR)`, 'output');
          addLine(`80/tcp    open     http            Nexus-Httpd/2.4`, 'output');
          addLine(`443/tcp   open     ssl/https       Quantum-TLS 1.3`, 'output');
          addLine(`8080/tcp  filtered http-proxy      Enclave Gateway`, 'output');
          addLine(`Device type: General Purpose Cloud Node (OS: NEXUS Core)`, 'output');
          terminalSound.playAccessGranted();
        }, 800);
        break;

      case 'brute':
        const bruteTarget = args[0] || 'admin';
        addLine(`Deploying dictionary attack against account [${bruteTarget}]...`, 'banner');
        let counter = 0;
        const interval = setInterval(() => {
          counter++;
          const candidate = `hash_${Math.random().toString(36).substring(2, 7)}`;
          addLine(`[ATTEMPT #${counter * 14}] Testing password token: ${candidate}...`, 'output');
          terminalSound.playTik();
          if (counter >= 4) {
            clearInterval(interval);
            addLine(`[SUCCESS] Password cracked for [${bruteTarget}]: "QUANTUM_94"`, 'success');
            terminalSound.playAccessGranted();
          }
        }, 350);
        break;

      case 'inject':
        const injectTarget = args[0] || 'auth_enclave';
        addLine(`Injecting memory buffer overflow exploit into [${injectTarget}]...`, 'banner');
        setTimeout(() => {
          addLine(`[>] Overflow payload: \\x90\\x90\\x90\\x31\\xc0\\x50\\x68//sh\\x68/bin...`, 'output');
        }, 300);
        setTimeout(() => {
          addLine(`[+] Stack pointer hijacked: EIP rewritten to 0x7FFF9420`, 'output');
          addLine(`[+] Ring-0 root shell spawn achieved!`, 'success');
          terminalSound.playAccessGranted();
        }, 750);
        break;

      case 'ddos':
        const ddosIp = args[0] || '198.51.100.44';
        addLine(`Launching high-throughput SYN Flood stress against [${ddosIp}]...`, 'banner');
        let pps = 10000;
        const ddosInt = setInterval(() => {
          pps += 45000;
          addLine(`[PACKETS] Transmitting ${pps.toLocaleString()} pps -> ${ddosIp}:443`, 'output');
          terminalSound.playTik();
          if (pps > 180000) {
            clearInterval(ddosInt);
            addLine(`[REPORT] Target ${ddosIp} latency saturated (>1500ms). Test concluded.`, 'success');
          }
        }, 300);
        break;

      case 'ping':
        const host = args[0] || '1.1.1.1';
        addLine(`PING ${host} (56 data bytes)`, 'output');
        for (let i = 1; i <= 4; i++) {
          setTimeout(() => {
            const time = (12 + Math.random() * 8).toFixed(1);
            addLine(`64 bytes from ${host}: icmp_seq=${i} ttl=64 time=${time} ms`, 'output');
            terminalSound.playTik();
          }, i * 300);
        }
        break;

      case 'ls':
        addLine('total 48', 'output');
        addLine('drwxr-xr-x 2 root root 4096 Sep 09 08:00 payloads', 'output');
        addLine('drwx------ 2 root root 4096 Sep 09 08:02 crypto', 'output');
        addLine('drwxr-xr-x 2 root root 4096 Sep 09 08:04 network', 'output');
        addLine('-rwxr-xr-x 1 root root 8192 Sep 09 08:05 kernel_bypass.c', 'success');
        addLine('-rw------- 1 root root 4096 Sep 09 08:06 shadow_hashes.db', 'output');
        addLine('-rw-r--r-- 1 root root 1024 Sep 09 08:08 sys_auth.log', 'output');
        break;

      case 'cat':
        const file = args[0];
        if (!file) {
          addLine('Usage: cat <filename> (e.g. cat kernel_bypass.c)', 'error');
        } else if (file.includes('kernel')) {
          addLine('// NEXUS-OS KERNEL BYPASS\nint main() {\n  elevate_ring0();\n  return 0;\n}', 'output');
        } else if (file.includes('shadow')) {
          addLine('root:$6$50000$qX9f...$9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b', 'output');
        } else {
          addLine(`File not found: ${file}`, 'error');
        }
        break;

      case 'pwd':
        addLine('/root', 'output');
        break;

      case 'whoami':
        addLine(`OPERATOR : ${username}`, 'success');
        addLine('ROLE     : ROOT_ADMINISTRATOR', 'output');
        addLine('SECURITY : TTY1_DIRECT_MEMORY_ENCLAVE', 'output');
        break;

      case 'calc':
        if (args.length === 0) {
          addLine("Usage: calc <expression> (e.g. 'calc 1024 * 64')", 'error');
          break;
        }
        try {
          const expr = args.join('');
          if (!/^[0-9+\-*/().^ ]+$/.test(expr)) {
            addLine('Math expression contains invalid characters.', 'error');
            break;
          }
          // eslint-disable-next-line no-eval
          const result = Function(`'use strict'; return (${expr})`)();
          addLine(`= ${result}`, 'success');
        } catch {
          addLine('Syntax error in arithmetic expression.', 'error');
        }
        break;

      case 'theme':
        const themeChoice = (args[0] || '').toLowerCase();
        if (['emerald', 'cyan', 'amber', 'crimson'].includes(themeChoice)) {
          onChangeTheme(themeChoice);
          addLine(`System CRT phosphor color set to: ${themeChoice.toUpperCase()}`, 'success');
        } else {
          addLine("Available themes: 'emerald', 'cyan', 'amber', 'crimson'", 'error');
        }
        break;

      case 'lock':
        addLine('Locking terminal workstation...', 'output');
        setTimeout(onLockSystem, 300);
        break;

      case 'reboot':
        addLine('Initiating system reboot...', 'error');
        setTimeout(onRebootSystem, 400);
        break;

      case 'clear':
        setHistory([]);
        break;

      default:
        addLine(`Command not recognized: '${cmd}'. Type 'help' for directory.`, 'error');
        terminalSound.playAccessDenied();
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandArchive.length > 0) {
        const nextIndex = historyIndex + 1;
        if (nextIndex < commandArchive.length) {
          setHistoryIndex(nextIndex);
          setInput(commandArchive[commandArchive.length - 1 - nextIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(commandArchive[commandArchive.length - 1 - nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col justify-between text-xs font-mono select-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Scrollable Command Output Log */}
      <div className="flex-1 overflow-y-auto terminal-scroll space-y-1 pr-1 pb-2 font-mono">
        {history.map((line) => {
          let style = 'text-neutral-300';
          if (line.type === 'input') style = 'text-emerald-400 font-bold';
          if (line.type === 'banner') style = 'text-emerald-400 font-bold glow-text-green';
          if (line.type === 'ascii') style = 'text-emerald-300 font-mono leading-tight whitespace-pre';
          if (line.type === 'success') style = 'text-emerald-300 font-semibold';
          if (line.type === 'error') style = 'text-rose-400 font-semibold';

          return (
            <div key={line.id} className={`${style} leading-relaxed break-all`}>
              {line.text}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Prompt Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCommand(input);
        }}
        className="pt-2 border-t border-emerald-500/20 flex items-center gap-2"
      >
        <span className="text-emerald-400 font-bold shrink-0 glow-text-green flex items-center gap-1">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          {username}@nexus:~#
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          placeholder="Type command ('help', 'zdcode', 'files', 'scan', 'neofetch')..."
          className="flex-1 bg-transparent text-emerald-300 outline-none border-none font-mono text-xs p-0 placeholder:text-emerald-800"
        />
        <button
          type="submit"
          className="text-emerald-600 hover:text-emerald-300 transition-colors p-1 cursor-pointer"
          title="Execute Command"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
