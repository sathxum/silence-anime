"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  PlusCircle,
  Pencil,
  Trash2,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  X,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import type { Popup } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { adminApi } from "@/lib/admin-api";

const EMPTY = {
  title: "",
  body: "",
  image_url: "",
  link_url: "",
  link_label: "Learn more",
  dismiss_after_seconds: 4,
  is_active: true,
};

type FormState = typeof EMPTY;

function toForm(p: Popup): FormState {
  return {
    title: p.title ?? "",
    body: p.body ?? "",
    image_url: p.image_url ?? "",
    link_url: p.link_url ?? "",
    link_label: p.link_label ?? "Learn more",
    dismiss_after_seconds: p.dismiss_after_seconds ?? 4,
    is_active: p.is_active,
  };
}

export function PopupManager({ initialPopups }: { initialPopups: Popup[] }) {
  const [popups, setPopups] = useState<Popup[]>(initialPopups);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Popup | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Popup | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  function openEdit(p: Popup) {
    setEditing(p);
    setForm(toForm(p));
    setShowForm(true);
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    if (!form.title.trim() && !form.body.trim()) {
      toast.error("Add a title or some text for the popup");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        image_url: form.image_url.trim(),
        link_url: form.link_url.trim(),
        link_label: form.link_label.trim() || "Learn more",
        dismiss_after_seconds: Math.min(10, Math.max(1, Number(form.dismiss_after_seconds) || 4)),
        is_active: form.is_active,
      };
      if (editing) {
        const updated = await adminApi.updatePopup(editing.id, payload);
        setPopups((list) => list.map((p) => (p.id === updated.id ? updated : p)));
        toast.success("Popup updated");
      } else {
        const created = await adminApi.createPopup(payload);
        setPopups((list) => [...list, created]);
        toast.success("Popup created");
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save popup");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(p: Popup) {
    try {
      const updated = await adminApi.updatePopup(p.id, {
        title: p.title,
        body: p.body,
        image_url: p.image_url ?? "",
        link_url: p.link_url ?? "",
        link_label: p.link_label,
        dismiss_after_seconds: p.dismiss_after_seconds,
        is_active: !p.is_active,
      });
      setPopups((list) => list.map((x) => (x.id === updated.id ? updated : x)));
    } catch {
      toast.error("Failed to update");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deletePopup(deleteTarget.id);
      setPopups((list) => list.filter((p) => p.id !== deleteTarget.id));
      toast.success("Popup deleted");
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
            Notifications
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Popups
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Shown one-by-one when a visitor opens the site. A close button appears after the delay you set.
          </p>
        </div>
        <Button onClick={openNew}>
          <PlusCircle className="h-4 w-4" /> New popup
        </Button>
      </div>

      {popups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Bell className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold">No popups yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create your first popup notification. Visitors will see it the moment they open your site.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {popups.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-float"
            >
              {p.image_url && (
                <div className="relative h-32 w-full overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold">{p.title || "Untitled popup"}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      p.is_active
                        ? "bg-emerald-500/15 text-emerald-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.is_active ? "Live" : "Off"}
                  </span>
                </div>
                {p.body && (
                  <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{p.body}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> close after {p.dismiss_after_seconds}s
                  </span>
                  {p.link_url && (
                    <span className="inline-flex items-center gap-1">
                      <ExternalLink className="h-3.5 w-3.5" /> {p.link_label}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                  <Button size="sm" variant="ghost" onClick={() => toggleActive(p)}>
                    {p.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {p.is_active ? "Disable" : "Enable"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(p)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Editor modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => !saving && setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-float"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">
                  {editing ? "Edit popup" : "New popup"}
                </h2>
                <button
                  onClick={() => !saving && setShowForm(false)}
                  className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <Field label="Title">
                  <Input
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="e.g. Join our Telegram"
                  />
                </Field>
                <Field label="Message">
                  <Textarea
                    value={form.body}
                    onChange={(e) => update("body", e.target.value)}
                    placeholder="Details visitors should see…"
                  />
                </Field>
                <Field label="Image URL (optional)">
                  <Input
                    value={form.image_url}
                    onChange={(e) => update("image_url", e.target.value)}
                    placeholder="https://…/banner.jpg"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Button link (optional)">
                    <Input
                      value={form.link_url}
                      onChange={(e) => update("link_url", e.target.value)}
                      placeholder="https://t.me/…"
                    />
                  </Field>
                  <Field label="Button label">
                    <Input
                      value={form.link_label}
                      onChange={(e) => update("link_label", e.target.value)}
                      placeholder="Learn more"
                    />
                  </Field>
                </div>
                <Field label={`Close button appears after: ${form.dismiss_after_seconds}s (max 10s)`}>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={form.dismiss_after_seconds}
                    onChange={(e) => update("dismiss_after_seconds", Number(e.target.value))}
                    className="w-full accent-[hsl(var(--primary))]"
                  />
                </Field>
                <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-xs text-muted-foreground">Show this popup to visitors</p>
                  </div>
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => update("is_active", v)}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowForm(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={save} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editing ? "Save changes" : "Create popup"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete popup?"
        description="This popup will no longer be shown to visitors. This cannot be undone."
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
