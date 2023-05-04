import Game from "../game.js";
import GameState from "../gamestate.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";
import yesOrThrow from "../../utils/yesorthrow.js";

/**
 * Sometimes you want to show a video, or a cool picture, or play some audio.
 * This class can do all 3 of those things 😎
 */
export default class MultimediaPage extends GameState {

    public readonly name = "multimediapage";

    private path: string;
    private type: "video" | "audio" | "image";

    /**
     * Constructor of `MultimediaPage`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object.
     */
    constructor(parent_game: Game, config: { [key: string]: any }) {
        super(parent_game, config);
        this.path = yesOrThrow(config, "path");
        this.type = yesOrThrow(config, "type");
    }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/multimediapage_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/multimediapage_bigscreen.js")
            .add_css_file("./src/view/widgets_css/multimediapage_bigscreen.css");
    }

    public playerScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/wait_playerscreen.html");
    }

    public stateMsg(): GameDataMsg {
        return {
            widget_name: "wait_screen",
            general_info: {
                widget_name: this.name,
                path: this.path,
                type: this.type
            },
            player_specific_info: {}
        };
    }
}