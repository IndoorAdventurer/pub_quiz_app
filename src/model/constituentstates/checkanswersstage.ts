import Game from "../game.js";
import GameState from "../gamestate.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";
import yesOrThrow from "../../utils/yesorthrow.js";
import QuestionData from "./questiondata.js";

/**
 * TODO: add description!
 */
export default class CheckAnswersStage extends GameState {

    public readonly name = "checkanswersstage";
    private qdat: QuestionData;
    private point_reward: number;
    private player_specific_info: {[key: string]: any} = {};

    /**
     * Constructor of `CheckAnswersStage`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object.
     */
    constructor(parent_game: Game, config: { [key: string]: any }, qdat: QuestionData) {
        super(parent_game, config);
        this.qdat = qdat;
        this.point_reward = yesOrThrow(config, "point_reward");
    }

    @GameState.stateChanger
    public begin_active() {
        // Get list of players that answered correctly:
        const heroes = this.qdat.listDumpAndClear()

        // Updating scores, and creating player_specific_info object
        const score_map = new Map<string, number>();
        for (const hero of heroes) {
            score_map.set(hero, this.point_reward);
            this.player_specific_info[hero] = {answer_correct: true};
        }

        this.parent_game.updateScores(score_map);
    }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/checkanswersstage_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/checkanswersstage_bigscreen.js");
    }

    public playerScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/checkanswersstage_playerscreen.html")
            .add_js_file("./dist/view/widget_scripts/checkanswersstage_playerscreen.js")
            .add_css_file("./src/view/widgets_css/checkanswersstage_playerscreen.css");
    }

    public adminScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/checkanswersstage_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/checkanswersstage_bigscreen.js");
    }

    public stateMsg(): GameDataMsg {
        return {
            general_info: {
                answer: this.qdat.exemplar_answer
            },
            player_specific_info: this.player_specific_info
        };
    }
}