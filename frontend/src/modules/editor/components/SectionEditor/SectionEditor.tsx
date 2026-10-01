import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ListTree, Pencil, Plus, Trash2 } from 'lucide-react';
import CompactPageHero from '@/components/ui/CompactPageHero/CompactPageHero';
import CompactRow from '@/components/ui/CompactRow/CompactRow';
import {
  newId,
  SECTION_LABELS,
  SECTION_UNIT,
  type SaveBridge,
  type SectionScaffold,
  type BaseItem,
} from '@/modules/editor/lib/scaffolding';

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
      <CompactPageHero
        icon={scaffold.icon ?? <ListTree size={18} />}
        title={SECTION_LABELS[scaffold.section]}
        subtitle={editingId ? `Editing a ${SECTION_UNIT(scaffold.section)}` : 'Add, reorder and remove entries'}
        badge={`${scaffold.items.length}`}
        actions={
          !editingId && (
            <button className="btn-accent text-[11px] !py-1.5" onClick={startNew}>
              <Plus size={12} /> Add {SECTION_UNIT(scaffold.section)}
            </button>
          )
        }
      />

      {editingId && draft ? (
        <div className="rounded-xl p-3 border space-y-3" style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-end">
            <button className="btn-ghost text-xs !py-1" onClick={cancel} disabled={saving}>Cancel</button>
          </div>
          {scaffold.renderFields(draft, patch)}
          {error && <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>}
        </div>
      ) : (
        <div className="space-y-1.5">
          {scaffold.items.map((item, i) => (
            <CompactRow
              key={item.id}
              icon={scaffold.rowIcon ? scaffold.rowIcon(item) : scaffold.icon ?? <ListTree size={14} />}
              title={
                <>
                  <h4>{scaffold.titleOf(item)}</h4>
                  <span className="min-w-0 truncate text-[10px]" style={{ color: 'var(--text-low)' }}>
                    {scaffold.subOf(item)}
                  </span>
                </>
              }
              meta={scaffold.renderRowMeta(item)}
              actions={
                <>
                  {scaffold.move && (
                    <>
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
                    </>
                  )}
                  <button className="icon-btn w-6 h-6 shrink-0" aria-label="Edit" onClick={() => startEdit(item)}>
                    <Pencil size={11} />
                  </button>
                  <button
                    className="icon-btn w-6 h-6 shrink-0"
                    aria-label="Delete"
                    style={{ color: 'var(--error)' }}
                    onClick={() => scaffold.remove(item.id)}
                  >
                    <Trash2 size={11} />
                  </button>
                </>
              }
            />
          ))}
          {!scaffold.items.length && (
            <p className="text-xs" style={{ color: 'var(--text-low)' }}>Nothing here yet — add one above.</p>
          )}
        </div>
      )}
    </div>
  );
}