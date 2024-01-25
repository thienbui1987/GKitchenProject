var express = require('express');
var app = express();

var config=require("../Config/appsetting.json");
var connDB=require("../Database/Connect.js");
var moment = require('moment');
const uuid = require('uuid');
var bodyParser = require('body-parser');
var logger=require("../Logging/log.js");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', function (req, res) {
var con=connDB.InitConnectDB();
console.log('Connect DB success');
});

function getgifttransaction(req,res)
{
  res.setHeader("Content-Type","application/json");
  //console.log(req);
  var pageIndex=0,pageSize=100,customerPhone='', page=0;
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
  if(req.query!=null&&req.query.customerPhone!=null)
    {
        customerPhone=req.query.customerPhone;
    }
  var objResult=new Object();
  var con=connDB.InitConnectDB();
  con.query('call GetGiftTransaction("'+customerPhone+'",'+page+','+pageSize+')', function (error, results, fields) {
    if (error){
      objResult.ErrorCode=1;
      objResult.ErrorMessage=error.sqlMessage;
      objResult.TotalRow=0;
      objResult.Result=null;
      logger.WriteLogError("getgifttransaction  call DB => error : customerPhone = " +customerPhone +", ex ="+ error);
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

function insertgifttransaction(req,res)
{
  var datetime=moment().format('Y-M-D H:m:s');
  var transactionId=uuid.v1();
  res.setHeader("Content-Type","application/json");
    var postData = req.body;
    var objResult=new Object();
    var con=connDB.InitConnectDB();
    con.query("INSERT INTO GiftTransaction (TransactionId,TransactionName,TransactionType,TransactionDate,ProductCode,ProductName,GiftId,TemQuantity,StoreId,CustomerId,CustomerPhone) VALUES ('"+transactionId+"','"+req.body.transactionName+"',1,"+datetime+",'"+req.body.productCode+"','"+req.body.productName+"',"+req.body.giftId+","+req.body.temQuantity+","+req.body.storeId+",'"+req.body.customerId+"','"+req.body.customerPhone+"');",postData,function (error, results, fields) {
      if (error) {
        objResult.ErrorCode=1;
        objResult.ErrorMessage=error.sqlMessage;
        objResult.Result=null;
        logger.WriteLogError("insertgifttransaction  call DB => error ="+ error);
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
  insertgifttransaction,
    getgifttransaction,
}