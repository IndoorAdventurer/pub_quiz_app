import AdminMsgState from "./fullstates/adminmsgstate.js";
import CJudgedMovieRound from "./fullstates/cjudgedmovieround.js";
import CJudgedOpenQuestion from "./fullstates/cjudgedopenquestion.js";
import ConnectionRound from "./fullstates/connectionround.js";
import HorseJump from "./fullstates/horsejump.js";
import MCQuestion from "./fullstates/mcquestion.js";
import MultimediaPage from "./fullstates/multimediapage.js";
import OpenQuestion from "./fullstates/openquestion.js";
import StaticPage from "./fullstates/staticpage.js";
import StoryQuestion from "./fullstates/storyquestion.js";
import type Game from "./game.js";
import GameState from "./gamestate.js";


export const all_game_states: all_game_states_type = {
    adminmsgstate : AdminMsgState,
    cjudgedmovieround : CJudgedMovieRound,
    cjudgedopenquestion : CJudgedOpenQuestion,
    connectionround : ConnectionRound,
    horsejump : HorseJump,
    mcquestion : MCQuestion,
    multimediapage : MultimediaPage,
    openquestion : OpenQuestion,
    staticpage : StaticPage,
    storyquestion : StoryQuestion,

};

// Specify type as object that maps strings to GameState constructors:
type all_game_states_type = {
    [key: string]: new (game: Game, args: {[key: string]: any}) => GameState
}