import yesOrThrow from "../../utils/yesorthrow.js";
import OQAnsweringStage from "../constituentstates/oqansweringstage.js";
import QuestionData from "../constituentstates/questiondata.js";
import Game from "../game.js";


export default class OpenQuestion extends OQAnsweringStage {


    constructor(parent_game: Game, config: { [key: string]: any }) {
        const qdat = new QuestionData(
            yesOrThrow(config, "correct_answer"),
            yesOrThrow(config, "case_sensitive")
        );
        
        super(parent_game, config, qdat);
    }
}