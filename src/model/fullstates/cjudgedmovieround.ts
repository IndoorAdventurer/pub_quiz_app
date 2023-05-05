import yesOrThrow from "../../utils/yesorthrow.js";
import CrowdJudgedMovieQuestion from "../constituentstates/crowdjudgedmoviequestion.js";
import PlayerPicker from "../constituentstates/playerpicker.js";
import Game from "../game.js";



export default class CJudgedMovieRound extends CrowdJudgedMovieQuestion {

    constructor(parent_game: Game, config: config_type) {
        
        // Picks who gets the next question of the round:
        const picker = new PlayerPicker(parent_game);

        // Getting the config arguments for all CrowdJudgedMovieQuestions:
        const configs: config_type[] = yesOrThrow(config, "questions");
        if (configs.length === 0)
            throw new Error("Movie round should contain at least one question");
        
        // First is the one we inherit from
        super(parent_game, configs.shift() as config_type, picker);

        // Make all the other questions too:
        for (const conf of configs) {
            new CrowdJudgedMovieQuestion(parent_game, conf, picker);
        }
    }
}

type config_type = { [key: string]: any };