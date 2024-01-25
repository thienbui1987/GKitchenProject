var express = require('express');
var app = express();
var config=require("../Config/appsetting.json");
var connDB=require("../Database/Connect.js");
var moment = require('moment');
var http = require('http');
var logger=require("../Logging/log.js");
var authen=require("../Authen/authen.js");
var bodyParser = require('body-parser');
//var session = require('express-session');
const NodeCache = require("node-cache");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

let sesstionTimeout=0,sessionKey='';
if(config!=null)
{
    sesstionTimeout=config.SessionTimeOut;
    sessionKey=config.SessionKey;
}
/*
app.use(session({
  secret: sessionKey,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: sesstionTimeout  } // session timeout of 60 seconds
}));
*/
function SaveSession(req,res)
{
    var datetime=moment().format('Y-M-D H:m:s');   
    try
    {
        var objSession=new Object();
        objSession.userName=req.userName;
        objSession.CreatedDate=datetime;
        objSession.IsActive=true;
        authen.SetCache(req.userName,objSession,sesstionTimeout);
       // objSession.cookie.expires=sesstionTimeout;
    }
    catch(e)
    {
        logger.WriteLogError("SaveSession ex => " +e);
    }
}

function CheckSession(req,res)
{
    var rs=false;
    try
    {
        var userName=req.headers.username;
        if(authen.GetCache(userName)!=null)
        {
            var objSession=authen.GetCache(userName);
            logger.WriteLogInfo("objSession = "+objSession);
            rs=true;
        }
    }
    catch(e)
    {
        logger.WriteLogError("SaveSession ex => " +e);
    }
    return rs;
}

function DestroySession(req,res)
{
    try
    {
        if(authen.GetCache(req.userName)!=null)
        {
            authen.SetCache(req.userName,null,-1);
        }
    }
    catch(e)
    {
        logger.WriteLogError("DetroySession ex => " +e);
    }
}

module.exports={
    SaveSession,
    CheckSession,
    DestroySession
}