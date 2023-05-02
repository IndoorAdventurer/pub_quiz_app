import yesOrThrow from "../../utils/yesorthrow.js";
import Game from "../game.js";
import GameState from "../gamestate.js";
import CheckAnswersStage from "./checkanswersstage.js";
import QuestionData from "./questiondata.js";


/**
 * For some rounds you might give players higher reward if they answer quicker.
 * This class is similar to `CheckAnswersStage`, except that it gives the first
 * to answer more points than the last to answer. The ones inbetween get
 * interpolated values assigned.
 */
export default class CheckAnswersRankedStage extends CheckAnswersStage {

    private max_points: number;
    private min_points: number;
    
    constructor(parent_game: Game, config: { [key: string]: any }, qdat: QuestionData) {
        super(parent_game, config, qdat);

        // First to answer gets max points, last to answer min_points, rest is
        // exponentially interpolated.
        const max_points = yesOrThrow(config, "max_points");
        const min_points = yesOrThrow(config, "min_points");

        this.min_points = min_points <= 0 ? 0.001 : min_points;
        this.max_points = max_points < min_points ? min_points : max_points;

        this.max_points = max_points;
        this.min_points = min_points;
    }
    
    
    @GameState.stateChanger
    public begin_active() {
        // Only run the rest once. Nice so if you go back you still have same
        if (this.already_ran)
            return;
        this.already_ran = true;
        
        // Get list of players that answered correctly:
        const heroes = this.qdat.listDumpAndClear()

        // Updating scores, and creating player_specific_info object
        const score_map = new Map<string, number>();
        const N = heroes.length;
        const y_0 = this.max_points;
        const decayFactor = this.min_points / y_0;
        for (let idx = 0; idx != N; ++idx) {
            const score = Math.floor(y_0 * Math.pow(decayFactor, idx / N));
            score_map.set(heroes[idx], score);
            this.player_specific_info[heroes[idx]] = {answer_correct: true};
        }

        this.parent_game.updateScores(score_map);
    }
}