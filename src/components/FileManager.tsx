import React, { useState } from 'react';
import {
  Folder,
  FileText,
  FileCode,
  Shield,
  Trash2,
  Download,
  Plus,
  Binary,
  Eye,
  Check,
  HardDrive
} from 'lucide-react';
import { terminalSound } from '../utils/terminalSound';

interface VirtualFile {
  id: string;
  name: string;
  dir: string;
  size: string;
  perms: string;
  type: 'code' | 'text' | 'bin' | 'log';
  content: string;
}

const INITIAL_FILES: VirtualFile[] = [
  {
    id: 'f1',
    name: 'kernel_bypass.c',
    dir: '/root/payloads',
    size: '4.2 KB',
    perms: '-rwxr-xr-x',
    type: 'code',
    content: `#include <nexus/core.h>\n\nint main(void) {\n    elevate_ring0_privilege();\n    deploy_enclave_hook();\n    return 0;\n}`
  },
  {
    id: 'f2',
    name: 'shadow_hashes.db',
    dir: '/root/crypto',
    size: '18.6 KB',
    perms: '-rw-------',
    type: 'bin',
    content: `root:$6$rounds=50000$qX9f...$9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b\nadmin:$6$rounds=50000$pL4k...$1234567890abcdef1234567890abcdef12345678`
  },
  {
    id: 'f3',
    name: 'network_map.json',
    dir: '/root/network',
    size: '2.8 KB',
    perms: '-rw-r--r--',
    type: 'text',
    content: `{\n  "gateway": "192.168.1.1",\n  "dns": ["1.1.1.1", "8.8.8.8"],\n  "nodes": [\n    {"name": "tokyo-prime", "ip": "133.242.18.9"},\n    {"name": "london-central", "ip": "185.199.108.153"}\n  ]\n}`
  },
  {
    id: 'f4',
    name: 'sys_auth.log',
    dir: '/root/logs',
    size: '12.4 KB',
    perms: '-rw-r-----',
    type: 'log',
    content: `[2026-09-09 08:00:12] SESSION OPENED for user 'root' on tty1\n[2026-09-09 08:04:19] SYSTEM_INTEGRITY: AES-512 check PASSED\n[2026-09-09 08:12:00] Quantum Enclave synchronized with remote mesh`
  },
  {
    id: 'f5',
    name: 'mem_dump_0x7FFF.raw',
    dir: '/root/memory',
    size: '64.0 KB',
    perms: '-rw-------',
    type: 'bin',
    content: `4e 45 58 55 53 20 45 4e 43 4c 41 56 45 20 56 41  NEXUS ENCLAVE VA\n55 4c 54 20 44 55 4d 50 20 30 78 37 46 46 46 20  ULT DUMP 0x7FFF \n7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00  .ELF............`
  }
];

const DIRECTORIES = ['/root', '/root/payloads', '/root/crypto', '/root/network', '/root/logs', '/root/memory'];

export const FileManager: React.FC = () => {
  const [files, setFiles] = useState<VirtualFile[]>(INITIAL_FILES);
  const [currentDir, setCurrentDir] = useState<string>('/root');
  const [selectedFile, setSelectedFile] = useState<VirtualFile>(INITIAL_FILES[0]);
  const [viewMode, setViewMode] = useState<'text' | 'hex'>('text');
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [showCreateInput, setShowCreateInput] = useState<boolean>(false);

  const filteredFiles = files.filter((f) => {
    if (currentDir === '/root') return true;
    return f.dir === currentDir;
  });

  const handleSelectFile = (file: VirtualFile) => {
    terminalSound.playTik();
    setSelectedFile(file);
    setDownloaded(false);
  };

  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    terminalSound.playTik();
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    if (selectedFile.id === id && updated.length > 0) {
      setSelectedFile(updated[0]);
    }
  };

  const handleDownload = () => {
    terminalSound.playAccessGranted();
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 1500);
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    terminalSound.playTik();

    const newFile: VirtualFile = {
      id: `f-${Date.now()}`,
      name: newFileName.trim(),
      dir: currentDir === '/root' ? '/root/payloads' : currentDir,
      size: '1.2 KB',
      perms: '-rw-r--r--',
      type: newFileName.endsWith('.c') ? 'code' : newFileName.endsWith('.log') ? 'log' : 'text',
      content: `/* Created in ${currentDir} */\n// Initialized payload buffer\n`
    };

    setFiles((prev) => [...prev, newFile]);
    setSelectedFile(newFile);
    setNewFileName('');
    setShowCreateInput(false);
  };

  // Hexadecimal generation for viewing binary / memory dumps
  const renderHexDump = (str: string) => {
    const lines = [];
    for (let i = 0; i < str.length; i += 16) {
      const chunk = str.slice(i, i + 16);
      const hex = chunk
        .split('')
        .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(' ');
      const ascii = chunk.replace(/[^\x20-\x7E]/g, '.');
      const offset = i.toString(16).padStart(8, '0');
      lines.push(`${offset}  ${hex.padEnd(48, ' ')} |${ascii}|`);
    }
    return lines.join('\n');
  };

  return (
    <div className="w-full h-full flex flex-col justify-between text-xs font-mono select-none space-y-2">
      {/* Top Breadcrumb Path & Tool Strip */}
      <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 text-[11px]">
        <div className="flex items-center gap-2 text-emerald-400">
          <HardDrive className="w-3.5 h-3.5" />
          <span className="text-emerald-600">PATH:</span>
          <span className="font-bold text-emerald-300">{currentDir}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              terminalSound.playTik();
              setShowCreateInput(!showCreateInput);
            }}
            className="px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>NEW FILE</span>
          </button>
        </div>
      </div>

      {/* New File Input Bar */}
      {showCreateInput && (
        <div className="p-2 rounded bg-emerald-950/50 border border-emerald-500/40 flex items-center gap-2">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="payload_name.c"
            className="flex-1 bg-transparent border-b border-emerald-400 outline-none text-emerald-300 px-1 py-0.5 text-xs"
            autoFocus
          />
          <button
            onClick={handleCreateFile}
            className="px-2 py-0.5 rounded bg-emerald-500 text-black font-bold cursor-pointer hover:bg-emerald-400"
          >
            CREATE
          </button>
          <button
            onClick={() => setShowCreateInput(false)}
            className="px-2 py-0.5 rounded bg-black/60 text-neutral-400 hover:text-white cursor-pointer"
          >
            CANCEL
          </button>
        </div>
      )}

      {/* Main Split Body: Sidebar Folders + File List + Previewer */}
      <div className="flex-1 flex flex-col sm:flex-row gap-2 overflow-hidden">
        {/* Left Tree: Directories */}
        <div className="w-full sm:w-44 bg-black/60 border border-emerald-500/20 rounded-lg p-2 flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <div className="text-[10px] text-emerald-600 font-bold mb-1">DIRECTORIES</div>
            {DIRECTORIES.map((dir) => (
              <button
                key={dir}
                onClick={() => {
                  terminalSound.playTik();
                  setCurrentDir(dir);
                }}
                className={`w-full p-1.5 rounded flex items-center gap-2 text-left cursor-pointer transition-colors ${
                  currentDir === dir
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'text-neutral-400 hover:text-emerald-400 hover:bg-black/40'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate text-[11px]">{dir.replace('/root', '~') || '/'}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-emerald-950 text-[9px] text-emerald-700">
            ROOT ENCRYPTED FS (AES-512)
          </div>
        </div>

        {/* Center: File Table */}
        <div className="w-full sm:w-56 bg-black/70 border border-emerald-500/20 rounded-lg p-2 overflow-y-auto terminal-scroll shrink-0 space-y-1">
          <div className="text-[10px] text-emerald-600 font-bold mb-1 flex justify-between">
            <span>FILES ({filteredFiles.length})</span>
            <span>PERMS</span>
          </div>

          {filteredFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => handleSelectFile(file)}
              className={`p-1.5 rounded flex items-center justify-between cursor-pointer transition-colors ${
                selectedFile.id === file.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400 font-semibold'
                  : 'text-neutral-300 hover:text-emerald-400 hover:bg-black/50'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                {file.type === 'code' ? (
                  <FileCode className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : file.type === 'bin' ? (
                  <Binary className="w-3 h-3 text-cyan-400 shrink-0" />
                ) : (
                  <FileText className="w-3 h-3 text-neutral-400 shrink-0" />
                )}
                <span className="truncate text-[11px]">{file.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] text-neutral-500 font-mono">{file.perms}</span>
                {files.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteFile(file.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 transition-opacity"
                    title="Delete File"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right: File Viewer / Hex Dump */}
        <div className="flex-1 bg-black/90 border border-emerald-500/30 rounded-lg p-3 flex flex-col justify-between overflow-hidden">
          <div>
            {/* File Details & View Toggle */}
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 mb-2">
              <div>
                <div className="text-emerald-300 font-bold flex items-center gap-1.5 text-xs">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  {selectedFile.name}
                </div>
                <div className="text-[10px] text-emerald-600">
                  {selectedFile.dir} &bull; SIZE: {selectedFile.size} &bull; {selectedFile.perms}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    terminalSound.playTik();
                    setViewMode('text');
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                    viewMode === 'text'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  <Eye className="w-3 h-3 inline mr-1" />
                  TEXT
                </button>
                <button
                  onClick={() => {
                    terminalSound.playTik();
                    setViewMode('hex');
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                    viewMode === 'hex'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  <Binary className="w-3 h-3 inline mr-1" />
                  HEX
                </button>
                <button
                  onClick={handleDownload}
                  className="px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-1 text-[10px] cursor-pointer"
                  title="Download File"
                >
                  {downloaded ? <Check className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3" />}
                  <span>{downloaded ? 'SAVED' : 'EXPORT'}</span>
                </button>
              </div>
            </div>

            {/* Content Display */}
            <div className="h-44 sm:h-52 overflow-auto terminal-scroll bg-black/50 p-2 rounded border border-emerald-500/10 font-mono text-[11px] leading-relaxed text-emerald-200">
              {viewMode === 'text' ? (
                <pre className="whitespace-pre-wrap">{selectedFile.content}</pre>
              ) : (
                <pre className="text-cyan-400/90 whitespace-pre">{renderHexDump(selectedFile.content)}</pre>
              )}
            </div>
          </div>

          <div className="text-[10px] text-emerald-600 pt-2 border-t border-emerald-950 flex justify-between">
            <span>MODE: {viewMode.toUpperCase()} VIEW</span>
            <span>SHA-256: e3b0c44298fc1c14...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
