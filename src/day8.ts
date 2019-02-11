import * as fs from 'fs';
import * as util from 'util';

const readFile = util.promisify(fs.readFile);

async function main() {
    const content = await readFile("./input/day8.txt", {encoding: 'utf8'});
    const encodedTree = content.trim();
    const iterable = iterateNumbers(encodedTree);
    const tree = readNode(iterable[Symbol.iterator]());
    
    const sum = sumMetadata(tree);
    console.log(`Metadata sum: ${sum}`);

    const tricky = trickySum(tree);
    console.log(`Tricky sum: ${tricky}`);
}

interface Node {
    children: Node[];
    metadata: number[];
}

function readNode(iterator: Iterator<number>): Node {
    const childCount = readNumber(iterator);
    const metadataCount = readNumber(iterator);
    const children: Node[] = [];
    for (let i = 0; i < childCount; i++) {
        children.push(readNode(iterator));
    }
    const metadata: number[] = [];
    for (let i = 0; i < metadataCount; i++) {
        metadata.push(readNumber(iterator));
    }
    return {children, metadata};
}

function readNumber(iterator: Iterator<number>): number {
    const {done, value} = iterator.next();
    if (done) {
        throw new Error('Unexpected end of stream');
    }
    return value;
}

function *iterateNumbers(content: string): Iterable<number> {
    for (const match of iterateRegexMatches(/(\d+)(?: |$)/g, content)) {
        yield Number(match[1]);
    }
}

function *iterateRegexMatches(regex: RegExp, text: string): Iterable<RegExpExecArray> {
    while (true) {
        const match = regex.exec(text);
        if (!match) { break; }
        yield match;
    }
}

function sumMetadata(node: Node): number {
    const selfSum = node.metadata.reduce((acc, m) => acc + m, 0);
    const childSum = node.children.reduce((acc, child) => acc + sumMetadata(child), 0);
    return selfSum + childSum;
}

function trickySum(node: Node): number {
    if (node.children.length === 0) {
        return node.metadata.reduce((acc, m) => acc + m, 0);
    } else {
        let total = 0;
        for (const childNo of node.metadata) {
            const index = childNo - 1;
            if (index >= 0 && index < node.children.length) {
                total += trickySum(node.children[index]);
            }
        }
        return total;
    }
}

main();
