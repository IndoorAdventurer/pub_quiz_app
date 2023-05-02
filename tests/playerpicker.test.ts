import Game from "../src/model/game";
import PlayerPicker from "../src/model/constituentstates/playerpicker";

const config = {
    start_score: 0,
    reset_score: 20,
    lobby: {
        big_screen_msg: "-",
    },
    gamestates: []
}

describe("Some simple player picker tests first", () => {

    test("A single round should select each player from lowest to higherst", () => {

        const g = new Game(config);
        const pp = new PlayerPicker(g);

        g.addPlayer("a");
        g.addPlayer("b");
        g.addPlayer("c");

        expect(pp.pickPlayer(true)).toBe("c");
        expect(pp.pickPlayer(false)).toBe("b");
        expect(pp.pickPlayer(false)).toBe("a");

    });

    test("A three question round should give each of the three player 1 question", () => {

        const g = new Game(config);
        const pp = new PlayerPicker(g);

        g.addPlayer("a");
        g.addPlayer("b");
        g.addPlayer("c");

        expect(pp.pickPlayer(true)).toBe("c");
        expect(pp.pickPlayer(false)).toBe("b");
        expect(pp.pickPlayer(false)).toBe("a");

        expect(pp.pickPlayer(true)).toBe("b");
        expect(pp.pickPlayer(false)).toBe("c");
        expect(pp.pickPlayer(false)).toBe("a");

        expect(pp.pickPlayer(true)).toBe("a");
        expect(pp.pickPlayer(false)).toBe("c");
        expect(pp.pickPlayer(false)).toBe("b");

    });

    test("Return null always on exhaustion of players", () => {

        const g = new Game(config);
        const pp = new PlayerPicker(g);

        g.addPlayer("a");
        g.addPlayer("b");
        g.addPlayer("c");

        expect(pp.pickPlayer(true)).toBe("c");
        expect(pp.pickPlayer(false)).toBe("b");
        expect(pp.pickPlayer(false)).toBe("a");
        expect(pp.pickPlayer(false)).toBe(null);

        expect(pp.pickPlayer(true)).toBe("b");
        expect(pp.pickPlayer(false)).toBe("c");
        expect(pp.pickPlayer(false)).toBe("a");
        expect(pp.pickPlayer(false)).toBe(null);

        expect(pp.pickPlayer(true)).toBe("a");
        expect(pp.pickPlayer(false)).toBe("c");
        expect(pp.pickPlayer(false)).toBe("b");
        expect(pp.pickPlayer(false)).toBe(null);

        expect(pp.pickPlayer(true)).toBe(null);

    });

});


describe("Dynamically changing scores before picking players few tests", () => {
    test("Two questions:", () => {
        const g = new Game(config);
        const pp = new PlayerPicker(g);

        g.addPlayer("a");
        g.addPlayer("b");
        g.addPlayer("c");

        expect(pp.pickPlayer(true)).toBe("c");
        g.updateScores(new Map([["c", 3]]));

        expect(pp.pickPlayer(false)).toBe("b");
        g.updateScores(new Map([["b", 2]]));

        expect(pp.pickPlayer(false)).toBe("a");
        g.updateScores(new Map([["a", 1]]));

        expect(pp.pickPlayer(true)).toBe("a");
        expect(pp.pickPlayer(false)).toBe("b");
        expect(pp.pickPlayer(false)).toBe("c");
    });
});