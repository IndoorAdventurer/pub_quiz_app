import Game from "../game.js";
import GameState from "../gamestate.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";
import QuestionData from "./questiondata.js";

/**
 * After open questions the quiz master/admin has to check which answer are and
 * are not correct. This game state comes right after players submitted their
 * answers. It presents all these answer to the admin such that he/she can mark
 * which are correct. These will then be added to the set of correct answers
 * such that the next state can grant points in the regular manner.
 * 
 * For fun it will also present the admin with the name of the player that gave
 * the answer, so it can be used as a conversation starter 😜
 */
export default class AdminAnswerCheck extends GameState {

    public readonly name = "adminanswercheck";
    private qdat: QuestionData;

    /**
     * Constructor of `AdminAnswerCheck`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object.
     * @param qdat The QuestionData object allowing multiple game states to
     * have access to the same data.
     */
    constructor(parent_game: Game, config: { [key: string]: any }, qdat: QuestionData) {
        super(parent_game, config);
        this.qdat = qdat;
    }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/adminanswercheck_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/adminanswercheck_bigscreen.js");
    }

    public playerScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/wait_playerscreen.html");
    }

    public adminScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/adminanswercheck_adminscreen.html")
            .add_js_file("./dist/view/widget_scripts/adminanswercheck_adminscreen.js");
    }

    public adminAnswer(obj: {[key: string]: any}): void {
        // Adding received correct answers to set in qdat, and moving to the
        // next state:
        const correct_answers: string[] | undefined = obj.correct_answers;
        this.qdat.addCorrectAnswers(correct_answers || []);
        this.parent_game.setCurState(1, true);
    }

    public stateMsg(): GameDataMsg {
        // Players to wait_screen, others just to this screen :-)
        return {
            widget_name: "wait_screen",
            general_info: { widget_name: this.name },
            admin_info: {
                widget_name: this.name,
                exemplar_answer: this.qdat.exemplar_answer,
                player_answers: this.qdat.player_answers
            },
            player_specific_info: {}
        };
    }
}