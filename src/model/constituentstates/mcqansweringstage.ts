import Game from "../game.js";
import GameState from "../gamestate.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";
import yesOrThrow from "../../utils/yesorthrow.js";
import QuestionData from "./questiondata.js";
import OQAnsweringStage from "./oqansweringstage.js";
import shuffle_array from "../../utils/shuffle.js";

/**
 * Multiple Choice Question -- Answering Stage. So in other words, this
 * game state represents the part of an MC question where people can submit
 * answers. It will make sure everyone gets the correct display in front of
 * their noses, and that received answers are registered so that the next game
 * state can check them.
 * 
 * Note that it derives from `OQAnsweringStage`, as the only difference is
 * 1) which widgets to show to the client;
 * 2) the fact that it has to send an array of MC options in `stateMsg`.
 */
export default class MCQAnsweringStage extends OQAnsweringStage {

    public name = "mcqansweringstage";
    private options: string[];

    /**
     * Constructor of `MCQAnsweringStage`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object.
     * @param qdat The QuestionData object allowing multiple game states to
     * have access to the same data.
     */
    constructor(parent_game: Game, config: { [key: string]: any }, qdat: QuestionData) {
        super(parent_game, config, qdat);
        
        // Get all options and shuffle:
        const correct_answer: string = yesOrThrow(config, "correct_answer");
        const other_options: string[] = yesOrThrow(config, "other_options");
        this.options = other_options.concat(correct_answer);
        this.options = shuffle_array(this.options);
    }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/mcqansweringstage_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/mcqansweringstage_bigscreen.js")
            .add_css_file("./src/view/widgets_css/colorlist.css");
    }

    public playerScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/mcqansweringstage_playerscreen.html")
            .add_html_file("./src/view/html/widgets/wait_playerscreen.html")
            .add_js_file("./dist/view/widget_scripts/mcqansweringstage_playerscreen.js")
            .add_css_file("./src/view/widgets_css/colorlist.css");
    }

    public adminScreenWidgets(): WidgetSnippets {
        // Just the same as bigscreen, so the admin can read it from there.
        return this.bigScreenWidgets();
    }

    public stateMsg(): GameDataMsg {
        const super_msg = super.stateMsg();
        super_msg.general_info["options"] = this.options;
        return super_msg;
    }
}