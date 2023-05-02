import CrowdJudgedQTemplate from "../src/model/constituentstates/crowdjudgedqtemplate";
import Game from "../src/model/game";
import WidgetSnippets from "../src/view/widgetsnippets";
import PlayerPicker from "../src/model/constituentstates/playerpicker";

class CJQTest extends CrowdJudgedQTemplate {
    public readonly name = "test";
    
    protected handleCorrectAnswer(answer: string): void {
        this.parent_game.updateScores(new Map<string, number>([
            [this.active_player || "", 20]
        ]));
    }
    public bigScreenWidgets(): WidgetSnippets {
        return new WidgetSnippets();
    }

    public activePlayer() {
        return this.active_player;
    }
    
}

const configGame = {
    start_score: 0,
    reset_score: 20,
    lobby: {
        big_screen_msg: "-",
    },
    gamestates: []
}

const configTest = {
    correct_answers: ["aap", "noot", "mies"],
    max_points: 5,
    min_points: 1
}

describe("Basic testing of the CrowdJudgedQTemplate template", () => {

    test("Triggering a single right answer", () => {

        const g = new Game(configGame);
        const cjq = new CJQTest(g, configTest, new PlayerPicker(g));

        g.addPlayer("a");
        g.addPlayer("b");
        g.addPlayer("c");
        g.addPlayer("d");

        // The first free are not playing but judges:
        g.setIsPlaying(["a", "b", "c"], false);

        // Moving from the lobby to the CJQTest state:
        g.setCurState(1, true);

        // They all now think noot was said, so they write Ynoot
        cjq.playerAnswer("a", "Ynoot");
        expect(cjq.stateMsg().general_info.answer_map?.aap?.[0]).toBe(0);
        expect(cjq.stateMsg().general_info.answer_map?.noot?.[0]).toBe(2/3);
        expect(cjq.stateMsg().general_info.answer_map?.mies?.[0]).toBe(0);

        cjq.playerAnswer("b", "Ynoot");
        expect(cjq.stateMsg().general_info.answer_map?.aap?.[0]).toBe(0);
        expect(cjq.stateMsg().general_info.answer_map?.noot?.[0]).toBe(undefined);
        expect(cjq.stateMsg().general_info.answer_map?.mies?.[0]).toBe(0);

        cjq.playerAnswer("c", "Ynoot");
        expect(cjq.stateMsg().general_info.answer_map?.aap?.[0]).toBe(0);
        expect(cjq.stateMsg().general_info.answer_map?.noot?.[0]).toBe(undefined);
        expect(cjq.stateMsg().general_info.answer_map?.mies?.[0]).toBe(0);

        const data = g.playerDataDump();

        expect(data[0].name).toBe("d");
        expect(data[0].score).toBe(20);

        expect(data[1].name).toBe("a");
        expect(data[1].score).toBe(5);

        expect(data[2].name).toBe("b");
        expect(data[2].score).toBe(2);

        expect(data[3].name).toBe("c");
        expect(data[3].score).toBe(0);

        g.setCurState(0, false);

    });

    test("A player gives the wrong answer", () => {

        const g = new Game(configGame);
        const cjq = new CJQTest(g, configTest, new PlayerPicker(g));

        g.addPlayer("a");
        g.addPlayer("b");
        g.addPlayer("c");
        g.addPlayer("d");

        // The first free are not playing but judges:
        g.setIsPlaying(["a", "b", "c"], false);

        // Moving from the lobby to the CJQTest state:
        g.setCurState(1, true);

        // B first gives the wrong answer then a and b mark this and b gets in
        // trouble
        cjq.playerAnswer("b", "Ymies");
        cjq.playerAnswer("a", "Nmies");
        cjq.playerAnswer("c", "Nmies");
        
        // They all now think noot was said, so they write Ynoot
        cjq.playerAnswer("a", "Ynoot");
        expect(cjq.stateMsg().general_info.answer_map?.aap?.[0]).toBe(0);
        expect(cjq.stateMsg().general_info.answer_map?.noot?.[0]).toBe(2/3);
        expect(cjq.stateMsg().general_info.answer_map?.mies?.[0]).toBe(0);

        cjq.playerAnswer("b", "Ynoot");
        expect(cjq.stateMsg().general_info.answer_map?.aap?.[0]).toBe(0);
        expect(cjq.stateMsg().general_info.answer_map?.noot?.[0]).toBe(undefined);
        expect(cjq.stateMsg().general_info.answer_map?.mies?.[0]).toBe(0);

        cjq.playerAnswer("c", "Ynoot");
        expect(cjq.stateMsg().general_info.answer_map?.aap?.[0]).toBe(0);
        expect(cjq.stateMsg().general_info.answer_map?.noot?.[0]).toBe(undefined);
        expect(cjq.stateMsg().general_info.answer_map?.mies?.[0]).toBe(0);

        const data = g.playerDataDump();

        expect(data[0].name).toBe("d");
        expect(data[0].score).toBe(45);

        expect(data[1].name).toBe("a");
        expect(data[1].score).toBe(30);

        expect(data[2].name).toBe("c");
        expect(data[2].score).toBe(25);

        expect(data[3].name).toBe("b");
        expect(data[3].score).toBe(22);

        g.setCurState(0, false);

    })

});