import { readFileSync } from "fs";
import Game from "../src/model/game";
import { PlayerListener } from "../src/model/gametypes";

const config_file = "./tests/test_game.json"; // TODO: get from CLI arguments
const config = JSON.parse(readFileSync(config_file, "utf-8"));

describe('Adding players to the game', () => {
    test(`Adding one player should result in one player.
    Removing it should remove it again`, () => {
        const g = new Game(config);
        g.addPlayer("vincent");
        expect(g.getPlayerNames().length).toBe(1);
        g.removePlayer("vincent");
        expect(g.getPlayerNames().length).toBe(0);
    });

    test(`Adding players, and removing one that doesn't exist.`, () => {
        const g = new Game(config);
        g.addPlayer("vincent");
        expect(g.getPlayerNames().length).toBe(1);
        g.addPlayer("karel");
        expect(g.getPlayerNames().length).toBe(2);
        g.removePlayer("peter");
        expect(g.getPlayerNames().length).toBe(2);
        g.addPlayer("peter");
        expect(g.getPlayerNames().length).toBe(3);

        const names = new Set(g.getPlayerNames());
        expect(names.size).toBe(3);
        expect(names.has("vincent")).toBe(true);
        expect(names.has("peter")).toBe(true);
        expect(names.has("karel")).toBe(true);
        expect(names.has("erik")).toBe(false);

        g.removePlayer("karel");
        expect(g.getPlayerNames().length).toBe(2);
        g.removePlayer("vincent");
        expect(g.getPlayerNames().length).toBe(1);
        g.removePlayer("peter");
        expect(g.getPlayerNames().length).toBe(0);
        g.removePlayer("theo");
        expect(g.getPlayerNames().length).toBe(0);
    });

    test("Adding same person twice should return false without any changes", () => {
        const g = new Game(config);
        g.addPlayer("vincent");
        g.addPlayer("vincent");
        expect(g.getPlayerNames().length).toBe(1);
        g.removePlayer("vincentX");
        expect(g.getPlayerNames().length).toBe(1);
        g.removePlayer("vincent");
        expect(g.getPlayerNames().length).toBe(0);
    });

});


describe("Updating scores/vals in multiple different ways", () => {
    test("Updating the scores in a relative manner", () => {
        const g = new Game(config);
        g.addPlayer("vincent");
        g.addPlayer("dennis");
        g.addPlayer("theo");

        let idx = 10;
        const score_map = new Map<string, number>
        for (const name of g.getPlayerNames()) {
            score_map.set(name, idx);
            idx += 10;
        }
        g.updateScores(score_map);

        let dump = g.playerDataDump();
        expect(dump[0].name).toBe("theo");
        expect(dump[1].name).toBe("dennis");
        expect(dump[2].name).toBe("vincent");
        expect(dump[0].score).toBe(config.start_score + 30);
        expect(dump[1].score).toBe(config.start_score + 20);
        expect(dump[2].score).toBe(config.start_score + 10);

        score_map.delete("vincent");
        score_map.set("remco", 500);
        g.updateScores(score_map);
        dump = g.playerDataDump();
        expect(dump[0].score).toBe(config.start_score + 60);
        expect(dump[1].score).toBe(config.start_score + 40);
        expect(dump[2].score).toBe(config.start_score + 10);
        expect(g.getPlayerNames().length).toBe(3);

    });

    test("Updating the scores in an absolute manner", () => {
        const g = new Game(config);
        g.addPlayer("vincent");
        g.addPlayer("dennis");
        g.addPlayer("theo");

        let idx = 10;
        const score_map = new Map<string, number>
        for (const name of g.getPlayerNames()) {
            score_map.set(name, idx);
            idx += 10;
        }
        g.updateScores(score_map, false);

        let dump = g.playerDataDump();
        expect(dump[0].name).toBe("theo");
        expect(dump[1].name).toBe("dennis");
        expect(dump[2].name).toBe("vincent");
        expect(dump[0].score).toBe(30);
        expect(dump[1].score).toBe(20);
        expect(dump[2].score).toBe(10);

        score_map.delete("vincent");
        score_map.set("remco", 500);
        score_map.set("theo", 60);
        score_map.set("dennis", 40);
        g.updateScores(score_map, false);
        dump = g.playerDataDump();
        expect(dump[0].score).toBe(60);
        expect(dump[1].score).toBe(40);
        expect(dump[2].score).toBe(10);
        expect(g.getPlayerNames().length).toBe(3);

    });

    test("Test the isplaying functionality", () => {
        const g = new Game(config);
        g.addPlayer("vincent");
        g.addPlayer("dennis");
        g.addPlayer("theo");
        g.addPlayer("remco");
        g.addPlayer("jitse");

        expect(g.getPlayerNames().length).toBe(5);
        expect(g.getPlayerNames(true).length).toBe(5);
        expect(g.getPlayerNames(false).length).toBe(0);

        console.log(g.playerDataDump());
        
        g.setIsPlaying(new Set(["theo", "dennis"]), false);

        expect(g.getPlayerNames().length).toBe(5);
        expect(g.getPlayerNames(true).length).toBe(3);
        expect(g.getPlayerNames(false).length).toBe(2);

        g.setIsPlaying(new Set(["jitse", "dennis"]), true);

        expect(g.getPlayerNames().length).toBe(5);
        expect(g.getPlayerNames(true).length).toBe(4);
        expect(g.getPlayerNames(false).length).toBe(1);
    });

});


class L implements PlayerListener {
    public cnt = 0;
    
    update(val: "player", obj: Object): void {
        const arr: Object[] = <Object[]>obj;
        this.cnt += arr.length;
    }
}

describe("Seeing if player listening works as it should", () => {
    test("single listener", () => {

        const g = new Game(config);
        const l = new L();
        g.addPlayerListener(l);
        g.addPlayer("mathijs");
        expect(l.cnt).toBe(1);
        g.addPlayer("peter");
        g.addPlayer("erik");
        expect(l.cnt).toBe(6);
        g.updateScores(new Map([
            ["peter", 50],
            ["erik", 100],
            ["mathijs", 10]
        ]));
        expect(l.cnt).toBe(9);
        g.removePlayer("mathijs");
        expect(l.cnt).toBe(11);
        g.setIsPlaying(new Set("erik"), false);
        expect(l.cnt).toBe(13);
        g.updateScores(new Map([["peter", 0]]), false);
        expect(l.cnt).toBe(15);
        g.updateScores(new Map([["paardenkop!", 0]]), false);
        expect(l.cnt).toBe(17);
        g.setIsPlaying(new Set(["paardenkop!"]), true);
        expect(l.cnt).toBe(19);
        g.removePlayer("mathijs");
        expect(l.cnt).toBe(19);
        g.removePlayer("peter");
        g.removePlayer("erik");
        expect(l.cnt).toBe(20);
    });

    test("multiple listeners", () => {
        // Also this test isn't completely what it should be anymore because I
        // changed the behavior of addPlayer() ...
        const g = new Game(config);
        const l1 = new L();
        const l2 = new L();

        g.addPlayerListener(l1);
        g.addPlayer("x");
        expect(l1.cnt).toBe(1);
        expect(l2.cnt).toBe(l1.cnt - 1);
        g.addPlayerListener(l2);
        g.addPlayer("x");
        expect(l1.cnt).toBe(1);
        expect(l2.cnt).toBe(l1.cnt - 1);
        g.removePlayerListener(l1);
        g.addPlayer("x");
        expect(l1.cnt).toBe(1);
        expect(l2.cnt).toBe(0);
    });
});