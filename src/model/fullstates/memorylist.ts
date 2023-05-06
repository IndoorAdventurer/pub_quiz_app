import Game from "../game.js";
import GameState from "../gamestate.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";
import yesOrThrow from "../../utils/yesorthrow.js";

/**
 * This state presents a list and an hourglass to the players. They get until
 * the time runs out to memorize the list. Then later in the game, you can give
 * an open question where they must write down everything they remember.
 */
export default class MemoryList extends GameState {

    public readonly name = "memorylist";

    private list: string[];
    private time_seconds: number;
    private timer: NodeJS.Timeout | undefined;

    /**
     * Constructor of `MemoryList`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object.
     */
    constructor(parent_game: Game, config: { [key: string]: any }) {
        super(parent_game, config);
        this.list = yesOrThrow(config, "list");
        this.time_seconds = yesOrThrow(config, "time_seconds");
    }

    @GameState.stateChanger
    public begin_active(): void {
        
        // First clearing: what if we went back one page and then forward again
        clearTimeout(this.timer);
        
        // We move to the next state after the specified amount of seconds:
        this.timer = setTimeout(() => {
            if (this.parent_game.currentState() === this)
                this.parent_game.setCurState(1, true);
        }, this.time_seconds * 1000 + 100); // adding 100ms because I'm nice
    }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/memorylist_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/memorylist_bigscreen.js");
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
                list: this.list,
                time_seconds: this.time_seconds
            },
            player_specific_info: {}
        };
    }
}