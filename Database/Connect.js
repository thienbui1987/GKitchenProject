var mysql = require("mysql");
var config=require("../Config/appsetting.json");
var logger=require("../Logging/log.js");
let server='',user='',pass='',database='',port;
if(config!=null&&config.database!=null)
{
    server=config.database.server;
    user=config.database.username;
    pass=config.database.password;
    database=config.database.databasename;
    port=config.database.databasename.port;
}
module.exports ={
    InitConnectDB,
    DetroyConnectDB
}
function InitConnectDB()
{
    var conn=mysql.createConnection(
        {
            host: server,
            user: user,
            password:pass,
            database:database,
            port:port,
            multipleStatements: true
          });

          conn.connect(function(err){
            if(err){
               // console.log("error connect DB");
                logger.WriteLogError("createConnection => error : server = " +server +",user = "+user +", database = "+database +", ex ="+ err);
                return;
            }
            else
            {
                //console.log("connect DB success");
            }
          });
          return conn;
}

function DetroyConnectDB(conn)
{
    conn.end((error) => {
        if (error) {
         // console.error('Error closing MySQL connection:', error);
          logger.WriteLogError("Closing MySQL connection => error : conn = " +conn +", ex ="+ error);
          return;
        }
    
       // console.log('MySQL connection closed.');
      });
}
