import { exists } from "https://deno.land/std@0.195.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.195.0/path/mod.ts";
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";
import { ZodError } from "https://deno.land/x/zod@v3.21.4/ZodError.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

/**
 * Configuration.
 */

const ConfigSchema = z.object({
  cardSize: z.number(),
  corner: z.object({
    ratio: z.number().nonnegative(),
    offset: z.number().nonnegative(),
  }),
  symbol: z.object({
    ratio: z.number().nonnegative(),
    offset: z.number().nonnegative(),
  }),
  prestige: z.object({
    circleRatio: z.number().nonnegative(),
    symbolRatio: z.number().nonnegative(),
    coords: z.record(
      z.string(),
      z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)])
    ),
  }),

  cardsWithoutSymbols: z.array(z.number()),
  alwaysAddAllCorners: z.boolean(),

  imagesDirectory: z.string(),
  images: z.record(z.string(), z.string()),

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
    console.error('ConfigError: "./config.json" not found');
  } else if (e instanceof ZodError) {
    console.error("ConfigError: invalid config");
    e.errors.forEach((error) => {
      console.error(`> ${error.path.join(".")}: ${error.message}`);
    });
  } else {
    console.error('ConfigError: failed to read "./config.json"');
    console.error(e);
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

const decode = async (
  name: keyof Config["images"],
  ratio = 1,
  angle = 0
): Promise<Image> => {
  if (!config.images[name]) {
    console.error(`ImageError(${name}): no image set`);
    Deno.exit(1);
  }

  const path = join(config.imagesDirectory, config.images[name]);
  try {
    return (await Image.decode(await Deno.readFile(path)))
      .resize(config.cardSize * ratio, Image.RESIZE_AUTO)
      .rotate(angle) as Image;
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      console.error(`ImageError(${name}): "${path}" not found`);
    } else {
      console.error(`ImageError(${name}): failed to read "${path}"`);
      console.error(e);
    }
    Deno.exit(1);
  }
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

/**
 * Generate images.
 */

const background = await decode("Background");
const circle = await decode("Circle", config.prestige.circleRatio);
const cornerTL = await decode("Corner", config.corner.ratio, 270);
const cornerTR = await decode("Corner", config.corner.ratio, 180);
const cornerBL = await decode("Corner", config.corner.ratio, 0);
const cornerBR = await decode("Corner", config.corner.ratio, 90);

if (await exists(config.outputDirectory))
  await Deno.remove(config.outputDirectory, { recursive: true });
await Deno.mkdir(config.outputDirectory);

for (const card of cards) {
  // Image
  const image = new Image(config.cardSize, config.cardSize);

  // Background
  image.composite(background, 0, 0);

  // Street
  if (card.geo) {
    const street = await decode(card.geo);
    image.composite(street, 0, 0);
  }

  // Houses
  // TODO.

  if (!config.cardsWithoutSymbols.includes(card.id)) {
    // Actions (top-left)
    if (card.actions) {
      const actions = await decode(card.actions, config.symbol.ratio);
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
      const event = await decode(card.event, config.symbol.ratio);
      placeBL(image, cornerBL, config.corner.offset);
      placeBL(image, event, config.symbol.offset);
    } else if (config.alwaysAddAllCorners) {
      placeBL(image, cornerBL, config.corner.offset);
    }

    // Indicator (bottom-right)
    if (card.indicator) {
      const indicator = await decode(card.indicator, config.symbol.ratio);
      placeBR(image, cornerBR, config.corner.offset);
      placeBR(image, indicator, config.symbol.offset);
    } else if (config.alwaysAddAllCorners) {
      placeBR(image, cornerBR, config.corner.offset);
    }

    // Prestige
    if (card.prestige) {
      const coords = config.prestige.coords[card.geo];
      if (coords) {
        const prestige = await decode(
          card.prestige,
          config.prestige.symbolRatio
        );
        place(image, circle, coords[0], coords[1]);
        place(image, prestige, coords[0], coords[1]);
      }
    }
  }

  // Save image
  await Deno.writeFile(
    join(config.outputDirectory, `${pad(card.id)}.png`),
    await image.encode()
  );
}
