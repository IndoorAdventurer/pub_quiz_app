import MCQuestion from "./fullstates/mcquestion.js";
import OpenCrowdJQuestion from "./fullstates/opencrowdjquestion.js";
import OpenQuestion from "./fullstates/openquestion.js";
import StaticPage from "./fullstates/staticpage.js";
import type Game from "./game.js";
import GameState from "./gamestate.js";


export const all_game_states: all_game_states_type = {
    mcquestion : MCQuestion,
    opencrowdjquestion : OpenCrowdJQuestion,
    openquestion : OpenQuestion,
    staticpage : StaticPage,

};

// Specify type as object that maps strings to GameState constructors:
type all_game_states_type = {
    [key: string]: new (game: Game, args: {[key: string]: any}) => GameState
}