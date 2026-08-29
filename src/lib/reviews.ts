import { supabase } from "@/integrations/supabase/client";

export type Review = {
  id: string;
  author: string;
  authorMeta: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  tag: ReviewTag;
  timeLabel: string;
  /** Used for "Newest" sorting. */
  sortDate: string;
  photo?: string | null;
  isUserSubmitted?: boolean;
};

/** Empty seeded reviews array. */
export const SEED_REVIEWS: Review[] = [];

export type ReviewTag = "General" | "Nike" | "Adidas";
export const REVIEW_TAGS: ReviewTag[] = ["General", "Nike", "Adidas"];
export type ReviewFilter = "All" | "Nike" | "Adidas";
export type ReviewSort = "relevant" | "newest" | "highest" | "lowest";

export function filterReviews(reviews: Review[], filter: ReviewFilter) {
  if (filter === "All") return reviews;
  return reviews.filter((r) => r.tag === filter);
}

export function sortReviews(reviews: Review[], sort: ReviewSort) {
  const copy = [...reviews];
  switch (sort) {
    case "newest":
      return copy.sort((a, b) => +new Date(b.sortDate) - +new Date(a.sortDate));
    case "highest":
      return copy.sort((a, b) => b.rating - a.rating);
    case "lowest":
      return copy.sort((a, b) => a.rating - b.rating);
    default:
      return copy;
  }
}

export function averageRating(reviews: Review[]) {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

function normalizeTag(tag: string): ReviewTag {
  return REVIEW_TAGS.includes(tag as ReviewTag) ? (tag as ReviewTag) : "General";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  return "a year ago";
}

/** User-submitted reviews live in the backend. */
export async function fetchUserReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, author, rating, body, tag, photo, created_at")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    author: r.author,
    authorMeta: "1 review",
    rating: r.rating as Review["rating"],
    body: r.body,
    tag: normalizeTag(r.tag),
    timeLabel: timeAgo(r.created_at),
    sortDate: r.created_at,
    photo: r.photo,
    isUserSubmitted: true,
  }));
}

export async function submitUserReview(input: {
  author: string;
  rating: number;
  body: string;
  tag: ReviewTag;
  photo?: string | null;
}): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      author: input.author,
      rating: input.rating,
      body: input.body,
      tag: input.tag,
      photo: input.photo ?? null,
    })
    .select("id, author, rating, body, tag, photo, created_at")
    .single();
  if (error || !data) throw error ?? new Error("Could not save review");
  return {
    id: data.id,
    author: data.author,
    authorMeta: "1 review",
    rating: data.rating as Review["rating"],
    body: data.body,
    tag: normalizeTag(data.tag),
    timeLabel: "Just now",
    sortDate: data.created_at,
    photo: data.photo,
    isUserSubmitted: true,
  };
}
