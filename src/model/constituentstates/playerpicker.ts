import Game from "../game.js";

/**
 * Some rounds will be turn-based, such that we need to pick which player gets
 * the turn. This class will pick a player for us. It will be linked to a full
 * round, so multiple questions. This is needed so that it can remember which
 * players already got a question and exclude them from consideration, as you
 * want each player to get exactly 1 question.
 */
export default class PlayerPicker {

    private game: Game;
    private already_picked_r: Set<string> = new Set();  // round bookkeeping
    private already_picked_q: Set<string> = new Set();  // question bookkeeping

    constructor(game: Game) {
        this.game = game;
    }

    /**
     * Picks a player for us and returns its name. For picking, it uses the
     * procedure from the Dutch game show *De Slimste Mens*:
     * * At the start of a new round it always picks the player with the least
     * amount of points **that hasn't had his/her own round yet**;
     * * When a player passes, the player with the next lowest score gets
     * selected to finish the question. **Here it does not matter anymore who
     * already got a round, but it does, of course, matter who got the question
     * already.**
     * @param startOfQuestion A boolean indicating if this is the start of a new
     * question (`true`), or if this is just picking the next player for an
     * ongoing question that someone else already passed (`false`).
     * @returns The name of the next candidate, or `null` if there aren't any
     * left.
     */
    public pickPlayer(startOfQuestion: boolean): string | null {

        // Getting all candidates with isplaying set to true in descending
        // order of score:
        let candidates = this.game.playerDataDump()
            .filter(p => p.isplaying)
            .map(p => p.name);

        // Start of new quesiton:
        if (startOfQuestion) {
            this.already_picked_q.clear();
            candidates = candidates.filter(p => !this.already_picked_r.has(p));
            const player = candidates.at(-1);
            if (player) {
                this.already_picked_r.add(player);
                this.already_picked_q.add(player);
            }
            return player || null;
        }

        // Continuation of question:
        candidates = candidates.filter(p => !this.already_picked_q.has(p));
        const player = candidates.at(-1);
        if (player)
            this.already_picked_q.add(player);
        return player || null;
    }
}