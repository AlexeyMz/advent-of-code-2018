import * as fs from 'fs';
import * as util from 'util';

const readFile = util.promisify(fs.readFile);

interface LogEntry {
    date: string;
    hour: number;
    minute: number;
    guard: number;
    type: 'sleep' | 'wake';
}

interface GuardInfo {
    id: number;
    sleepMinutes: number[];
}

async function main() {
    const content = await readFile("./input/day4.txt", {encoding: 'utf8'});
    const lines = content.split('\n').filter(line => line.length > 0);
    lines.sort();

    let guard: number | undefined = undefined;
    const entries: LogEntry[] = [];
    for (const line of lines) {
        const m = /^\[([\d\-]+) (\d\d):(\d\d)\] (.+)$/.exec(line);
        if (!m) {
            throw new Error(`Invalid claim line: ${line}`);
        }
        const [, date, hourText, minuteText, message] = m;
        if (/^falls asleep$/.exec(message)) {
            if (!guard) { throw new Error('No guard'); }
            const hour = Number(hourText);
            const minute = Number(minuteText);
            if (hour !== 0) {
                throw new Error('Should fall asleep only at 00 hour');
            }
            entries.push({date, hour, minute, guard, type: 'sleep'});
        } else if (/^wakes up$/.exec(message)) {
            if (!guard) { throw new Error('No guard'); }
            const hour = Number(hourText);
            const minute = Number(minuteText);
            if (hour !== 0) {
                throw new Error('Should wake up only at 00 hour');
            }
            entries.push({date, hour, minute, guard, type: 'wake'});
        } else {
            const messageMatch = /^Guard #(\d+) begins shift$/.exec(message);
            if (!messageMatch) {
                throw new Error(`Invalid entry: ${line}`);
            }
            guard = Number(messageMatch[1]);
        }
    }

    const guards = new Map<number, GuardInfo>();
    let watcher: GuardInfo | undefined;
    let date: string | undefined;
    let sleepingSince: number | undefined;

    for (const entry of entries) {
        if (!watcher || entry.guard !== watcher.id || entry.date !== date) {
            watcher = guards.get(entry.guard);
            if (!watcher) {
                watcher = createInfo(entry.guard);
                guards.set(watcher.id, watcher);
            }
            date = entry.date;
            sleepingSince = undefined;
        }
        if (entry.type === 'sleep') {
            if (sleepingSince !== undefined) {
                throw new Error('Cannot fall asleep second time');
            }
            sleepingSince = entry.minute;
        } else if (entry.type === 'wake') {
            if (sleepingSince === undefined) {
                throw new Error('Cannot wake up if not sleeping');
            }
            for (let i = sleepingSince; i < entry.minute; i++) {
                watcher.sleepMinutes[i]++;
            }
            sleepingSince = undefined;
        }
    }

    function strategy1() {
        let maxSleepTime = 0;
        let foundGuard: GuardInfo | undefined;
        guards.forEach(guard => {
            const sleepTime = guard.sleepMinutes.reduce((sum, m) => sum + m, 0);
            if (sleepTime > maxSleepTime) {
                maxSleepTime = sleepTime;
                foundGuard = guard;
            }
        });

        if (!foundGuard) {
            throw new Error('Cannot find guard with max sleep time');
        }

        let maxTimes = 0;
        let foundMinute: number | undefined;
        for (let i = 0; i < foundGuard.sleepMinutes.length; i++) {
            const times = foundGuard.sleepMinutes[i];
            if (times > maxTimes) {
                maxTimes = times;
                foundMinute = i;
            }
        }

        if (!foundMinute) {
            throw new Error(`Cannot find most frequent sleep minute for guard #${foundGuard.id}`);
        }

        console.log(`Strategy 1: guard #${foundGuard.id} * minute ${foundMinute} = ${foundGuard.id * foundMinute}`);
    }

    function strategy2() {
        let maxTimes = 0;
        let foundMinute: number | undefined;
        let foundGuard: GuardInfo | undefined;
        guards.forEach(guard => {
            for (let i = 0; i < guard.sleepMinutes.length; i++) {
                const times = guard.sleepMinutes[i];
                if (times > maxTimes) {
                    maxTimes = times;
                    foundMinute = i;
                    foundGuard = guard;
                }
            }
        });

        if (!foundMinute || !foundGuard) {
            throw new Error(`Cannot find most frequent sleep minute & guard`);
        }

        console.log(`Strategy 2: guard #${foundGuard.id} * minute ${foundMinute} = ${foundGuard.id * foundMinute}`);
    }

    strategy1();
    strategy2();
}

function createInfo(guard: number): GuardInfo {
    const sleepMinutes: number[] = [];
    for (let i = 0; i < 60; i++) {
        sleepMinutes.push(0);
    }
    return {id: guard, sleepMinutes};
}

main();
