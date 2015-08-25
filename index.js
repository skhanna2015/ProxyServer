
let http = require('http')
let request = require('request')
let argv = require('yargs')
    .default('host', '127.0.0.1:8000')
    .argv
let scheme = 'http://'
let path = require('path')
let fs = require('fs')
let logPath = argv.log && path.join(__dirname, argv.log)
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout
// Build the destinationUrl using the --host value
let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)
let destinationUrl = argv.url || scheme + argv.host + ':' + port
//let destinationUrl = '127.0.0.1:8000'


http.createServer((req, res) => {
    process.stdout.write(`Request received at: ${req.url}`)
    req.pipe(res)
    for (let header in req.headers) {
    res.setHeader(header, req.headers[header])
}
}).listen(8000)


http.createServer((req, res) => {
    process.stdout.write(`Proxying request to: ${destinationUrl + req.url}`)
    let url=destinationUrl
    if(req.headers['x-destination-url']){
    	req.headers['x-destination-url']
    }
    let options = {
    	headers : req.headers,
    	url:url+req.url
    }
    options.method=req.method
    
    process.stdout.write('\n\n\n' + JSON.stringify(req.headers))
    req.pipe(process.stdout)
    //req.pipe(request(options)).pipe(res)
    
    let downstreamResponse=req.pipe(request(options))
    process.stdout.write(JSON.stringify(downstreamResponse.headers))
    downstreamResponse.pipe(process.stdout)
    downstreamResponse.pipe(res)
     req.pipe(logStream, {end:false})

}).listen(8001)

