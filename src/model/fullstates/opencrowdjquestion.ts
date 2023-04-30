import CrowdJudgedQTemplate from "../constituentstates/crowdjudgedqtemplate.js";
import Game from "../game.js";
import PlayerPicker from "../constituentstates/playerpicker.js";
import WidgetSnippets from "../../view/widgetsnippets.js";
import { GameDataMsg } from "../gametypes.js";



export default class OpenCrowdJQuestion extends CrowdJudgedQTemplate {
    public readonly name: string = "opencrowdjquestion"


    constructor(parent_game: Game, config: {[key: string]: any}) {
        // TODO: is constituent state so move to that folder
        const picker = new PlayerPicker(parent_game);
        super(parent_game, config, picker);
    }

    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets()
            .add_html_file("./src/view/html/widgets/oqansweringstage_bigscreen.html")
            .add_js_file("./dist/view/widget_scripts/oqansweringstage_bigscreen.js");
    }

    protected handleCorrectAnswer(answer: string): void {
        // TODO change
        if (this.active_player)
            this.parent_game.updateScores(new Map([[this.active_player, 20]]));
    }

    public stateMsg(): GameDataMsg {
        const ret = super.stateMsg();

        ret.general_info["widget_name"] = "oqansweringstage";
        ret.general_info["question"] = "Test";

        return ret;
    }
    
}