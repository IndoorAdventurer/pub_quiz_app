import Game from "../game.js";
import GameState from "../gamestate.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";
import yesOrThrow from "../../utils/yesorthrow.js";
import QuestionData from "./questiondata.js";

/**
 * Open Question -- Answering Stage. So in other words, this game state
 * represents the part of an open question wherre people can submit answers
 * answers. It will make sure everyone gets the correct display in front of
 * their noses, and that received answers are registered so that the next game
 * state can check them.
 */
export default class OQAnsweringStage extends GameState {

    public name = "oqansweringstage";
    protected qdat: QuestionData;
    protected question: string;

    /**
     * Constructor of `MCQAnsweringStage`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object.
     * @param qdat The QuestionData object allowing multiple game states to
     * have access to the same data.
     */
    constructor(parent_game: Game, config: { [key: string]: any }, qdat: QuestionData) {
        super(parent_game, config);
        this.qdat = qdat;
        this.question = yesOrThrow(config, "question");
    }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/oqansweringstage_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/oqansweringstage_bigscreen.js");
    }

    public playerScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/oqansweringstage_playerscreen.html")
            .add_html_file("./src/view/html/widgets/wait_playerscreen.html")
            .add_js_file("./dist/view/widget_scripts/oqansweringstage_playerscreen.js");
    }

    public adminScreenWidgets(): WidgetSnippets {
        // Just the same as bigscreen, so the admin can read it from there.
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/oqansweringstage_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/oqansweringstage_bigscreen.js");
    }

    public playerAnswer(name: string, response: string): boolean {
        this.qdat.processAnswer(name, response);
        
        // Automatically move to next state if all players answered
        // Don't want to send two updates to the clients, so doing this in else:
        if (this.qdat.player_answers.length === this.parent_game.getPlayerNames().length)
            this.parent_game.setCurState(1, true);
        else
            this.parent_game.gameStateChange(this.stateMsg());
        return true;
    }

    public stateMsg(): GameDataMsg {
        // Create a player_specific_info object mapping names of players that
        // answered to an object {widget_name: "wait_screen"}, such that they
        // get directed to the wait screen after answering:
        const psi = this.qdat.player_answers.reduce((prev, [name, _]) => {
            prev[name] = {widget_name: "wait_screen"}
            return prev;
        }, {} as {[key: string]: any});

        return {
            general_info: {
                question: this.question,
            },
            player_specific_info: psi
        };
    }
}