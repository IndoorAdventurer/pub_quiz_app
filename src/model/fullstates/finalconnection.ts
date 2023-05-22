import Game from "../game.js";
import GameState from "../gamestate.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";
import yesOrThrow from "../../utils/yesorthrow.js";
import ConnectionAnsweringStage from "../constituentstates/connectionansweringstage.js";
import QuestionData from "../constituentstates/questiondata.js";
import shuffle_array from "../../utils/shuffle.js";

/**
 * If the person making the quiz feels like it, he/she can design the game like
 * in the Dutch game show The Connection. Here, at the end, the final candidate
 * gets to see all answers that were given during the game, and these all are
 * connected somehow. The final candidate has to find this connection.
 * So the whole game is pretty much a `ConnectionRound`.
 * 
 * This class takes a story with key terms marked {like this} as input. The
 * key terms are first displayed to the user for him/her to find the connection
 * until the time runs out. Afterwards, the admin gets to see the story with the
 * keywords marked in red. He/she should then read it to the audiance and click
 * on the ones he reads such that they appear on screen.
 */
export default class FinalConnection extends GameState {

    public readonly name = "finalconnection";
    
    static readonly curlyRegEx = /{([^}]*)}/g;
    private admin_text: string;
    private given_keywords: string[] = [];

    /**
     * Constructor of `FinalConnection`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object.
     */
    constructor(parent_game: Game, config: { [key: string]: any }) {
        const admin_text: string = yesOrThrow(config, "admin_text");
        let connection_answers: string[] = [];
        for (const match of admin_text.matchAll(FinalConnection.curlyRegEx))
            connection_answers.push(match[1]);
        
        connection_answers = shuffle_array(connection_answers);
        
        const qdat = new QuestionData("-");
        const cas = new ConnectionAnsweringStage(
            parent_game,
            {...config, connection_answers: connection_answers},
            qdat
        );

        // Modifying cas a bit:
        modifyAnsweringStage(
            cas, parent_game, yesOrThrow(config, "start_bonus"));
        
        // Give the answer:
        super(parent_game, config);
        this.admin_text = admin_text;
    }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/finalconnection_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/finalconnection_bigscreen.js")
            .add_css_file("./src/view/widgets_css/connectionansweringstage_bigscreen.css");
    }

    public playerScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/wait_playerscreen.html");
    }

    public adminScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/finalconnection_adminscreen.html")
            .add_js_file("./dist/view/widget_scripts/finalconnection_adminscreen.js")
            .add_css_file("./src/view/widgets_css/finalconnection_adminscreen.css");
    }

    /**
     * The admin reads the text that reveals The Connection. Meanwhile, he/she
     * clicks on the keywords read, such that they get added to the list of
     * given keywords displayed on the screen.
     * @param obj The object received by the admin client
     */
    @GameState.stateChanger
    public adminAnswer(obj: {[key: string]: any}): void {
        const keyword: string = obj.keyword;
        if (!keyword || this.given_keywords.indexOf(keyword) !== -1)
            return;
        this.given_keywords.push(keyword);
        this.admin_text = this.admin_text.replace("{" + keyword + "}", keyword);
    }

    public stateMsg(): GameDataMsg {
        return {
            widget_name: "wait_screen",
            general_info: {
                widget_name: this.name,
                given_keywords: this.given_keywords
            },
            admin_info: {
                widget_name: this.name,
                text: this.admin_text
            },
            player_specific_info: {}
        };
    }
}

/**
 * (Bit of a sketchy function, but don't want to make a whole freaking new class
 * for this :-p) Modifies the `ConnectionAnsweringStage` object such that it
 * directs all players to the wait screen instead to the screen where they can
 * give answers.
 * @param cas The `ConnectionAnsweringStage` object to fck up
 */
function modifyAnsweringStage(cas: ConnectionAnsweringStage,
    game: Game,
    start_bonus: number) {

    // Sending all players to wait screen:
    cas.stateMsg = function(): GameDataMsg {
        const ret = ConnectionAnsweringStage.prototype.stateMsg.call(this);

        ret.player_specific_info = {};
        ret.widget_name = "wait_screen";

        return ret;
    }

    // Giving the number 1 player a score bonus and then letting its points tick
    // away:
    let timer: NodeJS.Timeout | undefined;
    let num1: string | undefined;

    const tickFunc = () => {
        if (game.currentState() !== cas || !num1) {
            clearInterval(timer);
            return;
        }
        process.stdout.write("tick, ")
        const nominal = game.updateScores(new Map<string, number>([
            [num1, -1]
        ]), true);

        // Move to next state if score ran out:
        if (!nominal)
            game.setCurState(1, true);
    }

    cas.begin_active = function() {
        // Let score tick away:
        num1 = game.playerDataDump()[0]?.name;
        timer = setInterval(tickFunc, 1000);
        game.gameStateChange(this.stateMsg());
        
        // Give a start bonus to the player:
        if (!num1)
            return;
        game.updateScores(new Map<string, number>([
            [num1, start_bonus]
        ]), true);
    }

    cas.end_active = function() {
        clearInterval(timer);
    }

}