import Game from "../game.js";
import GameState from "../gamestate.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";
import yesOrThrow from "../../utils/yesorthrow.js";
import PlayerPicker from "./playerpicker.js";

/**
 * In later rounds, when some players are already eliminated, the game becomes
 * turn-based: A single player will have to answer questions at a time. They
 * will, however, not use their phone anymore to give answers. Instead, he/she
 * will just say the answers out loud. Meanwhile, the eliminated players get
 * presented with all the correct answers, and will have to judge which of these
 * were given. They will still get/lose points based on their performance.
 * 
 * This class is an abstract template for such a round, meaning that any round
 * that works like this will be derived from this one.
 */
export default abstract class CrowdJudgedQTemplate extends GameState {

    private picker: PlayerPicker
    protected active_player: string | null;
    
    /**
     * Fraction of players needed to have marked it as correct before it
     * gets marked as correct and triggers the `handleCorrectAnswer` method
     */
    private correct_threshold = 0.5;

    /**
     * With an `incorrect_threshold` value of `N`, if `M` players say an answer
     * was given, but `N * M` or more people say this isn't true, the `M`
     * players that said so get a penalty.
     */
    private incorrect_threshold = 2;

    /**
     * Maps each correct answer to a tuple of two lists. The first contains
     * the names of all players that say this answer was given. The second
     * contains the names of all players that explicitly say it wasn't given.
     */
    private answer_map: Map<string, [string[], string[]]> = new Map();

    // The list of answers that were said to be given:
    private answ_given: string[] = [];

    private max_points: number;
    private min_points: number;
    
    /**
     * Constructor of `CrowdJudgedQTemplate`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object.
     */
    constructor(parent_game: Game, config: { [key: string]: any }, picker: PlayerPicker) {
        super(parent_game, config);
        this.picker = picker;
        this.active_player = null;

        const correct_answers = yesOrThrow(config, "correct_answers");
        for (const ca of correct_answers)
            this.answer_map.set(ca, [[], []]);
        
        // Player that says answer was given first will get max_points, one that
        // was last gets min_points. Rest is exponentially interpolated.
        const max = yesOrThrow(config, "max_points");
        const min = yesOrThrow(config, "min_points");

        // Formula needs some constraints to not get NaN stuff
        this.min_points = min <= 0 ? 0.001 : min;
        this.max_points = max < min ? min : max;
    }

    @GameState.stateChanger
    public begin_active() {
        this.active_player = this.picker.pickPlayer(true);
        // TODO start countdown timer
    }

    public end_active(): void {
        // TODO end countdown timer
    }

    public playerScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/wait_playerscreen.html")
            .add_html_file("./src/view/html/widgets/crowdjudge_np_playerscreen.html")
            .add_html_file("./src/view/html/widgets/crowdjudge_p_playerscreen.html")
            .add_js_file("./dist/view/widget_scripts/crowdjudge_np_playerscreen.js")
            .add_js_file("./dist/view/widget_scripts/crowdjudge_p_playerscreen.js")
            .add_css_file("./src/view/widgets_css/crowdjudge.css");
    }

    public adminScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/crowdjudge_adminscreen.html")
            .add_js_file("./dist/view/widget_scripts/crowdjudge_adminscreen.js");
    }

    @GameState.stateChanger
    public playerAnswer(name: string, response: string): boolean {
        if (name !== this.active_player)
            return this.notPlayingPlayerAnswer(name, response);
        // TODO handle pass message of active player
        
        return false;
    }

    /**
     * Handles the response of any player other than the `this.active_player`.
     * These are the players that get to vote if an answer was given by the
     * active player
     * @param name The name of the player
     * @param response The response received from this player
     * @returns 
     */
    private notPlayingPlayerAnswer(name: string, response: string): boolean {
        // If the first character is Y it means he/she says this answer is given
        // Otherwise it means this player explicitly things it is not given.
        const idx = response[0] === "Y" ? 0 : 1;
        const answer = response.slice(1);

        // Get the list corresponding to the stated action (Y or other)
        const player_list = this.answer_map.get(answer)?.[idx];
        if (!player_list)
            return false;

        // Works as a toggle: if a player wasn't in the list, add. Else remove.
        const pIdx = player_list.indexOf(name);
        if (pIdx === -1)
            player_list.push(name);
        else
            player_list.splice(pIdx, 1);
        
        this.handleChange(answer);
        return true;
    }

    @GameState.stateChanger
    public adminAnswer(obj: {[key: string]: any}): void {
        // TODO 
    }

    /**
     * After a change, such a player having marked an answer as being said, we
     * have to check things, such as if this answer has now passed the threshold
     * and can be marked as given.
     * @param answer Optional argument. If given, it will only consider changes
     * with respect to this answer. Else it will consider with respect to all.
     */
    private handleChange(answer: string | undefined = undefined) {
        const threshold = this.parent_game.getPlayerNames(false).length *
            this.correct_threshold;
        const keys = answer ? [answer] : [...this.answer_map.keys()];
        for (const key of keys) {
            const yes_list = this.answer_map.get(key)?.[0];
            const no_list = this.answer_map.get(key)?.[1];
            if (!yes_list || !no_list)
                return;
            
            const num_yes = yes_list.length;
            const num_no = no_list.length;

            // Check if question passed threshold:
            if (num_yes > threshold) {
                this.grantPoints(yes_list);
                this.answer_map.delete(key);
                this.answ_given.push(key);
                this.handleCorrectAnswer(key);
            }

            // Check if some people should get penalty for prematurely marking
            // an answer as given, according to others:
            else if (num_yes && num_no >= num_yes * this.incorrect_threshold) {
                
                // Punish the wrongdoers
                const score_map = new Map<string, number>();
                for (const naughty of yes_list)
                    score_map.set(naughty, -this.max_points);
                this.parent_game.updateScores(score_map);

                // Reset:
                this.answer_map.set(key, [[],[]]);
            }
        }
    }
    
    /**
     * After an answer has been triggered as given, this function grants points
     * to the nonplaying players who marked it. The first player that marked it
     * gets `this.max_points` points, the last gets `this.min_points` points and
     * the rest is exponentially interpolated.
     * @param players An array of players, where `players[0]` was the first to
     * answer, and `players[players.length - 1]` the last to answer.
     */
    private grantPoints(players: string[]) {
        const N = players.length;
        const y_0 = this.max_points;
        const decayFactor = this.min_points / y_0;
        const score_map = new Map<string, number>();
        
        for (let idx = 0; idx != N; ++idx) {
            score_map.set(players[idx],
                Math.floor(y_0 * Math.pow(decayFactor, idx / N))
            );
        }

        this.parent_game.updateScores(score_map);
    }

    /**
     * Differrent types of question that derive from this class will respond
     * differently to the situation where a correct answer was given. For
     * example, fixed number of points, or different depending on answer, or
     * even subtracting points from other players instead.
     * 
     * **❗IMPORTANT:** Note that you have access to the player that gave the
     * answer via the `protected` `this.active_player` field.
     * @param answer The answer that was marked as correct by the crowd.
     */
    protected abstract handleCorrectAnswer(answer: string): void;

    public stateMsg(): GameDataMsg {
        const amap = this.getAnswerMap();
        const psi = this.getPlayerSpecificInfo();

        return {
            general_info: {
                active_player: this.active_player,
                answer_map: amap,
                given_answers: this.answ_given
            },
            admin_info: { widget_name: "crowdjudge" },
            player_specific_info: psi
        };
    }

    /**
     * @returns object that maps not given answers to a tuple containing:
     * * the fraction of players that think this answer was given in proportion
     * to the threshold. I.e. if the threshold is 0.5, and half of players think
     * it was given, this number will be 1.
     * * the number of players that explicitly thinks an answer is not given as
     * fraction of the threshold. I.e. if 4 people say it was not given, 2 people
     * say it was given, and the threshold is 2, then it will be 1, since the
     * theshold of 2 means that twice as many people have to say no than yes.
     */
    private getAnswerMap(): {[key: string]: [number, number]} {
        const notPlaying = this.parent_game.getPlayerNames(false).length;
        const amap: {[key: string]: [number, number]} = {};
        for (const [answ, [yes, no]] of this.answer_map) {
            amap[answ] = [
                // "Yes" votes as fraction of threshold, so 1 when reached:
                yes.length / notPlaying / this.correct_threshold,

                // "No" also as fraction of threshold:
                no.length / (yes.length * this.incorrect_threshold)
            ];
        }

        return amap;
    }

    /**
     * @returns The player specific info to send in `stateMsg()`. Players that
     * have their `isplaying` value set to `false` (the judges), will receive
     * the `crowdjudge_np` widget. The active player will receive the
     * `crowdjudge_p` widget where he/she can press the "pass" button. The rest
     * will go to the wait screen :-)
     */
    private getPlayerSpecificInfo() {
        const ret: {[key: string]: {widget_name: any}} = {};
        for (const name of this.parent_game.getPlayerNames(false))
            ret[name] = { widget_name: "crowdjudge_np" };
        for (const name of this.parent_game.getPlayerNames(true))
            ret[name] = { widget_name: "wait_screen" };
        ret[this.active_player || ""] = { widget_name: "crowdjudge_p" };

        return ret;
    }
}