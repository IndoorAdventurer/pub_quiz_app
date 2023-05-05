import Game from "../game.js";
import GameState from "../gamestate.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";
import yesOrThrow from "../../utils/yesorthrow.js";

/**
 * After a crowd judged type of question is over, we can show all the correct
 * answers. This type of game state is responsible for that.
 */
export default class CrowdJudgedShowAnswers extends GameState {

    public readonly name = "crowdjudgedshowanswers";

    private correct_answers: string[];

    /**
     * Constructor of `CrowdJudgedShowAnswers`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object.
     */
    constructor(parent_game: Game, config: { [key: string]: any }) {
        super(parent_game, config);
        this.correct_answers = yesOrThrow(config, "correct_answers");
    }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/crowdjudgedshowanswers_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/crowdjudgedshowanswers_bigscreen.js");
    }

    public playerScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/wait_playerscreen.html");
    }

    public stateMsg(): GameDataMsg {
        return {
            widget_name: "wait_screen",
            general_info: {
                widget_name: this.name,
                answers: this.correct_answers
            },
            player_specific_info: {}
        };
    }
}