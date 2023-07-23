import { exists } from "https://deno.land/std@0.195.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.195.0/path/mod.ts";
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";
import { MultiProgressBar } from "https://deno.land/x/progress@v1.3.8/mod.ts";
import { ZodError } from "https://deno.land/x/zod@v3.21.4/ZodError.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";
/**
 * Configuration.
 */

const ConfigSchema = z.object({
  cardSize: z.number(),
  corner: z.object({
    scale: z.number().nonnegative(),
    offset: z.number().nonnegative(),
  }),
  house: z.object({
    scale: z.number().nonnegative(),
    offset: z.number().nonnegative(),
  }),
  symbol: z.object({
    scale: z.number().nonnegative(),
    offset: z.number().nonnegative(),
  }),
  prestige: z.object({
    circleScale: z.number().nonnegative(),
    symbolScale: z.number().nonnegative(),
    coords: z.record(
      z.string(),
      z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)])
    ),
  }),

  cardsWithoutSymbols: z.array(z.number()),
  alwaysAddAllCorners: z.boolean(),

  imagesDirectory: z.string(),
  images: z.object({
    background: z.string(),
    circle: z.string(),
    corner: z.string(),
    houses: z.array(z.string()).min(4),
    labels: z.record(z.string(), z.string()),
  }),

  inputCsvFile: z.string(),
  outputDirectory: z.string(),
});

type Config = z.infer<typeof ConfigSchema>;

let config: Config;
try {
  const maybeConfig = JSON.parse(await Deno.readTextFile("./config.json"));
  config = ConfigSchema.parse(maybeConfig);
} catch (e) {
  if (e instanceof Deno.errors.NotFound) {
    console.error('\nConfigError: "./config.json" not found');
  } else if (e instanceof ZodError) {
    console.error("\nConfigError: invalid config");
    e.errors.forEach((error) => {
      console.error(`\n> ${error.path.join(".")}: ${error.message}`);
    });
  } else {
    console.error('\nConfigError: failed to read "./config.json"');
    console.error("\n", e);
  }
  Deno.exit(1);
}

/**
 * Types.
 */

const CardSchema = z.object({
  id: z.number(),
  geo: z.enum(["", "i", "I", "L", "T", "X"]),
  actions: z.string(),
  event: z.string(),
  indicator: z.string(),
  prestige: z.string(),
});

type Card = z.infer<typeof CardSchema>;

/**
 * CSV parser.
 */

const row2card = (row: string[]): Card => {
  return CardSchema.parse({
    id: Number(row[0]),
    era: row[1],
    geo: row[2],
    actions: row[3],
    event: row[4],
    indicator: row[5],
    prestige: row[6],
  });
};

const cards = (await Deno.readTextFile(config.inputCsvFile))
  .split("\n")
  .filter((row) => row !== "")
  .map((row) => row.split(",").map((cell) => cell.trim()))
  .map(row2card);

/**
 * Utilities.
 */

const imageCache: Record<string, Image> = {};

const decode = async (
  relativePath: string,
  scale = 1,
  angle = 0
): Promise<Image> => {
  const path = join(config.imagesDirectory, relativePath);
  try {
    // return (await Image.decode(await Deno.readFile(path)))
    //   .resize(config.cardSize * scale, Image.RESIZE_AUTO)
    //   .rotate(angle) as Image;

    if (!imageCache[path])
      imageCache[path] = await Image.decode(await Deno.readFile(path));

    if (!imageCache[`${path}[${scale}]`])
      imageCache[`${path}[${scale}]`] = imageCache[path]
        .clone()
        .resize(config.cardSize * scale, Image.RESIZE_AUTO);

    if (!imageCache[`${path}[${scale}][${angle}]`])
      imageCache[`${path}[${scale}][${angle}]`] = imageCache[
        `${path}[${scale}]`
      ]
        .clone()
        .rotate(angle) as Image;

    return imageCache[`${path}[${scale}][${angle}]`];
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      console.error(`\nImageError: "${path}" not found`);
    } else {
      console.error(`\nImageError: failed to read "${path}"`);
      console.error("\n", e);
    }
    Deno.exit(1);
  }
};

const decodeHouse = (index: number, scale = 1, angle = 0): Promise<Image> => {
  if (index < 0 || config.images.houses.length <= index) {
    console.error(`\nImageError: no image found for house at index ${index}`);
    Deno.exit(1);
  }

  return decode(config.images.houses[index], scale, angle);
};

const decodeLabel = (label: string, scale = 1, angle = 0): Promise<Image> => {
  if (!config.images.labels[label]) {
    console.error(`\nImageError: no image set for label "${label}"`);
    Deno.exit(1);
  }

  return decode(config.images.labels[label], scale, angle);
};

const pad = (n: number): string => {
  if (n < 10) return `00${n}`;
  if (n < 100) return `0${n}`;
  return `${n}`;
};

const placeTL = (base: Image, image: Image, offset = 0): void => {
  base.composite(image, offset, offset);
};

const placeTR = (base: Image, image: Image, offset = 0): void => {
  base.composite(image, base.width - image.width - offset, offset);
};

const placeBL = (base: Image, image: Image, offset = 0): void => {
  base.composite(image, offset, base.height - image.height - offset);
};

const placeBR = (base: Image, image: Image, offset = 0): void => {
  base.composite(
    image,
    base.width - image.width - offset,
    base.height - image.height - offset
  );
};

const place = (base: Image, image: Image, x: number, y: number): void => {
  base.composite(
    image,
    base.width * x - image.width / 2,
    base.height * y - image.height / 2
  );
};

const houseIndexes = (size: number): number[] => {
  const indexes: number[] = [];
  for (let i = 0; i < size; ++i) indexes[i] = i;

  let currentIndex = indexes.length;
  let randomIndex = currentIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [indexes[currentIndex], indexes[randomIndex]] = [
      indexes[randomIndex],
      indexes[currentIndex],
    ];
  }

  return indexes;
};

const randomRotation = (): 0 | 90 | 180 | 270 => {
  const rotations = [0, 90, 180, 270] as const;
  return rotations[Math.floor(Math.random() * rotations.length)];
};

/**
 * Generate images.
 */

const background = await decode(config.images.background);
const circle = await decode(config.images.circle, config.prestige.circleScale);
const cornerTL = await decode(config.images.corner, config.corner.scale, 270);
const cornerTR = await decode(config.images.corner, config.corner.scale, 180);
const cornerBL = await decode(config.images.corner, config.corner.scale, 0);
const cornerBR = await decode(config.images.corner, config.corner.scale, 90);

if (await exists(config.outputDirectory))
  await Deno.remove(config.outputDirectory, { recursive: true });
await Deno.mkdir(config.outputDirectory);

const progressBar = new MultiProgressBar({
  title: "Generating cards...",
  complete: "=",
  incomplete: "-",
  display: "Done: :completed/:total",
});

progressBar.render([{ completed: 0, total: cards.length }]);

for (let i = 0; i < cards.length; ++i) {
  const card = cards[i];

  // Image
  const image = new Image(config.cardSize, config.cardSize);

  // Background
  image.composite(background, 0, 0);

  // Houses
  const [h1, h2, h3, h4] = houseIndexes(config.images.houses.length);
  const houseTL = await decodeHouse(h1, config.house.scale, 0);
  placeTL(image, houseTL, config.house.offset);
  const houseTR = await decodeHouse(h2, config.house.scale, randomRotation());
  placeTR(image, houseTR, config.house.offset);
  const houseBL = await decodeHouse(h3, config.house.scale, randomRotation());
  placeBL(image, houseBL, config.house.offset);
  const houseBR = await decodeHouse(h4, config.house.scale, randomRotation());
  placeBR(image, houseBR, config.house.offset);

  // Street
  if (card.geo) {
    const street = await decodeLabel(card.geo);
    image.composite(street, 0, 0);
  }

  if (!config.cardsWithoutSymbols.includes(card.id)) {
    // Actions (top-left)
    if (card.actions) {
      const actions = await decodeLabel(card.actions, config.symbol.scale);
      placeTL(image, cornerTL, config.corner.offset);
      placeTL(image, actions, config.symbol.offset);
    } else if (config.alwaysAddAllCorners) {
      placeTL(image, cornerTL, config.corner.offset);
    }

    // <empty> (top-right)
    if (config.alwaysAddAllCorners) {
      placeTR(image, cornerTR, config.corner.offset);
    }

    // Event (bottom-left)
    if (card.event) {
      const event = await decodeLabel(card.event, config.symbol.scale);
      placeBL(image, cornerBL, config.corner.offset);
      placeBL(image, event, config.symbol.offset);
    } else if (config.alwaysAddAllCorners) {
      placeBL(image, cornerBL, config.corner.offset);
    }

    // Indicator (bottom-right)
    if (card.indicator) {
      const indicator = await decodeLabel(card.indicator, config.symbol.scale);
      placeBR(image, cornerBR, config.corner.offset);
      placeBR(image, indicator, config.symbol.offset);
    } else if (config.alwaysAddAllCorners) {
      placeBR(image, cornerBR, config.corner.offset);
    }

    // Prestige
    if (card.prestige) {
      const coords = config.prestige.coords[card.geo];
      if (coords) {
        const prestige = await decodeLabel(
          card.prestige,
          config.prestige.symbolScale
        );
        place(image, circle, coords[0], coords[1]);
        place(image, prestige, coords[0], coords[1]);
      }
    }

    progressBar.render([{ completed: i + 1, total: cards.length }]);
  }

  // Save image
  await Deno.writeFile(
    join(config.outputDirectory, `${pad(card.id)}.png`),
    await image.encode()
  );
}

console.log("\n");
