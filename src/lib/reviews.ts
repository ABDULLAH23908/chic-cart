export type Review = {
  id: string;
  author: string;
  authorMeta: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  tag: "Jackets" | "General";
  timeLabel: string;
  /** Used for "Newest" sorting; approximate is fine for seeded reviews. */
  sortDate: string;
  photo?: string | null;
  isUserSubmitted?: boolean;
};

/** Real reviews pulled from Google Business Profile. Do not remove without owner sign-off. */
export const SEED_REVIEWS: Review[] = [
  {
    id: "g1",
    author: "hammad hassan",
    authorMeta: "1 review",
    rating: 5,
    body: "One of the best thrift stores in town. Prices and dealing of the shopkeeper is excellent. Keep it up 👍",
    tag: "General",
    timeLabel: "a year ago",
    sortDate: "2025-08-01",
  },
  {
    id: "g2",
    author: "Zubair Khan",
    authorMeta: "Local Guide · 2 reviews · 76 photos",
    rating: 5,
    body: "Best quality of shirts and trousers ❤️",
    tag: "General",
    timeLabel: "a year ago",
    sortDate: "2025-07-20",
  },
  {
    id: "g3",
    author: "Usman Saboor",
    authorMeta: "Local Guide · 13 reviews · 57 photos",
    rating: 5,
    body: "Amazing shop, visited many times",
    tag: "General",
    timeLabel: "a year ago",
    sortDate: "2025-07-15",
  },
  {
    id: "g4",
    author: "Nosheen Asif",
    authorMeta: "1 review",
    rating: 5,
    body: "Very good experience. Highly recommend",
    tag: "General",
    timeLabel: "a year ago",
    sortDate: "2025-07-10",
  },
  {
    id: "g5",
    author: "Aqib Majeed",
    authorMeta: "1 review",
    rating: 5,
    body: "Excellent quality of Jackets with reasonable price",
    tag: "Jackets",
    timeLabel: "a year ago",
    sortDate: "2025-07-05",
  },
  {
    id: "g6",
    author: "Wajahat Anjum",
    authorMeta: "3 reviews · 1 photo",
    rating: 5,
    body: "Really nice stuff in reasonable prices",
    tag: "General",
    timeLabel: "a year ago",
    sortDate: "2025-06-28",
  },
  {
    id: "g7",
    author: "Umair Saeed",
    authorMeta: "Local Guide · 5 reviews · 1 photo",
    rating: 5,
    body: "Excellent shop for jackets",
    tag: "Jackets",
    timeLabel: "a year ago",
    sortDate: "2025-06-20",
  },
  {
    id: "g8",
    author: "Imran Alam",
    authorMeta: "1 review",
    rating: 5,
    body: "Great experience 👍",
    tag: "General",
    timeLabel: "a year ago",
    sortDate: "2025-06-12",
  },
  {
    id: "g9",
    author: "ali raza",
    authorMeta: "",
    rating: 5,
    body: "",
    tag: "General",
    timeLabel: "a year ago",
    sortDate: "2025-06-01",
  },
];

export type ReviewFilter = "All" | "Jackets";
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

import { supabase } from "@/integrations/supabase/client";

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

/** User-submitted reviews now live in the backend. */
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
    tag: (r.tag === "Jackets" ? "Jackets" : "General") as Review["tag"],
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
  tag: "Jackets" | "General";
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
    tag: (data.tag === "Jackets" ? "Jackets" : "General") as Review["tag"],
    timeLabel: "Just now",
    sortDate: data.created_at,
    photo: data.photo,
    isUserSubmitted: true,
  };
}

