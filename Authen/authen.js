var express = require('express');
var app = express();
var config=require("../Config/appsetting.json");
var logger=require("../Logging/log.js");
// var connDB=require("../Database/Connect.js");
var moment = require('moment');
const uuid = require('uuid');
var http = require('http');
const axios = require('axios');
var bodyParser = require('body-parser');
const e = require('express');
const NodeCache = require("node-cache");
const { channel } = require('diagnostics_channel');
const { Logger } = require('winston');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
let url='', clientId, appVersion='', nodeVersion='',hashCode='',deviceName='',token='', systemaccount='',passAccount='',EnableAuthenOTP='',timeResendOtp=60, expiredTimeCache=0, timeResendOtpMinute=3;
if(config!=null&&config.apiurl!=null)
{
    url=config.apiurl.linkapi;
    clientId=config.apiurl.clientId;
    appVersion=config.apiurl.versionapp;
    nodeVersion=config.apiurl.versionos;
    hashCode=config.apiurl.hashcode;
    deviceName=config.apiurl.devicename;
    token=config.apiurl.token;
    systemaccount=config.apiurl.username;
    passAccount=config.apiurl.password;

}
if(config!=null)
{
    EnableAuthenOTP=config.EnableAuthenOTP;
    timeResendOtp=config.TimeResendOtp;
    expiredTimeCache=config.ExpiredTimeCache;
}
/*
app.get('/', function (req, res) {
var con=connDB.InitConnectDB();
console.log('Connect DB success');
});
*/
var getheaders = {
  'clientid' : clientId,
  'versionos' : nodeVersion,
  'versionapp':appVersion,
  'devicename':deviceName,
  'hashcode':hashCode,
  'request-id' :Date.now().toString(36),
  'x-access-token':token
};

const cache = new NodeCache();
function GetOtp(req,res){
    var authenId=uuid.v1();
    var datetime=moment().format('Y-M-D H:m:s');
    var objResult=new Object();
    var urlAPI= url+"auth/registerForgotPassword";
    var customerPhone='';
   if(req.body.customerPhone!=null&&req.body.customerPhone!='')
   {
    customerPhone=req.body.customerPhone;
   }
   if(customerPhone==''||customerPhone==null)
   {
       objResult.ErrorCode=1;
       objResult.ErrorMessage="Vui lòng nhập số điện thoại";
       objResult.result=null;
       res.end(JSON.stringify(objResult))
       return objResult;
   }
   var result=new Object();
    var objData=new Object();
    objData.phone=customerPhone;

var options = {
  host: urlAPI,
  method: 'POST',
  headers: {
    'clientid' : clientId,
    'versionos' : nodeVersion,
    'versionapp':appVersion,
    'devicename':deviceName,
    'hashcode':hashCode,
    //'x-access-token':token,
    'request-id' :Date.now().toString(36),
    "Content-Type":"application/json",
    "Connection":"keep-alive"
  }
};
try
{
    timeResendOtpMinute=timeResendOtp/60;
}
catch{}
logger.WriteLogInfo("GetOtp = info : req ="+req +",EnableAuthenOTP = "+EnableAuthenOTP);
if(GetCache(customerPhone)!=null)
{
    var objCached=GetCache(customerPhone);
    logger.WriteLogInfo("GetOtp = info : req ="+req +",EnableAuthenOTP = "+EnableAuthenOTP +", timeResendOtp = " +timeResendOtp +", objCached = "+objCached);
    if(objCached!=null)
    {
        var createdDate=moment(objCached.CreatedDate).add('seconds', timeResendOtp);
        var currentDate=moment().format('YYYY-MM-DD HH:mm:ss');
        //createdDate=moment().format('DD/MM/YYYY HH:mm:ss');
        var d1=new Date(createdDate._i);
        d1.setSeconds(d1.getSeconds()+timeResendOtp);
        var d2=new Date(currentDate);
        if(d1>d2)
        {
            objResult.ErrorCode=1;
            objResult.ErrorMessage="Vui lòng chờ "+timeResendOtpMinute+" phút để lấy otp mới";
            objResult.result=null;
            res.end(JSON.stringify(objResult))
            return objResult;
        }
    }
}
if(EnableAuthenOTP=='false')
{
    
result.OtpId=authenId;
            result.CreatedDate=datetime;
            result.UpdatedDate=datetime;
            result.ExpiredDate=datetime;
            result.OtpId=authenId;

            objResult.result=result;
            //cache.set(customerPhone,result);
            SetCache(customerPhone,result,expiredTimeCache);
            res.end(JSON.stringify(objResult))
            return objResult;
}
else
{
return new Promise((resolve, reject) => {
axios.post(urlAPI, objData,{headers:options.headers})
     .then(response => {
        if(String(response.data.success)=='true')
        {
            objResult.ErrorCode=0;
             objResult.ErrorMessage="success";
            result.OtpId=response.data.data.otpID;
            result.CreatedDate=response.data.data.createdAt;
            result.UpdatedDate=response.data.data.updatedAt;
            result.ExpiredDate=response.data.data.expiresAt;
            objResult.result=result;
          //  cache.set(customerPhone,result);
            SetCache(customerPhone,result,expiredTimeCache);
            resolve(objResult);
            res.end(JSON.stringify(objResult));
        }
        else{
            objResult.ErrorCode=1;
           // objResult.PartnerCode=response.data;
            objResult.ErrorMessage=response.data.data;
            objResult.result=null;
            logger.WriteLogError("GetOtp call GKitchen => error : urlAPI = " +urlAPI +", data ="+ response.data);
            res.end(JSON.stringify(objResult));
        }
     })
     .catch(error => {
        logger.WriteLogError("GetOtp => error : req = " +req +", ex ="+ error.message);
         console.error('Error fetching data:', error);
         objResult.ErrorCode=1;
         objResult.PartnerCode=error.response.data.errorCode;
         if(error.response!=null&&error.response.data.errorCode=="E000")
         {
             objResult.ErrorMessage=error.response.data.message.phone;
         }
         else
         {
             objResult.ErrorMessage=error.response.data.message;
         }
         objResult.result=null;
         resolve(objResult);
         res.end(JSON.stringify(objResult));
     });
     
   
});
}
}


function ValidateOtp(req,res){
    var objResult=new Object();
   
    var urlAPI= url+"auth/registerConfirmOTP";
    var otpId='',otpCode='';
   if(req.body.otpId!=null&&req.body.otpId!='')
   {
    otpId=req.body.otpId;
   }
   if(req.body.otpCode!=null&&req.body.otpCode!='')
   {
    otpCode=req.body.otpCode;
   }
   if(otpId==''||otpId==null)
   {
       objResult.ErrorCode=1;
       objResult.ErrorMessage="Vui lòng nhập otpId";
       objResult.result=null;
       res.end(JSON.stringify(objResult))
       return objResult;
   }
   if(otpCode==''||otpCode==null)
   {
       objResult.ErrorCode=1;
       objResult.ErrorMessage="Vui lòng nhập mã OTP";
       objResult.result=null;
       res.end(JSON.stringify(objResult))
       return objResult;
   }
   if(EnableAuthenOTP=='false')
   {
        objResult.ErrorCode=0;
        objResult.ErrorMessage='success';
        objResult.result=null;
        res.end(JSON.stringify(objResult))
       return objResult;
   }
   if(cache!=null&&cache.has(customerPhone))
   {
       var objCached=cache.get(customerPhone);
       logger.WriteLogInfo("ValidateOtp = info : req ="+req +",EnableAuthenOTP = "+EnableAuthenOTP +", timeResendOtp = " +timeResendOtp +", objCached = "+objCached);
       if(objCached!=null)
       {         
           var currentDate=moment().format('YYYY-MM-DD HH:mm:ss');
           var expiredDate=new Date(objCached.ExpiredDate);
           var currDate=new Date(currentDate);
           if(expiredDate<currDate)
           {
               objResult.ErrorCode=1;
               objResult.ErrorMessage="Mã xác thực Otp đã hết hạn, vui lòng lấy mã Otp mới";
               objResult.result=null;
               res.end(JSON.stringify(objResult))
               return objResult;
           }
       }
   }
    var objData=new Object();
    objData.otpID=otpId.toString();
    objData.otpCode=otpCode.toString();
var options = {
  host: urlAPI,
  method: 'POST',
  headers: {
    'clientid' : clientId,
    'versionos' : nodeVersion,
    'versionapp':appVersion,
    'devicename':deviceName,
    'hashcode':hashCode,
    //'x-access-token':token,
    'request-id' :Date.now().toString(36),
    "Content-Type":"application/json",
    "Connection":"keep-alive"
  }
};
return new Promise((resolve, reject) => {
axios.post(urlAPI, objData,{headers:options.headers})
     .then(response => {
        if(String(response.data.success)=='true')
        {
            
            objResult.ErrorCode=0;
            objResult.ErrorMessage='success';
            objResult.result=null;
            resolve(objResult);
            res.end(JSON.stringify(objResult));
        }
        else
        {
            objResult.ErrorCode=1;
            objResult.PartnerCode=response.errorCode;
            objResult.ErrorMessage=response.message;
            objResult.result=null;
            logger.WriteLogError("ValidateOtp => error : urlAPI = " +urlAPI  +", headers = "+headers +", objData = "+objData +", ex ="+ response.message);
            resolve(objResult);
            res.end(JSON.stringify(objResult));

        }
     })
     .catch(error => {
        logger.WriteLogError("ValidateOtp => error : req = " +req +", ex ="+ error.message);
         console.error('Error fetching data:', error);
         objResult.ErrorCode=1;
            objResult.PartnerCode=error.response.data.errorCode;
            if(error.response!=null&&error.response.data.errorCode=="E000")
            {
                objResult.ErrorMessage=error.response.data.message.otpCode;
            }
            else
            {
                objResult.ErrorMessage=error.response.data.message;
            }
            objResult.result=null;
            resolve(objResult);
            res.end(JSON.stringify(objResult));
     });
   
});
}

function SetCache(key,value, timeout)
{
    
    try
    {
        /*
        if(!cache.has(key))
        {
           
        }
        */
        cache.set(key,value,timeout);
    }
    catch(e){
        logger.WriteLogInfo("SetCache = err : key ="+key +",value = "+value);
    }
}

function GetCache(key)
{
    var result=new Object();
    try
    {
        if(cache.has(key))
        {
            result=cache.get(key);
        }
        else
        {
            result=null;
        }
    }
    catch(e){
        logger.WriteLogInfo("SetCache = err : key ="+key +",value = "+value);
    }
    return result;
}

module.exports={
    GetOtp,
    ValidateOtp,
    SetCache,
    GetCache
}