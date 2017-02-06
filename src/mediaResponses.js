const fs = require('fs');
const path = require('path');

const getParty = (request, response) => {
   loadFile(request, response, '../client/party.mp4','video/mp4');
};

const getBling = (request, response) => {
   loadFile(request, response, '../client/bling.mp3','audio/mpeg');
};

const getBird = (request, response) => {
   loadFile(request, response, '../client/bird.mp4','video/mp4');
};

function loadFile(request, response, directory, type){
    const file = path.resolve(__dirname,  directory);
    
    fs.stat(file, (err, stats) => {
        // 404 Error
        if(err){
            if(err.code === 'ENOENT'){
                response.writeHead(404);
            }
            return response.end(err);
        }
        
        //Range header check
        const range = request.headers.range;
        
        if(!range){
            return response.writeHead(416);
        }
        
        //Get byte range of range header
        const positions = range.replace(/bytes=/,'').split('-');
        
        let start = parseInt(positions[0], 10);
        
        const total = stats.size;
        const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        
        if(start>end){
            start=end-1;
        }
        
        //Determine size of stuff being sent to browser
        const chunksize = (end-start)+1;
        
        response.writeHead(206,{
            'Content-Range':`bytes ${start}-${end}/${total}`,
            'Accept-Ranges': "bytes",
            'Content-Length': chunksize,
            'Content-Type': type,
        });
        
        //Create file stream
        const stream = fs.createReadStream(file, {start, end});
        
        stream.on('open',() => {
            stream.pipe(response);
        });
        
        stream.on('error',(streamErr) => {
            stream.end(streamErr);
        });
        
        return stream;
    });
}

module.exports.getParty = getParty;
module.exports.getBling = getBling;
module.exports.getBird = getBird;