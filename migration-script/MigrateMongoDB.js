
class MigrateMongoDB
{
    constructor()
    {
      return null;
    }

    async dumpOrRestoreMongoDB(dataSourceOrTarget=null,  credentials=null,  action=null, timeout=null)
    {
        // 1. defined command
        let command = null;
        const cds = credentials;
        const execOptions = {timeout: timeout};
        const childProcess = require("child_process");
        
        // note: a) dump is from NON-mongodb-atlas server - source
        // note: b) restore is into mongodb-atlas server (cluster) - target
     
        if(action === "dump")
        {
            const dataDirectory = dataSourceOrTarget;

            if(cds.dbTls === false)
            {
                command = `sudo mongodump -u ${cds.dbUserName} -p ${cds.dbUserPassword} -d ${cds.dbName} --port ${cds.dbPort} --host ${cds.dbDomainURL}` +
                ` --out ${dataDirectory}`;
                
            }
            else if(cds.dbTls === true)
            {
                command = `sudo mongodump -u ${cds.dbUserName} -p ${cds.dbUserPassword} -d ${cds.dbName} --port ${cds.dbPort} --host ${cds.dbDomainURL}` +
                ` --tls --tlsCertificateKeyFile ${cds.sslOptions.key} --tlsCAFile ${cds.sslOptions.key}` +
                ` --out ${dataDirectory}`;
            }
        }
        else if(action === "restore")
        {
            const dataPath = dataSourceOrTarget;
            command = `sudo mongorestore --uri=mongodb+srv://${cds.dbUserName}:${cds.dbUserPassword}@${cds.dbDomainURL} --drop ${dataPath}/${cds.dbColName}.bson`;
        }
        
        
        // 2. then run command asynchrously
        const cpexec = childProcess.exec(command, execOptions);
        const initialTime = new Date();
        
        cpexec.on('error', function(error)
        {
          console.log(error);
        });
        
        cpexec.stdout.on('data', function(data)
        {
          console.log(data);
        });
        
        cpexec.stderr.on('data', function(data)
        {
          console.log(data);
        });
        
        cpexec.on('exit', function (code)
        {
          const decimalPlaces = 6;
          const actionDuration = ((new Date()).getTime() - initialTime.getTime())/(1000)
          console.log("===============================================================");
          console.log(action.toUpperCase(), " Duration : " , actionDuration.toFixed(decimalPlaces)/1, "seconds");
          console.log("Child process exited with code : ", code);
          console.log("===============================================================");
        });
    }
    
    async transferFilesToS3(filePath=null, options=null, bucketName=null, fileName=null)
    {
        const fs = require('fs');
        const aws = require('aws-sdk');
        const s3 = new aws.S3(options=options);
        const pathTofileName = filePath + "/" + fileName;
        const sizes = { partSize: 10 * 1024 * 1024, queueSize: 1 };
        const readStream = fs.createReadStream(pathTofileName);
        const params = {Bucket: bucketName, Key: fileName, Body: readStream};
        console.log("Uploading ", fileName, " in progress. Time is: ", (new Date()), " .....");
        
        s3.upload(params, sizes, function(error, data)
        {
          if(error)
          {
            console.log("error: ", error);
          }
          
          if(data)
          {
            console.log(fileName, "is successfully uploaded. File location is: ", data.Location);
            console.log("Time is: ", (new Date()), " .....");
          }
        });
    }

    async transferFilesFromS3(filePath=null, options=null, bucketName=null, fileName=null)
    {
        const fs = require('fs');
        const aws = require('aws-sdk');
        const s3 = new aws.S3(options = options);
        const pathTofileName = filePath + "/" + fileName;
        const writeStream = fs.createWriteStream(pathTofileName);
        const params = { Bucket: bucketName, Key: fileName};
        console.log("Downloading ", fileName, " in progress. Time is: ", (new Date()), " .....");

        await s3.getObject(params, function (error, data)
        {
            if(error)
            {
                console.log("error: ", error);
            }
            
        }).createReadStream().pipe(writeStream);
        
        await console.log(fileName, "is successfully downloaded. File path is: ", pathTofileName);
        await console.log("Time is: ", (new Date()), " .....");
    }

    queryMongoDB(args=null)
    {
        // require/import relevant modules
        const fs = require('fs');
        const app = new MigrateMongoDB();
        const MongoClient = require('mongodb').MongoClient;
        
        //source connection credentials, url and client
        const cds = args.sourceCredentials;
        const urlSource = (`mongodb://${cds.dbUserName}:${cds.dbUserPassword}@${cds.dbDomainURL}:${cds.dbPort}/${cds.dbName}`).trim();
        const sourceClient = new MongoClient(urlSource, cds.mongodDBOptions);
        console.log("Connecting to MongoDB server.");
        const startDate = new Date();

        // connect and run query
        sourceClient.connect(function(sourceConnectionError)
        {
            if(sourceConnectionError)
            {
                sourceClient.close();
                return console.log(sourceConnectionError);
            }
            
            const dbs = sourceClient.db(cds.dbName);
            const sourceDbColName = cds.dbColName;
            const filter = { };
            const sourceCollection = dbs.collection(sourceDbColName);
                
            sourceCollection.find(filter).toArray(function(retrievedRecordsError, retrievedRecords)
            {
                if(retrievedRecordsError)
                {
                    sourceClient.close();
                    return console.log(retrievedRecordsError);
                }
                   
                //confirm success of retrieved documents and display/show
                console.log(`Retrieved ${retrievedRecords.length} documents.`);
                console.log(retrievedRecords);
                
                //display query run time
                const decimalPlaces = 6;
                const copyDuration = ((new Date()).getTime() - startDate.getTime())/(1000*60);
                app.separator();
                console.log("Query Duration : " , copyDuration.toFixed(decimalPlaces)/1, "minutes");
                app.separator();
                                
                //close database query
                sourceClient.close();
                return;
            });
        });
    }
    
    getRelevantStatistics(targetStat, sourceStat)
    {
        let targetValidationVariablesList = [];
        let sourceValidationVariablesList = [];
        
        //get db.stats' variables used (relevant) in validation
        //target
        targetValidationVariablesList.push(String(targetStat.db));
        targetValidationVariablesList.push(Number(targetStat.collections));
        targetValidationVariablesList.push(Number(targetStat.views));
        targetValidationVariablesList.push(Number(targetStat.objects));
        targetValidationVariablesList.push(Number(targetStat.avgObjSize));
        targetValidationVariablesList.push(Number(targetStat.dataSize));
        targetValidationVariablesList.push(Number(targetStat.indexes));
        //source
        sourceValidationVariablesList.push(String(sourceStat.db));
        sourceValidationVariablesList.push(Number(sourceStat.collections));
        sourceValidationVariablesList.push(Number(sourceStat.views));
        sourceValidationVariablesList.push(Number(sourceStat.objects));
        sourceValidationVariablesList.push(Number(sourceStat.avgObjSize));
        sourceValidationVariablesList.push(Number(sourceStat.dataSize));
        sourceValidationVariablesList.push(Number(sourceStat.indexes));
        
        return {"targetValidationVariablesList": targetValidationVariablesList,
                "sourceValidationVariablesList": sourceValidationVariablesList,
                "targetValidationKeyValuePairs": {
                  db: targetStat.db,
                  collections: targetStat.collections,
                  views: targetStat.views,
                  objects: targetStat.objects,
                  avgObjSize: targetStat.avgObjSize,
                  dataSize: targetStat.dataSize,
                  indexes: targetStat.indexes
                },
                "sourceValidationKeyValuePairs": {
                  db: sourceStat.db,
                  collections: sourceStat.collections,
                  views: sourceStat.views,
                  objects: sourceStat.objects,
                  avgObjSize: sourceStat.avgObjSize,
                  dataSize: sourceStat.dataSize,
                  indexes: sourceStat.indexes
                }
        };
    }
    
    compareStatistics(targetValidationVariablesList, sourceValidationVariablesList)
    {
        let count  = 0;
        let targetLength = targetValidationVariablesList.length;
        let sourceLength = sourceValidationVariablesList.length;
        let confirm = false;
        
        if(targetLength  === sourceLength)
        {
            for(let index = 0; index < targetLength; index++)
            {
                if(targetValidationVariablesList[index] !== sourceValidationVariablesList[index])
                {
                    count = count + 1;
                }
            }
                              
            if(count > 0)
            {
                confirm = false;
                return confirm;
            }
            
            confirm = true;
            return confirm;
        }
        
        return confirm;
    }
    
    saveValidationResults(targetStats, sourceStats, confirm, resultsFileName)
    {
        let fs   = require('fs');
        let util = require('util');
        fs.writeFileSync(resultsFileName,  "\n" + "--------------------------------------------------------------------------", {flag: 'a'});
        fs.writeFileSync(resultsFileName, "\n" + "Start Time: " + new Date(), {flag: 'a'});
        fs.writeFileSync(resultsFileName, "\n" + "--------------------------------------------------------------------------", {flag: 'a'});
        fs.writeFileSync(resultsFileName, "\n" + "Target Validation Stats" + "\n", {flag: 'a'});
        fs.writeFileSync(resultsFileName, util.format(targetStats), {flag: 'a'});
        fs.writeFileSync(resultsFileName, "\n", {flag: 'a'});
        fs.writeFileSync(resultsFileName, "\n" + "Source Validation Stats" + "\n", {flag: 'a'});
        fs.writeFileSync(resultsFileName, util.format(sourceStats), {flag: 'a'});
        fs.writeFileSync(resultsFileName, "\n" + "--------------------------------------------------------------------------", {flag: 'a'});
        fs.writeFileSync(resultsFileName, "\n" + "Is validation okay?: " + confirm, {flag: 'a'});
        fs.writeFileSync(resultsFileName, "\n" + "--------------------------------------------------------------------------", {flag: 'a'});
        fs.writeFileSync(resultsFileName, "\n" + "\n", {flag: 'a'});
    }
    
    validate(targetStats, sourceStats)
    {
        const app = new MigrateMongoDB();

        //get db.stats for validation
        const validationStats = app.getRelevantStatistics(targetStats, sourceStats);
        let targetStatsList = validationStats.targetValidationVariablesList;
        let sourceStatsList = validationStats.sourceValidationVariablesList;
        let targetStatsUsed = validationStats.targetValidationKeyValuePairs;
        let sourceStatsUsed = validationStats.targetValidationKeyValuePairs;
      
        // validate migrated database using relevant db.stats' variables
        console.log();
        console.log("------------------------------------------");
        console.log("Starting Validation Engine.");
        let confirm = app.compareStatistics(targetStatsList, sourceStatsList);
        
        //console.log input validation variables
        console.log("------------------------------------------");
        console.log("Target Validation Statistics: " );
        console.log(targetStatsUsed);
        console.log("------------------------------------------");
        console.log("Source Validation Statistics: ");
        console.log(sourceStatsUsed);
        console.log("------------------------------------------");
        
        //print validation results
        if(confirm  === true)
        {
          console.log("Is validation okay?");
          console.log("Yes, " + "'" + sourceStats.db + "' database is validated.");
        }
        else
        {
          console.log("Is validation okay?");
          console.log("No, " + "'" + sourceStats.db + "' database is NOT validated.");
        }
        
        console.log("------------------------------------------");
        console.log("End of Validation Engine.");
        console.log("------------------------------------------");

        //finally, save stats used for validation to file
        let resultsFileName = "MongoDBValidate.txt";
        app.saveValidationResults(targetStatsUsed, sourceStatsUsed, confirm, resultsFileName);
    }
    
    connectAndValidate(args=null)
    {
        // require/import relevant modules
        const fs = require('fs');
        const app = new MigrateMongoDB();
        const MongoClient = require('mongodb').MongoClient;
        
        // note: a) NON-mongodb-atlas server is the source
        // note: b) mongodb-atlas server (cluster) is the target
        
        //source connection credentials, url and client
        const cds = args.sourceCredentials;
        const urlSource = (`mongodb://${cds.dbUserName}:${cds.dbUserPassword}@${cds.dbDomainURL}:${cds.dbPort}/${cds.dbName}`).trim();
        const sourceClient = new MongoClient(urlSource, cds.mongodDBOptions);
        
        //target connection credentials, url and client
        const cdt = args.targetCredentials;
        const urlTarget = (`mongodb+srv://${cdt.dbUserName}:${cdt.dbUserPassword}@${cdt.dbDomainURL}/${cdt.dbName}`).trim();
        const targetClient = new MongoClient(urlTarget, cdt.mongodDBOptions);
        
        console.log("Connecting to MongoDB server(s).");
        
        //start time
        const startDate = new Date();

        sourceClient.connect(function(sourceConnectionError)
        {
            if(sourceConnectionError)
            {
                sourceClient.close();
                return console.log(sourceConnectionError);
            }
            
            //get reference to source database and confirm connection
            console.log();
            const sourceDb = sourceClient.db(cds.dbName);
            console.log("............................................");
            console.log("Now connected to  source database on:", cds.dbDomainURL);
            console.log("............................................");
            
            targetClient.connect(function(targetConnectionError)
            {
                if(targetConnectionError)
                {
                    targetClient.close();
                    sourceClient.close();
                    return console.log(targetConnectionError);
                }
                

                //get reference to target database and confirm connection
                console.log();
                const targetDb = targetClient.db(cdt.dbName);
                console.log("............................................");
                console.log("Now connected to  target database on:", cdt.dbDomainURL);
                console.log("............................................");
                
                 //get all db statistics
                 targetDb.stats(function(targetStatsError, targetStats)
                 {
                      if(targetStatsError)
                      {
                          console.log(targetStatsError);
                          console.log("Error while getting Target Statistics.");
                          return;
                      }
                      
                      sourceDb.stats(function(sourceStatsError, sourceStats)
                      {
                        if(sourceStatsError)
                        {
                            console.log(sourceStatsError);
                            console.log("Error while getting Source Statistics.");
                            return;
                        }
                    
                        //finally validate
                        const app = new MigrateMongoDB();
                        const validate = app.validate(targetStats, sourceStats);
                        
                        //display validation run time
                        const decimalPlaces = 6;
                        const validationDuration = ((new Date()).getTime() - startDate.getTime())/(1000);
                        app.separator();
                        console.log("Validation Duration : " , validationDuration.toFixed(decimalPlaces)/1, "seconds");
                        app.separator();
                        
                        //then close connections to databases
                        sourceClient.close();
                        targetClient.close();
                        console.log("Connections to Target and Source Databases are now closed ........");
                        console.log
                        
                      });
                  });
                
            });
        });
    }

    separator()
    {
      console.log("===================================================================");
    }
}


(function main()
{
    const fs = require('fs');
    const path = require('path');
    const app = new MigrateMongoDB();
    const config = JSON.parse(fs.readFileSync('configuration.json')); //configuration.json is in CWD
    
    //source config variables
    let sourceDbPort = config.sourceDbPort;
    let sourceDbName = config.sourceDbName;
    let sourceDbColName = config.sourceDbColName;
    let sourceDbUserName = config.sourceDbUserName;
    let sourceDbUserPassword = config.sourceDbUserPassword;
    let sourceDbDomainURL = config.sourceDbDomainURL;
    let sourceDbTls =  config.sourceDbTls;
    
    //target config vriables
    let targetDbPort = config.targetDbPort;
    let targetDbName = config.targetDbName;
    let targetDbColName = config.targetDbColName;
    let targetDbUserName = config.targetDbUserName;
    let targetDbUserPassword = config.targetDbUserPassword;
    let targetDbDomainURL = config.targetDbDomainURL;
    let targetDbTls =  config.sourceDbTls;
    
    //tls
    let sourceTlsCertOptions  = {"ca": null, "key": null, "cert": null};
    let targetTlsCertOptions  = {"ca": null, "key": null, "cert": null}
    if(sourceDbTls)
    {
        sourceTlsCertOptions = {"ca": path.resolve("/pathToCAFile/caFile.pem"), "key": path.resolve("/pathToKEYFile/mongodb.pem"),"cert": path.resolve("/pathToCERTFile/certFile.pem")}
    }
    if(targetDbTls)
    {
        targetTlsCertOptions = {"ca": path.resolve("/pathToCAFile/caFile.pem"),"key": path.resolve("/pathToKEYFile/mongodb.pem"), "cert": path.resolve("/pathToCERTFile/certFile.pem")}
    }
    
    // mongodb connection options
    const sourceMongodDBOptions = {
        useNewUrlParser: true, useUnifiedTopology: true, minSize: 5, loggerLevel: "error",
        readPreference: 'nearest', maxStalenessSeconds: 90, poolSize: 500, tls: false,
        sslValidate: false, tlsCAFile: sourceTlsCertOptions.ca, tlsCertificateKeyFile: sourceTlsCertOptions.key,
        connectTimeoutMS: 54000000,
        socketTimeoutMS:  54000000
    };
    
    const targetMongodDBOptions = {
        useNewUrlParser: true, useUnifiedTopology: true, minSize: 5, loggerLevel: "error",
        readPreference: 'nearest', maxStalenessSeconds: 90, poolSize: 500, tls: false,
        sslValidate: false, tlsCAFile: targetTlsCertOptions.ca, tlsCertificateKeyFile: targetTlsCertOptions.key,
        connectTimeoutMS: 54000000,
        socketTimeoutMS:  54000000,
    };

    const sourceCredentials = {
        "dbPort": sourceDbPort,
        "dbName": sourceDbName,
        "dbColName": sourceDbColName,
        "dbUserName": sourceDbUserName,
        "dbUserPassword": sourceDbUserPassword,
        "dbDomainURL": sourceDbDomainURL,
        "dbTls": sourceDbTls,
        "mongodDBOptions": sourceMongodDBOptions
    };
    
     const targetCredentials = {
        "dbPort": targetDbPort,
        "dbName": targetDbName,
        "dbColName": targetDbColName,
        "dbUserName": targetDbUserName,
        "dbUserPassword": targetDbUserPassword,
        "dbDomainURL": targetDbDomainURL,
        "dbTls": targetDbTls,
        "mongodDBOptions": targetMongodDBOptions
    };
    
    // show details of source and target MongoDB servers with password redacted
    console.log("Details of MongoDB Servers:");
    let configRedacted = config;
    configRedacted.sourceDbUserPassword = "redacted";
    configRedacted.targetDbUserPassword = "redacted";
    console.log(configRedacted);
    app.separator();
  
    
    // action
    let action;
    action = "dump";
    action = "restore";
    action = "transferToS3";
    action = "transferFromS3";
    action = "query"
    action = "validateDB"
    
    action = "";
    
    try
    {
        if((action === "dump") || (action ==="restore"))
        {
            const timeout = 7200000; //2 hour time-out
            let dataPath;
            let credentials;
            let dataSourceOrTarget = "";
            
            if(action === "dump")
            {
                credentials = sourceCredentials;
                dataSourceOrTarget = "/home/ubuntu/environment/dump";
                app.dumpOrRestoreMongoDB(dataSourceOrTarget, credentials, action, timeout);
            }
            else if(action === "restore")
            {
                credentials = targetCredentials;
                dataSourceOrTarget = `/home/ubuntu/environment/dump/${sourceCredentials.dbName}/`;
                app.dumpOrRestoreMongoDB(dataSourceOrTarget, credentials, action, timeout);
            }
        }
        else if(action === "transferToS3")
        {
            const dumpFilePath = "dumpFilePath";
            const options = {accessKeyId: "accessKeyId", secretAccessKey: "secretAccessKey", region: "region"};
            const bucketName = "bucketName";
            const fileName = "fileName";
            app.transferFilesToS3(filePath, options, bucketName, fileName);
        }
        else if(action === "transferFromS3")
        {
            const dumpFilePath = "dumpFilePath";
            const options = {accessKeyId: "accessKeyId", secretAccessKey: "secretAccessKey", region: "region"};
            const bucketName = "bucketName";
            const fileName = "fileName";
            app.transferFilesFromS3(filePath, options, bucketName, fileName);
        }
        else if(action === "query")
        {
            const args = {sourceCredentials: sourceCredentials};
            app.separator();
            app.queryMongoDB(args);
            console.log("Successfully run query.");
        }
        else if(action === "validateDB")
        {
          const args = {sourceCredentials: sourceCredentials, targetCredentials: targetCredentials};
          app.connectAndValidate(args)
        }
        else
        {
          console.log("No action is selected.");
          console.log(`Select one of these actions: ${"dump"}, ${"restore"}` +
                      ` ${"transferToS3"}, ${"transferFromS3"}, ${"query"} or ${"validateDB"}`)
        }
    }
    catch (error)
    {
        console.error(error);
        
    }
    
}());
