"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  PlusCircle,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  X,
  Save,
  Globe,
  Film,
} from "lucide-react";
import { toast } from "sonner";
import type { Disclaimer, DisclaimerPlacement } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { adminApi } from "@/lib/admin-api";

const EMPTY = { placement: "site" as DisclaimerPlacement, body: "", is_active: true };
type FormState = typeof EMPTY;

export function DisclaimerManager({ initial }: { initial: Disclaimer[] }) {
  const [items, setItems] = useState<Disclaimer[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Disclaimer | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Disclaimer | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  }
  function openEdit(d: Disclaimer) {
    setEditing(d);
    setForm({ placement: d.placement, body: d.body, is_active: d.is_active });
    setShowForm(true);
  }

  async function save() {
    if (!form.body.trim()) {
      toast.error("Disclaimer text is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        placement: form.placement,
        body: form.body.trim(),
        is_active: form.is_active,
      };
      if (editing) {
        const updated = await adminApi.updateDisclaimer(editing.id, payload);
        setItems((l) => l.map((d) => (d.id === updated.id ? updated : d)));
        toast.success("Disclaimer updated");
      } else {
        const created = await adminApi.createDisclaimer(payload);
        setItems((l) => [...l, created]);
        toast.success("Disclaimer added");
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(d: Disclaimer) {
    try {
      const updated = await adminApi.updateDisclaimer(d.id, {
        placement: d.placement,
        body: d.body,
        is_active: !d.is_active,
      });
      setItems((l) => l.map((x) => (x.id === updated.id ? updated : x)));
    } catch {
      toast.error("Failed to update");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteDisclaimer(deleteTarget.id);
      setItems((l) => l.filter((d) => d.id !== deleteTarget.id));
      toast.success("Disclaimer deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Legal
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Disclaimers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Site disclaimers show in the footer. Anime disclaimers show at the end of every anime page.
          </p>
        </div>
        <Button onClick={openNew}>
          <PlusCircle className="h-4 w-4" /> New disclaimer
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold">No disclaimers yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add a legal disclaimer for your footer or anime pages.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 shadow-float"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {d.placement === "site" ? <Globe className="h-4 w-4" /> : <Film className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {d.placement === "site" ? "Footer" : "Anime pages"}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      d.is_active ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {d.is_active ? "Live" : "Off"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{d.body}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => toggleActive(d)}>
                  {d.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(d)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(d)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => !saving && setShowForm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-float"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                {editing ? "Edit disclaimer" : "New disclaimer"}
              </h2>
              <button
                onClick={() => !saving && setShowForm(false)}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="mb-1.5 block text-sm font-medium">Where to show</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["site", "anime"] as DisclaimerPlacement[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setForm((f) => ({ ...f, placement: p }))}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                        form.placement === p
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {p === "site" ? <Globe className="h-4 w-4" /> : <Film className="h-4 w-4" />}
                      {p === "site" ? "Footer" : "Anime pages"}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Disclaimer text</span>
                <Textarea
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="All content is provided by third parties. This site does not host any files…"
                  className="min-h-[140px]"
                />
              </label>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Show this disclaimer</p>
                </div>
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowForm(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editing ? "Save changes" : "Add disclaimer"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete disclaimer?"
        description="This disclaimer will be removed. This cannot be undone."
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
