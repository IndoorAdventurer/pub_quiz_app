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
        .add_js_file("./dist/view/widget_scripts/lobby_playerscreen.js");
    }

    public playerAnswer(name: string, response: string): boolean {
        throw new Error("Method not implemented.");
    }

    public stateMsg(): GameDataMsg {
        throw new Error("Method not implemented.");
    }

}