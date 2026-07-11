// Placeholder content for the Coterie homepage.
// All images are vendored locally in /public/img so the site is fully
// self-contained — no external image host, no API key, works offline.
// Swap these for real member uploads when wiring up the backend.

export type FeedPost = {
  id: string;
  author: string;
  handle: string;
  community: string;
  avatar: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
};

export const feed: FeedPost[] = [
  {
    id: "p1",
    author: "Mara Ellison",
    handle: "maraclay",
    community: "Slow Ceramics",
    avatar: "/img/avatar-p1.jpg",
    image: "/img/post-p1.jpg",
    caption:
      "First firing of the new stoneware glaze. Little bubbles = happy accidents.",
    likes: 342,
    comments: 28,
  },
  {
    id: "p2",
    author: "Devon Park",
    handle: "devonrides",
    community: "Rando Cyclists",
    avatar: "/img/avatar-p2.jpg",
    image: "/img/post-p2.jpg",
    caption:
      "600km brevet done. The checkpoint at dawn had the best coffee of my life.",
    likes: 511,
    comments: 44,
  },
  {
    id: "p3",
    author: "Yuki Tan",
    handle: "yukibakes",
    community: "Sourdough Club",
    avatar: "/img/avatar-p3.jpg",
    image: "/img/post-p3.jpg",
    caption:
      "72-hour cold ferment. The crumb finally opened up the way I wanted.",
    likes: 890,
    comments: 73,
  },
  {
    id: "p4",
    author: "Ismael R.",
    handle: "ismaelplants",
    community: "Rare Aroids",
    avatar: "/img/avatar-p4.jpg",
    image: "/img/post-p4.jpg",
    caption:
      "New leaf unfurling on the variegated monstera. Worth the two-year wait.",
    likes: 1204,
    comments: 96,
  },
  {
    id: "p5",
    author: "Priya N.",
    handle: "priyathreads",
    community: "Natural Dyers",
    avatar: "/img/avatar-p5.jpg",
    image: "/img/post-p5.jpg",
    caption: "Marigold + madder → the softest blush. Nature does not miss.",
    likes: 402,
    comments: 31,
  },
  {
    id: "p6",
    author: "Theo B.",
    handle: "theowoodshop",
    community: "Hand Tool Woodwork",
    avatar: "/img/avatar-p6.jpg",
    image: "/img/post-p6.jpg",
    caption: "Wrapped and ready to ship — hand-cut, no jig. Grandad would approve.",
    likes: 733,
    comments: 52,
  },
  {
    id: "p7",
    author: "Lena K.",
    handle: "lenafilm",
    community: "35mm Wanderers",
    avatar: "/img/avatar-p7.jpg",
    image: "/img/post-p7.jpg",
    caption: "Shot on Portra 400 under the Milky Way. Nothing beats the grain.",
    likes: 967,
    comments: 61,
  },
  {
    id: "p8",
    author: "Sam O.",
    handle: "samscent",
    community: "Small-Batch Perfume",
    avatar: "/img/avatar-p8.jpg",
    image: "/img/post-p8.jpg",
    caption:
      "Fig + cedar candles poured. Scent samples going out to the group this week.",
    likes: 288,
    comments: 19,
  },
];

export type Product = {
  id: string;
  title: string;
  maker: string;
  community: string;
  price: string;
  image: string;
  tag?: string;
};

export const products: Product[] = [
  {
    id: "m1",
    title: "Speckled stoneware set",
    maker: "Mara Ellison",
    community: "Slow Ceramics",
    price: "$38",
    image: "/img/product-m1.jpg",
    tag: "New",
  },
  {
    id: "m2",
    title: "Fig & cedar botanical blend",
    maker: "Sam O.",
    community: "Small-Batch Perfume",
    price: "$64",
    image: "/img/product-m2.jpg",
    tag: "Trending",
  },
  {
    id: "m3",
    title: "Naturally dyed silk scarf",
    maker: "Priya N.",
    community: "Natural Dyers",
    price: "$52",
    image: "/img/product-m3.jpg",
  },
  {
    id: "m4",
    title: "Hand-cut walnut shelf",
    maker: "Theo B.",
    community: "Hand Tool Woodwork",
    price: "$120",
    image: "/img/product-m4.jpg",
    tag: "Almost gone",
  },
  {
    id: "m5",
    title: "Wild sourdough starter kit",
    maker: "Yuki Tan",
    community: "Sourdough Club",
    price: "$18",
    image: "/img/product-m5.jpg",
  },
  {
    id: "m6",
    title: "Riso-printed adventure map",
    maker: "Devon Park",
    community: "Rando Cyclists",
    price: "$24",
    image: "/img/product-m6.jpg",
  },
];

export type Community = {
  id: string;
  name: string;
  members: string;
  blurb: string;
  cover: string;
};

export const communities: Community[] = [
  {
    id: "c1",
    name: "Slow Ceramics",
    members: "4.2k",
    blurb: "Wheel-throwing, glaze chemistry, and kiln logs.",
    cover: "/img/community-c1.jpg",
  },
  {
    id: "c2",
    name: "Sourdough Club",
    members: "12.8k",
    blurb: "Starters, crumb shots, and hydration debates.",
    cover: "/img/community-c2.jpg",
  },
  {
    id: "c3",
    name: "35mm Wanderers",
    members: "7.6k",
    blurb: "Film photography, on foot, one roll at a time.",
    cover: "/img/community-c3.jpg",
  },
  {
    id: "c4",
    name: "Rare Aroids",
    members: "9.1k",
    blurb: "Propagation, swaps, and unreasonable leaf love.",
    cover: "/img/community-c4.jpg",
  },
];
