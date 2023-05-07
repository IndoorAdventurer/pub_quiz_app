import Game from "../game.js";
import CrowdJudgedQTemplate from "./crowdjudgedqtemplate.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";
import yesOrThrow from "../../utils/yesorthrow.js";
import PlayerPicker from "./playerpicker.js";
import CrowdJudgedShowAnswers from "./crowdjudgedshowanswers.js";
import shuffle_array from "../../utils/shuffle.js";
import JudgeInformAdminMsg from "./judgeinformadminmsg.js";

/**
 * This is the puzzle question of De Slimste Mens. Each player has to find `N`
 * answers, which each are associated with `M` keywords. These `M * N` keywords
 * are randomly placed in a grid.
 * For example, keywords: High, The Big, Work days, Prime - gives answer: Five.
 */
export default class CrowdJudgedPuzzleQuestion extends CrowdJudgedQTemplate {

    public readonly name = "crowdjudgedpuzzlequestion";

    private points_per_correct: number;
    private keyword_array: {keyword: string, answer: string}[];
    private x1: number;     // Dimensions. Not calling them width and height
    private x2: number;     // Because still want to decide which is which lol

    /**
     * Constructor of `CrowdJudgedPuzzleQuestion`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object.
     */
    constructor(parent_game: Game, config: { [key: string]: any }, picker: PlayerPicker) {
        
        // The keys are the answers:
        const correct_answers = Object.keys(config.puzzle)
        config["correct_answers"] = correct_answers;
                
        // Show the judges the answers already:
        config["message"] = "Puzzelvraag";
        config["judgeinform_question"] = "Zoek de verbanden bij de trefwoorden.";
        new JudgeInformAdminMsg(parent_game, config);
        
        // Let the players play the puzzle:
        super(parent_game, config, picker);

        // Show all the correct answers at the end:
        new CrowdJudgedShowAnswers(parent_game, config);

        this.points_per_correct = yesOrThrow(config, "points_per_correct");

        // The puzzle is a mapping from an answer to a list of keywords
        // associated with that answer:
        const puzzle: {[answer: string]: string[]} = yesOrThrow(config, "puzzle");
        
        // Checking for correct input:
        const num_answers = Object.keys(puzzle).length
        const num_keywords = puzzle[Object.keys(puzzle)[0]]?.length;
        if (num_answers === 0 || num_keywords === 0)
            throw new Error("Specify at least one 'answer : keywords[]' pair");
        for (const answer in puzzle) {
            if (puzzle[answer].length !== num_keywords)
                throw new Error("All answers must have same number of keywords");
        }

        // Convert to different representation:
        const list_form: {keyword: string, answer: string}[] = [];
        for (const answer in puzzle)
            for (const keyword of puzzle[answer])
                list_form.push({keyword: keyword, answer: answer});

        this.keyword_array = shuffle_array(list_form);
        this.x1 = num_answers;
        this.x2 = num_keywords;
    }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/crowdjudgedpuzzlequestion_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/crowdjudgedpuzzlequestion_bigscreen.js")
            .add_css_file("./src/view/widgets_css/crowdjudgedpuzzlequestion_bigscreen.css");
    }

    /**
     * Gives a fixed amount of points per correct answer. This amount must be
     * specified as the `points_per_correct` attribute in the `config`.
     * @param answer The correct answer the player gave. Gets ignored.
     */
    protected handleCorrectAnswer(answer: string): void {
        if (this.active_player) {
            this.parent_game.updateScores(new Map([
                [this.active_player, this.points_per_correct]
            ]));
        }
    }

    public stateMsg(): GameDataMsg {
        const ret = super.stateMsg();

        ret.general_info["keywords"] = this.keyword_array;
        ret.general_info["x1"] = this.x1;
        ret.general_info["x2"] = this.x2;

        return ret;
    }
}