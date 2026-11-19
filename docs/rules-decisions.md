# Root Rules Implementation Decisions & Clarifications

Based on the official Law of Root (v1.2+):

1. **Board Layout & Clearings**:
   - The Fall (base) map features exactly 12 clearings:
     - 4 Fox (Clearings 1, 6, 8, 12)
     - 4 Rabbit (Clearings 3, 4, 10, 11)
     - 4 Mouse (Clearings 2, 5, 7, 9)
   - Building slots: 1 to 3 slots per clearing as on the physical base board (Total: 22 slots, with 4 ruins occupying slots in clearings 5, 7, 10, 11).
   - Base Ruins contain items: Hammer, Sword, Boot, Bag.

2. **Rule & Control**:
   - The faction with the most combined warriors and buildings rules the clearing (tokens do not count toward rule).
   - Lords of the Forest (Eyrie): Eyrie rules clearings where they are tied for most combined pieces.
   - Vagabond has no warriors and never rules a clearing.

3. **Movement**:
   - To move, a faction must rule either the origin clearing, the destination clearing, or both (Law of Root 4.2).
   - Vagabond moves using Boots and ignores rule restrictions, but must exhaust 1 additional Boot to enter or leave a clearing with Hostile faction pieces.

4. **Combat Resolution**:
   - Two 12-sided dice marked 0, 1, 2, 3 (each number appears three times).
   - Attacker takes higher die; defender takes lower die.
   - Hits dealt cannot exceed the number of warriors the faction has in the battle (except Vagabond uses undamaged, ready swords, and defenseless bonus applies).
   - Defenseless: If defender has 0 warriors, attacker deals +1 extra hit.
   - Ambushes: Defender may play a matching ambush card before dice roll to deal 2 immediate hits; attacker may cancel by playing a matching ambush card.
   - Order of damage removal: Warriors must be removed first before buildings or tokens.
   - Point scoring in battle: Removing an enemy building or token scores 1 VP.

5. **Crafting**:
   - Marquise crafts using Workshops in clearings matching the card's suit.
   - Eyrie crafts using Roosts in clearings matching the card's suit.
   - Woodland Alliance crafts using Sympathy tokens in clearings matching the card's suit.
   - Vagabond crafts using ready Hammers matching the clearing suit where the Vagabond pawn is currently located.
   - Items crafted come from the finite shared item supply; if the item is not available in the supply, the card cannot be crafted for an item.

6. **Victory Conditions**:
   - First player to 30 Victory Points immediately wins.
   - Dominance cards (playable when at 10+ VP in Daylight): Discards current score marker and requires ruling 3 matching clearings at the start of Birdsong (or opposite corners for Bird Dominance).
   - Coalition: Vagabond playing a Dominance card forms a coalition with the lowest-scoring other player and wins if that player wins.
