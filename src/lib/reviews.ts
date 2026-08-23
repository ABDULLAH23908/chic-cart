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
    author: "Usman Saboor",
    authorMeta: "Local Guide · 13 reviews · 57 photos",
    rating: 5,
    body: "Amazing thrift store! Rex has all the top clothing brands, especially in sportswear. Super impressed with the selection and prices!",
    tag: "General",
    timeLabel: "a year ago",
    sortDate: "2025-08-01",
  },
  {
    id: "g2",
    author: "Muhammad Yasir",
    authorMeta: "Local Guide · 129 reviews · 7 photos",
    rating: 5,
    body: "Imported cloth store in Phase 7 Bahria Town Rawalpindi, sports wear to casual dressing and Jackets. Adidas, Puma, Zara brands under one roof. Very Nice",
    tag: "Jackets",
    timeLabel: "10 months ago",
    sortDate: "2025-10-15",
  },
  {
    id: "g3",
    author: "Yasir Daud",
    authorMeta: "10 reviews",
    rating: 5,
    body: "Great store u can get nice stuff in shorts and Jeans and T Shirts also regular shirts. Price is really reasonable and great management. Highly recommended 👌",
    tag: "General",
    timeLabel: "a year ago",
    sortDate: "2025-07-20",
  },
  {
    id: "g4",
    author: "SANA SAEED",
    authorMeta: "2 reviews",
    rating: 5,
    body: "I'm obsessed with this brand! Their clothes are stylish, comfortable, and affordable. I've already recommended them to all my friends. The fabric is breathable, and the design is stunning.",
    tag: "General",
    timeLabel: "a year ago",
    sortDate: "2025-07-10",
  },
  {
    id: "g5",
    author: "Wajahat Anjum",
    authorMeta: "3 reviews · 1 photo",
    rating: 5,
    body: "Prices are super affordable with top notch quality branded cloths. U can find T shirts, casual shirts, jeans trousers etc. Highly recommended",
    tag: "General",
    timeLabel: "a year ago",
    sortDate: "2025-07-01",
  },
  {
    id: "g6",
    author: "adeel malik",
    authorMeta: "1 review",
    rating: 5,
    body: "The store has almost all well known 100% original brands at unbelievable reasonable prices. Must visit",
    tag: "General",
    timeLabel: "a year ago",
    sortDate: "2025-06-20",
  },
  {
    id: "g7",
    author: "Ali Mir",
    authorMeta: "4 reviews",
    rating: 5,
    body: "Its great and good quality. Kind and humble staff, and you will get best things in reasonable price.",
    tag: "General",
    timeLabel: "a year ago",
    sortDate: "2025-06-10",
  },
  {
    id: "g8",
    author: "mubasher hussain",
    authorMeta: "1 review",
    rating: 5,
    body: "Great experience 👍",
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

