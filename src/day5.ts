import * as fs from 'fs';
import * as util from 'util';

const readFile = util.promisify(fs.readFile);

async function main() {
    const content = await readFile("./input/day5.txt", {encoding: 'utf8'});
    const polymer = content.trim();

    const stable = reactUntilStop(polymer);
    console.log(`stable length = ${stable.length}`);

    const lowerUnitTypes = new Set<string>();
    for (let i = 0; i < polymer.length; i++) {
        lowerUnitTypes.add(polymer[i].toLowerCase());
    }

    let minLength = Infinity;
    let foundUnit: string | undefined;
    lowerUnitTypes.forEach(lowerUnit => {
        const upperUnit = lowerUnit.toUpperCase();
        const withoutUnit = polymer
            .split(lowerUnit).join('')
            .split(upperUnit).join('');

        const stableWithoutUnit = reactUntilStop(withoutUnit);
        if (stableWithoutUnit.length < minLength) {
            minLength = stableWithoutUnit.length;
            foundUnit = lowerUnit;
        }
    });

    if (foundUnit === undefined) {
        throw new Error('Cannot find unit to remove');
    }

    console.log(`stable without unit '${foundUnit}${foundUnit.toUpperCase()}' length = ${minLength}`);
}

function reactUntilStop(polymer: string): string {
    let current = polymer;
    while (true) {
        const previous = current;
        current = reactOnce(current);
        if (current.length === previous.length) {
            break;
        }
    }
    return current;
}

function reactOnce(polymer: string): string {
    const lower = polymer.toLowerCase();
    const upper = polymer.toUpperCase();
    let next = '';
    let i = 0;
    while (i < polymer.length) {
        if (isOppositeAt(polymer, lower, upper, i)) {
            i += 2;
        } else {
            next += polymer[i];
            i++;
        }
    }
    return next;
}

function isOppositeAt(source: string, lower: string, upper: string, i: number) {
    if (i === source.length - 1) {
        return false;
    }
    return lower[i] === lower[i + 1] && source[i] !== source[i + 1] && (
        source[i] === lower[i] && source[i + 1] === upper[i + 1] ||
        source[i] === upper[i] && source[i + 1] === lower[i + 1]
    );
}

main();
