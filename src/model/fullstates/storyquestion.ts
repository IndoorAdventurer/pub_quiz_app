import yesOrThrow from "../../utils/yesorthrow.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import AdminAnswerCheck from "../constituentstates/adminanswercheck.js";
import CheckAnswersRankedStage from "../constituentstates/checkanswersrankedstage.js";
import OQAnsweringStage from "../constituentstates/oqansweringstage.js";
import QuestionData from "../constituentstates/questiondata.js";
import Game from "../game.js";
import { GameDataMsg } from "../gametypes.js";



export default class StoryQuestion extends OQAnsweringStage {

    private story: string;
    
    constructor(parent_game: Game, config: { [key: string]: any }) {
        const qdat = new QuestionData(
            yesOrThrow(config, "correct_answer"),
            yesOrThrow(config, "case_sensitive")
        );
        
        // Construct parent: the game state that allows players to give open
        // answered questions:
        super(parent_game, {...config, question: "Geef antwoord als je het weet"}, qdat);

        // The story the admin will tell:
        this.story = yesOrThrow(config, "story");

        // Add state where the admin sees all player answers and marks which
        // ones are correct:
        new AdminAnswerCheck(parent_game, config, qdat);

        // For story questions you have to answer as early as possible. The
        // following stage gives more points depending on how soon a player
        // answered:
        new CheckAnswersRankedStage(parent_game, config, qdat);
    }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/wait_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/wait_bigscreen.js");
    }

    public adminScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/adminmsgstate_adminscreen.html")
            .add_js_file("./dist/view/widget_scripts/adminmsgstate_adminscreen.js");
    }

    public stateMsg(): GameDataMsg {
        const ret = super.stateMsg();
        ret.general_info.widget_name = "wait_screen";
        ret.admin_info = {
            // I am re-using stuff from `AdminMsgState`:
            widget_name: "adminmsgstate",
            message: this.story
        }
        return ret;
    }

}