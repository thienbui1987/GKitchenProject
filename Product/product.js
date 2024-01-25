var express = require('express');
var app = express();
var config=require("../Config/appsetting.json");
var connDB=require("../Database/Connect.js");
var moment = require('moment');
var http = require('http');
const axios = require('axios');
var session=require("../Session/session.js");
var logger=require("../Logging/log.js");
var bodyParser = require('body-parser');
const e = require('express');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
let url='', clientId, appVersion='', nodeVersion='',hashCode='',deviceName='',token='', systemaccount='',passAccount='';
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
  'request-id' :Date.now().toString(36),
  'x-access-token':token
};


function getproduct(req,res){
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
  var pageIndex=0,pageSize=1000, searchValue='',allowChangeTem=-1, page=0;
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
  /*
  else if(pageIndex>1)
  {
    page=pageIndex*pageSize - pageSize;
  }
*/
  if(req.query!=null&&req.query.allowChangeTem!=null)
  {
    var allowChange=parseInt(req.query.allowChangeTem);
    if(!isNaN(allowChange))
    {
      allowChangeTem=allowChange;
    }
    
  }
  if(req.query.searchValue!=null)
  {
      searchValue=req.query.searchValue;
  }

  var con=connDB.InitConnectDB();
  con.query("call GetListProduct('"+searchValue+"',"+allowChangeTem+","+page+","+pageSize+")", function (error, results, fields) {
    if (error){
      objResult.ErrorCode=1;
      objResult.ErrorMessage=error;
      objResult.Result=null;
      objResult.TotalRow=0;
      logger.WriteLogError("getproduct call DB searchValue = "+searchValue +", error = " +error);
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
function productdetail(req,res)
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
  
    var con=connDB.InitConnectDB();
    con.query('call GetProductDetail("'+req.query.productCode+'")', function (error, results, fields) {
      if (error) {
        objResult.ErrorCode=1;
        objResult.ErrorMessage=error.sqlMessage;
        objResult.TotalRow=0
        objResult.Result=null;
        logger.WriteLogError("GetProductDetail call DB productCode = "+req.query.productCode +", error = " +error);
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

 async function insertproduct(req,res)
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
  var type='insert';
  if(req.body!=null&&req.body.updateType!='')
  {
      type=req.body.updateType;
  }
 
  var datetime=moment().format('Y-M-D H:m:s');

   objResult.ErrorCode=0;
   objResult.ErrorMessage='success';
   objResult.result=null;
   var searchValue='',allowChangeTem=-1,pageIndex=0,pageSize=100000;
   var con=connDB.InitConnectDB();
var lstOldProduct=new Object();
new Promise(async function (resolve, reject){
  con.query("call GetListProduct('"+searchValue+"',"+allowChangeTem+","+pageIndex+","+pageSize+")", function (error1, results1, fields1) {
    if (error1){
      objResult.ErrorCode=1;
      objResult.ErrorMessage=error1;
      objResult.Result=null;
      objResult.TotalRow=0;
      logger.WriteLogError("Insert Product => GetListProduct call DB  error = " +error1);
    }
    else{
      lstOldProduct=results1[0];
    }
  });
});
  var strQuery='';
    token= await gettoken(res);
var urlAPI= url+"sync/accumulate_stamps";
var options = {
  host: urlAPI,
  method: 'GET',
  headers: {
    'clientid' : clientId,
    'versionos' : nodeVersion,
    'versionapp':appVersion,
    'devicename':deviceName,
    'hashcode':hashCode,
    'x-access-token':token,
    'request-id' :Date.now().toString(36),
    "Content-Type":"application/json",
    "Connection":"keep-alive"
  }
};
axios.get(urlAPI,{ headers: options.headers })
     .then(response => {
            var lstObj=response.data.data;
          
            if(lstObj!=null)
            {
              if(lstOldProduct.length>0)
              {
               new Promise(async function (resolve, reject){
                lstObj.forEach(item =>{
                  var checkExists=false;
                  lstOldProduct.forEach(oldItem=>{
                        if(oldItem.ProductCode==item.productCode)
                        {
                          checkExists=true;
                          return false;
                        }
                  });
                  var employeeId=0;
                 if(item.employeeID!=null)
                 {
                  employeeId=item.employeeID;
                 }
                  if(checkExists)
                  {
                     strQuery+="Update product set  ProductName = '"+item.productName+"', TaxPercentage = "+item.taxPercentage+", ProductType = "+item.productType+", Uom ='"+item.uom+"',BarcodePublic = '"+item.barcodePublic+"',BarcodeInternal='"+item.barcodeInternal+"',Weight='"+item.weight+"',StockCode='"+item.stockProducts.stockCode+"',AvailableUnit="+item.stockProducts.availableUnit+",ProductStatus="+item.stockProducts.status+",IsDeleted="+item.stockProducts.isDeleted+",EmployeeID='"+employeeId+"',StoreStype="+item.stockProducts.stockType+",UpdatedDate='"+item.stockProducts.updatedAt+"',ProductPriceID="+item.productPrices.productPriceID+",CustomerClassCode='"+item.productPrices.customerClassCode+"',BasePrice="+item.productPrices.basePrice+",DiscountBy="+item.productPrices.discountBy+",DiscountByAmount="+item.productPrices.discountByAmount+", SalePrice="+item.productPrices.salePrice+",EffectedDate='"+item.productPrices.effectedDate+"',Price="+item.productPrices.price+",ProductDefaultImage='"+item.productDefaultImage+"',CategoryID="+item.categoryID+",GroupCategoryID="+item.groupCategoryID+",SapProductCode='"+item.sapProductCode+"' where ProductCode='"+item.productCode+"' ; ";
                  }
                  else
                  {
                      strQuery+="INSERT INTO product (ProductId,ProductCode,ProductName,TaxPercentage,ProductType,Uom,BarcodePublic,BarcodeInternal,Weight,StoreProductID,StockCode,AvailableUnit,ProductStatus,IsDeleted,EmployeeID,StoreStype,CreatedDate,UpdatedDate,ProductPriceID,CustomerClassCode,BasePrice,DiscountBy,DiscountByAmount,SalePrice,EffectedDate,Price,ProductDefaultImage,CategoryID,GroupCategoryID,SapProductCode,QuantityExchange,AllowChangeTem) VALUES("+item.productID+",'"+item.productCode+"','"+item.productName+"',"+item.taxPercentage+","+item.productType+",'"+item.uom+"','"+item.barcodePublic+"','"+item.barcodeInternal+"','"+item.weight+"',0,'"+item.stockProducts.stockCode+"',"+item.stockProducts.availableUnit+","+item.stockProducts.status+","+item.stockProducts.isDeleted+",'"+employeeId+"',"+item.stockProducts.stockType+",'"+item.stockProducts.createdAt+"','"+item.stockProducts.updatedAt+"',"+item.productPrices.productPriceID+",'"+item.productPrices.customerClassCode+"',"+item.productPrices.basePrice+","+item.productPrices.discountBy+","+item.productPrices.discountByAmount+","+item.productPrices.salePrice+",'"+item.productPrices.effectedDate+"',"+item.productPrices.price+",'"+item.productDefaultImage+"',"+item.categoryID+","+item.groupCategoryID+",'"+item.sapProductCode+"',0,1); ";
                  }
                });
              });
                      con.query(strQuery,function (error, results, fields) {
                        if (error) {
                          console.log(error);
                          objResult.ErrorCode=1;
                          objResult.ErrorMessage=error;
                          objResult.Result=null;
                          logger.WriteLogError("SyncProduct call DB error  => ex = "+error);
                        }
                      else{
                          objResult.ErrorCode=0;
                          objResult.ErrorMessage='success';
                          objResult.results=results
                          logger.WriteLogInfo("SyncProduct => success , total row = " +lstObj.length);
                      }
                  });
                  connDB.DetroyConnectDB(con);
                  res.end(JSON.stringify(objResult))
              }
              else
              {
                new Promise(async function (resolve, reject){
                    lstObj.forEach(item =>{
                      console.log(item.productID);
                      var employeeId=0;
                      if(item.employeeID!=null)
                      {
                        employeeId=item.employeeID;
                      }
                      strQuery+="INSERT INTO product (ProductId,ProductCode,ProductName,TaxPercentage,ProductType,Uom,BarcodePublic,BarcodeInternal,Weight,StoreProductID,StockCode,AvailableUnit,ProductStatus,IsDeleted,EmployeeID,StoreStype,CreatedDate,UpdatedDate,ProductPriceID,CustomerClassCode,BasePrice,DiscountBy,DiscountByAmount,SalePrice,EffectedDate,Price,ProductDefaultImage,CategoryID,GroupCategoryID,SapProductCode,QuantityExchange,AllowChangeTem) VALUES("+item.productID+",'"+item.productCode+"','"+item.productName+"',"+item.taxPercentage+","+item.productType+",'"+item.uom+"','"+item.barcodePublic+"','"+item.barcodeInternal+"','"+item.weight+"',0,'"+item.stockProducts.stockCode+"',"+item.stockProducts.availableUnit+","+item.stockProducts.status+","+item.stockProducts.isDeleted+",'"+employeeId+"',"+item.stockProducts.stockType+",'"+item.stockProducts.createdAt+"','"+item.stockProducts.updatedAt+"',"+item.productPrices.productPriceID+",'"+item.productPrices.customerClassCode+"',"+item.productPrices.basePrice+","+item.productPrices.discountBy+","+item.productPrices.discountByAmount+","+item.productPrices.salePrice+",'"+item.productPrices.effectedDate+"',"+item.productPrices.price+",'"+item.productDefaultImage+"',"+item.categoryID+","+item.groupCategoryID+",'"+item.sapProductCode+"',0,1); ";
                      //con.query("INSERT INTO product (ProductId,ProductCode,ProductName,TaxPercentage,ProductType,Uom,BarcodePublic,BarcodeInternal,Weight,StoreProductID,StockCode,AvailableUnit,ProductStatus,IsDeleted,EmployeeID,StoreStype,CreatedDate,UpdatedDate,ProductPriceID,CustomerClassCode,BasePrice,DiscountBy,DiscountByAmount,SalePrice,EffectedDate,Price,ProductDefaultImage,CategoryID,GroupCategoryID,SapProductCode) VALUES("+item.productID+",'"+item.productCode+"','"+item.productName+"',"+item.taxPercentage+","+item.productType+",'"+item.uom+"','"+item.barcodePublic+"','"+item.barcodeInternal+"','"+item.weight+"',0,'"+item.stockProducts.stockCode+"',"+item.stockProducts.availableUnit+","+item.stockProducts.status+","+item.stockProducts.isDeleted+",'"+employeeId+"',"+item.stockProducts.stockType+",'"+item.stockProducts.createdAt+"','"+item.stockProducts.updatedAt+"',"+item.productPrices.productPriceID+",'"+item.productPrices.customerClassCode+"',"+item.productPrices.basePrice+","+item.productPrices.discountBy+","+item.productPrices.discountByAmount+","+item.productPrices.salePrice+",'"+item.productPrices.effectedDate+"',"+item.productPrices.price+",'"+item.productDefaultImage+"',"+item.categoryID+","+item.groupCategoryID+",'"+item.sapProductCode+"');",function (error, results, fields) {
                      
                  });
                });
                  con.query(strQuery,function (error, results, fields) {
                    if (error) {
                      console.log(error);
                      objResult.ErrorCode=1;
                      objResult.ErrorMessage=error;
                      objResult.Result=null;
                      logger.WriteLogError("SyncProduct call DB error new=> ex = "+error);
                    }
                  else{
                      objResult.ErrorCode=0;
                      objResult.ErrorMessage='success';
                      objResult.results=results
                      logger.WriteLogInfo("SyncProduct => success , total row = " +lstObj.length);
                  }
              });
              connDB.DetroyConnectDB(con);
              res.end(JSON.stringify(objResult))
          }
         }
     })
     .catch(error => {
         //console.error('Error fetching data:', error);
         logger.WriteLogError("SyncProduct call API GKitchen error => ex = "+error);
     });
   
   
}

function gettoken(res)
{
  res.setHeader("Content-Type","application/json");
  var tokenResult;
    var objData=new Object();
    objData.username=systemaccount;
    objData.password=passAccount;
    var options = {
      host: urlAPI,
      method: 'POST',
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
    var urlAPI= url+"employee/login";
  return new Promise((resolve, reject) => {
    axios.post(urlAPI, objData,{headers:options.headers})
     .then(response => {
        tokenResult=response.data.data.token;
        //return tokenResult;
        console.log(tokenResult);
        resolve(tokenResult)
     })
     .catch(error => {
        // console.error('Error posting data:', error);
         logger.WriteLogError("gettoken call API GKitchen error => ex = "+error);
         reject(error); 
     });
    });
}

function UpdateOnOffProduct(req,res)
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
    con.query("call UpdateOnOfProduct('"+req.body.productStatus+"',"+datetime+","+req.body.productCode+")",postData,function (error, results, fields) {
      if (error) {
        objResult.ErrorCode=1;
        objResult.ErrorMessage=error.sqlMessage;
        objResult.Result=null;
        logger.WriteLogError("UpdateOnOffProduct call DB error => ex = "+error);
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

function updateallowchangetemproduct(req,res)
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
    var con=connDB.InitConnectDB();
    var lstProduct=req.body.lstProductUpdate;
    var strQuery='';
    if(lstProduct!=null&&lstProduct!='')
    {
        lstProduct.forEach(item=>{
              strQuery +='update product set AllowChangeTem='+item.allowChangeTem+', UpdatedDate="'+datetime+'" where ProductCode="'+item.productCode+'"; ';
              //strQuery += mysql.format("update product set AllowChangeTem="+item.allowChangeTem+" where ProductCode='"+item.productCode+"';");
        });
    }
    con.query(strQuery,function (error, results, fields) {
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

function getlistproductnotallowchange(req,res){
  res.setHeader("Content-Type","application/json");
  var pageIndex=0,pageSize=1000, searchValue='',allowChangeTem=0, page=0;
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
  if(req.query.searchValue!=null)
  {
      searchValue=req.query.searchValue;
  }
  var objResult=new Object();
  var con=connDB.InitConnectDB();
  con.query("call GetListProduct('"+searchValue+"',"+allowChangeTem+","+page+","+pageSize+")", function (error, results, fields) {
    if (error){
      objResult.ErrorCode=1;
      objResult.ErrorMessage=error;
      objResult.Result=null;
      objResult.TotalRow=0;
      logger.WriteLogError("getlistproductnotallowchange call DB error => ex = "+error);
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

module.exports={
  insertproduct,
  getproduct,
  productdetail,
  UpdateOnOffProduct,
  updateallowchangetemproduct,
  getlistproductnotallowchange
}