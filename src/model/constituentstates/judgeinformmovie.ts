import yesOrThrow from "../../utils/yesorthrow.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import MultimediaPage from "../fullstates/multimediapage.js";
import Game from "../game.js";
import { GameDataMsg } from "../gametypes.js";


/**
 * Constituent of the `CrowdJudgedMovieQuestion`. While showing a movie for this
 * question, it also already presents the correct answers to the judges.
 */
export default class JudgeInformMovie extends MultimediaPage {

    private judgeinform_question: string;
    private judgeinform_answers: string;


    /**
     * Constructor
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object.
     */
    constructor(parent_game: Game, config: { [key: string]: any }) {
        super(parent_game, config);
        this.judgeinform_question = yesOrThrow(config, "judgeinform_question");
        this.judgeinform_answers = yesOrThrow(config, "correct_answers");
    }

    public playerScreenWidgets(): WidgetSnippets {
        return super.playerScreenWidgets()
            .add_html_file("./src/view/html/widgets/judgeinform.html")
            .add_js_file("./dist/view/widget_scripts/judgeinform.js")
    }

    public stateMsg(): GameDataMsg {
        const ret = super.stateMsg();

        // Redirect the judges (i.e. nonplaying players) to a screen that
        // already shows them the answers:
        ret.general_info.judgeinform_question = this.judgeinform_question;
        ret.general_info.judgeinform_answers = this.judgeinform_answers;
        
        const psi: { [player: string]: any } = {};
        const psiDict = {widget_name: "judgeinform"};
        for (const player of this.parent_game.getPlayerNames(false))
            psi[player] = psiDict;
        ret.player_specific_info = psi;

        return ret;
    }
}