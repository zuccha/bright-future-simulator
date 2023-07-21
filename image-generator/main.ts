import { exists } from "https://deno.land/std@0.195.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.195.0/path/mod.ts";
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

/**
 * Configuration.
 */

const ConfigSchema = z.object({
  cardSize: z.number(),
  circle: z.object({ ratio: z.number().nonnegative() }),
  corner: z.object({
    ratio: z.number().nonnegative(),
    offset: z.number().nonnegative(),
  }),
  symbol: z.object({
    ratio: z.number().nonnegative(),
    offset: z.number().nonnegative(),
  }),

  imagesDirectory: z.string(),
  images: z.object({
    Background: z.string(),
    Circle: z.string(),
    Corner: z.string(),
    House1: z.string(),
    House2: z.string(),
    House3: z.string(),
    House4: z.string(),
    House5: z.string(),
    House6: z.string(),
    i: z.string(),
    I: z.string(),
    L: z.string(),
    T: z.string(),
    X: z.string(),
    "0": z.string(),
    "1": z.string(),
    "2": z.string(),
    "3": z.string(),
    "4": z.string(),
    "5": z.string(),
    "6": z.string(),
    "7": z.string(),
    "8": z.string(),
    "9": z.string(),
    "10": z.string(),
    Cloth: z.string(),
    Electricity: z.string(),
    Food: z.string(),
    Medicine: z.string(),
    Pearks: z.string(),
    People: z.string(),
    Rooms: z.string(),
    Scraps: z.string(),
    Water: z.string(),
    Loot: z.string(),
    Score: z.string(),
  }),

  inputCsvFile: z.string(),
  outputDirectory: z.string(),
});

type Config = z.infer<typeof ConfigSchema>;

const config = ConfigSchema.parse(
  JSON.parse(await Deno.readTextFile("./config.json"))
);

/**
 * Types.
 */

const ResourceSchema = z.union([
  z.undefined(),
  z.enum([
    "Cloth",
    "Electricity",
    "Food",
    "Medicine",
    "Pearks",
    "People",
    "Rooms",
    "Scraps",
    "Water",
  ]),
]);

const ActionSchema = z.union([
  z.undefined(),
  z.enum(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]),
]);

const EventSchema = z.union([z.undefined(), z.enum(["Loot", "Score"])]);

const CardSchema = z.object({
  id: z.number(),
  era: z.number(),
  geo: z.enum(["i", "I", "L", "T", "X"]),
  actions: ActionSchema,
  event: EventSchema,
  indicator: ResourceSchema,
  prestige: ResourceSchema,
});

type Card = z.infer<typeof CardSchema>;

/**
 * CSV parser.
 */

const row2card = (row: string[]): Card => {
  return CardSchema.parse({
    id: Number(row[0]),
    era: Number(row[1]),
    geo: row[2] || "i",
    actions: row[3] || undefined,
    event: row[4] || undefined,
    indicator: row[5] || undefined,
    prestige: row[6] || undefined,
  });
};

const cards = (await Deno.readTextFile(config.inputCsvFile))
  .split("\n")
  .filter((row) => row !== "")
  .map((row) => row.split(",").map((cell) => cell.trim()))
  .map(row2card);

/**
 * Setup.
 */

if (await exists(config.outputDirectory))
  await Deno.remove(config.outputDirectory, { recursive: true });
await Deno.mkdir(config.outputDirectory);

/**
 * Utilities.
 */

const decodeMap = new Map<[keyof Config["images"], number, number], Image>();

const decode = async (
  name: keyof Config["images"],
  ratio = 1,
  angle = 0
): Promise<Image> => {
  // if (!decodeMap.has([name, ratio, angle]))
  //   decodeMap.set(
  //     [name, ratio, angle],
  //     (await Image.decode(join(config.imagesDirectory, config.images[name])))
  //       .resize(config.cardSize * ratio, Image.RESIZE_AUTO)
  //       .rotate(angle) as Image
  //   );
  // return decodeMap.get([name, ratio, angle])!;

  const path = join(config.imagesDirectory, config.images[name]);
  return (await Image.decode(await Deno.readFile(path)))
    .resize(config.cardSize * ratio, Image.RESIZE_AUTO)
    .rotate(angle) as Image;
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

/**
 * Generate images.
 */

const background = await decode("Background");
const circle = await decode("Circle", 0.3);
const cornerTL = await decode("Corner", config.corner.ratio, 270);
const cornerTR = await decode("Corner", config.corner.ratio, 180);
const cornerBL = await decode("Corner", config.corner.ratio, 0);
const cornerBR = await decode("Corner", config.corner.ratio, 90);

for (const card of cards) {
  // Image
  const image = new Image(config.cardSize, config.cardSize);

  // Background
  image.composite(background, 0, 0);

  // Street
  const street = await decode(card.geo);
  image.composite(street, 0, 0);

  // Houses
  // TODO.

  // Actions (top-left)
  if (card.actions) {
    const actions = await decode(card.actions, config.symbol.ratio);
    placeTL(image, cornerTL, config.corner.offset);
    placeTL(image, actions, config.symbol.offset);
  }

  // Event (bottom-left)
  if (card.event) {
    const event = await decode(card.event, config.symbol.ratio);
    placeBL(image, cornerBL, config.corner.offset);
    placeBL(image, event, config.symbol.offset);
  }

  // Indicator (bottom-right)
  if (card.indicator) {
    const indicator = await decode(card.indicator, config.symbol.ratio);
    placeBR(image, cornerBR, config.corner.offset);
    placeBR(image, indicator, config.symbol.offset);
  }

  // Prestige
  // TODO

  // Save image
  await Deno.writeFile(
    join(config.outputDirectory, `${pad(card.id)}.png`),
    await image.encode()
  );
}
