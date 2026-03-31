import { useState, useMemo, useCallback } from 'react';
import type { Song, Key } from '@/types';
import { ALL_KEYS, generateUUID } from '@/utils/constants';
import { parseChordProText, sectionsToChordPro, parseChordProLine } from '@/utils/chordpro';
import LyricsSearchDialog, { type LyricsSearchSelection } from './LyricsSearchDialog';
import VisualChordEditor from './VisualChordEditor';

/** Initial data that can be provided from external sources (e.g. lyrics search) */
export interface SongEditorInitialData {
  title?: string;
  artist?: string;
  chordProText?: string;
}

interface SongEditorProps {
  song?: Song | null;
  initialData?: SongEditorInitialData;
  onSave: (song: Song) => void;
  onCancel: () => void;
}

export default function SongEditor({ song, initialData, onSave, onCancel }: SongEditorProps) {
  const isEditing = !!song;

  const [title, setTitle] = useState(song?.title ?? initialData?.title ?? '');
  const [artist, setArtist] = useState(song?.artist ?? initialData?.artist ?? '');
  const [key, setKey] = useState<Key>(song?.key ?? 'C');
  const [capo, setCapo] = useState(song?.capo ?? 0);
  const [tempo, setTempo] = useState(song?.tempo?.toString() ?? '');
  const [tags, setTags] = useState(song?.tags?.join(', ') ?? '');

  const [chordProText, setChordProText] = useState(() => {
    if (song) return sectionsToChordPro(song);
    if (initialData?.chordProText) return initialData.chordProText;
    return '';
  });

  const [showLyricsSearch, setShowLyricsSearch] = useState(false);
  const [editorMode, setEditorMode] = useState<'visual' | 'chordpro'>('visual');
  const [activePanel, setActivePanel] = useState<'metadata' | 'lyrics'>(
    initialData?.chordProText ? 'lyrics' : 'metadata'
  );
  // Live preview
  const preview = useMemo(() => {
    const { sections } = parseChordProText(chordProText);
    return sections;
  }, [chordProText]);

  const handleSave = useCallback(() => {
    if (!title.trim() || !artist.trim()) return;

    const { metadata, sections } = parseChordProText(chordProText);

    const newSong: Song = {
      id: song?.id ?? generateUUID(),
      title: metadata.title || title.trim(),
      artist: metadata.artist || artist.trim(),
      key: (metadata.key as Key) || key,
      capo: metadata.capo ? parseInt(metadata.capo, 10) : capo,
      tempo: (metadata.tempo ? parseInt(metadata.tempo, 10) : tempo ? parseInt(tempo, 10) : undefined) || undefined,
      sections,
      dateAdded: song?.dateAdded ?? Date.now(),
      lastViewed: song?.lastViewed,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    onSave(newSong);
  }, [title, artist, key, capo, tempo, tags, chordProText, song, onSave]);

  const insertAtCursor = useCallback((text: string) => {
    const textarea = document.getElementById('chordpro-editor') as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = chordProText.slice(0, start);
    const after = chordProText.slice(end);
    setChordProText(before + text + after);
    // Restore cursor after the inserted text
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    });
  }, [chordProText]);

  const handleLyricsSearchSelect = useCallback((selection: LyricsSearchSelection) => {
    setTitle(selection.title);
    setArtist(selection.artist);
    setChordProText(selection.chordProText);
    setShowLyricsSearch(false);
    setActivePanel('lyrics');
  }, []);

  const canSave = title.trim() && artist.trim();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="rounded-xl overflow-hidden w-full"
        style={{
          maxWidth: '900px',
          maxHeight: '90vh',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{
            backgroundColor: 'var(--color-surface-raised)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h2
            className="text-base font-bold"
            style={{ color: 'var(--color-text)' }}
          >
            {isEditing ? 'Edit Song' : 'Add Song'}
          </h2>
          <button
            onClick={onCancel}
            className="text-lg cursor-pointer"
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)' }}
          >
            &#x2715;
          </button>
        </div>

        {/* Mobile panel toggle */}
        <div className="flex sm:hidden"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          {(['metadata', 'lyrics'] as const).map((panel) => (
            <button
              key={panel}
              onClick={() => setActivePanel(panel)}
              className="flex-1 py-2 text-xs font-semibold cursor-pointer"
              style={{
                background: 'none',
                border: 'none',
                color: activePanel === panel ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderBottom: activePanel === panel ? '2px solid var(--color-primary)' : '2px solid transparent',
              }}
            >
              {panel === 'metadata' ? 'Details' : 'Lyrics & Chords'}
            </button>
          ))}
        </div>

        {/* Body: two panels */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ display: 'flex', minHeight: 0 }}
        >
          {/* Left: Metadata */}
          <div
            className={`${activePanel === 'metadata' ? 'block' : 'hidden'} sm:block p-5`}
            style={{
              flex: '0 0 280px',
              borderRight: '1px solid var(--color-border)',
              overflowY: 'auto',
            }}
          >
            <div className="space-y-3">
              <FieldGroup label="Title *">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Song title"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={inputStyle}
                />
              </FieldGroup>
              <FieldGroup label="Artist *">
                <input
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Artist name"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={inputStyle}
                />
              </FieldGroup>
              <FieldGroup label="Key">
                <select
                  value={key}
                  onChange={(e) => setKey(e.target.value as Key)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={inputStyle}
                >
                  {ALL_KEYS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </FieldGroup>
              <FieldGroup label="Capo">
                <select
                  value={capo}
                  onChange={(e) => setCapo(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={inputStyle}
                >
                  {Array.from({ length: 13 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? 'No capo' : `Fret ${i}`}
                    </option>
                  ))}
                </select>
              </FieldGroup>
              <FieldGroup label="Tempo (BPM)">
                <input
                  value={tempo}
                  onChange={(e) => setTempo(e.target.value.replace(/\D/g, ''))}
                  placeholder="Optional"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={inputStyle}
                />
              </FieldGroup>
              <FieldGroup label="Tags">
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="rock, acoustic, ..."
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={inputStyle}
                />
              </FieldGroup>
            </div>
          </div>

          {/* Right: Editor (Visual or ChordPro) */}
          <div
            className={`${activePanel === 'lyrics' ? 'flex' : 'hidden'} sm:flex flex-col flex-1 min-w-0`}
          >
            {/* Editor mode tabs + toolbar */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0 overflow-x-auto"
              style={{
                borderBottom: '1px solid var(--color-border-subtle)',
                backgroundColor: 'var(--color-surface-raised)',
              }}
            >
              {/* Mode tabs */}
              {(['visual', 'chordpro'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setEditorMode(mode)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer"
                  style={{
                    backgroundColor: editorMode === mode ? 'var(--color-primary)' : 'transparent',
                    color: editorMode === mode ? 'var(--color-text-on-primary)' : 'var(--color-text-muted)',
                    border: 'none',
                  }}
                >
                  {mode === 'visual' ? 'Visual' : 'ChordPro'}
                </button>
              ))}

              {/* Divider */}
              <div
                className="flex-shrink-0 w-px h-4"
                style={{ backgroundColor: 'var(--color-border)' }}
              />

              {/* ChordPro-mode-only toolbar buttons */}
              {editorMode === 'chordpro' && (
                <>
                  <button
                    onClick={() => insertAtCursor('[Am]')}
                    className="px-2 py-1 rounded text-[11px] font-medium cursor-pointer flex-shrink-0"
                    style={toolbarBtnStyle}
                  >
                    + Chord
                  </button>
                  <button
                    onClick={() => insertAtCursor('\n{section: Verse 1}\n')}
                    className="px-2 py-1 rounded text-[11px] font-medium cursor-pointer flex-shrink-0"
                    style={toolbarBtnStyle}
                  >
                    + Section
                  </button>
                  <div
                    className="flex-shrink-0 w-px h-4"
                    style={{ backgroundColor: 'var(--color-border)' }}
                  />
                </>
              )}

              {/* Search Web button (both modes) */}
              <button
                onClick={() => setShowLyricsSearch(true)}
                className="px-2 py-1 rounded text-[11px] font-semibold cursor-pointer flex-shrink-0"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-text-on-accent)',
                  border: 'none',
                }}
              >
                Search Web
              </button>

              <div className="flex-1" />

              {editorMode === 'visual' && (
                <span
                  className="text-[10px] flex-shrink-0"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Click above words to add chords
                </span>
              )}
            </div>

            {/* Visual mode */}
            {editorMode === 'visual' && (
              <VisualChordEditor
                chordProText={chordProText}
                onChange={setChordProText}
                songKey={key}
                onKeyChange={setKey}
              />
            )}

            {/* ChordPro text mode */}
            {editorMode === 'chordpro' && (
              <>
                <textarea
                  id="chordpro-editor"
                  value={chordProText}
                  onChange={(e) => setChordProText(e.target.value)}
                  placeholder={`Paste or type ChordPro format:\n\n{section: Verse 1}\n[Am]Hello [G]world\n[C]This is a [F]song`}
                  className="flex-1 w-full resize-none p-4 text-sm"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    border: 'none',
                    outline: 'none',
                    fontFamily: 'var(--songbook-chord-font)',
                    minHeight: '200px',
                  }}
                  spellCheck={false}
                />

                {/* Preview (ChordPro mode only) */}
                {preview.length > 0 && (
                  <div
                    className="flex-shrink-0 p-4 overflow-y-auto"
                    style={{
                      borderTop: '1px solid var(--color-border)',
                      maxHeight: '200px',
                      backgroundColor: 'var(--color-surface-raised)',
                    }}
                  >
                    <div
                      className="text-[10px] font-semibold uppercase mb-2"
                      style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}
                    >
                      Preview
                    </div>
                    {preview.map((section, si) => (
                      <div key={si} className="mb-3">
                        <div
                          className="text-[10px] font-bold uppercase mb-1"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          {section.label}
                        </div>
                        {section.lines.map((line, li) => {
                          const parsed = parseChordProLine(line);
                          return (
                            <div key={li} className="mb-1">
                              <div
                                className="text-[11px] font-bold"
                                style={{ color: 'var(--color-primary)', fontFamily: 'var(--songbook-chord-font)' }}
                              >
                                {parsed.segments.map((seg, i) => (
                                  seg.chord ? <span key={i} className="mr-3">{seg.chord}</span> : null
                                ))}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--color-text)' }}>
                                {parsed.segments.map((seg) => seg.lyrics).join('')}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-5 py-3"
          style={{
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-raised)',
          }}
        >
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
            style={{
              backgroundColor: canSave ? 'var(--color-primary)' : 'var(--color-border)',
              color: canSave ? 'var(--color-text-on-primary)' : 'var(--color-text-muted)',
              border: 'none',
              opacity: canSave ? 1 : 0.6,
            }}
          >
            {isEditing ? 'Save Changes' : 'Add Song'}
          </button>
        </div>
      </div>

      {/* Lyrics search dialog */}
      {showLyricsSearch && (
        <LyricsSearchDialog
          onSelect={handleLyricsSearchSelect}
          onClose={() => setShowLyricsSearch(false)}
        />
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  outline: 'none',
};

const toolbarBtnStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text-muted)',
  border: '1px solid var(--color-border)',
};

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block text-[11px] font-semibold mb-1"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
