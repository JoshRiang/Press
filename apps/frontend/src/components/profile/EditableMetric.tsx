import { useState } from "react";
import { Edit3, Check, X } from "lucide-react";

export function EditableMetric({
  label,
  value,
  unit,
  onSave,
}: {
  label: string;
  value: number;
  unit: string;
  onSave: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));

  const handleSave = () => {
    const num = parseFloat(editValue);
    if (!isNaN(num) && num > 0) {
      onSave(num);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(value));
    setEditing(false);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[9px] font-medium tracking-wider text-slate-600 uppercase">
          {label}
        </p>
        {!editing ? (
          <button
            onClick={() => {
              setEditValue(String(value));
              setEditing(true);
            }}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-slate-600 transition-colors hover:bg-slate-800 hover:text-slate-400"
          >
            <Edit3 size={10} />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className="rounded p-0.5 text-emerald-400 hover:bg-emerald-500/10"
            >
              <Check size={12} />
            </button>
            <button
              onClick={handleCancel}
              className="rounded p-0.5 text-red-400 hover:bg-red-500/10"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="flex items-baseline gap-1">
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            className="w-20 bg-transparent font-mono text-xl font-bold text-sky-400 outline-none border-b border-sky-400/30 focus:border-sky-400"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
          <span className="font-mono text-sm text-slate-500">{unit}</span>
        </div>
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-xl font-bold text-slate-200">{value}</span>
          <span className="font-mono text-sm text-slate-500">{unit}</span>
        </div>
      )}
    </div>
  );
}
