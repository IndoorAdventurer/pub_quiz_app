import Game from "../game.js";
import GameState from "../gamestate.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";
import yesOrThrow from "../../utils/yesorthrow.js";

/**
 * TODO: add description!
 */
export default class StaticPage extends GameState {

    public readonly name = "staticpage";

    private html_content: string;

    /**
     * Constructor of `StaticPage`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object.
     */
    constructor(parent_game: Game, config: { [key: string]: any }) {
        super(parent_game, config);
        this.html_content = yesOrThrow(config, "html_content");
    }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/staticpage_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/staticpage_bigscreen.js");
    }

    public playerScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/wait_playerscreen.html");
    }

    public stateMsg(): GameDataMsg {
        const players = this.parent_game.getPlayerNames();
        const psi: { [key: string]: any } = {};
        for (const p of players)
            psi[p] = { widget_name: "wait_screen" };

        return {
            general_info: { html: this.html_content },
            player_specific_info: psi
        };
    }
}