import CrowdJudgedQTemplate from "../constituentstates/crowdjudgedqtemplate.js";
import Game from "../game.js";
import PlayerPicker from "../constituentstates/playerpicker.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";
import yesOrThrow from "../../utils/yesorthrow.js";
import CrowdJudgedShowAnswers from "../constituentstates/crowdjudgedshowanswers.js";
import JudgeInformAdminMsg from "../constituentstates/judgeinformadminmsg.js";


/**
 * This is an open question where the crowd, i.e. the eliminated players, have
 * to judge if an answer is given. So the quizmaster asks a question in the form
 * of: "What do you know about X", and the candidate has to give, say, 5 answers.
 * The crowd sees these 5 and have to press when it is given.
 */
export default class CJudgedOpenQuestion extends CrowdJudgedQTemplate {
    
    public readonly name: string = "cjudgedopenquestion";

    private question: string;
    private score_subtraction: number;

    /**
     * When one player beat the other, we should go the the game state beyond
     * the last open question. This variable keeps an index to that state.
     * Maybe I could have come up with a cleaner solution, but well 🤷🏻‍♂️😛
     */
    private static target_gs_idx = -1;
    private showanswerstage: CrowdJudgedShowAnswers;


    constructor(parent_game: Game, config: {[key: string]: any}) {

        // Questions are not connected to each other like in other crowd judged
        // rounds, so each question has its own picker
        const picker = new PlayerPicker(parent_game);
        const question = yesOrThrow(config, "question");
        
        config["message"] = "QUESTION: " + question;
        config["judgeinform_question"] = question;
        
        // Show admin the question, and judge question and answers:
        new JudgeInformAdminMsg(parent_game, config);

        // The answering stage itself:
        super(parent_game, config, picker, () => {
            this.alterShowAnswerStage();
            this.parent_game.setCurState(1, true);
        });

        // Show all the correct answers at the end:
        this.showanswerstage = new CrowdJudgedShowAnswers(parent_game, config);

        this.question = question;
        
        // Subtract this amount of points from the other players when the active
        // player give the correct answer (GIVE POSITIVE VALUE):
        this.score_subtraction = yesOrThrow(config, "score_subtraction");
        if (this.score_subtraction < 0)
            throw Error("Make sure the score subtraction value is positive");
        
        // Settings target game state index to the number of game states, such
        // that it points to the one beyond the last CJudgedOpenQuestion we add:
        CJudgedOpenQuestion.target_gs_idx = parent_game.numberOfStates();
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
        if (!aboveZero) {
            this.alterShowAnswerStage();
            this.parent_game.setCurState(1, true);
        }
    }

    public stateMsg(): GameDataMsg {
        const ret = super.stateMsg();
        ret.general_info["question"] = this.question;

        return ret;
    }

    /**
     * Probably the most sketchy method in this code base... It alters the
     * `CrowdJudgedShowAnswers` object associated with this question, such that
     * after leaving that state, it will redirect you to the game state beyond
     * the last question.
     * 
     * It gets called after one player beat the other (which means the game is
     * over). In that way, it ensures you can still show the correct answers,
     * but after that, will leave this round by skipping al unanswered questions
     */
    private alterShowAnswerStage() {
        const end_active = this.showanswerstage.end_active;
        const pg = this.parent_game;

        this.showanswerstage.end_active = function() {
            // Immediately restore old situation after the first call, otherwise
            // we likely end in an infinite loop..
            this.end_active = end_active;

            // I have to put this in a setTimeout, because this function itself
            // gets called from inside setCurState().. Otherwise the outer call
            // undos the effect of this inner call...
            setTimeout(
                () => pg.setCurState(CJudgedOpenQuestion.target_gs_idx), 10)
        }
    }
}