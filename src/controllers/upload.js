const upload = require('../middleware/upload');
const dbConfig = require('../config/db');
const MongoClient = require("mongodb").MongoClient;
const GridFSBucket = require("mongodb").GridFSBucket;

const url = dbConfig.url;
const baseUrl = "http://localhost:8080/files/"
const mongoClient  = new MongoClient(url)


const uploadFiles = async (req,res) => {
    try{
        await upload(req,res);
        console.log(req.files)
        if(req.files.length <= 0){

            return res.status(400).send({message:"You must select one file atleast"})
        }
        return res.send({
            message:"Files has been uploaded"
        })
        // if(req.file == undefined){
        //     return res.send({
        //         message:"You must select a file"
        //     })
        // }



    }catch(error){
        console.log(error)
        if(error.code === "LIMIT_UNEXPECTED_FILE"){
            return res.status(400).send({
                message:"Too many files to upload"
            });
        }


        return res.send({
            message:`Error when uploading too many file:${error}`
        })
    }
}


const getListFiles = async (req,res)=>{
    try{

        await mongoClient.connect();
        const database = mongoClient.db(dbConfig.database);
        const images = database.collection(dbConfig.imgBucket + ".files");
        images.find({}).toArray(function(err,result){
            if(err){
                return res.status(500).send({
                    message: "No files found!",
                  });
            }
            let fileInfos = []
            result.forEach((doc)=>{
                fileInfos.push({
                    name:doc.filename,
                    url:baseUrl + doc.filename
                });
            });
            return res.status(200).send(fileInfos);
        });


    }catch(error){
        return res.status(500).send({
            message:error.message
        })
    }
}

const download = async (req,res) =>{
    try{
        await mongoClient.connect();
        const database = mongoClient.db(dbConfig.database);
        const bucket = new GridFSBucket(database, {
          bucketName: dbConfig.imgBucket,
        });

        let downloadStream = bucket.openDownloadStreamByName(req.params.name);

        downloadStream.on("data",function(data){
            return res.status(200).write(data);
        })

        downloadStream.on("error", function(err){
            console.log(err)
            return res.status(404).send({ message: "Cannot download the Image!" });
        })

        downloadStream.on("end", () => {
            return res.end();
        });

    }catch(error){
        return res.status(500).send({
            message: error.message,
        });
    }
}


module.exports = {
    uploadFiles,
    getListFiles,
    download
}