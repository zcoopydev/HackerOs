export interface LinuxBootLog {
  text: string;
  type?: 'dmesg' | 'ok' | 'info' | 'warn' | 'target' | 'ready' | 'err';
  tag?: string;
  pauseAfterMs?: number;
  speedClass?: 'normal' | 'fast' | 'blitz';
}

export const REAL_LINUX_BOOT_LOGS: LinuxBootLog[] = [
  // ── PHASE 1: Normal speed custom OS kernel init ──
  { text: 'NEXUS-OS Core Kernel v9.4.2-quantum (x86_64-smp)', type: 'dmesg', speedClass: 'normal' },
  { text: 'Command line: BOOT_IMAGE=/core/kernel-nexus root=UUID=8f7e2a-4c91 quiet loglevel=3', type: 'dmesg', speedClass: 'normal' },
  { text: 'x86/fpu: Hardware acceleration XSAVE enabled (AVX-512, SSE4.2)', type: 'dmesg', speedClass: 'normal' },
  { text: 'ACPI: Core revision 20260412 enabled. Power states [S0, S3, S5] mapped', type: 'dmesg', speedClass: 'normal' },
  { text: 'Kernel page tables isolation: verified hardware memory protection', type: 'dmesg', speedClass: 'normal' },
  { text: 'smpboot: Booting SMP configuration: 16 Cores / 32 Threads online', type: 'dmesg', speedClass: 'normal' },
  { text: 'Performance Monitor: Hardware trace counter bus initialized', type: 'dmesg', speedClass: 'normal' },
  { text: 'Initializing cgroup subsys cpuset, cpu, memory, io, pids', type: 'dmesg', speedClass: 'normal' },
  { text: 'PCI: Probing root bridge hardware bus [0000:00]', type: 'dmesg', speedClass: 'normal' },

  // ── NATURAL MIDWAY STOP / DELAY (Storage & hardware probing) ──
  { text: 'nvme nvme0: High-speed NVMe flash controller online', type: 'dmesg', speedClass: 'normal' },
  { text: 'nvme nvme0: Partition 2 [rootfs] AES-XTS-512 volume identified', type: 'dmesg', speedClass: 'normal' },
  { text: 'scsi host0: Direct memory access controller verified', type: 'dmesg', speedClass: 'normal' },
  { text: 'random: Entropy pool primed with 8192 bits of hardware noise', type: 'dmesg', pauseAfterMs: 1300, speedClass: 'normal' },

  // ── PHASE 2: Transition into System Core & Services ──
  { text: 'nexus-init[1]: System manager 9.4 running in secure mode (+CRYPTO +SELINUX)', type: 'info', speedClass: 'normal' },
  { text: 'nexus-init[1]: Machine ID: 0x9f4a-71b3-ee40-c112', type: 'info', speedClass: 'normal' },
  { text: 'nexus-init[1]: Hostname assigned: <nexus-mainframe.local>', type: 'info', pauseAfterMs: 500, speedClass: 'normal' },

  // ── PHASE 3: FAST BLITZ / FLOOD (Services & subsystems spawning) ──
  { text: 'Mounted Secure Kernel Runtime File System.', type: 'ok', tag: 'OK', speedClass: 'blitz' },
  { text: 'Started Cryptographic Keystore Daemon.', type: 'ok', tag: 'OK', speedClass: 'blitz' },
  { text: 'Reached target Encrypted File Systems and Keys.', type: 'target', tag: 'OK', speedClass: 'blitz' },
  { text: 'Listening on Process Event Bus & IPC sockets.', type: 'ok', tag: 'OK', speedClass: 'blitz' },
  { text: 'Mounted Huge Pages Virtual Memory Pool.', type: 'ok', tag: 'OK', speedClass: 'blitz' },
  { text: 'Mounted POSIX Hardware Message Queues.', type: 'ok', tag: 'OK', speedClass: 'blitz' },
  { text: 'Started Remount Root and Storage Controllers.', type: 'ok', tag: 'OK', speedClass: 'blitz' },
  { text: 'Mounted /sys/kernel/security and cryptographic enclave.', type: 'ok', tag: 'OK', speedClass: 'blitz' },
  { text: 'Mounted /sys/fs/cgroup resource governors.', type: 'ok', tag: 'OK', speedClass: 'blitz' },
  { text: 'Reached target Local File Systems.', type: 'target', tag: 'OK', speedClass: 'blitz' },
  { text: 'Started Device Hotplug Discovery Daemon.', type: 'ok', tag: 'OK', speedClass: 'blitz' },
  { text: 'Started Internal Inter-Process D-Bus Router.', type: 'ok', tag: 'OK', speedClass: 'blitz' },
  { text: 'Started Neural DNS & Host Name Resolution.', type: 'ok', tag: 'OK', speedClass: 'blitz' },
  { text: 'Reached target Network Resolver is Online.', type: 'target', tag: 'OK', speedClass: 'blitz' },
  { text: 'Starting Gigabit Ethernet & Wireless Interfaces...', type: 'info', speedClass: 'blitz' },
  { text: 'Started Secure Tunneling & Mesh Gateway.', type: 'ok', tag: 'OK', speedClass: 'blitz' },
  { text: 'Reached target Network Matrix Online.', type: 'target', tag: 'OK', speedClass: 'blitz' },
  { text: 'Loaded Hardware Acceleration drivers: OpenGL/WebGPU pipeline', type: 'ok', tag: 'OK', speedClass: 'blitz' },
  { text: 'Started Synthetic Audio Feedback Subsystem (WebAudio Core).', type: 'ok', tag: 'OK', speedClass: 'blitz' },
  { text: 'Started Real-Time GeoIP & Global Radar Matrix.', type: 'ok', tag: 'OK', speedClass: 'blitz' },
  { text: 'Mounted Virtual Terminal Devices (pts/0 -> pts/32).', type: 'ok', tag: 'OK', speedClass: 'blitz' },
  { text: 'Reached target System Core Initialization.', type: 'target', tag: 'OK', speedClass: 'blitz' },

  // ── PHASE 4: FINAL GRAPHICAL & DESKTOP TARGET ──
  { text: 'Starting Security Lock & Account Controller...', type: 'info', pauseAfterMs: 700, speedClass: 'normal' },
  { text: 'Started Security Lock Daemon.', type: 'ok', tag: 'OK', speedClass: 'blitz' },
  { text: 'Started Holographic Desktop Shell Environment.', type: 'ok', tag: 'OK', speedClass: 'blitz' },
  { text: 'Reached target Cyber Graphical Desktop.', type: 'target', tag: 'OK', pauseAfterMs: 300, speedClass: 'normal' },
  { text: 'NEXUS-OS boot sequence completed. System ready.', type: 'ready', speedClass: 'normal' }
];
