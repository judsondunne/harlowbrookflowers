/**
 * Image asset manifest. Every image on the site is listed here with its source and license.
 * provisional: true = sample photography to be replaced with Sarah's own photos (same path or via /admin).
 * Generated from the files in /public/images; keep it in sync when assets change.
 */
export type AssetEntry = {
  src: string;
  width: number;
  height: number;
  alt: string;
  placement: string;
  source: string;
  photographer: string;
  license: string;
  licenseUrl: string;
  processing: string;
  provisional: boolean;
};

export const assetManifest: AssetEntry[] = [
  {
    "src": "/images/bouquets/garden-bouquet.webp",
    "width": 1800,
    "height": 2117,
    "alt": "A loose bouquet of peach garden roses, coral carnations and pink waxflower in a clear glass vase",
    "placement": "Homepage hero; Garden Bouquet product image",
    "source": "https://unsplash.com/photos/mNEpmNiFdXs",
    "photographer": "Angelina Jollivet",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Background removed (macOS Vision subject lift), trimmed, WebP with alpha",
    "provisional": true
  },
  {
    "src": "/images/bouquets/harlow-brook-bunch.webp",
    "width": 1650,
    "height": 2200,
    "alt": "An abundant arrangement of sunflowers, peach roses, blush hydrangea, delphinium and white stock",
    "placement": "Homepage hero; Harlow Brook Bunch product image",
    "source": "https://unsplash.com/photos/H4HlMihSxs4",
    "photographer": "RP C O N C I E R G E",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Background removed, trimmed, WebP with alpha",
    "provisional": true
  },
  {
    "src": "/images/bouquets/little-posy.webp",
    "width": 1730,
    "height": 2200,
    "alt": "A small wrapped bouquet with lavender scabiosa, cream roses, deep red blooms and silvery dusty miller",
    "placement": "Homepage hero; Little Posy product image",
    "source": "https://unsplash.com/photos/O0YVKmrTPCM",
    "photographer": "Robin Baral",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Background removed, trimmed, WebP with alpha",
    "provisional": true
  },
  {
    "src": "/images/bouquets/season-of-flowers.webp",
    "width": 1800,
    "height": 1268,
    "alt": "An airy cottage bouquet of lilac snapdragons, scabiosa, chamomile and pink astilbe",
    "placement": "Homepage hero; A Season of Flowers product image; 404 page",
    "source": "https://unsplash.com/photos/wxXLoKVkgWY",
    "photographer": "Natalie Kinnear",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Background removed, trimmed, WebP with alpha",
    "provisional": true
  },
  {
    "src": "/images/bouquets/six-months-of-flowers.webp",
    "width": 1799,
    "height": 2200,
    "alt": "A cheerful jar of garden flowers: tulips, celosia, waxflower, gerbera and orange roses",
    "placement": "Homepage hero; Six Months of Flowers product image",
    "source": "https://unsplash.com/photos/BRk56DTxdP4",
    "photographer": "Evelien Van Den Brink",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Background removed, trimmed, WebP with alpha",
    "provisional": true
  },
  {
    "src": "/images/photos/garden-bouquet-styled.webp",
    "width": 1600,
    "height": 2400,
    "alt": "Peach garden roses and waxflower arranged in a clear glass vase against a pale wall",
    "placement": "Garden Bouquet gallery",
    "source": "https://unsplash.com/photos/mNEpmNiFdXs",
    "photographer": "Angelina Jollivet",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/harlow-brook-bunch-styled.webp",
    "width": 1800,
    "height": 2400,
    "alt": "A large arrangement of sunflowers, roses, hydrangea and delphinium on a warm beige backdrop",
    "placement": "Harlow Brook Bunch gallery",
    "source": "https://unsplash.com/photos/H4HlMihSxs4",
    "photographer": "RP C O N C I E R G E",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/little-posy-styled.webp",
    "width": 1800,
    "height": 2400,
    "alt": "A small wrapped bouquet of roses, scabiosa and dusty miller against a pale grey wall",
    "placement": "Little Posy gallery",
    "source": "https://unsplash.com/photos/O0YVKmrTPCM",
    "photographer": "Robin Baral",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/season-of-flowers-styled.webp",
    "width": 2000,
    "height": 1367,
    "alt": "A soft cottage-garden bouquet of snapdragons, scabiosa and chamomile on a white background",
    "placement": "Season of Flowers gallery",
    "source": "https://unsplash.com/photos/wxXLoKVkgWY",
    "photographer": "Natalie Kinnear",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/six-months-of-flowers-styled.webp",
    "width": 1800,
    "height": 2400,
    "alt": "A glass jar of mixed garden flowers on a grey floor against a white wall",
    "placement": "Six Months gallery",
    "source": "https://unsplash.com/photos/BRk56DTxdP4",
    "photographer": "Evelien Van Den Brink",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/dahlia-bouquet-in-hand.webp",
    "width": 1600,
    "height": 2400,
    "alt": "A hand holding a just-picked bouquet of peach and coral dahlias in a summer garden",
    "placement": "Homepage story",
    "source": "https://unsplash.com/photos/BQtphmFrst4",
    "photographer": "Jack Swords",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/dahlia-rows.webp",
    "width": 2000,
    "height": 1333,
    "alt": "Rows of staked dahlias in bloom in a small flower field under a blue sky",
    "placement": "Homepage story inset; About (the farm)",
    "source": "https://unsplash.com/photos/wOOPqfJ4Fl4",
    "photographer": "Rose Bahmani",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/peach-dahlias.webp",
    "width": 1600,
    "height": 2400,
    "alt": "Peach dahlias in a garden, softly out of focus behind",
    "placement": "Not currently placed (spare)",
    "source": "https://unsplash.com/photos/Y9vwEr_i4NE",
    "photographer": "Anita Austvika",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/dahlia-basket.webp",
    "width": 1807,
    "height": 2400,
    "alt": "A basket filled with freshly cut dahlias in magenta, orange and coral",
    "placement": "Homepage season strip (late summer); About gallery",
    "source": "https://unsplash.com/photos/ih7powhVe7M",
    "photographer": "Christopher Lowe",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/zinnias-in-hand.webp",
    "width": 1800,
    "height": 2400,
    "alt": "A hand holding a bright bunch of zinnias above a garden bed",
    "placement": "Homepage season strip (high summer); About gallery",
    "source": "https://unsplash.com/photos/bHkIUavTIEo",
    "photographer": "Megan Waksmundzki",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/dahlia-harvest-flatlay.webp",
    "width": 2000,
    "height": 1519,
    "alt": "Freshly cut blush and peach dahlias laid out beside garden snips",
    "placement": "Wholesale: why farm-grown",
    "source": "https://unsplash.com/photos/KSu972ZVzk4",
    "photographer": "Lynnelle Cleveland",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/autumn-farm.webp",
    "width": 2000,
    "height": 1114,
    "alt": "A red barn and farmhouse among autumn trees with hills beyond",
    "placement": "Not currently placed (spare)",
    "source": "https://unsplash.com/photos/1PnkD5YV6Sw",
    "photographer": "LXS Photography",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/mountain-valley.webp",
    "width": 2000,
    "height": 1333,
    "alt": "A green valley with forested mountains under a cloudy sky",
    "placement": "About: visiting",
    "source": "https://unsplash.com/photos/xmB63hJPTIo",
    "photographer": "Alex Moliski",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/valley-village.webp",
    "width": 2000,
    "height": 1331,
    "alt": "A New England valley in autumn with farmhouses along a winding road",
    "placement": "Not currently placed (spare)",
    "source": "https://unsplash.com/photos/9uWkID2TCIE",
    "photographer": "Venti Views",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/rudbeckia-fence.webp",
    "width": 2000,
    "height": 1500,
    "alt": "Black-eyed Susans along a rustic wooden fence at sunset",
    "placement": "Not currently placed (spare)",
    "source": "https://unsplash.com/photos/Qayn6sbwKBk",
    "photographer": "J K",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/flowers-with-open-book.webp",
    "width": 2000,
    "height": 1600,
    "alt": "Pale garden flowers in a white jug beside an open book",
    "placement": "Not currently placed (spare)",
    "source": "https://unsplash.com/photos/QMbLS3j-Si0",
    "photographer": "Sixteen Miles Out",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/flowers-on-book.webp",
    "width": 2000,
    "height": 1333,
    "alt": "A bunch of golden flowers resting on an open book by a window",
    "placement": "About: the writer",
    "source": "https://unsplash.com/photos/izbz9y9j6ME",
    "photographer": "Sixteen Miles Out",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/white-flowers-on-books.webp",
    "width": 2000,
    "height": 1333,
    "alt": "White flowers resting on a stack of old books",
    "placement": "About: the writer",
    "source": "https://unsplash.com/photos/yOh9lWBDjP4",
    "photographer": "Aliis Sinisalu",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/wrapped-bouquets.webp",
    "width": 2000,
    "height": 1335,
    "alt": "Wrapped bouquets laid out on a table, ready for pickup",
    "placement": "Wholesale hero; How it works",
    "source": "https://unsplash.com/photos/m6tnAOyhSwY",
    "photographer": "Georg Eiermann",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/bouquets-outdoor-table.webp",
    "width": 2000,
    "height": 1502,
    "alt": "Several bright garden bouquets in jars on an outdoor table",
    "placement": "Harlow Brook Bunch gallery",
    "source": "https://unsplash.com/photos/4R9GnmeZd4U",
    "photographer": "Joshua Soliz",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/breakfast-table-flowers.webp",
    "width": 1600,
    "height": 2400,
    "alt": "A vase of garden flowers on a breakfast table by a window",
    "placement": "Homepage subscriptions band; Garden Bouquet gallery; Gift flowers",
    "source": "https://unsplash.com/photos/kBeDeQtbcZ4",
    "photographer": "Bozica Uglesic",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/windowsill-flowers.webp",
    "width": 1600,
    "height": 2400,
    "alt": "A glass of orange and yellow flowers on a sunny farmhouse windowsill",
    "placement": "Little Posy gallery",
    "source": "https://unsplash.com/photos/cM0cQZKzaEY",
    "photographer": "Chris Linnett",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/farmhouse-pond.webp",
    "width": 2000,
    "height": 1500,
    "alt": "A farmhouse beside a pond among autumn trees",
    "placement": "Contact",
    "source": "https://unsplash.com/photos/u5MyPfbvKww",
    "photographer": "Eric Chen",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/wildflowers-blue-bucket.webp",
    "width": 1800,
    "height": 2400,
    "alt": "A blue enamel bucket of Queen Anne's lace, cornflowers and garden stems on a wooden table",
    "placement": "Homepage season strip (early summer); Subscriptions FAQ; Season of Flowers gallery",
    "source": "https://unsplash.com/photos/6CC1xmZ88Dk",
    "photographer": "Maja Koppfeldt",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/dahlias-white-bucket.webp",
    "width": 1600,
    "height": 2400,
    "alt": "A white bucket of peach and pink dahlias in a green field",
    "placement": "Homepage season strip (autumn); draft product",
    "source": "https://unsplash.com/photos/Ix5Tc8Jl4RA",
    "photographer": "Eileen Kummer",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/buckets-of-flowers.webp",
    "width": 2000,
    "height": 1500,
    "alt": "Buckets of freshly cut zinnias, cosmos and celosia",
    "placement": "Homepage wholesale band; About gallery; Six Months gallery",
    "source": "https://unsplash.com/photos/k9CBKpuVjY0",
    "photographer": "Roxanne Bohman",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/zinnia-jug.webp",
    "width": 1600,
    "height": 2400,
    "alt": "A stoneware jug of zinnias and garden flowers on a bamboo stool outdoors",
    "placement": "Gift flowers; Wholesale: who we work with",
    "source": "https://unsplash.com/photos/rumoef7nbks",
    "photographer": "Marites Allen",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/zinnias-mason-jar.webp",
    "width": 1600,
    "height": 2400,
    "alt": "Zinnias and sunflowers in a mason jar on a sunny marble counter",
    "placement": "Subscriptions hero; How it works",
    "source": "https://unsplash.com/photos/hhuNFtcrCtY",
    "photographer": "Rakitha Perera",
    "license": "Unsplash License (free commercial use, no permission required)",
    "licenseUrl": "https://unsplash.com/license",
    "processing": "Resized, WebP",
    "provisional": true
  },
  {
    "src": "/images/photos/sarah-stewart-taylor.webp",
    "width": 1600,
    "height": 2000,
    "alt": "Sarah Stewart Taylor smiling under an autumn maple, holding a copy of her novel Agony Hill",
    "placement": "Homepage: Meet Sarah; About intro",
    "source": "",
    "photographer": "Courtesy of Sarah Stewart Taylor",
    "license": "Supplied by the client for this site. Confirm the photographer credit before launch.",
    "licenseUrl": "",
    "processing": "Cropped to 4:5 from the supplied 4032×3024 original, WebP",
    "provisional": false
  },
];
const bySrc = new Map(assetManifest.map((a) => [a.src, a]));

/** Looks up intrinsic dimensions for a local asset; unknown (uploaded) images get a safe default. */
export function assetSize(src: string): { width: number; height: number } {
  const a = bySrc.get(src);
  return a ? { width: a.width, height: a.height } : { width: 1600, height: 2000 };
}

export function asset(src: string) {
  return bySrc.get(src);
}
