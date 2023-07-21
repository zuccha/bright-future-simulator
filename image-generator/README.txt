================================================================================
# BRIGHT FUTURE IMAGE GENERATOR
================================================================================

Tool for generating terrain images for Bright Future.


--------------------------------------------------------------------------------
## Images
--------------------------------------------------------------------------------

All images provided to the tool must be squares, in PNG or JPG format (no GIFs).


--------------------------------------------------------------------------------
## Config
--------------------------------------------------------------------------------

- cardSize: Height and width of the card, in pixels (cards are squares).
- corner.ratio: Ratio of the corner white halo compared to the card size.
- corner.offset: Offset in pixels of the corner image with respect to the card
  borders.
- symbol.ratio: Ratio of any symbol image that go into a corner (actions, event
  indicator) compared to the card size.
- symbol.offset: Offset in pixels of any symbol image that go into a corner
  (actions, event indicator) with respect to the card borders.
- prestige.circleRatio: Ratio of the prestige circle compared to the card size.
- prestige.symbolRatio: Ratio of the symbol inside the prestige circle compared
  to the card size.
- prestige.coords: Map from geo label (i, I, L, T, X) to coordinates where to
  position the circle on the card (this allows to configure different positions
  for different street configurations). The coordinates are expressed as values
  between 0 and 1 (e.g., [0.5, 0.5] is the center of the card, and [0, 0] is the
  top-left corner). The coordinates represent the center of the circle.

- cardsWithoutSymbols: List of card ids. For these cards, the tool will only
  add background and streets.
- alwaysAddAllCorners: If true, corner white halos will always be added to all
  cards (except for cards listed in `cardsWithoutSymbols`), even if the
  respective symbol slot is empty.

- imagesDirectory: Path to the folder (relative to this tool's folder), where
  input images are stored.
- images: Map from label to image file. A label is any value present in columns
  "Actions", "Event", "Geo", "Indicator", and "Prestige" of the CSV file.
  The following values are special, should always be present, and should not be
  used on the aforementioned columns: "Background", "Circle", "Corner",
  "House1", "House2", "House3", "House4", "House5".
  * Background: Image used as a background.
  * Circle: Image used for the prestige circle.
  * Corner: Image used for the white halo corner. The provided image should be
    of the bottom-left corner, the tool will turn it for the others.
  * House1-House5: Images used when placing houses. For every house, the tool
    will choose a random house image and rotate it randomly.
  Labels are case sensitive!

- inputCsvFile: Path (relative to this tool's folder) of the input CSV list.
- outputDirectory: Path (relative to this tool's folder) where output images
  will be saved. The directory will be removed and recreated at each execution
  of the program.


--------------------------------------------------------------------------------
## CSV List
--------------------------------------------------------------------------------

File containing card definitions. For each row, the tool will generate an image.
The tool expects the following order:

  id, era, geo, actions, event, indicator, prestige

`id` is mandatory and must be a number.
`era` is ignored.
`geo`, `actions`, `event`, `indicator`, and `prestige` are optional, if not
provided the tool will not add the corresponding image(s).

The CSV should NOT contain a header row, only rows for cards.


--------------------------------------------------------------------------------
## Order of execution
--------------------------------------------------------------------------------

The tool will apply the following layers, in order:

1. Background
2. Street
3. Houses
4. Actions (top-left corner)
5. <nothing> (top-right corner)
6. Event (bottom-left corner)
7. Indicator (bottom-right corner)
8. Prestige


--------------------------------------------------------------------------------
## Errors
--------------------------------------------------------------------------------

If the config file is missing or contains invalid values, the execution will
fail right away (before deleting and recreating the output folder).

If images for background, circle, and corner are not found or not set, the
execution will fail right away  (before deleting and recreating the output
folder).

If an image for a label is missing or not set, the execution will fail when that
particular item is being processed.
