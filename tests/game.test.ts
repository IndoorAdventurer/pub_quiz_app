import Game from "../src/model/game";

describe('Adding players to the game', () => {
    test(`Adding one player should result in one player.
    Removing it should remove it again`, () => {
        const g = new Game();
        g.addPlayer("vincent");
        expect(g.numberOfPlayers()).toBe(1);
        g.removePlayer("vincent");
        expect(g.numberOfPlayers()).toBe(0);
    })

    test(`Adding players, and removing one that doesn't exist.`, () => {
        const g = new Game();
        g.addPlayer("vincent");
        expect(g.numberOfPlayers()).toBe(1);
        g.addPlayer("karel");
        expect(g.numberOfPlayers()).toBe(2);
        g.removePlayer("peter");
        expect(g.numberOfPlayers()).toBe(2);
        g.addPlayer("peter");
        expect(g.numberOfPlayers()).toBe(3);

        const names = g.getAllPlayerNames();
        expect(names.size).toBe(3);
        expect(names.has("vincent")).toBe(true);
        expect(names.has("peter")).toBe(true);
        expect(names.has("karel")).toBe(true);
        expect(names.has("erik")).toBe(false);

        g.removePlayer("karel");
        expect(g.numberOfPlayers()).toBe(2);
        g.removePlayer("vincent");
        expect(g.numberOfPlayers()).toBe(1);
        g.removePlayer("peter");
        expect(g.numberOfPlayers()).toBe(0);
        g.removePlayer("theo");
        expect(g.numberOfPlayers()).toBe(0);
    })

    test("Adding same person twice should add an X to the name", () => {
        const g = new Game();
        g.addPlayer("vincent");
        g.addPlayer("vincent");
        expect(g.numberOfPlayers()).toBe(2);
        g.removePlayer("vincentX");
        expect(g.numberOfPlayers()).toBe(1);
        expect(g.getScore("vincent")).toBe(Game.START_SCORE);

        g.addPlayer("vincentX");
        g.addPlayer("vincent");

        expect(g.numberOfPlayers()).toBe(3);
        const names = g.getAllPlayerNames();
        expect(names.has("vincent")).toBe(true);
        expect(names.has("vincentX")).toBe(true);
        expect(names.has("vincentXX")).toBe(true);
    })

});


describe("Updating scores/vals in multiple different ways", () => {
    test("Updating scores using the all at once function, and seeing if output sorted", () => {
        const g = new Game();
        g.addPlayer("vincent");
        g.addPlayer("dennis");
        g.addPlayer("theo");

        let idx = 10;
        const score_map = new Map<string, number>
        for (const name of g.getAllPlayerNames()) {
            score_map.set(name, idx);
            idx += 10;
        }
        g.addToScores(score_map);

        let dump = g.playerDataDump();
        expect(dump[0].name).toBe("theo");
        expect(dump[1].name).toBe("dennis");
        expect(dump[2].name).toBe("vincent");
        expect(dump[0].score).toBe(Game.START_SCORE + 30);
        expect(dump[1].score).toBe(Game.START_SCORE + 20);
        expect(dump[2].score).toBe(Game.START_SCORE + 10);

        score_map.delete("vincent");
        score_map.set("remco", 500);
        g.addToScores(score_map);
        dump = g.playerDataDump();
        expect(dump[0].score).toBe(Game.START_SCORE + 60);
        expect(dump[1].score).toBe(Game.START_SCORE + 40);
        expect(dump[2].score).toBe(Game.START_SCORE + 10);
        expect(g.numberOfPlayers()).toBe(3);

    })

    test("Testing all the other getters/setters", () => {
        const g = new Game();
        g.addPlayer("vincent");
        expect(g.getScore("vincent")).toBe(Game.START_SCORE);
        g.setScore("vincent", 10);
        expect(g.getScore("vincent")).toBe(10);
        expect(g.getScore("karel")).toBe(undefined);
        expect(g.isPlaying("karel")).toBe(undefined);
        expect(g.isPlaying("vincent")).toBe(true);
        g.setIsPlaying("vincent", false);
        expect(g.isPlaying("vincent")).toBe(false);
        g.setIsPlaying("bente", false);
        g.setScore("bente", 1000000);
    })
});