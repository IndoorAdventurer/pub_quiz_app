
/**
 * In some rounds, the player that is playing will have to speak out loud
 * the answers. The players that already dropped out of the game will be
 * the judges then. They get presented with all the right answers, and will
 * have to press on them once they hear the playing player gave it. If enough
 * players have said an answer was given, it passes its threshold and will be
 * marked as given. If, however, some players mark it as given, others will get
 * the option to correct this and explicitly say it is not given. If enough
 * people say an answer is not given, the ones that said it was given get points
 * subtracted.
 * 
 * All of the above logic is captured by this class..
 */
export default class JudgeAnswerMap {

    // See setters for explaination:
    private static CORRECT_THRESHOLD = 0.5;
    private static INCORRECT_THRESHOLD = 2;

    /**
     * All answers players can vote on, in the order they should appear
     */
    private all_answers: string[];
    
    /**
     * Stores for each answer a list of players that say it was given, and a
     * list of players that explicitly say it was not given
     */
    private map: Map<string, [string[], string[]]> = new Map();

    /**
     * Answers that are already marked as given
     */
    public given_answers: string[] = [];

    private max_points: number;     // First to correctly vote gets this much
    private min_points: number;     // and last to vote gets this much points

    /**
     * Constructor
     * @param answers The list of correct answers that players have to vote on
     * @param max_points When an answer passes the voting threshold and gets
     * set to given, the first to have voted it was given gets this many points.
     * In addition, the penalty for answering wrong will be `max_points` too.
     * @param min_points The last player to have voted that an answer was given
     * gets this many points. All the ones in the middle will be interpolated
     * between `max_points` and `min_points`.
     */
    constructor(answers: string[], max_points: number, min_points: number) {

        this.all_answers = answers;
        
        // Adding some constraints:
        this.min_points = min_points <= 0 ? 0.001 : min_points;
        this.max_points = max_points < min_points ? min_points : max_points;

        // Initializing map:
        for (const answ of answers)
            this.map.set(answ, [[], []]);
    }

    /**
     * @returns `true` if we are still in a state from which we can keep
     * playing. `false` if not. I.e. if there are no more questions left to vote
     * on.
     */
    public canKeepPlaying(): boolean {
        return this.map.size > 0;
    }

    /**
     * Fraction of players that need to mark an answer as correct before it will
     * be set to correct by the system
     * @param The The treshold to set
     */
    public setCorrectThreshold(th: number) {
        if (th <= 0 || th > 1)    // illegal
            return;
        JudgeAnswerMap.CORRECT_THRESHOLD = th;
    }

    /**
     * Stores for each answer a list of players that say it was given, and a
     * list of players that explicitly say it was not given
     * @param The The treshold to set
     */
    public setIncorrectThreshold(th: number) {
        if (th <= 1)    // illegal
            return;
        JudgeAnswerMap.INCORRECT_THRESHOLD = th;
    }

    /**
     * Registers a vote. Works like a toggle, so if you give the same arguments
     * twice, it derigsters it.
     * @param player The player that gave a new vote
     * @param answer The answer the player voted on
     * @param votes_yes If `true` `player` votes that `answer` is given. Else
     * he/she votes it is explicitly not given
     */
    public toggleVote(player: string, answer: string, votes_yes: boolean): boolean {
        // Get the list of votes this player wants to add him/herself to and the
        // opposit of its vote (so the yes list if no, and no if yes):
        const target = this.map.get(answer)?.[votes_yes ? 0 : 1];
        const opposit = this.map.get(answer)?.[votes_yes ? 1 : 0];
        if (!target || !opposit)
            return false;

        let idx = target.indexOf(player);
        if (idx === -1) {   // Wasnt in yet:
            target.push(player);
            idx = opposit.indexOf(player);
            if (idx !== -1) // Can't also be in oppo: taking it out
                opposit.splice(idx, 1);
        }
        else {              // Was in: taking it out:
            target.splice(idx, 1);
        }

        return true;
    }

    /**
     * Should get called after any change. Checks if some threshold fired and
     * if so, deals with it.
     * @param num_judges The number of players that are judging. Needed to
     * calculate threshold. Needs to be given again and again because players
     * might quit
     * @param answer An optional answer. If given, it will only check updates
     * with regards to this answer.
     * @returns A tuple. The first element says which questions are now makred
     * as given. The second as a mapping from player names to the reward they
     * should receive for their judging efforts
     */
    public handleChange(num_judges: number, answer: string | null = null)
        : [string[], Map<string, number>] {
            
        const answers = answer ? [answer] : [...this.map.keys()];
        const correct_th = num_judges * JudgeAnswerMap.CORRECT_THRESHOLD;
        
        // No judges -- admin is the only to vote:
        if (correct_th === 0)
            return [[], new Map()];

        const marked_answers: string[] = [];
        const score_update = new Map<string, number>();

        // function for adding scores to score_update
        const add_to_score_update = (toAdd: Map<string, number>) => {
            for (const [name, score] of toAdd) {
                const cur = score_update.get(name);
                const update = cur ? score + cur : score;
                score_update.set(name, update);
            }
        }

        for (const answer of answers) {

            const yes_list = this.map.get(answer)?.[0];
            if (!yes_list)
                continue;
            const yes_length = yes_list.length;

            // Answer passed the threshold and can be considered given:
            if (yes_length >= correct_th) {
                const su = this.markAnswerGivenAndReturnPoints(answer);
                add_to_score_update(su);
                marked_answers.push(answer);
                continue;
            }

            const no_length = this.map.get(answer)?.[1].length;
            if (!no_length)
                continue;

            // nolist is not allowed to have stuff in it when yeslist doesn't:
            // note that next `if` is very dependent on this check :-p
            if (yes_length === 0 && no_length > 0) {
                this.map.set(answer, [[], []]);
                continue;
            }

            // Enough people said an answer is wrong that the ones that said it
            // is right must be punished ;-P
            if (no_length >= yes_length * JudgeAnswerMap.INCORRECT_THRESHOLD) {
                const punish_map = new Map<string, number>();
                for (const naughty of yes_list)
                    punish_map.set(naughty, -this.max_points);
                add_to_score_update(punish_map);

                // Reset the answer map to all zero:
                this.map.set(answer, [[], []]);
            }
        }

        return [marked_answers, score_update];
    }

    /**
     * Marks `answer` as being voted given by the players by changing this
     * object's internal state to reflect this fact. In addition, it calculates
     * for all players that voted this answer as given the amount of points they
     * should receive, and `returns` this as a map from players to points.
     */
    public markAnswerGivenAndReturnPoints(answer: string): Map<string, number> {
        const vote_list = this.map.get(answer)?.[0];
        if (!vote_list)
            return new Map();

        // Calculate points for each player that correctly voted:
        const score_map = new Map<string, number>();
        const N = vote_list.length;
        const y_0 = this.max_points;
        const decayFactor = this.min_points / y_0;
        for (let idx = 0; idx != N; ++idx) {
            score_map.set(vote_list[idx],
                Math.floor(y_0 * Math.pow(decayFactor, idx / N))
            );
        }

        // Update internals:
        this.map.delete(answer);
        this.given_answers.push(answer);

        return score_map;
    }

    /**
     * Returns for each answer the number of players that voted yes on it and
     * the number of players that voted no on it, both as a fraction of the
     * threshold values.
     * @param num_judges The number of non-players. Needed to calculate the
     * threshold values
     * @returns An object with answers as keys, and as values a tuple, where the
     * first value is the number of judges that voted yes on it, and the second
     * the number of judges that voted no on it.
     */
    public getVotesForAnswers(num_judges: number) {
        const ret: [string, number, number][] = [];
        const cThres = JudgeAnswerMap.CORRECT_THRESHOLD;
        const iThres = JudgeAnswerMap.INCORRECT_THRESHOLD;

        for (const answer of this.all_answers) {
            let yVal = 1;
            let nVal = 0;

            const vote_lists = this.map.get(answer);
            if (vote_lists !== undefined) {
                const yLength = vote_lists[0].length
                const nLength = vote_lists[1].length;

                // "Yes" votes as fraction of threshold, so 1 when reached:
                yVal = yLength / num_judges / cThres;

                // "No" also as fraction of threshold:
                nVal = nLength ? nLength / (yLength * iThres) : 0;
            }

            ret.push([answer, yVal, nVal])
        }

        return ret;
    }

    /**
     * @returns An object that for each player contains a tuple such that the
     * first element of the tuple is a list of answers the player voted yes on
     * and the second is a list of answers the player voted no on.
     */
    public getVotesOfPlayers() {
        const pMap: { [player: string]: [string[], string[]] } = {};

        for (const [answer, [yes_list, no_list]] of this.map) {
            for (const name of yes_list) {
                if (!(name in pMap))
                    pMap[name] = [[], []];
                pMap[name][0].push(answer);
            }
            for (const name of no_list) {
                if (!(name in pMap))
                    pMap[name] = [[], []];
                pMap[name][1].push(answer);
            }
        }

        return pMap;
    }
}