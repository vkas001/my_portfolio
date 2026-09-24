import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { newId, type SaveBridge, type SectionScaffold, type BaseItem } from '@/modules/editor/lib/scaffolding';

export default function SectionEditor<T extends BaseItem>({
  scaffold,
  commitRef,
  reportSave,
}: {
  scaffold: SectionScaffold<T>;
  commitRef: SaveBridge['commitRef'];
  reportSave: SaveBridge['reportSave'];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const startNew = () => {
    const id = newId();
    setDraft(scaffold.emptyFor(id));
    setEditingId(id);
    setCreating(true);
    setError('');
  };
  const startEdit = (item: T) => {
    setDraft({ ...item });
    setEditingId(item.id);
    setCreating(false);
    setError('');
  };
  const cancel = () => {
    setEditingId(null);
    setCreating(false);
    setDraft(null);
    setError('');
  };

  const patch = (p: Partial<T>) => setDraft((d) => (d ? { ...d, ...p } : d));

  const commit = async () => {
    if (!draft) return;
    const problem = scaffold.validate(draft);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError('');
    const ok = await scaffold.save(draft, creating);
    setSaving(false);
    if (ok) cancel();
    else setError('Could not save — check your input and try again.');
  };

  useEffect(() => {
    commitRef.current = draft ? () => { void commit(); } : null;
    reportSave({ canSave: !!draft, saving });
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-low)' }}>
          {scaffold.items.length} {scaffold.section === 'experience' ? 'entries' : 'items'}
        </span>
        {!editingId && (
          <button className="btn-accent text-[11px] !py-1.5" onClick={startNew}>
            <Plus size={12} /> Add {scaffold.section === 'experience' ? 'entry' : 'item'}
          </button>
        )}
      </div>

      {editingId && draft ? (
        <div className="rounded-xl p-3 border space-y-3" style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-end">
            <button className="btn-ghost text-xs !py-1" onClick={cancel} disabled={saving}>Cancel</button>
          </div>
          {scaffold.renderFields(draft, patch)}
          {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}
        </div>
      ) : (
        <div className="space-y-1.5">
          {scaffold.items.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2"
              style={{ background: 'var(--accent-soft)' }}
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate">{scaffold.titleOf(item)}</div>
                <div className="text-[10px] truncate" style={{ color: 'var(--text-low)' }}>{scaffold.subOf(item)}</div>
              </div>
              {scaffold.move && (
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    className="icon-btn w-4 h-4 !text-[9px]"
                    aria-label="Move up"
                    disabled={i === 0}
                    onClick={() => scaffold.move?.(item.id, -1)}
                  >
                    <ArrowUp size={10} />
                  </button>
                  <button
                    className="icon-btn w-4 h-4 !text-[9px]"
                    aria-label="Move down"
                    disabled={i === scaffold.items.length - 1}
                    onClick={() => scaffold.move?.(item.id, 1)}
                  >
                    <ArrowDown size={10} />
                  </button>
                </div>
              )}
              <div className="hidden @md:block shrink-0">{scaffold.renderRowMeta(item)}</div>
              <button className="icon-btn w-6 h-6 shrink-0" aria-label="Edit" onClick={() => startEdit(item)}>
                <Pencil size={11} />
              </button>
              <button
                className="icon-btn w-6 h-6 shrink-0"
                aria-label="Delete"
                style={{ color: '#f87171' }}
                onClick={() => scaffold.remove(item.id)}
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
          {!scaffold.items.length && (
            <p className="text-xs" style={{ color: 'var(--text-low)' }}>Nothing here yet — add one above.</p>
          )}
        </div>
      )}
    </div>
  );
}