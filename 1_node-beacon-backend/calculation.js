const fs = require('fs');
const readline = require('readline');

let filePath = "./beacon5m.txt";
let sum = 0;
let counter = 0;

const readInterface = readline.createInterface({
    input: fs.createReadStream(filePath),
    output: false,
    console: false
});

const printAverage = (sum,counter) => {
	console.log(sum/counter);
}

readInterface.on('line', function(line) {
    sum += parseInt(line);
    counter++;
    console.log(sum, counter)
});


const processLine = line => {
	sum += parseInt(line);
	counter++;
}


