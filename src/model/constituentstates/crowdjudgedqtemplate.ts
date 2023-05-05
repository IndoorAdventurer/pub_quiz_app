import Game from "../game.js";
import GameState from "../gamestate.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";
import yesOrThrow from "../../utils/yesorthrow.js";
import PlayerPicker from "./playerpicker.js";
import JudgeAnswerMap from "./judgeanswermap.js";

/**
 * In later rounds, when some players are already eliminated, the game becomes
 * turn-based: A single player will have to answer questions at a time. He/she
 * will, however, not use their phone anymore to give answers. Instead, he/she
 * will just say the answers out loud. Meanwhile, the eliminated players get
 * presented with all the correct answers, and will have to judge which of these
 * were given. They will still get/lose points based on their performance.
 * 
 * This class is an template for such a round, meaning that any round that works
 * like this will be derived from this one.
 */
export default abstract class CrowdJudgedQTemplate extends GameState {

    private picker: PlayerPicker
    protected active_player: string | null;
    private stop_on_zero: boolean;
    private jMap: JudgeAnswerMap;
    private timer: NodeJS.Timer | undefined;

    /**
     * Constructor of `CrowdJudgedQTemplate`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object.
     * @param picker The `PlayerPicker` that selects next active players
     * @param stop_on_zero If `true`, the round will stop when the main player
     * reaches a score of 0. Default is `false`.
     */
    constructor(
        parent_game: Game,
        config: { [key: string]: any },
        picker: PlayerPicker,
        stop_on_zero: boolean = false

    ) {
        super(parent_game, config);
        this.picker = picker;
        this.stop_on_zero = stop_on_zero;
        this.active_player = null;

        const correct_answers = yesOrThrow(config, "correct_answers");
        const max = yesOrThrow(config, "max_points");
        const min = yesOrThrow(config, "min_points");
        this.jMap = new JudgeAnswerMap(correct_answers, max, min);
    }

    @GameState.stateChanger
    public begin_active() {
        this.setActivePlayer(true);
        this.timer = setInterval(() => this.scoreTick(), 1000);
    }

    public end_active(): void {
        clearInterval(this.timer);
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

        // A non-player (i.e. judge) giving a response: its a vote on an answer:
        if (name !== this.active_player) {
            const answer = response.slice(1);
            const ret = this.jMap.toggleVote(name, answer, response[0] === "Y");
            const [correct_answers, score_map] = this.jMap.handleChange(
                this.parent_game.getPlayerNames(false).length,
                answer
            );

            // Update scores of active player and judging players:
            for (const ca of correct_answers)
                this.handleCorrectAnswer(ca);
            this.parent_game.updateScores(score_map);

            // Possibly move to next round:
            if (!this.jMap.canKeepPlaying())
                this.parent_game.setCurState(1, true);

            return ret;
        }

        // Active player passes, select next player (or exit round):
        if (response == "pass") {
            this.setActivePlayer(false);
            return true;
        }

        return false;
    }

    @GameState.stateChanger
    public adminAnswer(obj: { [key: string]: any }): void {

        // If admin marks answer, so immediately trigger it as given:
        if ("answer" in obj) {
            const map = this.jMap.markAnswerGivenAndReturnPoints(obj.answer);
            this.handleCorrectAnswer(obj.answer);
            this.parent_game.updateScores(map);

            // Possibly move to next round:
            if (!this.jMap.canKeepPlaying())
                this.parent_game.setCurState(1, true);
            return;
        }

        // Change a treshold:
        if ("correct_threshold" in obj)
            this.jMap.setCorrectThreshold(obj.correct_threshold);
        if ("incorrect_threshold" in obj)
            this.jMap.setIncorrectThreshold(obj.incorrect_threshold);

        const [correct_answers, score_map] = this.jMap.handleChange(
            this.parent_game.getPlayerNames(false).length);

        // Update scores of active player and judging players:
        for (const ca of correct_answers)
            this.handleCorrectAnswer(ca);
        this.parent_game.updateScores(score_map);

        // Possibly move to next round:
        if (!this.jMap.canKeepPlaying())
            this.parent_game.setCurState(1, true);
    }

    /**
     * In this type of rounds are turn-based, so there is only one player at
     * a time who is allowed to answer. This function selects and sets who
     * this player is.
     * @param isstart 
     */
    private setActivePlayer(isstart: boolean) {
        this.active_player = this.picker.pickPlayer(isstart);

        // If we get `undefined`, we excausted the list and must move to the
        // next round:
        if (!this.active_player) {
            this.parent_game.setCurState(1, true);
        }
    }

    /**
     * Should get called every second. Lowers the score of the active player
     * with 1 (its points tick away while he/she has the round, so folding in
     * time is part of the game too)
     */
    @GameState.stateChanger
    private scoreTick() {
        // Don't want mistakes here: keeping this log() in as long as possible
        console.log("tick");
        if (this.parent_game.currentState() !== this) {
            clearInterval(this.timer);
            return;
        }

        if (this.active_player === null)
            return;
        const map = new Map([[this.active_player, -1]]);
        const aboveZero = this.parent_game.updateScores(map, true);

        // If the player's score reached zero we terminate its turn.
        if (!aboveZero) {
            if (this.stop_on_zero)
                this.parent_game.setCurState(1, true);
            else
                this.setActivePlayer(false);
        }
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
        const judges = this.parent_game.getPlayerNames(false).length;
        const amap = this.jMap.getVotesForAnswers(judges);
        const psi = this.getPlayerSpecificInfo();

        return {
            general_info: {
                active_player: this.active_player,
                answer_map: amap,
                answers: this.jMap.given_answers
            },
            admin_info: { widget_name: "crowdjudge" },
            player_specific_info: psi
        };
    }

    /**
     * @returns The player specific info to send in `stateMsg()`. Players that
     * have their `isplaying` value set to `false` (the judges), will receive
     * the `crowdjudge_np` widget. The active player will receive the
     * `crowdjudge_p` widget where he/she can press the "pass" button. The rest
     * will go to the wait screen :-)
     */
    private getPlayerSpecificInfo() {
        const ret: {
            [player: string]: {
                widget_name: string,
                pmap?: [string[], string[]]
            }
        } = {};
        const player_map = this.jMap.getVotesOfPlayers();


        for (const name of this.parent_game.getPlayerNames(false))
            ret[name] = { widget_name: "crowdjudge_np", pmap: player_map[name] };
        for (const name of this.parent_game.getPlayerNames(true))
            ret[name] = { widget_name: "wait_screen" };
        if (this.active_player)
            ret[this.active_player] = { widget_name: "crowdjudge_p" };

        return ret;
    }
}