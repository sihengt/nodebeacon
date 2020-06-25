const fs = require('fs');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const stringify = require('csv-stringify')

// I only have the bandwidth to deal with one constant this time.
const macOfInterest = "DC:15:81:BC:0B:5D";
let filePath = "/home/siheng/Desktop/";

const data = []
const stringifier = stringify({
  delimiter: ','
})

stringifier.on('readable', function(){
  let row;
  while(row = stringifier.read()){
    data.push([row]);
  }
})

stringifier.on('error', function(err){
  console.error(err.message)
})

// defining this for writing to file later.
const readFilePath = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var csvFile = fs.createWriteStream('/home/siheng/Desktop/my.csv',{'flags': 'a'});

const saveData = (beacon_data) => {
  stringifier.write([beacon_data.rssi]);
}

// readFilePath.question('Where would you like to write the data to: ', (answer) => {
//    filePath = answer;
// });

server.listen(3319);

// Test page for phone to check connection.
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log("Connected.");
  socket.on('new message', (data) =>{
    if (data.mac == macOfInterest){
      saveData(data);
    }
  })
});


// do stuff here.
process.on('SIGINT', function() {
  console.log("Received SIGINT, saving file...")


  // stringifier.end();
  // console.log(data);
  // stringifier.pipe(process.stdout);
  // stringifier.pipe(csvFile);
  // csvFile.end();
  // adaptiveFilePath = filePath + macOfInterest + ".csv";
  // console.log(data);
  // fs.appendFile(adaptiveFilePath, data, (err) => {if (err) throw err; });
  process.exit();
});

// const interval = setInterval(printSomething = () => {
//   console.log(beaconMacAndRSSI);
// }, 2000);