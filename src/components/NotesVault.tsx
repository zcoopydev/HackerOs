import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Save, FileCode, Check } from 'lucide-react';
import { terminalSound } from '../utils/terminalSound';

interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

const NOTES_STORAGE_KEY = 'hacker_sim_notes_v1';

const DEFAULT_FILES: NoteItem[] = [
  {
    id: 'recon-targets',
    title: 'recon_targets.txt',
    content: `# NEXUS SURVEILLANCE TARGETS\n\n1. Node 185.199.108.153 (London-Central) - Port 443 SSL Active\n2. Node 133.242.18.9 (Tokyo-Prime) - Quantum Crypt Gateway\n3. Node 198.51.100.44 (New-York) - AES-512 Enclave\n\nNotes: Security protocols refreshed every 3600 seconds.`,
    updatedAt: '2026-09-09'
  },
  {
    id: 'crypto-keys',
    title: 'crypto_hashes.log',
    content: `SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855\nMD5: d41d8cd98f00b204e9800998ecf8427e\nSTATUS: ENCRYPTED // USE 'crack <hash>' IN CMD TERMINAL`,
    updatedAt: '2026-09-09'
  }
];

export const NotesVault: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');
  const [savedBadge, setSavedBadge] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as NoteItem[];
        setNotes(parsed);
        if (parsed.length > 0) {
          selectNote(parsed[0]);
        }
      } else {
        setNotes(DEFAULT_FILES);
        selectNote(DEFAULT_FILES[0]);
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(DEFAULT_FILES));
      }
    } catch {
      setNotes(DEFAULT_FILES);
      selectNote(DEFAULT_FILES[0]);
    }
  }, []);

  const selectNote = (note: NoteItem) => {
    setSelectedNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setSavedBadge(false);
  };

  const handleSave = () => {
    terminalSound.playAccessGranted();
    const updated = notes.map((n) => {
      if (n.id === selectedNoteId) {
        return {
          ...n,
          title: editTitle || 'untitled.txt',
          content: editContent,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return n;
    });

    setNotes(updated);
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  const handleCreateNew = () => {
    terminalSound.playTik();
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: `intel_memo_${notes.length + 1}.txt`,
      content: `# NEW OPERATOR MEMO\n\nEnter confidential data here...`,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    const nextList = [newNote, ...notes];
    setNotes(nextList);
    selectNote(newNote);
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(nextList));
    } catch {}
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    terminalSound.playTik();
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(remaining));
    } catch {}
    if (selectedNoteId === id && remaining.length > 0) {
      selectNote(remaining[0]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col sm:flex-row text-xs font-mono select-none gap-2">
      {/* Left Sidebar: File List */}
      <div className="w-full sm:w-48 bg-black/60 border border-emerald-500/20 rounded-lg p-2 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-emerald-500 pb-1.5 border-b border-emerald-500/20 mb-2">
            <span className="font-bold flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              INTEL VAULT
            </span>
            <button
              onClick={handleCreateNew}
              className="p-1 rounded hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
              title="New File"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Files List */}
          <div className="space-y-1 overflow-y-auto max-h-36 sm:max-h-56 terminal-scroll">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  terminalSound.playTik();
                  selectNote(note);
                }}
                className={`p-1.5 rounded flex items-center justify-between cursor-pointer transition-colors ${
                  selectedNoteId === note.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-neutral-400 hover:text-emerald-400 hover:bg-black/40'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <FileText className="w-3 h-3 shrink-0 text-emerald-500" />
                  <span className="truncate text-[11px]">{note.title}</span>
                </div>
                {notes.length > 1 && (
                  <button
                    onClick={(e) => handleDelete(note.id, e)}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5"
                    title="Delete File"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-[9px] text-emerald-700 pt-2 border-t border-emerald-950/60">
          PERSISTED IN LOCAL STORAGE
        </div>
      </div>

      {/* Right Area: File Editor */}
      <div className="flex-1 bg-black/80 border border-emerald-500/20 rounded-lg p-3 flex flex-col justify-between">
        <div>
          {/* Editor Header */}
          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 mb-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="bg-transparent text-emerald-300 font-bold outline-none border-b border-emerald-500/30 text-xs w-48 focus:border-emerald-400"
              placeholder="Filename.txt"
            />
            <div className="flex items-center gap-2">
              {savedBadge && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> SAVED
                </span>
              )}
              <button
                onClick={handleSave}
                className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-400 text-emerald-300 flex items-center gap-1 font-bold text-[11px] cursor-pointer transition-colors shadow-[0_0_10px_rgba(0,255,102,0.3)]"
              >
                <Save className="w-3 h-3" /> SAVE
              </button>
            </div>
          </div>

          {/* Text Area */}
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-44 sm:h-52 bg-transparent text-neutral-200 outline-none resize-none font-mono text-xs leading-relaxed placeholder:text-neutral-600 terminal-scroll"
            placeholder="Type confidential intel or system notes here..."
            spellCheck={false}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-emerald-600 pt-2 border-t border-emerald-950">
          <span>ENCODING: UTF-8 // STORAGE: LOCAL_CLIENT</span>
          <span>CHARS: {editContent.length}</span>
        </div>
      </div>
    </div>
  );
};
