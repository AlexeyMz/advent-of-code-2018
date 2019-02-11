import * as fs from 'fs';
import * as util from 'util';

const readFile = util.promisify(fs.readFile);

async function main() {
    const content = await readFile("./input/day7.txt", {encoding: 'utf8'});
    const lines = content.split('\n').filter(line => line.length > 0);

    const requirements = new Map<string, Set<string>>();
    const steps = new Set<string>();

    for (const line of lines) {
        const m = /^Step ([a-zA-Z]+) must be finished before step ([a-zA-Z]+) can begin\.$/.exec(line);
        if (!m) {
            throw new Error(`Invalid step line: ${line}`);
        }
        const [, first, second] = m;
        let primary = requirements.get(second);
        if (!primary) {
            primary = new Set<string>();
            requirements.set(second, primary);
        }
        primary.add(first);
        steps.add(first);
        steps.add(second);
    }

    function part1() {
        const assemblyOrder: string[] = [];
        const stepsLeft = new Set(steps);
        const edgesLeft = new Map<string, Set<string>>();
        requirements.forEach((primary, second) => edgesLeft.set(second, new Set(primary)));

        while (true) {
            const next = getNextAvailableStep(stepsLeft, edgesLeft);
            if (next === undefined) {
                break;
            }
            removeStep(stepsLeft, edgesLeft, next);
            assemblyOrder.push(next);
        }

        console.log(`Assembly order: ${assemblyOrder.join('')}`);
    }

    function part2() {
        const stepsLeft = new Set(steps);
        const edgesLeft = new Map<string, Set<string>>();
        requirements.forEach((primary, second) => edgesLeft.set(second, new Set(primary)));

        interface Worker {
            step: string | undefined;
            until: number;
        }

        const workers: Array<Worker> = [];
        for (let i = 0; i < 5; i++) {
            workers.push({step: undefined, until: 0});
        }

        const inProgressSteps = new Set<string>();
        const canTakeStep = (step: string) => !inProgressSteps.has(step);

        let time = 0;
        while (true) {
            let eventHappened = false;
            // important! should complete all current steps before next assignments
            // overwise it will change assembly order (with different total time)
            for (const worker of workers) {
                if (worker.step && worker.until === time) {
                    inProgressSteps.delete(worker.step);
                    removeStep(stepsLeft, edgesLeft, worker.step);
                    worker.step = undefined;
                    eventHappened = true;
                }
            }
            for (const worker of workers) {
                if (worker.step === undefined) {
                    const step = getNextAvailableStep(stepsLeft, edgesLeft, canTakeStep);
                    if (step) {
                        inProgressSteps.add(step);
                        worker.step = step;
                        worker.until = time + getStepTimeSpan(step);
                        eventHappened = true;
                    }
                }
            }
            if (eventHappened) {
                console.log(`${time}: ${workers.map(w => w.step ? `${w.step}=>${w.until}` : '.').join(' ')}`);
            }
            if (stepsLeft.size === 0 && inProgressSteps.size === 0) {
                break;
            }
            time++;
        }

        console.log(`Total time for ${workers.length} workers: ${time}`);
    }

    part1();
    part2();
}

function getNextAvailableStep(
    steps: Set<string>,
    edges: Map<string, Set<string>>,
    canTakeStep?: (step: string) => boolean
): string | undefined {
    let next: string | undefined;
    steps.forEach(second => {
        const primary = edges.get(second);
        if (primary && primary.size > 0) { return; }
        if (next === undefined || second < next) {
            if (!canTakeStep || canTakeStep(second)) {
                next = second;
            }
        }
    });
    return next;
}

function removeStep(steps: Set<string>, edges: Map<string, Set<string>>, step: string) {
    steps.delete(step);
    edges.forEach(primary => primary.delete(step));
}

function getStepTimeSpan(step: string) {
    if (!(step.length === 1 && step[0] >= 'A' && step[0] <= 'Z')) {
        throw new Error(`Step is not a single uppercase letter but expected to be: '${step}'`);
    }
    return step.charCodeAt(0) - 'A'.charCodeAt(0) + 61;
}

main();
