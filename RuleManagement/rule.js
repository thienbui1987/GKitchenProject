var express = require('express');
var app = express();
var config=require("../Config/appsetting.json");
var connDB=require("../Database/Connect.js");
var session=require("../Session/session.js");
var moment = require('moment');
var logger=require("../Logging/log.js");
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.get('/', function (req, res) {
var con=connDB.InitConnectDB();
console.log('Connect DB success');
});

function getrulemanagement(req,res){
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
  var pageIndex=0,pageSize=1000, page=0;
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
  con.query('call GetRuleManagement('+page+','+pageSize+')', function (error, results, fields) {
    if (error){
      objResult.ErrorCode=1;
      objResult.ErrorMessage=error;
      objResult.Result=null;
      logger.WriteLogError("getrulemanagement  error = " +error);
    }
    else{
      objResult.ErrorCode=0;
      objResult.ErrorMessage='success';
      objResult.Result=results[0];
    }
    res.end(JSON.stringify(objResult));
    connDB.DetroyConnectDB(con);
  });
 
}
  
}
function rulemanagementdetail(req,res)
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
    var ruleId=0;
    
    if(req.query!=null&&req.query.ruleId!=null)
    {
      var id=parseInt(req.query.ruleId);
      if(!isNaN(id))
      {
        ruleId=id;
      }
    }
    /*
    if(req.params!=null&&req.params.ruleId!=null)
    {
      var id=parseInt(req.params.ruleId);
      if(!isNaN(id))
      {
        ruleId=id;
      }
    }
    */

    var con=connDB.InitConnectDB();
    con.query('call GetRuleManagementDetail('+ruleId+')', function (error, results, fields) {
      if (error) {
        objResult.ErrorCode=1;
        objResult.ErrorMessage=error.sqlMessage;
        objResult.Result=null;
        logger.WriteLogError("getrulemanagement ruleId= "+ruleId +", error = " +error);
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
function insertrulemanagement(req,res)
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
    con.query("INSERT INTO RuleManagement (RuleName,TemQuantity,TotalBill,TotalBillTo,TemStartTime,TemEndTime,GiftStartTime,GiftEndTime,IsActive,IsDeleted,CreatedDate,CreatedUser) VALUES ('"+req.body.ruleName+"',"+req.body.temQuantity+","+req.body.totalBill+","+req.body.totalBillTo+",'"+req.body.temStartTime+"','"+req.body.temEndTime+"','"+req.body.giftStartTime+"','"+req.body.giftEndTime+"',1,0,'"+datetime+"','"+req.body.createdUser+"');",postData,function (error, results, fields) {
      if (error) {
        objResult.ErrorCode=1;
        objResult.ErrorMessage=error.sqlMessage;
        objResult.Result=null;
        logger.WriteLogError("insertrulemanagement error = " +error);
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
function updaterulemanagement(req,res)
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
    con.query("UPDATE RuleManagement set RuleName ='"+req.body.ruleName+"',TemQuantity="+req.body.temQuantity+",TotalBill="+req.body.totalBill+",TotalBillTo="+req.body.totalBillTo+",TemStartTime='"+req.body.temStartTime+"',TemEndTime='"+req.body.temEndTime+"',GiftStartTime='"+req.body.giftStartTime+"',GiftEndTime='"+req.body.giftEndTime+"',UpdatedDate='"+datetime+"',UpdatedUser='"+req.body.updatedUser+"' where RuleId = '"+req.body.ruleId+"'",postData,function (error, results, fields) {
      if (error) {
        objResult.ErrorCode=1;
        objResult.ErrorMessage=error.sqlMessage;
        objResult.Result=null;
        logger.WriteLogError("insertrulemanagement error = " +error);
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

function deleterulemanagement(req,res)
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
    con.query("UPDATE RuleManagement set IsDeleted = 1, DeletedDate='"+datetime+"',DeletedUser='"+req.body.deletedUser+"' where RuleId = '"+req.body.ruleId+"'",postData,function (error, results, fields) {
      if (error) {
        objResult.ErrorCode=1;
        objResult.ErrorMessage=error.sqlMessage;
        objResult.Result=null;
        logger.WriteLogError("insertrulemanagement error = " +error);
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
  insertrulemanagement,
  rulemanagementdetail,
  getrulemanagement,
  updaterulemanagement,
  deleterulemanagement
}