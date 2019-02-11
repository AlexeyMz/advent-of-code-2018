import * as fs from 'fs';
import * as util from 'util';

const readFile = util.promisify(fs.readFile);

interface Rect {
    l: number;
    t: number;
    r: number;
    b: number;
}

interface SourceRect extends Rect {
    id: string;
}

async function main() {
    const content = await readFile("./input/day3.txt", {encoding: 'utf8'});
    const rects = content
        .split('\n')
        .filter(line => line.length > 0)
        .map((line, index): SourceRect => {
            const m = /^#(\d+) @ (\d+),(\d+): (\d+)x(\d+)$/.exec(line);
            if (!m) {
                throw new Error(`Invalid claim line at index ${index}: ${line}`);
            }
            const r = {id: m[1], l: Number(m[2]), t: Number(m[3]), w: Number(m[4]), h: Number(m[5])};
            return {id: r.id, l: r.l, t: r.t, r: r.l + r.w, b: r.t + r.h};
        });
    
    const overlappedIds = new Set<string>();
    const overclaims: Rect[] = [];
    for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
            const first = rects[i];
            const second = rects[j];
            if (intersects(first, second)) {
                overclaims.push(intersection(first, second));
                overlappedIds.add(first.id);
                overlappedIds.add(second.id);
            }
        }
        
    }

    for (const claim of rects) {
        if (!overlappedIds.has(claim.id)) {
            console.log(`Claim #${claim.id} don't overlaps with anything`);
        }
    }

    let nonOverlappingOverclaims: Rect[] = [];
    for (const overclaim of overclaims) {
        nonOverlappingOverclaims = nonOverlappingOverclaims.reduce((acc: Rect[], r) => {
            if (intersects(r, overclaim)) {
                const segments = subtract(r, overclaim);
                for (const segment of segments) {
                    acc.push(segment);
                }
            } else {
                acc.push(r);
            }
            return acc;
        }, []);
        nonOverlappingOverclaims.push(overclaim);
    }


    const total = nonOverlappingOverclaims.reduce((sum, claim) => sum + area(claim), 0);
    console.log(total);
}

function intersects(u: Rect, v: Rect) {
    return u.r > v.l && u.l < v.r && u.b > v.t && u.t < v.b;
}

function intersection(u: Rect, v: Rect): Rect {
    return {
        l: Math.max(u.l, v.l),
        t: Math.max(u.t, v.t),
        r: Math.min(u.r, v.r),
        b: Math.min(u.b, v.b),
    };
}

function subtract(u: Rect, v: Rect): Rect[] {
    const result: Rect[] = [];
    const add = (l: number, t: number, r: number, b: number) => {
        if (r > l && b > t) {
            result.push(intersection(u, {l, t, r, b}));
        }
    };
    add(u.l, u.t, v.l, v.t); // top left corner
    add(v.l, u.t, v.r, v.t); // top side
    add(v.r, u.t, u.r, v.t); // top right corner
    add(v.r, v.t, u.r, v.b); // right side
    add(v.r, v.b, u.r, u.b); // bottom right corner
    add(v.l, v.b, v.r, u.b); // bottom side
    add(u.l, v.b, v.l, u.b); // bottom left corner
    add(u.l, v.t, v.l, v.b); // left side
    return result;
}

function area(u: Rect) {
    return (u.r - u.l) * (u.b - u.t);
}

main();
