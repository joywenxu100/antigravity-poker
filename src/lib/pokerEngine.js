
export const VILLAIN_TYPES = {
  NIT: 'Nit (Tight Passive)',
  TAG: 'TAG (Tight Aggressive)',
  LAG: 'LAG (Loose Aggressive)',
  WHALE: 'Whale (Loose Passive)',
  MANIAC: 'Maniac (Loose Aggressive)',
  STATION: 'Calling Station',
  UNKNOWN: 'Unknown'
};

export const POSITIONS = ['SB', 'BB', 'Straddle', 'UTG+1', 'UTG+2', 'LJ', 'HJ', 'CO', 'BTN'];
// Wait, 8-handed with Straddle.
// Standard 8-max: SB, BB, UTG, UTG+1, MP, HJ, CO, BTN.
// With Straddle (UTG straddles usually):
// SB, BB, Straddle(UTG), UTG+1, MP, HJ, CO, BTN.
// So preflop action starts at UTG+1.

export class PokerEngine {
  constructor() {
    this.structure = {
      sb: 1,
      bb: 2,
      straddle: 4,
      ante: 1, // Per player
      players: 8
    };
  }

  updateStructure(config) {
    this.structure = { ...this.structure, ...config };
  }

  classifyVillain(stats) {
    const { vpip, winRate, showdown, hands } = stats;

    if (hands < 50) return VILLAIN_TYPES.UNKNOWN;

    // Basic heuristics
    if (vpip > 40) {
      if (winRate < -10) return VILLAIN_TYPES.WHALE;
      return VILLAIN_TYPES.MANIAC;
    }

    if (vpip < 18) return VILLAIN_TYPES.NIT;

    if (vpip >= 18 && vpip <= 26) return VILLAIN_TYPES.TAG;

    if (vpip > 26 && vpip <= 40) return VILLAIN_TYPES.LAG;

    if (showdown > 32) return VILLAIN_TYPES.STATION;

    return VILLAIN_TYPES.UNKNOWN;
  }

  calculatePotInfo(stackSizeBB = 100) {
    const { sb, bb, straddle, ante, players } = this.structure;
    const deadMoney = sb + bb + straddle + (ante * players);

    // If straddle is 0, effective BB is just the BB.
    const hasStraddle = straddle > 0;
    const effectiveBB = hasStraddle ? straddle : bb;

    // Calculate effective stack
    // stackSizeBB is in original BBs. 
    // Total Stack = stackSizeBB * bb
    const totalStackValue = stackSizeBB * bb;

    // Effective Stack (in terms of the effective big blind)
    const effectiveStackDepth = totalStackValue / effectiveBB;

    const spr = totalStackValue / deadMoney; // Stack to Pot Ratio preflop

    return {
      deadMoney,
      effectiveBB,
      startingPotInBB: deadMoney / bb, // For display relative to BB
      effectiveStackStraddles: effectiveStackDepth, // Renaming conceptually, but keeping key for compatibility or updating usage
      hasStraddle,
      spr
    };
  }

  getExploitativeAdvice(villainType, position, stackSizeBB = 200) {
    const advice = {
      general: "",
      preflop: "",
      postflop: "",
      deepStack: ""
    };

    const potInfo = this.calculatePotInfo(stackSizeBB);
    const isDeep = potInfo.effectiveStackStraddles >= 150; // 150+ Straddles is deep
    const isSuperDeep = potInfo.effectiveStackStraddles >= 250;

    switch (villainType) {
      case VILLAIN_TYPES.WHALE:
        advice.general = "Target this player. They play too many hands and lose money.";
        advice.preflop = `Isolate wide (top 20-30%). Raise size: ${3.5 * potInfo.effectiveBB} - ${5 * potInfo.effectiveBB}. With deep stacks, you can isolate with speculative hands (78s, 66) in position.`;
        advice.postflop = "Value bet thin. Do not bluff. Overfold to their aggression. Deep stack: They will call down light, so size up your value bets to 120%+ pot.";
        break;
      case VILLAIN_TYPES.NIT:
        advice.general = "Avoid giving them action unless you have a monster.";
        advice.preflop = "Steal their blinds relentlessly. Fold to 3-bets. Deep stack: Set mining is extremely profitable here if they have a full stack. Call 3-bets with pairs.";
        advice.postflop = "Respect their bets. Deep stack: If they bet big on the river, fold everything but the nuts. They do not bluff for 200bb+.";
        break;
      case VILLAIN_TYPES.STATION:
        advice.general = "They love to see showdowns. Value town.";
        advice.preflop = "Standard opens. Deep stack: Add more suited connectors to open range in position to crack their big pairs.";
        advice.postflop = "Bet 3 streets with Top Pair Good Kicker. Deep stack: Be careful with one-pair hands if the pot gets bloated. They might have hit a random 2-pair.";
        break;
      case VILLAIN_TYPES.TAG:
        advice.general = "Solid player. Minimize mistakes.";
        advice.preflop = "Play standard ranges. Deep stack: 3-bet polar (nuts or bluffs), avoid 3-betting merged hands that dominate nothing.";
        advice.postflop = "Balance your checking range. Deep stack: Position is king. Do not bloat pots OOP with medium strength hands.";
        break;
      case VILLAIN_TYPES.MANIAC:
        advice.general = "High variance opponent. Buckle up.";
        advice.preflop = "Tighten up. Let them hang themselves. Deep stack: You need a stronger range to call off 200bb+. Avoid calling 4-bets with AQ/AK.";
        advice.postflop = "Induce bluffs. Check strong hands. Deep stack: Be prepared for massive overbet jams. Call with top of range only.";
        break;
      default:
        advice.general = "Gather more data.";
        advice.preflop = "Play standard GTO-ish ranges.";
        advice.postflop = "Play ABC poker.";
    }

    // Straddle + Deep Stack Adjustment
    const depthUnit = potInfo.hasStraddle ? 'Straddles' : 'BBs';

    advice.structureNote = `Structure: 8-Max, ${potInfo.hasStraddle ? `Straddle ($${this.structure.straddle})` : 'No Straddle'}, Ante. 
    Stack Depth: ${stackSizeBB}BB (${potInfo.effectiveStackStraddles.toFixed(1)} ${depthUnit}).
    ${isDeep ? "⚠️ DEEP STACK ALERT" : "Standard Depth"}
    With ${potInfo.effectiveStackStraddles.toFixed(1)} effective ${depthUnit}, implied odds are HUGE. 
    - Variance Minimization: Avoid stacking off with Top Pair / Overpair for >100 ${depthUnit}. Pot control is vital.
    - Winrate Maximization: Play suited connectors (78s, T9s) and small pairs (22-66) more aggressively in position. You want to crack big hands.
    - Position: Being OOP deep is a disaster. Tighten up significantly from SB/BB/UTG.`;

    return advice;
  }
}
