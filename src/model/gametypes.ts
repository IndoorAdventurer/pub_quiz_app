/**
 * Represent a player in the game. Manages its data, such as score, etc.
 */
export interface Player {
    score: number; // The players score
    isplaying: boolean; // At some point, only the top-n players will keep
}
/**
 * An interface for the observer pattern: Any class that wants to receive
 * a notification when the state of the game has changed, has to extend this
 * interface.
 * `T` should be a string specifying the topic. For example, we can have:
 * `class Foo implements Listener<"topic-x"> {}`
 */
interface Listener<T, U = any> {
    /**
     * The function that should be implemented
     * @param val a string describing the 'topic'
     * @param msg an object describing the state. Should contain all the info
     * the viewer would want.
     */
    update(val: T, msg: U): void;
}

export type GameListener = Listener<"game", GameDataMsg>;
export type PlayerListener = Listener<"player", PlayerDataMsg>;
/**
 * A `GameState` (see `gamestate.ts`) notifies others of changes through
 * returned objects. These objects need to abide by this interface.
 *
 * The `general_info` field should contain an object with general information
 * about the state of the gamen.
 *
 * The `player_specific_info` field should contain an object where each key
 * corresponds to a player in the game. The corresponding values should be
 * objects with player-specific information.
 *
 * The `admin_info` field should contain information that only the admin (i.e.
 * the quiz master) should know. It is optional, since often `general_info` will
 * suffice.
 *
 * The `widget_name` field should give the name of the widget that receives this
 * object on the client side. **Note that** higher specificity has priority: if
 * this field is defined in the global scope, and in the player scope, then the
 * player scope will be the widget the player sees. The same goes for admin. The
 * general info widget will be associated the big screen.
 *
 * **IMPORTANT!** Make sure you return ALL the information you need to re-draw
 * the screen of the client. Don't ever add statefull information on the client
 * side.
 */


export interface GameDataMsg {
    widget_name?: string;
    general_info: {
        widget_name?: string;
        [key: string]: any;
    };

    admin_info?: {
        widget_name?: string;
        [key: string]: any;
    };

    player_specific_info: {
        [player: string]: {
            widget_name?: string;
            [key: string]: any;
        };
    };
}
/**
 * Player data is an array of objects containing the information of all players.
 * These should be sorted in descending order of score. A PlayerListener takes
 * this type as argument for its update function.
 */

export type PlayerDataMsg = {
    name: string;
    score: number;
    isplaying: boolean;
}[];
