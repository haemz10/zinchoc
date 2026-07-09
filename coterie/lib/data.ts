// Placeholder content for the Coterie homepage.
// Images are served from Unsplash (single-host, no redirect) so the feed renders
// reliably without an API key. Swap these for real member uploads when wiring
// up the backend.

const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&q=80&auto=format&fit=crop`;

const face = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=96&h=96&q=80&auto=format&fit=crop`;

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
    avatar: face("1494790108377-be9c29b29330"),
    image: photo("1493106641515-6b5631de4bb9", 600, 780),
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
    avatar: face("1500648767791-00dcc994a43e"),
    image: photo("1519160558534-579f5106e43f", 600, 600),
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
    avatar: face("1534528741775-53994a69daeb"),
    image: photo("1509440159596-0249088772ff", 600, 760),
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
    avatar: face("1507003211169-0a1dd7228f2d"),
    image: photo("1466692476868-aef1dfb1e735", 600, 600),
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
    avatar: face("1438761681033-6461ffad8d80"),
    image: photo("1490750967868-88aa4486c946", 600, 820),
    caption: "Marigold + madder → the softest blush. Nature does not miss.",
    likes: 402,
    comments: 31,
  },
  {
    id: "p6",
    author: "Theo B.",
    handle: "theowoodshop",
    community: "Hand Tool Woodwork",
    avatar: face("1531123897727-8f129e1688ce"),
    image: photo("1512909006721-3d6018887383", 600, 600),
    caption: "Wrapped and ready to ship — hand-cut, no jig. Grandad would approve.",
    likes: 733,
    comments: 52,
  },
  {
    id: "p7",
    author: "Lena K.",
    handle: "lenafilm",
    community: "35mm Wanderers",
    avatar: face("1544005313-94ddf0286df2"),
    image: photo("1519681393784-d120267933ba", 600, 800),
    caption: "Shot on Portra 400 under the Milky Way. Nothing beats the grain.",
    likes: 967,
    comments: 61,
  },
  {
    id: "p8",
    author: "Sam O.",
    handle: "samscent",
    community: "Small-Batch Perfume",
    avatar: face("1502685104226-ee32379fefbe"),
    image: photo("1602523961358-f9f03dd557db", 600, 600),
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
    image: photo("1534349762230-e0cadf78f5da", 600, 600),
    tag: "New",
  },
  {
    id: "m2",
    title: "Fig & cedar botanical blend",
    maker: "Sam O.",
    community: "Small-Batch Perfume",
    price: "$64",
    image: photo("1502741224143-90386d7f8c82", 600, 600),
    tag: "Trending",
  },
  {
    id: "m3",
    title: "Naturally dyed silk scarf",
    maker: "Priya N.",
    community: "Natural Dyers",
    price: "$52",
    image: photo("1441986300917-64674bd600d8", 600, 600),
  },
  {
    id: "m4",
    title: "Hand-cut walnut shelf",
    maker: "Theo B.",
    community: "Hand Tool Woodwork",
    price: "$120",
    image: photo("1513694203232-719a280e022f", 600, 600),
    tag: "Almost gone",
  },
  {
    id: "m5",
    title: "Wild sourdough starter kit",
    maker: "Yuki Tan",
    community: "Sourdough Club",
    price: "$18",
    image: photo("1416879595882-3373a0480b5b", 600, 600),
  },
  {
    id: "m6",
    title: "Riso-printed adventure map",
    maker: "Devon Park",
    community: "Rando Cyclists",
    price: "$24",
    image: photo("1500534623283-312aade485b7", 600, 600),
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
    cover: photo("1493106641515-6b5631de4bb9", 600, 400),
  },
  {
    id: "c2",
    name: "Sourdough Club",
    members: "12.8k",
    blurb: "Starters, crumb shots, and hydration debates.",
    cover: photo("1509440159596-0249088772ff", 600, 400),
  },
  {
    id: "c3",
    name: "35mm Wanderers",
    members: "7.6k",
    blurb: "Film photography, on foot, one roll at a time.",
    cover: photo("1509233725247-49e657c54213", 600, 400),
  },
  {
    id: "c4",
    name: "Rare Aroids",
    members: "9.1k",
    blurb: "Propagation, swaps, and unreasonable leaf love.",
    cover: photo("1485955900006-10f4d324d411", 600, 400),
  },
];
