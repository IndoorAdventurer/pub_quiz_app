import type Game from "./game.js";
import GameState from "./gamestate.js";
import WidgetSnippets from "../view/widgetsnippets.js";
import { GameDataMsg, PlayerDataMsg, PlayerListener } from "./gametypes.js";
import yesOrThrow from "../utils/yesorthrow.js";

/**
 * The first `GameState` of any game! Will show on the big screen a list of
 * all candidates. To people going to the website (on their phone), it will
 * provide an interface to join the game and create a (nick)name.
 * 
 * The lobby can also be added again later in the game as a game state. In that
 * case, it is used to go from groups to individual players. I.e. people were
 * first playing in groupes, where only one was logged in, but now everyone will
 * log in. The admin screen has functionality for this. It has a button to log
 * everyone out at once, but save all group names and associated scores. Then it
 * shows an interface to quickly place newly logged in players to their former
 * group, such that they get the amount of points of their group.
 */
export default class Lobby extends GameState implements PlayerListener {

    public readonly name = "lobby";
    private big_screen_msg: string;

    /**
     * Constructor of `Lobby`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object. Should specify `big_screen_msg` as a
     * message to show on the big screen that tells players how they can join
     * on their phone. (e.g. go to this and that web address)
     */
    constructor(parent_game: Game, config: { [key: string]: any }) {
        super(parent_game, config);
        this.big_screen_msg = yesOrThrow(config, "big_screen_msg");
    }

    // Lobby listens for player updates while active:
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
    }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/lobby_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/lobby_bigscreen.js")
            .add_css_file("./src/view/widgets_css/lobby_bigscreen.css");
    }

    public playerScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/lobby_playerscreen.html")
            .add_html_file("./src/view/html/widgets/wait_playerscreen.html")
            .add_js_file("./dist/view/widget_scripts/lobby_playerscreen.js");
    }

    public adminScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/lobby_adminscreen.html")
            .add_js_file("./dist/view/widget_scripts/lobby_adminscreen.js");
    }

    public playerAnswer(name: string, response: string): boolean {
        return this.parent_game.addPlayer(name);
    }

    public stateMsg(): GameDataMsg {
        const pdata = this.parent_game.playerDataDump();
        const names = pdata.map(p => p.name);
        const scores = pdata.map(p => p.score);
        const psi: { [key: string]: any } = {};
        for (const p of names)
            psi[p] = { widget_name: "wait_screen" };

        return {
            general_info: {
                all_players: names,
                all_scores: scores,
                big_screen_msg: this.big_screen_msg
            },
            player_specific_info: psi
        };
    }
}