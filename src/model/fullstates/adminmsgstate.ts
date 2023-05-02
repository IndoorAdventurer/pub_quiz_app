import Game from "../game.js";
import GameState from "../gamestate.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";
import yesOrThrow from "../../utils/yesorthrow.js";

/**
 * When there is time pressure involved, you want the quiz master to first ask
 * the question and only then let the round start. This class helps with that:
 * it is capable of showing the admin some textual information, while leaving
 * the other screens blank. For the rest it does nothing :-p.
 */
export default class AdminMsgState extends GameState {

    public readonly name = "adminmsgstate";
    private message: string;

    /**
     * Constructor of `AdminMsgState`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object.
     */
    constructor(parent_game: Game, config: { [key: string]: any }) {
        super(parent_game, config);
        this.message = yesOrThrow(config, "message");
    }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/wait_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/wait_bigscreen.js");
    }

    public playerScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/wait_playerscreen.html");
    }

    public adminScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/adminmsgstate_adminscreen.html")
            .add_js_file("./dist/view/widget_scripts/adminmsgstate_adminscreen.js");
    }

    public stateMsg(): GameDataMsg {
        // All to wait screen, except for admin:
        return {
            widget_name: "wait_screen",
            general_info: {},
            admin_info: {
                widget_name: this.name,
                message: this.message
            },
            player_specific_info: {}
        };
    }
}