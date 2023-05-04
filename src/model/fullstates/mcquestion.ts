import yesOrThrow from "../../utils/yesorthrow.js";
import CheckAnswersStage from "../constituentstates/checkanswersstage.js";
import MCQAnsweringStage from "../constituentstates/mcqansweringstage.js";
import QuestionData from "../constituentstates/questiondata.js";
import Game from "../game.js";


/**
 * Encapsulates a multiple-choice question. Here, a player gets to see a random
 * set of options to choose from, and has to select one. It is made up out of
 * two constituent game states, namely:
 * 1) The state where a player can answer the question;
 * 2) The state where points get rewarded.
 */
export default class MCQuestion extends MCQAnsweringStage {


    constructor(parent_game: Game, config: { [key: string]: any }) {
        const qdat = new QuestionData(
            yesOrThrow(config, "correct_answer"),
            true
        );
        
        // Construct parent: the game state that actually allows players to give
        // multiple choice answers:
        super(parent_game, config, qdat);

        // This will add the stage that checks answers and gives points:
        new CheckAnswersStage(parent_game, config, qdat);
    }
}