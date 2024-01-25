var express = require('express');
var app = express();
var config=require("../Config/appsetting.json");
var connDB=require("../Database/Connect.js");
var session=require("../Session/session.js");
var logger=require("../Logging/log.js");
var moment = require('moment');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', function (req, res) {
var con=connDB.InitConnectDB();
console.log('Connect DB success');
});

function listgift(req,res)
{
  var objResult=new Object();

  //console.log(req);
  /*
  var checkSession=session.CheckSession(req,res);
  if(checkSession==false)
  {
    objResult.ErrorCode=2;
    objResult.ErrorMessage="Vui lòng đăng nhập để truy cập vào hệ thống";
    objResult.result=null;
    res.end(JSON.stringify(objResult))
    return objResult;
  }
  */
  res.setHeader("Content-Type","application/json");
  var pageIndex=0,pageSize=100,page=0;
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
  var con=connDB.InitConnectDB();
  con.query('call ListGiftProduct('+page+','+pageSize+')', function (error, results, fields) {
    if (error){
      objResult.ErrorCode=1;
      objResult.ErrorMessage=error.sqlMessage;
      objResult.Result=null;
      logger.WriteLogError("getgiftcondition error = " +error);
    }
    else{
      objResult.ErrorCode=0;
      objResult.ErrorMessage='success';
      objResult.Result=results;
    }
    res.end(JSON.stringify(objResult));
    connDB.DetroyConnectDB(con);
  });
}

function getgiftcondition(req,res)
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
  res.setHeader("Content-Type","application/json");
  //console.log(req);

  var con=connDB.InitConnectDB();
  con.query('select * from GiftCondition', function (error, results, fields) {
    if (error){
      objResult.ErrorCode=1;
      objResult.ErrorMessage=error.sqlMessage;
      objResult.Result=null;
      logger.WriteLogError("getgiftcondition error = " +error);
    }
    else{
      objResult.ErrorCode=0;
      objResult.ErrorMessage='success';
      objResult.Result=results;
    }
    res.end(JSON.stringify(objResult));
    connDB.DetroyConnectDB(con);
  });
}
function giftconditiondetail(req,res)
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
  res.setHeader("Content-Type","application/json");
    //console.log(req.params);
    var giftId=0;
    /*
    if(req.params!=null&&req.params.Id!=null)
    {
      var id=parseInt(req.params.Id);
      if(!isNaN(id))
      {
        giftId=id;
      }
    }
    */
    
    if(req.query!=null&&req.query.id!=null)
    {
      var id=parseInt(req.query.id);
      if(!isNaN(id))
      {
        giftId=id;
      }
    }
    
  
    var con=connDB.InitConnectDB();
    con.query('select * from GiftCondition where Id='+giftId+'', function (error, results, fields) {
      if (error) {
        objResult.ErrorCode=1;
        objResult.ErrorMessage=error.sqlMessage;
        objResult.Result=null;
        logger.WriteLogError("InsertGiftCondition error = " +error);
      }
      else
      {
      objResult.ErrorCode=0;
      objResult.ErrorMessage='success';
      objResult.Result=results;
      }
      res.end(JSON.stringify(objResult));
      connDB.DetroyConnectDB(con);
    });
}
function insertgiftcondition(req,res)
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
  res.setHeader("Content-Type","application/json");
    var postData = req.body;

    var con=connDB.InitConnectDB();
    con.query("call InsertGiftCondition('"+req.body.productCode+"','"+req.body.productName+"',"+req.body.temQuantity+",'"+datetime+"','"+req.body.createdUser+"');",function (error, results, fields) {
      if (error) {
        objResult.ErrorCode=1;
        objResult.ErrorMessage=error.sqlMessage;
        objResult.Result=null;
        logger.WriteLogError("InsertGiftCondition error = " +error);
      }
    else{
      if(results[0]!=null)
      {
        objResult.ErrorCode=0;
        objResult.ErrorMessage='success';
        objResult.results=null;

      }
      else
      {
        objResult.ErrorCode=1;
        objResult.ErrorMessage='Sản phẩm này đã được thêm trước đó';
        //objResult.results=results;
       
      }
    }
    res.end(JSON.stringify(objResult))
      connDB.DetroyConnectDB(con);
    });
}
function updategiftcondition(req,res)
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
  res.setHeader("Content-Type","application/json");
    var postData = req.body;
  
    var con=connDB.InitConnectDB();
    con.query("call UpdateGiftCondition('"+req.body.productCode+"','"+req.body.productName+"',"+req.body.temQuantity+",'"+datetime+"','"+req.body.updatedUser+"','"+req.body.id+"') ",function (error, results, fields) {
      if (error) {
        objResult.ErrorCode=1;
        objResult.ErrorMessage=error.sqlMessage;
        objResult.Result=null;
        logger.WriteLogError("updategiftcondition error = " +error);
      }
    else{
      if(results[0]!=null)
      {
        objResult.ErrorCode=0;
        objResult.ErrorMessage='success';
        objResult.results=null;

      }
      else
      {
        objResult.ErrorCode=1;
        objResult.ErrorMessage='Sản phẩm này đã tồn tại, vui lòng không sửa mã sản phẩm đã có trước đó';       
      }
    }
      res.end(JSON.stringify(objResult))
      connDB.DetroyConnectDB(con);
    });
}
function deletegiftcondition(req,res)
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
  res.setHeader("Content-Type","application/json");
  var id=0, deleteUser='';
  if(req.body!=null&&req.body.Id!=null)
  {
    var giftId=parseInt(req.body.Id);
    if(!isNaN(giftId))
    {
      id=giftId;
    }
  }
  if(req.body!=null&&req.body.id!=null)
    {
      var giftId=parseInt(req.body.id);
      if(!isNaN(giftId))
      {
        id=giftId;
      }
    }
   
    if(req.body!=null&&req.body.deletedUser!=null)
    {
      deleteUser=req.body.deletedUser;
    }
    //var postData = req.body;

    var con=connDB.InitConnectDB();
    con.query("call UpdateDeleteGiftCondition("+id+",'"+datetime+"','"+deleteUser+"')",function (error, results, fields) {
      if (error) {
        objResult.ErrorCode=1;
        objResult.ErrorMessage=error.sqlMessage;
        objResult.Result=null;
        logger.WriteLogError("deletegiftcondition error = " +error);
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
  insertgiftcondition,
  getgiftcondition,
  giftconditiondetail,
  updategiftcondition,
  deletegiftcondition,
  listgift
}