import ConnectionAnsweringStage from "../constituentstates/connectionansweringstage.js";
import Game from "../game.js";
import AdminAnswerCheck from "../constituentstates/adminanswercheck.js";
import CheckAnswersStage from "../constituentstates/checkanswersstage.js";
import QuestionData from "../constituentstates/questiondata.js";
import yesOrThrow from "../../utils/yesorthrow.js";
import { all_game_states } from "../allgamestates.js";


/**
 * A connection round can exist out of any number of questions. The answers to
 * these questions are collected. Then as a last question of that round we show
 * all answers, and ask what the connection is between these answers.
 */
export default class ConnectionRound extends ConnectionAnsweringStage {

    constructor(parent_game: Game, config: { [key: string]: any }) {
        const qdat = new QuestionData(
            yesOrThrow(config, "correct_answer"),
            true
        );

        // Going over the rounds the question is made of. In addition to name
        // and args, we should now also specify the answer field. Not relying on
        // the "correct_answer" field inside of args for flexibility: what if
        // we want to add a static or multimedia page inbetween, for exmaple.
        const connection_answers: string[] = [];
        for (const gs of yesOrThrow(config, "gamestates")) {
            const name = yesOrThrow(gs, "name");
            const args = yesOrThrow(gs, "args");
            if ("answer" in gs)
                connection_answers.push(gs.answer);
            else
                console.warn(`No "answer" specified for "${name}", ${args}` +
                    " in connection round");
            new all_game_states[name](parent_game, args);
        }

        // Asking the connection question:
        super(parent_game, { connection_answers: connection_answers }, qdat);

        // Add state where the admin sees all player answers and marks which
        // ones are correct:
        new AdminAnswerCheck(parent_game, config, qdat);
        
        // This will add the stage that checks answers and gives points:
        new CheckAnswersStage(parent_game, config, qdat);
    }

}