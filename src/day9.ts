import * as fs from 'fs';
import * as util from 'util';

const readFile = util.promisify(fs.readFile);

async function main() {
    const content = await readFile("./input/day9.txt", {encoding: 'utf8'});
    const input = content.trim();
    const match = /^(\d+) players; last marble is worth (\d+) points$/.exec(input);
    if (!match) {
        throw new Error('Cannot match input');
    }
    const [, playerCountString, maxMarbleScoreString] = match;
    const inputPlayerCount = Number(playerCountString);
    const inputMaxMarbleScore = Number(maxMarbleScoreString);

    function simulateGame(playerCount: number, maxMarbleScore: number, log = false) {
        const score: number[] = [];
        for (let i = 0; i < playerCount; i++) {
            score.push(0);
        }

        const field: number[] = [0];
        let currentAt = 0;

        const logInterval = Math.ceil(maxMarbleScore / 20);

        for (let marble = 1; marble <= maxMarbleScore; marble++) {
            if (marble % 23 === 0) {
                const playerIndex = remainder(marble - 1, score.length);
                score[playerIndex] += marble;
                const removeAt = remainder(currentAt - 7, field.length);
                const [removedScore] = field.splice(removeAt, 1);
                score[playerIndex] += removedScore;
                currentAt = remainder(removeAt, field.length);
            } else {
                const placeAt = remainder(currentAt + 2, field.length);
                if (placeAt === 0) {
                    field.push(marble);
                    currentAt = field.length - 1;
                } else {
                    field.splice(placeAt, 0, marble);
                    currentAt = placeAt;
                }
            }

            if (log && marble % logInterval === 0) {
                console.log(`${Math.floor(100 * marble / maxMarbleScore)}%`);
            }
            // const fieldString = field.map((m, i) => i === currentAt ? `(${m})` : `${m}`).join(' ');
            // console.log(`[${marble}] ${fieldString}`);
        }

        const maxScore = score.reduce((max, s) => Math.max(max, s), 0);
        return maxScore;
    }

    function simulateUsingLinkedLists(playerCount: number, maxMarbleScore: number, log = false) {
        const score: number[] = [];
        for (let i = 0; i < playerCount; i++) {
            score.push(0);
        }

        let field = new Node(0);

        const logInterval = Math.ceil(maxMarbleScore / 20);

        for (let marble = 1; marble <= maxMarbleScore; marble++) {
            if (marble % 23 === 0) {
                const playerIndex = remainder(marble - 1, score.length);
                score[playerIndex] += marble;
                const shifted = field.shift(-7);
                score[playerIndex] += shifted.value;
                field = shifted.removeThenShiftToNext();
            } else {
                field = field.shift(1).insertAfterAndShiftTo(marble);
            }

            if (log && marble % logInterval === 0) {
                console.log(`${Math.floor(100 * marble / maxMarbleScore)}%`);
            }
        }

        const maxScore = score.reduce((max, s) => Math.max(max, s), 0);
        return maxScore;
    }

    const maxNormalScore = simulateUsingLinkedLists(inputPlayerCount, inputMaxMarbleScore);
    console.log(`Max normal score: ${maxNormalScore}`);

    const max100Score = simulateUsingLinkedLists(inputPlayerCount, inputMaxMarbleScore * 100, true);
    console.log(`Max x100 score: ${max100Score}`);
}

function remainder(divident: number, divisor: number): number {
    if (divisor <= 0) {
        throw new Error('Divisor should be >= 0');
    }
    const modulo = divident % divisor;
    return modulo >= 0 ? modulo : (modulo + divisor);
}

class Node<T> {
    next: Node<T>;
    previous: Node<T>;

    constructor(readonly value: T) {
        this.next = this;
        this.previous = this;
    }

    shift(shift: number): Node<T> {
        let current: Node<T> = this;
        if (shift > 0) {
            for (let i = 0; i < shift; i++) {
                current = current.next;
            }
        } else if (shift < 0) {
            for (let i = 0; i < -shift; i++) {
                current = current.previous;
            }
        }
        return current;
    }

    insertAfterAndShiftTo(value: T): Node<T> {
        const added = new Node(value);
        added.previous = this;
        added.next = this.next;
        this.next.previous = added;
        this.next = added;
        return added;
    }

    removeThenShiftToNext(): Node<T> {
        if (this.next == this) {
            throw new Error('Cannot remove node from list with one element');
        }
        this.next.previous = this.previous;
        this.previous.next = this.next;
        return this.next;
    }
}

main();
