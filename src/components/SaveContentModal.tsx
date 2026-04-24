import { useState, useEffect, KeyboardEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useContentStore, ContentItem } from "@/stores/contentStore";
import { useSSEStore } from "@/stores/sseStore";
import { toast } from "sonner";

interface SaveContentModalProps {
  open: boolean;
  onClose: () => void;
  initialTag?: string;
}

export function SaveContentModal({
  open,
  onClose,
  initialTag,
}: SaveContentModalProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialTag ? [initialTag] : []);
  const [loading, setLoading] = useState(false);
  const addItem = useContentStore((s) => s.addItem);
  const items = useContentStore((s) => s.items);
  const incrementPending = useSSEStore((s) => s.incrementPending);

  useEffect(() => {
    if (open) {
      setUrl("");
      setTitle("");
      setTagInput("");
      setTags(initialTag ? [initialTag] : []);
    }
  }, [open, initialTag]);

  const existingTags = [
    ...new Set(items.flatMap((i) => i.tags.map((t) => t.name))),
  ];
  const filteredSuggestions = tagInput
    ? existingTags
        .filter(
          (t) =>
            t.toLowerCase().includes(tagInput.toLowerCase()) &&
            !tags.includes(t),
        )
        .slice(0, 5)
    : [];

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) setTags([...tags, trimmed]);
    setTagInput("");
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await apiFetch<{ data: ContentItem }>("/api/v1/content", {
        method: "POST",
        body: JSON.stringify({ title: title || url, link: url, tags }),
      });
      const newItem: any = res.data;
      addItem({
        _id: newItem._id || newItem.id,
        status: "pending",
        tags: tags.map((t) => ({ name: t })),
        contentType: "unknown",
        createdAt: new Date().toISOString(),
        title: title || url,
        link: url,
        suggestedTopics: [],
      } as ContentItem);
      incrementPending();
      toast.success("Saved! AI is processing...");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save to Brain</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="save-url">URL</Label>
            <Input
              id="save-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              autoFocus
              required
              className="bg-secondary border-border font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="save-title">Title (optional)</Label>
            <Input
              id="save-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter((t) => t !== tag))}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type tag + Enter"
                className="bg-secondary border-border"
              />
              {filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50">
                  {filteredSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
                      onClick={() => addTag(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !url.trim()}
          >
            {loading ? "Saving..." : "Save to Brain"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
