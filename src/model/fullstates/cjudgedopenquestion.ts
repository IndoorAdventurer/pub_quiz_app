import CrowdJudgedQTemplate from "../constituentstates/crowdjudgedqtemplate.js";
import Game from "../game.js";
import PlayerPicker from "../constituentstates/playerpicker.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";
import yesOrThrow from "../../utils/yesorthrow.js";
import AdminMsgState from "./adminmsgstate.js";
import CrowdJudgedShowAnswers from "../constituentstates/crowdjudgedshowanswers.js";


/**
 * This is an open question where the crowd, i.e. the eliminated players, have
 * to judge if an answer is given. So the quizmaster asks a question in the form
 * of: "What do you know about X", and the candidate has to give, say, 5 answers.
 * The crowd sees these 5 and have to press when it is given.
 */
export default class CJudgedOpenQuestion extends CrowdJudgedQTemplate {
    
    public readonly name: string = "cjudgedopenquestion"

    private question: string;
    private score_subtraction: number;


    constructor(parent_game: Game, config: {[key: string]: any}) {

        // Questions are not connected to each other like in other crowd judged
        // rounds, so each question has its own picker
        const picker = new PlayerPicker(parent_game);
        const question = yesOrThrow(config, "question");
        
        // First a state where only the admin already gets to see the quesion:
        new AdminMsgState(parent_game, { message: question });

        // The answering stage itself:
        super(parent_game, config, picker, true);

        // Show all the correct answers after the question at the end
        new CrowdJudgedShowAnswers(parent_game, config);

        this.question = question;
        
        // Subtract this amount of points from the other players when the active
        // player give the correct answer (GIVE POSITIVE VALUE):
        this.score_subtraction = yesOrThrow(config, "score_subtraction");
        if (this.score_subtraction < 0)
            throw Error("Make sure the score subtraction value is positive");
    }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/cjudgedopenquestion_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/cjudgedopenquestion_bigscreen.js");
    }

    /**
     * Subtracts `this.score_subtraction` from all `isplaying` players except
     * the `this.active_player`.
     * @param answer The correct answer the player gave. Gets ignored.
     */
    protected handleCorrectAnswer(answer: string): void {
        const players = this.parent_game.getPlayerNames(true);
        const map = new Map<string, number>();
        for (const p of players)
            map.set(p, -this.score_subtraction);
        if (this.active_player)
            map.delete(this.active_player);
        const aboveZero = this.parent_game.updateScores(map);

        // WE HAVE A WINNER! EXITING QUESTION.
        if (!aboveZero)
            this.parent_game.setCurState(1, true);
    }

    public stateMsg(): GameDataMsg {
        const ret = super.stateMsg();
        ret.general_info["question"] = this.question;

        return ret;
    }
    
}