import OQAnsweringStage from "./oqansweringstage.js";
import Game from "../game.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";
import yesOrThrow from "../../utils/yesorthrow.js";
import QuestionData from "./questiondata.js";

/**
 * One of the fun rounds (inspiration from the Dutch game show "The Connection")
 * is where the quiz master asks X questions, and then questions `X + 1` is:
 * what is the connection between the answers of these X questions.
 * 
 * This game state is used as that `X + 1` question. It is pretty much an open
 * question, except that on the big screen instead of displaying a question, it
 * displays a list of answers.
 */
export default class ConnectionAnsweringStage extends OQAnsweringStage {

    private connection_answers: string[];
    
    /**
     * Constructor of `OQAnsweringStage`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object.
     * @param qdat The QuestionData object allowing multiple game states to
     * have access to the same data.
     */
    constructor(parent_game: Game, config: { [key: string]: any }, qdat: QuestionData) {
        super(parent_game, { question: "Wat is de connectie?" }, qdat);
        this.connection_answers = yesOrThrow(config, "connection_answers");
    }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/connectionansweringstage_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/connectionansweringstage_bigscreen.js")
            .add_css_file("./src/view/widgets_css/connectionansweringstage_bigscreen.css");
    }

    public stateMsg(): GameDataMsg {
        const ret = super.stateMsg();
        ret.general_info.widget_name = "connectionansweringstage";
        ret.general_info["connection_answers"] = this.connection_answers;
        return ret;
    }
}