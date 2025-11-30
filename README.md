# Exploitative Poker Trainer

## Overview
This application is designed to help you maximize win rate and minimize variance in a specific Texas Hold'em structure:
- **8-Handed**
- **Straddle (2BB)**
- **Ante (1SB)**

## Features

### 1. Villain Profiling
Input opponent statistics (Hands, VPIP, WinRate, Showdown) to automatically classify them into archetypes:
- **Whale:** High VPIP, Negative WinRate.
- **Nit:** Low VPIP.
- **Station:** High Showdown %.
- **Maniac:** Very High VPIP, Aggressive.

### 2. Strategic Adjustments
The engine calculates the "True" effective stack and dead money.
- **Straddle Impact:** The straddle effectively halves your stack depth in terms of blinds. This reduces the value of speculative hands (suited connectors) and increases the value of high card strength (Top Pair value).
- **Dead Money:** The large amount of dead money (Ante + Straddle) incentivizes stealing, but you must be wary of the lower SPR.

### 3. Exploitative Advice
Based on the classification, the system provides tailored advice:
- **Vs Whale:** Isolate wide, value bet thin, never bluff.
- **Vs Nit:** Steal blinds, fold to aggression.
- **Vs Station:** Value bet only, size up.

## How to Run
1. Install dependencies: `npm install`
2. Start the app: `npm run dev`
3. Open `http://localhost:5173`
