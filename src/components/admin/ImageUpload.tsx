import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { uploadMedia } from "@/lib/admin/upload";

export function ImageUpload({
  value,
  onChange,
  folder = "uploads",
  hint,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  hint?: string | null;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handle = async (file: File) => {
    setUploading(true); setErr(null);
    try {
      const url = await uploadMedia(file, folder);
      onChange(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally { setUploading(false); }
  };

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-32 w-48 object-cover rounded-md border" />
          <button type="button" onClick={() => onChange(null)} className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground grid place-items-center shadow"><X className="h-3.5 w-3.5" /></button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 h-32 w-48 rounded-md border-2 border-dashed cursor-pointer hover:bg-secondary text-sm text-muted-foreground">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading..." : "Upload image"}
          <input
            type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }}
          />
        </label>
      )}
      {hint && (
        <div className="text-xs text-muted-foreground mt-1.5">
          Recommended: <span className="font-medium text-foreground">{hint}</span>
        </div>
      )}
      {err && <div className="text-xs text-destructive mt-1">{err}</div>}
    </div>
  );
}
