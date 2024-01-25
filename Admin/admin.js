var express = require('express');
var app = express();
var config=require("../Config/appsetting.json");
var connDB=require("../Database/Connect.js");
var moment = require('moment');
var http = require('http');
var logger=require("../Logging/log.js");
var session=require("../Session/session.js");
var md5 = require('md5');
var bodyParser = require('body-parser');
//var session = require('express-session');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

/*
let sesstionTimeout=0,sessionKey='';
if(config!=null)
{
    sesstionTimeout=config.SessionTimeOut;
    sessionKey=config.SessionKey;
}
app.use(session({
  secret: sessionKey,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: sesstionTimeout * 1000 } // session timeout of 60 seconds
}));
*/
function AdminLogon(req,res){
     var userName='',password='';
     var objResult=new Object();
     if(req.body!=null&&req.body.userName!=null)
     {
       userName=req.body.userName;
     }
     if(req.body!=null&&req.body.password!=null)
     {
        password=req.body.password;
     }
     if(userName=='')
     {
        objResult.ErrorCode=1;
        objResult.ErrorMessage="Vui lòng nhập tên đăng nhập";
        objResult.result=null;
        res.end(JSON.stringify(objResult))
        return objResult;
     }
     if(password=='')
     {
        objResult.ErrorCode=1;
        objResult.ErrorMessage="Vui lòng nhập mật khẩu";
        objResult.result=null;
        res.end(JSON.stringify(objResult))
        return objResult;
     }
     var passMd5=md5(password);

     var con=connDB.InitConnectDB();
     con.query('call LoginAdmin("'+userName+'","'+passMd5+'")', function (error, results, fields) {
       if (error){
         objResult.ErrorCode=1;
         objResult.ErrorMessage=error;
         objResult.Result=null;
         objResult.TotalRow=0;
         logger.WriteLogError("AdminLogon  => error : userName = " +userName +" passMd5 = "+passMd5 +", ex ="+ error);
       }
       else{
         
         if(results!=null&&results[0]!=null&&results[0][0]!=null)
         {
            objResult.ErrorCode=0;
            objResult.ErrorMessage='success';
            objResult.Result=results[0][0];

            var request=new Object();
            request.userName=userName;
            
            session.SaveSession(request,res);
         }
         else
         {
            objResult.ErrorCode=1;
            objResult.ErrorMessage='Tên đăng nhập hoặc mật khẩu không đúng';
            objResult.Result=null;
         }
         
       }
       res.end(JSON.stringify(objResult));
       connDB.DetroyConnectDB(con);
     });
   }

   function Logout(req,res)
   {
        session.DestroySession(req,res);
        objResult=new Object();
        objResult.ErrorCode=0;
        objResult.ErrorMessage='Logout success';
        objResult.Result=null;
        res.end(JSON.stringify(objResult));
   }

module.exports={
    AdminLogon,
    Logout
}