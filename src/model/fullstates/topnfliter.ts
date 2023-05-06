import Game from "../game.js";
import GameState from "../gamestate.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg, PlayerDataMsg, PlayerListener } from "../gametypes.js";
import yesOrThrow from "../../utils/yesorthrow.js";

/**
 * This whole game is an elimination race, so at some points in the game you
 * want to filter out everyone except the top N best players. This class does
 * exactly that: it first shows the top N players it wants to leave in, and when
 * all is fine, the admin can proceed with elimination. Elimination just means
 * a player its `isplaying` boolean is set to `false`. From then on this player
 * will be a judge instead of an active player.
 */
export default class TopNFliter extends GameState implements PlayerListener {

    public readonly name = "topnfliter";

    private top_n: number;

    /**
     * Constructor of `TopNFliter`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object.
     */
    constructor(parent_game: Game, config: { [key: string]: any }) {
        super(parent_game, config);
        this.top_n = yesOrThrow(config, "top_n");
    }

    // Listens for player changes while active. For example, if we the admin
    // removes someone in the top N who doesn't want to be in it
    public update(val: "player", msg: PlayerDataMsg): void {
        if (this.parent_game.currentState() === this)
            this.parent_game.gameStateChange(this.stateMsg());
    }

    @GameState.stateChanger
    public begin_active() {
        this.parent_game.addPlayerListener(this);
    }

    public end_active(): void {
        this.parent_game.removePlayerListener(this);

        // Filtering out all but  the top N in `end_active` to give some room
        // for taking people out of top n who don't wan to be in:
        const ordered_names = this.parent_game.playerDataDump()
            .map(p => p.name);
        
        // Only setting top_n players to `isplaying = true`, rest to `false`
        const topN = ordered_names.splice(0, this.top_n);
        this.parent_game.setIsPlaying(topN, true);
        this.parent_game.setIsPlaying(ordered_names, false);
    }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/topnfliter_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/topnfliter_bigscreen.js");
    }

    public playerScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/wait_playerscreen.html");
    }

    public stateMsg(): GameDataMsg {
        const topN = this.parent_game.playerDataDump()
            .slice(0, this.top_n)
            .map(p => {return {name: p.name, score: p.score}});
        
        return {
            widget_name: "wait_screen",
            general_info: {
                widget_name: this.name,
                top_n: topN
            },
            player_specific_info: {}
        };
    }
}