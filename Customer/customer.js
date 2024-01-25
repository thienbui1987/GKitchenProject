var express = require('express');
var app = express();
var config=require("../Config/appsetting.json");
var connDB=require("../Database/Connect.js");
var moment = require('moment');
var http = require('http');
const axios = require('axios');
const excel = require("exceljs");
var logger=require("../Logging/log.js");
var session=require("../Session/session.js");
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
let url='', clientId, appVersion='', nodeVersion='',hashCode='',deviceName='',secretKey='', domainFile='', filePath='';
if(config!=null&&config.apiurl!=null)
{
    url=config.apiurl.linkapi;
    clientId=config.apiurl.clientId;
    appVersion=config.apiurl.versionapp;
    nodeVersion=config.apiurl.versionos;
    hashCode=config.apiurl.hashcode;
    deviceName=config.apiurl.devicename;
}
if(config!=null&&config.ApiKey!=null)
{
    secretKey=config.ApiKey.SecretKey;
}

if(config!=null&&config.LinkCMS!=null)
{
  domainFile=config.LinkCMS;
}
if(config!=null)
{
  filePath=config.FilePath;
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


function getcustomer(req,res){
 // res.setHeader("Content-Type","application/json");
  //console.log(req);
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
  
  var pageIndex=0,pageSize=100;
  if(req.query!=null&&req.query.pageIndex!=null)
  {
    var index=parseInt(req.query.pageIndex);
    if(!isNaN(index))
    {
      pageIndex=index;
    }
    //pageIndex=req.query.pageIndex;
  }
  if(req.query!=null&&req.query.pageSize!=null)
  {
    var size=parseInt(req.query.pageSize);
    if(!isNaN(size))
    {
      pageSize=size;
    }
   // pageSize=req.query.pageSize;
  }
 
  var con=connDB.InitConnectDB();
  con.query('call GetCustomer("'+req.query.phoneNumber+'",'+pageIndex+','+pageSize+')', function (error, results, fields) {
    if (error){
      objResult.ErrorCode=1;
      objResult.ErrorMessage=error;
      objResult.Result=null;
      objResult.TotalRow=0;
      logger.WriteLogError("GetCustomer exception : customerPhone = "+req.body.phoneNumber +", error = "+error );
    }
    else{
      objResult.ErrorCode=0;
      objResult.ErrorMessage='success';
      if(results!=null&&results[0]!=null)
      {
        objResult.TotalRow=results[0].TotalRow;
      }
      objResult.Result=results;
    }
    res.end(JSON.stringify(objResult));
    connDB.DetroyConnectDB(con);
  });
}

async function exportexcelbycustomer(req,res){
  var checkSession=session.CheckSession(req,res);
  if(checkSession==false)
  {
    objResult.ErrorCode=2;
    objResult.ErrorMessage="Vui lòng đăng nhập để truy cập vào hệ thống";
    objResult.result=null;
    res.end(JSON.stringify(objResult))
    return objResult;
  }
   var pageIndex=0,pageSize=1000;
  var mobile=req.body.phoneNumber;
   var objResult=new Object();
   var resultData=new Object();
   var resultGiftTransaction=new Object();
   const workbook = new excel.Workbook();
   const sheetnames = ["Thông tin khách hàng", "Lịch sử giao dịch tem", "Lịch sử đổi quà"];
  const worksheetCustomer = workbook.addWorksheet('Thông tin khách hàng');

  worksheetCustomer.columns = [
{ header: 'Số điện thoại', key: 'Mobile', width: 25 },
{ header: 'Số lượng tem đã tích', key: 'TemQuantityPlus', width: 25 },
{ header: 'Số lượng tem đã đối', key: 'TemQuantityChanged', width: 25 },
{ header: 'Số lượng tem còn lại', key: 'TemQuantity', width: 25 }
];
const worksheetTemTransaction = workbook.addWorksheet('Lịch sử giao dịch tem');

worksheetTemTransaction.columns = [
  { header: 'Mã bill', key: 'TransactionId', width: 25 },
  { header: 'Số điện thoại', key: 'Mobile', width: 25 },
  { header: 'Số lượng tem', key: 'TemQuantity', width: 25 },
  { header: 'Ngày giao dịch', key: 'CreatedDate', width: 25 }
];

const worksheetGiftTransaction = workbook.addWorksheet('Lịch sử đổi quà');

worksheetGiftTransaction.columns = [
  { header: 'Ngày giao dịch', key: 'TransactionDate', width: 20 },
  { header: 'Số điện thoại', key: 'Mobile', width: 20 },
  { header: 'Số lượng đã đổi', key: 'TemQuantity', width: 20 },
  { header: 'Quà đã đổi', key: 'ProductCode', width: 20 },
  { header: 'Cửa hàng đã đổi', key: 'StockCode', width: 20 }
];

var resultTemTransaction=new Object();
try
{
  resultTemTransaction=await GetTemTransactionByCustomer(req,res);
  /*
    promiseTem.then((response)=>{
      resultTemTransaction=response;
    });
    */
}
catch(ex)
{
  //resultTemTransaction=ex;
  logger.WriteLogError("exportexcelbycustomer =>  GetTemTransactionByCustomer exception : customerPhone = "+mobile +", ex = "+ex);
}

try
{
    resultGiftTransaction=await GetGiftTransactionByCustomer(req,res);
}
catch(ex)
{
  logger.WriteLogError("exportexcelbycustomer =>  GetGiftTransactionByCustomer exception : customerPhone = "+mobile +", ex = "+ex);
}
   var con=connDB.InitConnectDB();
   con.query('call GetCustomerDetail("'+req.body.phoneNumber+'")', function (error, results, fields) {
     if (error){
       objResult.ErrorCode=1;
       objResult.ErrorMessage=error;
       objResult.Result=null;
       objResult.TotalRow=0;
       logger.WriteLogError("exportexcelbycustomer => GetCustomerDetail exception : customerPhone = "+req.body.phoneNumber +", error = "+error );
     }
     else{
       objResult.ErrorCode=0;
       objResult.ErrorMessage='success';
       resultData=results[0];
     
       const download = new Promise((req, res) => {
      
resultData.forEach(item=>{
  worksheetCustomer.addRow({ Mobile: item.Mobile, TemQuantityPlus: item.TemQuantityPlus, TemQuantityChanged: item.TemQuantityChanged, TemQuantity:item.TemQuantity});
});

if(resultTemTransaction!=null)
{
resultTemTransaction.forEach(item=>{
  worksheetTemTransaction.addRow({ TransactionId: item.TransactionId,Mobile: item.CustomerPhone, TemQuantity: item.TemQuantity, CreatedDate: item.CreatedDate});
});
}

if(resultGiftTransaction!=null)
{
  resultGiftTransaction.forEach(item=>{
    worksheetGiftTransaction.addRow({ TransactionDate: item.TransactionDate,Mobile: item.CustomerPhone, TemQuantity: item.TemQuantity, ProductCode: item.proDuctCode,StockCode:item.StockCode});
});
}

//const worksheetGiftTransaction = workbook.addWorksheet('Lịch sử đổi quà');

//var customerFile= '/var/www/Excel/'+mobile+'.xlsx';
var customerFile= filePath + "customer_"+ mobile+'.xlsx';

//var customerFile= '../WBSProject/Excel/customer_'+mobile+'.xlsx';
objResult.Result= domainFile + 'Excel/customer_'+mobile+'.xlsx';
workbook.xlsx.writeFile(customerFile)
  .then(() => {
    console.log('Excel file created!');
    logger.WriteLogInfo("exportexcelbycustomer  export excel success : customerPhone = "+mobile +", customerFile = " +customerFile);
  })
  .catch((error) => {
    console.log(error);
    logger.WriteLogError("exportexcelbycustomer  export exception : customerPhone = "+mobile +", error = " +error);
  });
});
   connDB.DetroyConnectDB(con);
   res.end(JSON.stringify(objResult));
  }
});
}
function customerdetail(req,res)
{
  res.setHeader("Content-Type","application/json");
    //console.log(req.params);
    var objResult=new Object();
    var con=connDB.InitConnectDB();
    con.query('call GetCustomerDetail("'+req.body.phoneNumber+'")', function (error, results, fields) {
      if (error) {
        objResult.ErrorCode=1;
        objResult.ErrorMessage=error.sqlMessage;
        objResult.Result=null;
        logger.WriteLogError("customerdetail call DB error : customerPhone = "+req.body.phoneNumber +", error = " +error);
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
function insertcustomer(req,res)
{
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
  var datetime=moment().format('Y-M-D H:m:s');

   objResult.ErrorCode=0;
   objResult.ErrorMessage='success';
   objResult.result=null;
   var checkApiKey=req.headers.secretkey;
   if(checkApiKey!=secretKey)
   {
    objResult.ErrorCode=2;
    objResult.ErrorMessage='Vui lòng xác thực để gọi API';
    objResult.result=null;
    res.end(JSON.stringify(objResult))
    return objResult;
   }
  var birthday=null;var idCard='',email='',address='',fullName='',customerId='',totalBill=0,mobile='';
  if(req.body.birthday!=null&&req.body.birthday!='')
  {
      birthday=req.body.birthday;
  }
  if(req.body.idCard!=null||req.body.idCard!='')
  {
    idCard=req.body.idCard;
  }
  if(req.body.email!=null||req.body.email!='')
  {
    email=req.body.email;
  }
  if(req.body.address!=null||req.body.address!='')
  {
    address=req.body.address;
  }
  if(req.body.fullName!=null||req.body.fullName!='')
  {
    fullName=req.body.fullName;
  }
  if(req.body.customerId!=null||req.body.customerId!='')
  {
    customerId=req.body.customerId;
  }
  if(req.body.mobile!=null||req.body.mobile!='')
  {
    mobile=req.body.mobile;
  }
  if(req.body.totalBill!=null||req.body.totalBill!='')
  {
    totalBill=req.body.totalBill;
  }
  if(mobile==''||mobile==null)
  {
      objResult.ErrorCode=1;
      objResult.ErrorMessage="Vui lòng nhập số điện thoại";
      objResult.result=null;
      res.end(JSON.stringify(objResult))
      return objResult;
  }
  if(fullName==''||fullName==null)
  {
      objResult.ErrorCode=1;
      objResult.ErrorMessage="Vui lòng nhập tên khách hàng";
      objResult.result=null;
      res.end(JSON.stringify(objResult))
      return objResult;
  }
  if(totalBill==0||totalBill==null)
  {
      objResult.ErrorCode=1;
      objResult.ErrorMessage="Vui lòng nhập tổng bill";
      objResult.result=null;
      res.end(JSON.stringify(objResult))
      return objResult;
  }
  
  var con=connDB.InitConnectDB();
   con.query("INSERT INTO Customer (CustomerId,FullName,Mobile,Email,Address,IdCard,CreatedDate,CreatedUser,IsActive,TemQuantity) VALUES('','"+fullName+"','"+mobile+"','"+email+"','"+address+"','"+idCard+"','"+datetime+"','GKitchen POS',1,0);",function (error, results, fields) {
    if (error) {
      objResult.ErrorCode=1;
      objResult.ErrorMessage=error.sqlMessage;
      objResult.Result=null;
      logger.WriteLogError("insertcustomer call DB error : customerPhone = "+mobile +", error = " +error);
    }
  else{
      objResult.ErrorCode=0;
      objResult.ErrorMessage='success';
      objResult.results=results
  }
});
     res.end(JSON.stringify(objResult))
     connDB.DetroyConnectDB(con);
  
}

function getlistgiftbycustomer(req,res){
  //res.setHeader("Content-Type","application/json");
  var pageIndex=0,pageSize=100, customerPhone='', isChanged=0, stockCode='', page=0;
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
  if(pageIndex>0)
  {
      page=pageIndex*pageSize;
  }
  if(req.query!=null&&req.query.isChanged!=null)
  {
    var changed=parseInt(req.query.isChanged);
    if(!isNaN(changed))
    {
      isChanged=changed;
    }
  }
  if(req.query!=null&&req.query.customerPhone!=null)
  {
      customerPhone=req.query.customerPhone;
  }
  
  if(req.query!=null&&req.query.stockCode!=null)
  {
    stockCode=req.query.stockCode;
  }
  var objResult=new Object();
  var con=connDB.InitConnectDB();
  con.query("call GetListGiftByCustomer('"+customerPhone+"',"+page+","+pageSize+","+isChanged+",'"+stockCode+"')", function (error, results, fields) {
    if (error){
      objResult.ErrorCode=1;
      objResult.ErrorMessage=error;
      objResult.Result=null;
      objResult.TotalRow=0;
      logger.WriteLogError("getlistgiftbycustomer call DB error : customerPhone = "+customerPhone +", error = " +error);
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

function GetTemTransactionByCustomer(req, res)
{
  var mobile=req.body.phoneNumber;
  var transactionType=-1;
  var pageIndex=0,pageSize=1000;
  var resultTemTransaction=new Object();
   var con=connDB.InitConnectDB();
  return new Promise(async function (resolve, reject){
   await con.query('call GetTemTransaction("'+mobile+'","'+transactionType+'",'+pageIndex+','+pageSize+')', function (errorTem, resultTem, fieldsTem) {
         if(errorTem)
         {
           logger.WriteLogError("GetTemTransactionByCustomer exception : customerPhone = "+mobile +", errorTem = " +errorTem);
         }
         else
         {

             resultTemTransaction=resultTem[0];
         }
         connDB.DetroyConnectDB(con);
         
         resolve(resultTemTransaction);
    })
  }
);
/*
constResult.catch((error) => {
  logger.WriteLogError("GetTemTransactionByCustomer exception : customerPhone = "+mobile +", error = " +error);
});
 */
}

function GetGiftTransactionByCustomer(req, res)
{
  var mobile=req.body.phoneNumber;
  var pageIndex=0,pageSize=1000;
  var resultGiftTransaction=new Object();
   var con=connDB.InitConnectDB();
  return new Promise(async function (resolve, reject){
    await con.query('call GetGiftTransaction("'+mobile+'",'+pageIndex+','+pageSize+')', function (errorTem, resultTem, fieldsTem) {
         if(errorTem)
         {
           logger.WriteLogError("GetGiftTransactionByCustomer exception : customerPhone = "+mobile +", errorTem = " +errorTem);
         }
         else
         {

          resultGiftTransaction=resultTem[0];
         }
         connDB.DetroyConnectDB(con);
         
         resolve(resultGiftTransaction);
    })
  }
);
/*
constResult.catch((error) => {
  logger.WriteLogError("GetGiftTransactionByCustomer exception : customerPhone = "+mobile +", error = " +error);
});
 */
}

module.exports={
  insertcustomer,
  customerdetail,
  getcustomer,
  getlistgiftbycustomer,
  exportexcelbycustomer
}