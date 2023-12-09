import { readFile, writeFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { performance, PerformanceObserver } from 'node:perf_hooks';

const INPUT_SIZE = 5000;
const TARGET = INPUT_SIZE - 1; // searching for the last item in the array
const INPUT_FILE = './input.json';

const obs = new PerformanceObserver((list) => {
    console.log(list.getEntries()[0].duration);
    
    performance.clearMarks();
    performance.clearMeasures();
    obs.disconnect();
});
obs.observe({ entryTypes: ['function'] });

const linearSearch = (input: number[], target: number) : number => {
    for (const i in input) {
        const value = input[i];
        if (value === target) return Number(i);
    }
    return -1;
}

const binarySearch = (input: number[], target: number) : number => {
    let left = 0;
    let right = input.length - 1;
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (input[mid] === target) {
            return mid;
        } else if (input[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}

const writeInput = async (int: number) => {
    const chunkMax = 500;
    const chunk : number[] = [];
    const stream = createWriteStream(INPUT_FILE, 'utf-8');
    let chunksWritten = 0;
    stream.write('[');
    for (var i = 1; i <= int; i++) {
        chunk.push(i);
        if (chunk.length >= chunkMax) {
            await new Promise((resolve) => {
                const data = chunksWritten > 0
                    ? `,${chunk.join(',')}`
                    : chunk.join(',')
                stream.write(data, (err) => {
                    if (err) {
                        console.error('there was an error!');
                    } else {
                        // await writeFile(INPUT_FILE, JSON.stringify(chunk));
                        chunk.splice(0, chunk.length);
                        chunksWritten += 1;
                        resolve(true);
                    }
                });
            })
        }
    }
    stream.write(']');
    stream.end();
}

const main = async () => {
    await writeInput(INPUT_SIZE)
    const algorithm = process.argv[2];
    const data = await readFile(path.resolve('./input.json'));
    const json = data.toString('utf8');
    if (algorithm === 'binary-search') {
        console.info('...using binary search algorithm...')
        const binaryTime = performance.timerify(binarySearch);
        const result = binaryTime(JSON.parse(json), TARGET);
        console.log(`${result}`)
    } else {
        console.info('...using linear algorithm...')
        const linearTime = performance.timerify(linearSearch);
        const result = linearTime(JSON.parse(json), TARGET);
        console.log(`${result}`)
    }
}

main();