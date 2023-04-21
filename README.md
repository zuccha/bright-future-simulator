# Bright Future Simulator

Simulator for Bright Future terrain cards placement.

## Configuration View

The configuration view allows to specify the parameters for a simulation, and execute it.

### Parameters:

- **Players:** Number of players participating in the game, almost irrelevant for the purpose of the simulation.
- **Deck size:** Number of terrain cards in the deck (it doesn't include the first card placed at the beginning of the game).
- **Board size:** Height and width of the board where the players can place tiles. It's computed based on the minimum board size needed to play all cards in the deck (including the first card placed at the beginning of the game).
- **Custom board size:** Control manually the size of the board.
- **Deck generation:** Either
  - **Custom:** The user specifies the percentages of of different terrain card types manually. Only one simulation with the specified percentages will run.
  - **Random:** The user specifies the number of simulation they want to run. For each simulation, a different distribution of terrain card types will be used, generated at random.
- **Number of iterations:** Number of times a simulation with the same distribution of terrain tiles will be run. The average of these iterations will be shown in the report.

### Actions:

- **Run Simulation:** Start the simulation. Depending on the size of the board, this could take anywhere from 5 to 30 seconds.

### Simulation:

Running a simulation involves:
1. Generating a distribution of terrain cards (or use the one specified by the user).
2. Create the deck of terrain cards, based on the generated distribution. The deck is shuffles and the terrain cards are rotated randomly.
3. Play the game, until no card can be placed on the board:
    1. Each player draws up to 4 cards.
    2. Each player plays 1 card, until only 1 is left.

This is repeated for each terrains distribution specified in the configuration.

_Playing a card_ means iterating over one player's hand. For each card, the player checks if it fits on the board somewhere, if it does, the player places it on the board and passes the turn. If the card doesn't match, the player rotates it and tries again, until all possible rotations have been tested. If the card doesn't fit with any rotation, the player selects the next card and repeats the procedure. If no card fits in any rotation possible, or if the player has no cards in hand, the game finished.

## Report View

The report view features a few actions, and the report table. In the table, each row is represents a different simulation consisting of a different distribution of terrain cards. Rows are sorted by _score_.

### Actions:
- **Configure:** Go back to the configuration view. **N.B.: The current report will be lost!**
- **Show percentages:** If active, the table will display the values in percentages, otherwise it will show the actual values used during the simulation.
- **Export CSV:** Not implemented yet.

### Columns:
- **Score:** The proportion of terrain cards placed on the board over the total number of terrain cards. 1 mean all cards have been used, 0 means none.
- **Total cards:** Total number of cards in the original deck (not including the initial card placed at the center of the board).
- **╀:** Number of cards with one connection.
- **╂:** Number of cards with two connections, I shaped.
- **╄:** Number of cards with two connections, L shaped.
- **╇:** Number of cards with three connections.
- **╋:** Number of cards with four connections.
- **Cards used:** Number of cards placed on the board.
- **Cards used:** Number of cards still in the deck or players' hands.
- **Total cells:** Total number of cells on the board, where
theoretically a terrain card could be placed.
- **Empty cells:** Number of cells on the board that have not been used (no terrain card have been placed on it).
- **Occupied cells:** Number of cells on the board that have been used (a terrain card has been placed on it).

