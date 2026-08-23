import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Star, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  SEED_REVIEWS,
  averageRating,
  fetchUserReviews,
  filterReviews,
  sortReviews,
  submitUserReview,
  type Review,
  type ReviewFilter,
  type ReviewSort,
} from "@/lib/reviews";


const FILTERS: ReviewFilter[] = ["All", "Jackets"];
const SORTS: { value: ReviewSort; label: string }[] = [
  { value: "relevant", label: "Most relevant" },
  { value: "newest", label: "Newest" },
  { value: "highest", label: "Highest" },
  { value: "lowest", label: "Lowest" },
];

function Stars({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} ${i < rating ? "fill-foreground text-foreground" : "text-border"}`}
        />
      ))}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ReviewsSection() {
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<ReviewFilter>("All");
  const [sort, setSort] = useState<ReviewSort>("relevant");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void fetchUserReviews().then(setUserReviews);
  }, []);

  const allReviews = useMemo(() => [...userReviews, ...SEED_REVIEWS], [userReviews]);
  const visible = useMemo(
    () => sortReviews(filterReviews(allReviews, filter), sort),
    [allReviews, filter, sort],
  );
  const avg = useMemo(() => averageRating(allReviews), [allReviews]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase sm:text-4xl">Reviews</h2>
          <div className="mt-3 flex items-center gap-3">
            <Stars rating={Math.round(avg)} size="h-5 w-5" />
            <span className="font-display text-lg font-black">{avg.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({allReviews.length} review{allReviews.length === 1 ? "" : "s"})
            </span>
          </div>
        </div>

        <WriteReviewDialog
          open={open}
          onOpenChange={setOpen}
          onSubmitted={(review) => {
            setUserReviews((prev) => [review, ...prev]);
            setOpen(false);
            toast.success("Thanks for your review!");
          }}
        />

      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                "label-caps border px-4 py-2 transition-colors " +
                (filter === f
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground")
              }
            >
              {f}
            </button>
          ))}
        </div>

        <label className="label-caps flex items-center gap-2 text-muted-foreground">
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as ReviewSort)}
            className="border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground uppercase"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => (
            <article key={r.id} className="flex flex-col gap-3 border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="label-caps grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-foreground">
                  {initials(r.author)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{r.author}</p>
                  {r.authorMeta && (
                    <p className="truncate text-xs text-muted-foreground">{r.authorMeta}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Stars rating={r.rating} />
                <span className="text-xs text-muted-foreground">{r.timeLabel}</span>
              </div>

              {r.body && <p className="text-sm leading-relaxed text-foreground/90">{r.body}</p>}

              {r.photo && (
                <img
                  src={r.photo}
                  alt={`Photo from ${r.author}'s review`}
                  className="mt-1 h-40 w-full border border-border object-cover"
                />
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-8 border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No reviews match this filter yet.
        </p>
      )}
    </section>
  );
}

function WriteReviewDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (review: Review) => void;
}) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<"Jackets" | "General">("General");
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setName("");
    setRating(5);
    setBody("");
    setTag("General");
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please attach an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!name.trim() || !body.trim()) {
      toast.error("Please add your name and a short review");
      return;
    }
    onSubmit({
      id: `user-${Date.now()}`,
      author: name.trim(),
      authorMeta: "1 review",
      rating: rating as Review["rating"],
      body: body.trim(),
      tag,
      timeLabel: "Just now",
      sortDate: new Date().toISOString(),
      photo,
      isUserSubmitted: true,
    });
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="label-caps">Write a review</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase">Write a review</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="review-name">Your name</Label>
            <Input
              id="review-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ayesha Khan"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = i + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  >
                    <Star
                      className={`h-7 w-7 ${
                        value <= rating ? "fill-foreground text-foreground" : "text-border"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>What's it about?</Label>
            <div className="flex gap-2">
              {(["General", "Jackets"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={
                    "label-caps border px-3 py-1.5 text-xs " +
                    (tag === t
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground")
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="review-body">Your review</Label>
            <Textarea
              id="review-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Add a photo (optional)</Label>
            {photo ? (
              <div className="relative w-fit">
                <img src={photo} alt="Attached preview" className="h-28 w-28 border border-border object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="absolute -top-2 -right-2 rounded-full bg-foreground p-1 text-background"
                  aria-label="Remove photo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="label-caps flex h-28 w-28 flex-col items-center justify-center gap-1.5 border border-dashed border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              >
                <Camera className="h-5 w-5" />
                Add photo
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          <Button onClick={handleSubmit} className="label-caps mt-2">
            Submit review
          </Button>
          <p className="text-xs text-muted-foreground">
            Your review is saved on this device and shown alongside our Google reviews.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
