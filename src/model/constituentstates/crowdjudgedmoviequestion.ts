import Game from "../game.js";
import CrowdJudgedQTemplate from "./crowdjudgedqtemplate.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import yesOrThrow from "../../utils/yesorthrow.js";
import PlayerPicker from "./playerpicker.js";
import CrowdJudgedShowAnswers from "./crowdjudgedshowanswers.js";
import JudgeInformMovie from "./judgeinformmovie.js";

/**
 * In this type of question, the candidate(s) first get to see a video clip and
 * after that have to give `N` keywords associated with that clip. Each
 * subsequent answer is worth more than the previous. For example, for the first
 * question you get right, you might get 10 points, the second 20, etc.
 */
export default class CrowdJudgedMovieQuestion extends CrowdJudgedQTemplate {
    
    public readonly name = "crowdjudgedmoviequestion";

    private points_sf: number;  // scale factor for points

    /**
     * Constructor of `CrowdJudgedMovieQuestion`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object.
     */
    constructor(parent_game: Game, config: { [key: string]: any }, picker: PlayerPicker) {
        
        // Setting the question the judges get to see to something generic here:
        config["judgeinform_question"] = "Zoek trefwoorden bij het clipje.";

        // First show the movie and inform judges already of correct answers:
        new JudgeInformMovie(parent_game, config);
        
        // Let players answer:
        super(parent_game, config, picker);

        // Show all the correct answers at the end:
        new CrowdJudgedShowAnswers(parent_game, config);
        
        // score_sum specifies the total number of obtainable points:
        const score_sum: number = yesOrThrow(config, "score_sum");
        let N: number = yesOrThrow(config, "correct_answers").length;

        // Calculate scale factor with `n * (n + 1) / 2` formula:
        this.points_sf = Math.round(2 * score_sum / (N * ++N));
    }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/crowdjudgedmoviequestion_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/crowdjudgedmoviequestion_bigscreen.js");
    }

    /**
     * Gives a linearly increasing amount of points for each new answer:
     * The first is worth `1 * x` points, the second `2 * x`, etc. This means
     * that the total number of points obtainable in this question is:
     * `x * N * (N + 1) / 2`, where `N` is the number of answers.
     * @param answer The correct answer the player gave. Gets ignored.
     */
    protected handleCorrectAnswer(answer: string): void {
        // First answer worth 1 * points_sf, second 2 * points_sf, etc:
        const points = this.jMap.given_answers.length * this.points_sf;
        if (this.active_player) {
            this.parent_game.updateScores(new Map<string, number>([
                [this.active_player, points]
            ]));
        }
    }
}