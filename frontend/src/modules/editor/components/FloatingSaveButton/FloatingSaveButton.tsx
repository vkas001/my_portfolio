import { LoaderCircle } from 'lucide-react';

export default function FloatingSaveButton({ canSave, saving, onSave }: { canSave: boolean; saving: boolean; onSave: () => void }) {
  return (
    <button
      onClick={onSave}
      disabled={!canSave || saving}
      className="absolute right-3 bottom-3 z-10 btn-accent text-xs !px-4 !py-2 rounded-full shadow-lg cursor-pointer transition-opacity"
      style={{ opacity: canSave && !saving ? 1 : 0.6 }}
    >
      {saving ? <LoaderCircle size={13} className="animate-spin" /> : null}
      {saving ? 'Saving…' : 'Save'}
    </button>
  );
}