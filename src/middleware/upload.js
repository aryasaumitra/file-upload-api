const util = require('util');
const multer = require('multer');  //for multipart form data
const { GridFsStorage } = require("multer-gridfs-storage");
const path = require('path');
const dbConfig = require(path.join(__dirname,'../config/db'));

let storage = new GridFsStorage({
    url:dbConfig.url + dbConfig.database,
    options: {useNewUrlParser:true, useUnifiedTopology:true},
    file: (req,file) =>{
        const match = ["image/png","image/jpeg"];
        if(match.indexOf(file.mimetype) === -1){
            const filename = `${Date.now()} - test - ${file.originalname}`;
            return filename;
        }
        return{
            bucketName: dbConfig.imgBucket,
            filename: `${Date.now()} - test - ${file.originalname}`
        };
    }
});

var uploadFiles = multer({storage:storage}).array("file",10); //this "file" is from name attribute in views/index.html "<input type="file" name="file">""
var UploadFilesMiddleware = util.promisify(uploadFiles);

module.exports = UploadFilesMiddleware;