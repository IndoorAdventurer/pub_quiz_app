import GameState from "./gamestate.js";
import WidgetSnippets from "../view/widgetsnippets.js";
import { GameDataMsg } from "./game.js";

/**
 * The first `GameState` of any game! Will show on the big screen a list of
 * all candidates. To people going to the website (on their phone), it will
 * provide an interface to join the game and create a (nick)name.
 */
export default class Lobby extends GameState {
    
    public readonly name = "lobby";

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets();
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
        const players = Array.from(this.parent_game.getAllPlayerNames());
        const psi = {};
        for (const p of players)
            psi[p] = {widget_name: "wait_screen"};

        return {
            general_info: { all_players: players },
            player_specific_info: psi
        };
    }

}