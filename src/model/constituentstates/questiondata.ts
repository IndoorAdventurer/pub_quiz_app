

/**
 * A single question will be composed of multiple game states, where one, for
 * example, is responsible for letting users input an answer, and the next for
 * checking the answers, etc. This means that they need some shared data. All
 * that shared data, together with methods to process it, are encapsulated by
 * this class.
 */
export default class QuestionData {

    public correct_answers: Set<string>;
    public not_answered: Set<string>;
    public answers: [string, string][] = [];

    private case_sensitive: boolean

    /**
     * Constructor
     * @param correct_answer The correct answer to the quesiton. You can also
     * give an array of correct answers if multiple are possible
     * @param players An array of player names that should answer this question.
     * @param case_sensitive If it should match despite lowecase/uppercase.
     * Default is `false`, making it more lenient.
     */
    constructor(
        correct_answer: string | string[],
        players: string[],
        case_sensitive: boolean = false
    ) {
        this.correct_answers = typeof correct_answer == "string" ?
            new Set([correct_answer]) : new Set(correct_answer);
        this.not_answered = new Set(players);
        this.case_sensitive = case_sensitive;
    }

    /**
     * For open questions, after all players gave an answer, the admin will
     * mark which of these are correct, which adds them to the list of correct
     * answers, such that theirs will be considered correct.
     * @param answers A list of answers that can be considered correct
     */
    public addCorrectAnswers(answers: string[]) {
        for (const answer of answers)
            this.correct_answers.add(answer);
    }
    
    /**
     * @returns True if all players have given an answer. False if not.
     */
    public allPlayersAnswered(): boolean {
        return this.not_answered.size === 0;
    }

    /**
     * Updates data with new player answer
     * @param player Name of player that gave the answer
     * @param answer The answer
     */
    public processAnswer(player: string, answer: string) {
        if (!this.not_answered.has(player)) {
            console.warn(`Player "${player}" already answered. Ignoring`)
            return;
        }
        
        this.answers.push([player, answer]);
        this.not_answered.delete(player);
    }

    /**
     * Returns a list of all players that gave a correct answer, and then clears
     * all data
     */
    public listDumpAndClear(): string[] {
        // All players that gave a correct answer:
        if (!this.case_sensitive) {
            this.correct_answers =
                new Set([...this.correct_answers].map(a => a.toLowerCase()));
        }
        
        const list = this.answers.filter(([_, answer]) => {
            if (!this.case_sensitive)
                answer = answer.toLowerCase();
            return this.correct_answers.has(answer);
        });

        // Clear all data so we don't fuck up if we have to go back somewhere:
        this.correct_answers = new Set();
        this.not_answered = new Set();
        this.answers = [];

        // Return the names of our heroes:
        return list.map(([player]) => player);
    }

    /**
     * Returns a set of all players that gave a correct answer, and then clears
     * all data
     */
    public setDumpAndClear(): Set<string> {
        return new Set(this.listDumpAndClear())
    }
}