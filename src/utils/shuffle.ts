// Directly got this from stack overflow:
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array


/**
 * Function I copied from stackoverflow.com to shuffle arrays. How rediculous
 * is it that this isn't built into JS/TS?!
 * @param array Array of strings to shuffle
 * @returns The array gotten as input, but shuffled the shit out of
 */
export default function shuffle_strings(array: string[]) {
    let currentIndex = array.length;
    let randomIndex: number;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}