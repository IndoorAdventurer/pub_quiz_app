import yesOrThrow from "../../utils/yesorthrow.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import AdminMsgState from "../fullstates/adminmsgstate.js";
import Game from "../game.js";
import { GameDataMsg } from "../gametypes.js";


/**
 * Same functionality as `AdminMsgState`, except that it shows the judges, i.e.
 * the non-playing players, already the answers to the upcoming question.
 */
export default class JudgeInformAdminMsg extends AdminMsgState {

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

// Shame that you cant extend generics: class X<T> extends T. Because I have
// multiple classes that are pretty much just exact copies, except for which
// class they extend :-(