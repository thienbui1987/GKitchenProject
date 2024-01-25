var express = require('express');
var app = express();
var config=require("../Config/appsetting.json");
var connDB=require("../Database/Connect.js");
var logger=require("../Logging/log.js");
var moment = require('moment');
var http = require('http');
 const axios = require('axios');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
let url='', clientId, appVersion='', nodeVersion='',hashCode='',deviceName='';
if(config!=null&&config.apiurl!=null)
{
    url=config.apiurl.linkapi;
    clientId=config.apiurl.clientId;
    appVersion=config.apiurl.versionapp;
    nodeVersion=config.apiurl.versionos;
    hashCode=config.apiurl.hashcode;
    deviceName=config.apiurl.devicename;
}

app.get('/', function (req, res) {
var con=connDB.InitConnectDB();
console.log('Connect DB success');
});

var getheaders = {
  'clientid' : clientId,
  'versionos' : nodeVersion,
  'versionapp':appVersion,
  'devicename':deviceName,
  'hashcode':hashCode,
  'request-id' :Date.now().toString(36)
};


function getstore(req,res){
  res.setHeader("Content-Type","application/json");
  //console.log(req);
  var pageIndex=0,pageSize=100, storeStatus=-1;
  if(req.query!=null&&req.query.pageIndex!=null)
  {
    var index=parseInt(req.query.pageIndex);
    if(!isNaN(index))
    {
      pageIndex=index;
    }
  }
  if(req.query!=null&&req.query.pageSize!=null)
  {
    var size=parseInt(req.query.pageSize);
    if(!isNaN(size))
    {
      pageSize=size;
    }
  }
  if(req.query!=null&&req.query.storeStatus!=null)
  {
    var status=parseInt(req.query.storeStatus);
    if(!isNaN(status))
    {
      storeStatus=status;
    }
  }
  var objResult=new Object();
  var con=connDB.InitConnectDB();
  con.query('call GetListStore('+pageIndex+','+pageSize+','+storeStatus+')', function (error, results, fields) {
    if (error){
      objResult.ErrorCode=1;
      objResult.ErrorMessage=error;
      objResult.Result=null;
      objResult.TotalRow=0;
      logger.WriteLogError("getstore  call DB => error ="+ error);
    }
    else{
      objResult.ErrorCode=0;
      objResult.ErrorMessage='success';
      if(results!=null&&results.length>0)
      {
        objResult.TotalRow=results[0].TotalRow;
      }
      objResult.Result=results[0];
    }
    res.end(JSON.stringify(objResult));
    connDB.DetroyConnectDB(con);
  });
}
function storedetail(req,res)
{
  res.setHeader("Content-Type","application/json");
  var storeId=0;
  if(req.query!=null&&req.query.storeId!=null)
  {
    var id=parseInt(req.query.storeId);
    if(!isNaN(id))
    {
      storeId=id;
    }
  }
    var objResult=new Object();
    var con=connDB.InitConnectDB();
    con.query('call GetStoreDetail('+storeId+')', function (error, results, fields) {
      if (error) {
        objResult.ErrorCode=1;
        objResult.ErrorMessage=error.sqlMessage;
        objResult.Result=null;
        logger.WriteLogError("storedetail  call DB => error ="+ error);
      }
      else
      {
      objResult.ErrorCode=0;
      objResult.ErrorMessage='success';
      objResult.Result=results[0];
      }
      res.end(JSON.stringify(objResult));
      connDB.DetroyConnectDB(con);
    });
}

function insertstore(req,res)
{
  var datetime=moment().format('Y-M-D H:m:s');
   var objResult=new Object();
   var checkSession=session.CheckSession(req,res);
  if(checkSession==false)
  {
    objResult.ErrorCode=2;
    objResult.ErrorMessage="Vui lòng đăng nhập để truy cập vào hệ thống";
    objResult.result=null;
    res.end(JSON.stringify(objResult))
    return objResult;
  }
   objResult.ErrorCode=0;
   objResult.ErrorMessage='success';
   objResult.result=null;
   var strQuery='';
   var con=connDB.InitConnectDB();
var urlAPI= url+"stock?isMeatShop=1";
var options = {
  host: urlAPI,
  method: 'GET',
  headers: {
    'clientid' : clientId,
    'versionos' : nodeVersion,
    'versionapp':appVersion,
    'devicename':deviceName,
    'hashcode':hashCode,
    'request-id' :Date.now().toString(36),
    "Content-Type":"application/json",
    "Connection":"keep-alive"
  }
};
new Promise(async function (resolve, reject){
axios.get(urlAPI,{ headers: options.headers })
     .then(response => {

            var lstObj=response.data.data.stock;
            if(lstObj!=null)
            {
             
              lstObj.forEach(item =>{
                 strQuery+="INSERT INTO Store (StoreId,StoreCode,StoreName,StorePhone,ProvinceId,DistrictId,WardId,StreetId,Address,ImagePath,AddressNumber,Latitude,Longtitude,StoreStatus,IsDeleted,SapStockCode,OpenHour,IsHidden,CreatedDate,UpdatedDate,IsMS,MerchantID,ClientID,EcHubDistrict,FastDelivery,CheckAvailableUnit,Is_ms_30ph) VALUES("+item.stockID+",'"+item.stockCode+"','"+item.stockName+"','"+item.stockPhoneNumber+"',"+item.stockProvinceID+","+item.stockDistrictID+","+item.stockWardID+","+item.stockStreetID+",'"+item.stockAddress+"','"+item.stockPathImg+"','"+item.stockAddressNumber+"',"+item.stockLatitude+","+item.stockLongitude+","+item.msStatus+","+item.isDeleted+",'"+item.sapStockCode+"','"+item.stockOpeningHours+"',"+item.stockIsHidden+",'"+item.createdAt+"','"+item.updatedAt+"',"+item.isMS+",'"+item.merchantID+"','"+item.clientID+"','"+item.ecHubDistrict+"',"+item.fastDelivery+","+item.checkAvailableUnit+","+item.is_ms_30ph+"); ";
            });
            con.query(strQuery,function (error, results, fields) {
              if (error) {
                objResult.ErrorCode=1;
                objResult.ErrorMessage=error.sqlMessage;
                objResult.Result=null;
                logger.WriteLogError("insertstore  call DB => error ="+ error);
              }
            else{
                objResult.ErrorCode=0;
                objResult.ErrorMessage='success';
                objResult.results=results
            }
        });
        connDB.DetroyConnectDB(con);
         }
     })
     .catch(error => {
         console.error('Error fetching data:', error);
         logger.WriteLogError("insertstore  call api Gkitchen => error ="+ error);
     });
    });
    
     res.end(JSON.stringify(objResult))

  res.setHeader("Content-Type","application/json");
}

module.exports={
  insertstore,
  getstore,
  storedetail
}