import Game from "./game.js";
import { GameDataMsg } from "./gametypes.js";
import WidgetSnippets from "../view/widgetsnippets.js";

/**
 * Represents a certain state of the game. For example, a specific question, or
 * a specific round. Even the pre-game state where people can log in should be
 * derived from this class. Gets access to the relevant internals of the `Game`
 * class, as it is responsible for manipulating these. For example, a question
 * is itself responsible for updating the points of individual players.
 */
export default abstract class GameState {

    // GameState object needs to be able to interact with a game:
    protected parent_game: Game;

    // GameState object needs a name that gets appended to update messages
    // such that there is no confusion about what the active game state is
    public readonly abstract name: string;

    /**
     * The base class constructor that gets called for any object that is
     * derived from this abstract `GameState` class. Adds a reference to the
     * game, **AND ADDS ITSELF TO THE GAME!**.
     * 
     * ❗**WARNING:**❗This constructor will add itself to the `parent_game`
     * `Game` object. This means that **[A]**: you won't **EVER** have to do
     * this manually! **[B]**: you should be aware of the fact that any
     * `GameState` will automatically be added to the game on construction. This
     * means that a `GameState` object that is not part of a `Game` cannot
     * exist. It also means that the order of construction makes all the
     * difference.
     * @param parent_game The `Game` object this `GameState` belongs to. It will
     * add `parent_game` as a `protected` field `this.parent_game`, and it will
     * add itself to this game.
     */
    constructor(parent_game: Game) {
        this.parent_game = parent_game;
        
        // I am an adult, so I am allowed to do these kinds of things 😉
        // Making the gamestate add itself to the game, by calling a method
        // that is actually private to `Game`. This is its intended use
        // however. Doing a bit of ugglyness here for safer code elsewhere.
        (parent_game as any).makeGameStateAddSelf(this);
    }

    /**
     * Gets called when `Game` hands control over to this object, such that it
     * gets notified it is in charge now. It can, for example, set things up
     * to start a timer that makes the player's points tick away, or make sure
     * the players will see the appropriate screen, etc.
     */
    @GameState.stateChanger
    public begin_active(): GameDataMsg {
        return {
            general_info: {},
            player_specific_info: {}
        };
    }

    /**
     * Gets called when `Game` hands control over to the next `GameState`
     */
    // Not adding decorator here, since the next `GameState` its `begin_active`
    // will be called right afterwards.
    public end_active(): void { }

    /**
     * Returns widget snippets for the big screen.
     * @returns A `WidgetSnippets` object containing all the html, js and css
     * needed to correctly display the current game state on the big screen.
     * The big screen is just a large tv in the middle of the room that, for
     * example, during a question should display the question.
     * See the `WidgetSnipptes` class for more information!
     */
    public abstract bigScreenWidgets(): WidgetSnippets;

    /**
     * Returns widget snippets for the screen of any player.
     * @returns A `WidgetSnippets` object containing all the html, js and css
     * to correctly display the current game state on the (mobile phone) screen
     * of the client. For example, for a multiple-choice question, it should
     * contain an html template with the 4 buttons (A, B, C, D) the player can
     * press, as well as the javascript code to send the answer back.
     * See the `WidgetSnipptes` class for more information!
     */
    public abstract playerScreenWidgets(): WidgetSnippets;

    /**
     * Returns widget snippets for the admin screen. Usually this will be
     * nothing, so a default implementation is given.
     * @returns A `WidgetSnippets` object to correctly render the current game
     * state on the screen of the admin. For example, after an open question
     * has been answered, the game should move into a state where the admin
     * has to manually check which answers were correct. The widget to do this
     * checking, together with the javascript to send back the evaluation of
     * the admin, should then be included here.
     * See the `WidgetSnipptes` class for more information!
     */
    public adminScreenWidgets(): WidgetSnippets {
        const ws = new WidgetSnippets();
        ws.add_css_snippet(`
        <template id="nothing">
        <p>Nothing to display</p>
        </template>
        `);
        return ws;
    }

    /**
     * When a player gives some response this function will have to process
     * that response. For example, if the response is a good answer, it can
     * calculate what score the player has gained, so it can add this later to
     * that players total using `Game.addToScores()`.
     * @param name The name of the player
     * @param response The response the player gave
     */
    public abstract playerAnswer(name: string, response: string): boolean;


    /**
     * Should return a summary of the current state in the form of a
     * `GameDataMsg`.
     */
    public abstract stateMsg(): GameDataMsg;

    /**
     * A method decorator. Any method of a class that derives from
     * `GameState` should be decorated with `@GameState.stateChanger` if it
     * makes some change to the visible state of the game.
     * @returns A decorator that ensures the `Game` object notifies all clients
     * of an update when it is called.
     */
    protected static stateChanger: MethodDecorator = function (target: Object,
        key: string | symbol,
        descriptor: PropertyDescriptor) {
        
        const of = descriptor.value;
        descriptor.value = function (this: GameState, ...args: any[]) {
            const out = of.apply(this, args);
            this.parent_game.gameStateChange(this.stateMsg());
            return out;
        }

        return descriptor;
    }

}