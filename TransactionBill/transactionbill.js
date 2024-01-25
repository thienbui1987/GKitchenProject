var express = require('express');
var app = express();

var config=require("../Config/appsetting.json");
var connDB=require("../Database/Connect.js");
var moment = require('moment');
const uuid = require('uuid');
var logger=require("../Logging/log.js");
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

let secretKey='';
if(config!=null&&config.ApiKey!=null)
{
    secretKey=config.ApiKey.SecretKey;
}
app.get('/', function (req, res) {
var con=connDB.InitConnectDB();
console.log('Connect DB success');
});

function gettransactionbill(req,res)
{
  //res.setHeader("Content-Type","application/json");
  var pageIndex=0,pageSize=100, customerPhone="",transactionId="", page=0;
  if(req.query!=null&&req.query.pageIndex!=null)
  {
    var index=parseInt(req.query.pageIndex);
    if(!isNaN(index))
    {
      pageIndex=index;
    }
    //pageIndex=req.query.pageIndex;
  }
  if(req.body!=null&&req.query.pageSize!=null)
  {
    var size=parseInt(req.query.pageSize);
    if(!isNaN(size))
    {
      pageSize=size;
    }
   // pageSize=req.query.pageSize;
  }
  if(pageIndex>0)
  {
      page=pageIndex*pageSize;
  }
  if(req.query!=null&&req.query.customerPhone!=null)
    {
        customerPhone=req.query.customerPhone;
    }
    if(req.query!=null&&req.query.transactionId!=null)
    {
      transactionId=req.query.transactionId;
    }
  //console.log(req);
  var objResult=new Object();
  var con=connDB.InitConnectDB();
  con.query('call GetTransactionBill("'+customerPhone+'","'+transactionId+'",'+page+','+pageSize+')', function (error, results, fields) {
    if (error){
      objResult.ErrorCode=1;
      objResult.ErrorMessage=error.sqlMessage;
      objResult.TotalRow=0;
      objResult.Result=null;
      logger.WriteLogError("gettransactionbill  call DB => error ="+ error);
    }
    else{
      objResult.ErrorCode=0;
      objResult.ErrorMessage='success';
      if(results!=null&&results.length>0)
      {
        objResult.TotalRow=results[0].TotalRow;
      }
      objResult.Result=results;
    }
    res.end(JSON.stringify(objResult));
    connDB.DetroyConnectDB(con);
  });
}

function insertbilltransaction(req,res)
{
  var datetime=moment().format('Y-M-D H:m:s');
  var transactionId=uuid.v1();
  res.setHeader("Content-Type","application/json");
    var postData = req.body;
    var objResult=new Object();
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
   var transactionCode='';customerName='',customerPhone='',totalValue=0,discountPercent=0, createdUser='', stockCode='', transactionDate='';
   if(req.body.transactionCode!=null&&req.body.transactionCode!='')
   {
    transactionCode=req.body.transactionCode;
   }
   if(req.body.customerName!=null&&req.body.customerName!='')
   {
    customerName=req.body.customerName;
   }
   if(req.body.customerPhone!=null&&req.body.customerPhone!='')
   {
    customerPhone=req.body.customerPhone;
   }
   if(req.body.createdUser!=null&&req.body.createdUser!='')
   {
    createdUser=req.body.createdUser;
   }
   if(req.body.transactionDate!=null&&req.body.transactionDate!='')
   {
    transactionDate=req.body.transactionDate;
   }
   if(req.body.stockCode!=null&&req.body.stockCode!='')
   {
    stockCode=req.body.stockCode;
   }
   if(req.body.totalValue!=null&&req.body.totalValue!='')
   {
        var value=parseFloat(req.body.totalValue);
        if(!isNaN(value))
        {
            totalValue=value;
        }
   }
   if(req.body.discountPercent!=null||req.body.discountPercent!='')
   {
        var discount=parseFloat(req.body.discountPercent);
        if(!isNaN(discount))
        {
            discountPercent=discount;
        }
   }
   
   if(customerPhone==''||customerPhone==null)
   {
       objResult.ErrorCode=1;
       objResult.ErrorMessage="Vui lòng nhập số điện thoại";
       objResult.result=null;
       res.end(JSON.stringify(objResult))
       return objResult;
   }
   if(customerName==''||customerName==null)
   {
       objResult.ErrorCode=1;
       objResult.ErrorMessage="Vui lòng nhập tên khách hàng";
       objResult.result=null;
       res.end(JSON.stringify(objResult))
       return objResult;
   }
   if(stockCode==''||stockCode==null)
   {
       objResult.ErrorCode=1;
       objResult.ErrorMessage="Vui lòng chọn cửa hàng";
       objResult.result=null;
       res.end(JSON.stringify(objResult))
       return objResult;
   }
   if(transactionDate==''||transactionDate==null)
   {
       objResult.ErrorCode=1;
       objResult.ErrorMessage="Vui lòng nhập vào thời gian giao dịch";
       objResult.result=null;
       res.end(JSON.stringify(objResult))
       return objResult;
   }
   if(transactionCode==''||transactionCode==null)
   {
       objResult.ErrorCode=1;
       objResult.ErrorMessage="Vui lòng nhập mã giao dịch";
       objResult.result=null;
       res.end(JSON.stringify(objResult))
       return objResult;
   }
   if(totalValue==0||totalValue==null)
   {
       objResult.ErrorCode=1;
       objResult.ErrorMessage="Vui lòng nhập tổng bill";
       objResult.result=null;
       res.end(JSON.stringify(objResult))
       return objResult;
   }
   
   var con=connDB.InitConnectDB();
    con.query("call InsertTemTransaction('"+transactionCode+"','"+customerName+"','"+customerPhone+"','"+transactionDate+"',"+totalValue+",'"+discountPercent+"','"+stockCode+"','"+datetime+"','"+createdUser+"')",postData,function (error, results, fields) {
      if (error) {
        objResult.ErrorCode=1;
        objResult.ErrorMessage=error.sqlMessage;
        objResult.Result=null;
      }
    else{
        objResult.ErrorCode=0;
        objResult.ErrorMessage='success';
        objResult.results=results
    }
      res.end(JSON.stringify(objResult))
      connDB.DetroyConnectDB(con);
    });
}

module.exports={
    insertbilltransaction,
    gettransactionbill,
}