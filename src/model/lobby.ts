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
            .add_html_snippet(
`<template id="boo">
<p>Booh!👻</p>
</template>`
            )
            .add_js_snippet(
`(function() {
setTimeout(() => {
    const d = document.getElementById("boo");
    const div = document.createElement("div");
    div.id = d.id;
    div.innerHTML = d.innerHTML;
    document.body.appendChild(div);
    console.log("DONE!");
}, 3000);
})();`
            );
    }

    public playerAnswer(name: string, response: string): boolean {
        throw new Error("Method not implemented.");
    }

    public stateMsg(): GameDataMsg {
        throw new Error("Method not implemented.");
    }

}