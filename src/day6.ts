import * as fs from 'fs';
import * as util from 'util';

const readFile = util.promisify(fs.readFile);

async function main() {
    const content = await readFile("./input/day6.txt", {encoding: 'utf8'});
    const coords = content
        .split('\n')
        .filter(line => line.length > 0)
        .map(line => {
            const match = /^(\d+), (\d+)$/.exec(line);
            if (!match) {
                throw new Error(`Invalid coords: ${line}`);
            }
            return {x: Number(match[1]), y: Number(match[2])};
        });

    const minX = coords.reduce((min, c) => Math.min(min, c.x), Infinity);
    const minY = coords.reduce((min, c) => Math.min(min, c.y), Infinity);
    const maxX = coords.reduce((max, c) => Math.max(max, c.x), -Infinity);
    const maxY = coords.reduce((max, c) => Math.max(max, c.y), -Infinity);

    const distances: number[] = [];
    const excludedIndices = new Set<number>();
    let areaWithTotalDistanceLessThan10K = 0;

    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            let minDistance: number = Infinity;
            let foundIndex: number | undefined;
            let totalDistance = 0;
            for (let i = 0; i < coords.length; i++) {
                const c = coords[i];
                const distance = Math.abs(x - c.x) + Math.abs(y - c.y);
                if (distance === minDistance) {
                    foundIndex = undefined;
                } else if (distance < minDistance) {
                    minDistance = distance;
                    foundIndex = i;
                }
                totalDistance += distance;
            }
            if (foundIndex !== undefined) {
                if (x === minX || x === maxX || y === minY || y === maxY) {
                    excludedIndices.add(foundIndex);
                }
                distances.push(foundIndex);
            }
            if (totalDistance < 10000) {
                areaWithTotalDistanceLessThan10K++;
            }
        }
    }

    const counts = coords.map(() => 0);
    for (const index of distances) {
        counts[index]++;
    }

    console.log(counts.join(' '));

    let maxCount = 0;
    let foundIndex: number | undefined;
    for (let i = 0; i < counts.length; i++) {
        if (excludedIndices.has(i)) {
            continue;
        }
        const count = counts[i];
        if (count > maxCount) {
            maxCount = count;
            foundIndex = i;
        }
    }

    if (foundIndex === undefined) {
        throw new Error('Failed to find index with max area');
    }

    console.log(`Max count is ${maxCount} at ${foundIndex}`);
    console.log(
        `Area of locations with total distance less than 10000 ` +
        `is ${areaWithTotalDistanceLessThan10K}`
    );
}

main();
