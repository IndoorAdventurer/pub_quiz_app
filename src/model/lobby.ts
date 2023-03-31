import { GameState } from "./game.js"

/**
 * The first `GameState` of any game! Will show on the big screen a list of
 * all candidates. To people going to the website (on their phone), it will
 * provide an interface to join the game and create a (nick)name.
 */
export default class Lobby extends GameState {
    
    
    public bigScreen(): string {
        throw new Error("Method not implemented.");
    }

    public playerScreen(name: string): string {
        throw new Error("Method not implemented.");
    }

    public playerAnswer(name: string, response: string): boolean {
        throw new Error("Method not implemented.");
    }

    // Also TODO in game.ts: add abstract methods that should get called for,
    // respectively, drawing the big screen, or drawing the small screen.
}