
console.log('Start'); 
setImmediate(() => console.log('setImmediate 1'));
setTimeout(() => console.log('setTimeout 1'), 0);
process.nextTick(() => console.log('nextTick 1'));
setImmediate(() => console.log('setImmediate 2'));
process.nextTick(() => console.log('nextTick 2'));
// http.get(options, () => console.log('network IO'));
// fs.readdir(process.cwd(), () => console.log('file system IO 1'));
setImmediate(() => console.log('setImmediate 3'));
process.nextTick(() => console.log('nextTick 3'));
setImmediate(() => console.log('setImmediate 4'));
// fs.readdir(process.cwd(), () => console.log('file system IO 2'));
console.log('End');
// setTimeout(done, 1500);
    