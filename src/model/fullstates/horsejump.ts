import Game from "../game.js";
import GameState from "../gamestate.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";
import yesOrThrow from "../../utils/yesorthrow.js";

/**
 * Shows a horse jump puzzle to the players (from the "2 voor 12" game show). A
 * player gets to see a 3 x 3 grid of letters, except for the middle one, and
 * need to make a word with it by only making jumps like the horse of chess:
 * ```
 * e p n
 * a   l
 * e t h,
 * ```
 * for example, gives `elephant` as answer.
 * Only works with words of 8 letters, of course.
 */
export default class HorseJump extends GameState {

    public readonly name = "horsejump";

    private scrambled_word: string;
    private time_seconds: number;
    private timer: NodeJS.Timeout | undefined;

    /**
     * Constructor of `HorseJump`
     * @param parent_game The `Game` this lobby will be added to
     * @param config The config object.
     */
    constructor(parent_game: Game, config: { [key: string]: any }) {
        super(parent_game, config);
        
        // Getting word as an array of uppercase letters:
        let word = (yesOrThrow(config, "word") as string)
            .toUpperCase().split("");
        if (word.length !== 8)
            throw new Error("Horse jump words must have exactly 8 letters!");
        
        // 50% chance of reversing the word
        if (Math.random() < 0.5)
            word = word.reverse();
        
        // Now scramble:
        const tmpWord = new Array<string>(8);
        let tmpIdx = Math.floor(Math.random() * 8);
        for (let idx = 0; idx !== 8; ++idx) {
            tmpWord[tmpIdx] = word[idx];
            tmpIdx = (tmpIdx + 3) % 8;
        }

        this.scrambled_word = tmpWord.join("");
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
            .add_html_file("./src/view/html/widgets/horsejump_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/horsejump_bigscreen.js")
            .add_css_file("./src/view/widgets_css/horsejump_bigscreen.css");
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
                scrambled_word: this.scrambled_word,
                time_seconds: this.time_seconds
            },
            player_specific_info: {}
        };
    }
}