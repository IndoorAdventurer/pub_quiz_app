import Game, {GameState} from "./model/game.js";

const g = new Game();

class TestGameState extends GameState {

    private num: number;
    
    constructor(parent_game: Game, num: number) {
        super(parent_game);
        this.num = num;
    }

    @GameState.updatesGame()
    public foo(str: string) {
        console.log(`foo() got "${str}" as argument, and has ${this.num}`);
    }

}

const tgs = new TestGameState(g, 42);

tgs.foo("hihi!");

g.addPlayer("peter");
g.addPlayer("peter");
g.addPlayer("peter");
g.addPlayer("peter");


tgs.foo("jaja!");