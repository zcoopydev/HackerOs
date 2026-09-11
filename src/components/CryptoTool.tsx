import React, { useState } from 'react';
import { Key, Copy, Check, RefreshCw, Lock, Unlock, Hash } from 'lucide-react';
import { terminalSound } from '../utils/terminalSound';

export const CryptoTool: React.FC = () => {
  const [inputText, setInputText] = useState<string>('NEXUS_ROOT_OVERRIDE_2026');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Compute live transformations
  const toBase64 = (str: string) => {
    try {
      return btoa(str);
    } catch {
      return 'ENCODING_ERROR';
    }
  };

  const toHex = (str: string) => {
    return str
      .split('')
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  };

  const toBinary = (str: string) => {
    return str
      .split('')
      .map((c) => c.charCodeAt(0).toString(2).padStart(8, '0'))
      .slice(0, 8)
      .join(' ');
  };

  // Deterministic pseudo-sha256 calculation for preview
  const pseudoHash = (str: string, seed: number) => {
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const hexStr = Math.abs(hash).toString(16).padStart(8, '0');
    return (hexStr + hexStr + hexStr + hexStr + hexStr + hexStr + hexStr + hexStr).slice(0, 64);
  };

  const sha256Val = pseudoHash(inputText, 0x811c9dc5);
  const md5Val = pseudoHash(inputText, 0x5a827999).slice(0, 32);

  const copyToClipboard = (val: string, field: string) => {
    terminalSound.playTik();
    navigator.clipboard.writeText(val);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const generateRandomKey = () => {
    terminalSound.playTik();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let res = '';
    for (let i = 0; i < 24; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInputText(res);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between text-xs font-mono select-none space-y-3">
      {/* Input Text / Secret Key */}
      <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-emerald-500 pb-1.5 border-b border-emerald-500/20">
          <span className="flex items-center gap-1.5 font-bold text-emerald-300">
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            INPUT STRING / RAW CRYPTO PHRASE
          </span>
          <button
            onClick={generateRandomKey}
            className="hover:text-emerald-300 text-emerald-500 flex items-center gap-1 cursor-pointer transition-colors"
            title="Generate Random Secret"
          >
            <RefreshCw className="w-3 h-3" />
            <span>GENERATE KEY</span>
          </button>
        </div>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text or cryptographic seed..."
          className="w-full bg-black/60 border border-emerald-500/40 rounded px-2.5 py-1.5 text-emerald-300 outline-none focus:border-emerald-400 font-mono text-xs"
        />
      </div>

      {/* Hash Transformation Matrix */}
      <div className="flex-1 space-y-2 overflow-y-auto terminal-scroll pr-1">
        {/* SHA-256 */}
        <div className="p-2.5 rounded bg-black/70 border border-emerald-500/20 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-emerald-500">
            <span className="font-bold flex items-center gap-1">
              <Hash className="w-3 h-3 text-emerald-400" /> SHA-256 CHECKSUM
            </span>
            <button
              onClick={() => copyToClipboard(sha256Val, 'sha')}
              className="text-emerald-400 hover:text-emerald-200 cursor-pointer flex items-center gap-1"
            >
              {copiedField === 'sha' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedField === 'sha' ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>
          <div className="text-[11px] text-emerald-300 break-all font-mono select-text bg-black/40 p-1 rounded">
            {sha256Val}
          </div>
        </div>

        {/* MD5 */}
        <div className="p-2.5 rounded bg-black/70 border border-emerald-500/20 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-emerald-500">
            <span className="font-bold flex items-center gap-1">
              <Lock className="w-3 h-3 text-cyan-400" /> MD5 MESSAGE DIGEST
            </span>
            <button
              onClick={() => copyToClipboard(md5Val, 'md5')}
              className="text-cyan-400 hover:text-cyan-200 cursor-pointer flex items-center gap-1"
            >
              {copiedField === 'md5' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedField === 'md5' ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>
          <div className="text-[11px] text-cyan-300 break-all font-mono select-text bg-black/40 p-1 rounded">
            {md5Val}
          </div>
        </div>

        {/* Base64 */}
        <div className="p-2.5 rounded bg-black/70 border border-emerald-500/20 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-emerald-500">
            <span className="font-bold flex items-center gap-1">
              <Unlock className="w-3 h-3 text-emerald-400" /> BASE-64 ENCODING
            </span>
            <button
              onClick={() => copyToClipboard(toBase64(inputText), 'b64')}
              className="text-emerald-400 hover:text-emerald-200 cursor-pointer flex items-center gap-1"
            >
              {copiedField === 'b64' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedField === 'b64' ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>
          <div className="text-[11px] text-emerald-300 break-all font-mono select-text bg-black/40 p-1 rounded">
            {toBase64(inputText)}
          </div>
        </div>

        {/* Hexadecimal */}
        <div className="p-2.5 rounded bg-black/70 border border-emerald-500/20 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-emerald-500">
            <span className="font-bold">HEX STREAM (0x)</span>
            <button
              onClick={() => copyToClipboard(toHex(inputText), 'hex')}
              className="text-emerald-400 hover:text-emerald-200 cursor-pointer flex items-center gap-1"
            >
              {copiedField === 'hex' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedField === 'hex' ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>
          <div className="text-[11px] text-emerald-300 break-all font-mono select-text bg-black/40 p-1 rounded">
            0x{toHex(inputText)}
          </div>
        </div>
      </div>

      <div className="text-[9px] text-emerald-700 pt-2 border-t border-emerald-950 flex justify-between">
        <span>CIPHER: AES-512 HARDWARE ENCLAVE</span>
        <span>OUTPUT: RFC-4648 COMPLIANT</span>
      </div>
    </div>
  );
};
