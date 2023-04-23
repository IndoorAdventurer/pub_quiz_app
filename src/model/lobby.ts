import type Game from "./game.js";
import GameState from "./gamestate.js";
import WidgetSnippets from "../view/widgetsnippets.js";
import { GameDataMsg } from "./gametypes.js";
import { yesOrThrow } from "../utils/yesorthrow.js";

/**
 * The first `GameState` of any game! Will show on the big screen a list of
 * all candidates. To people going to the website (on their phone), it will
 * provide an interface to join the game and create a (nick)name.
 */
export default class Lobby extends GameState {
    
    public readonly name = "lobby";
    private big_screen_msg: string;

    /**
     * Constructor of `Lobby`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object. Should specify `big_screen_msg` as a
     * message to show on the big screen that tells players how they can join
     * on their phone. (e.g. go to this and that web address)
     */
    constructor(parent_game: Game, config: {[key: string]: any}) {
        super(parent_game, config);
        this.big_screen_msg = yesOrThrow(config, "big_screen_msg");
    }
    
    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
        .add_html_file("./src/view/html/widgets/lobby_bigscreen.html")
        .add_js_file("./dist/view/widget_scripts/lobby_bigscreen.js");
    }

    public playerScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
        .add_html_file("./src/view/html/widgets/lobby_playerscreen.html")
        .add_html_file("./src/view/html/widgets/wait_playerscreen.html")
        .add_js_file("./dist/view/widget_scripts/lobby_playerscreen.js");
    }

    @GameState.stateChanger
    public playerAnswer(name: string, response: string): boolean {
        return this.parent_game.addPlayer(name);
    }

    public stateMsg(): GameDataMsg {
        const players = this.parent_game.getPlayerNames();
        const psi: {[key: string]: any} = {};
        for (const p of players)
            psi[p] = {widget_name: "wait_screen"};

        return {
            general_info: {
                all_players: players,
                big_screen_msg: this.big_screen_msg
            },
            player_specific_info: psi
        };
    }
}