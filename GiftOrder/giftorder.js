var express = require('express');
var app = express();
var config=require("../Config/appsetting.json");
var connDB=require("../Database/Connect.js");
var logger=require("../Logging/log.js");
//var gm = require('gm').subclass({ imagemagick: true });
var moment = require('moment');
const QRCode = require('qrcode');
var barcode = require('barcode');

const Jimp = require("jimp");
const fs = require('fs')
const generator = require('generate-password'); 
const qrCodeReader = require('qrcode-reader');
const bwipjs = require('bwip-js');
/*
var jsBarcode = require('jsbarcode');
var Canvas = require("canvas");
*/

const uuid = require('uuid');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

var EnableAuthenOTP='', LinkWebEvent='', qrcodePath='', barcodePath='';

app.get('/', function (req, res) {
var con=connDB.InitConnectDB();
console.log('Connect DB success');
});

if(config!=null)
{
  EnableAuthenOTP=config.EnableAuthenOTP;
  LinkWebEvent=config.LinkWebEvent;
  qrcodePath=config.QrcodePath;
  barcodePath=config.BarcodePath;
}
function getgiforder(req,res)
{
    res.setHeader("Content-Type","application/json");
    var pageIndex=0,pageSize=100, customerPhone='', isChanged=0, page=0;
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
  con.query('call GiftOrderByCustomer("'+customerPhone+'",'+page+','+pageSize+')', function (error, results, fields) {
    if (error){
      objResult.ErrorCode=1;
      objResult.ErrorMessage=error.sqlMessage;
      objResult.TotalRow=0;
      objResult.Result=null;
      logger.WriteLogError("GiftOrderByCustomer  call DB => error : customerPhone = " +customerPhone +", ex ="+ error);
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
function giftorderdetailbyorderId(req,res)
{
    res.setHeader("Content-Type","application/json");
    var orderId=0;
    if(req.query!=null&&req.query.orderId!=null)
    {
        var id=parseInt(req.query.orderId);
        if(!isNaN(id))
        {
            orderId=id;
        }
    }
    var objResult=new Object();
    var con=connDB.InitConnectDB();
    con.query('call GetGiftOrderDetailByOrderId('+orderId+')', function (error, results, fields) {
      if (error) {
        objResult.ErrorCode=1;
        objResult.ErrorMessage=error.sqlMessage;
        objResult.Result=null;
        logger.WriteLogError("GetGiftOrderDetailByOrderId  call DB => error : orderId = " +orderId +", ex ="+ error);
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

function giftorderbycode(req,res)
{
    res.setHeader("Content-Type","application/json");
    var orderCode='',qrCode='',barCode='';
    if(req.body!=null&&req.body.redeemcode!=null)
    {
       orderCode=req.body.redeemcode;
    }
    if(req.body!=null&&req.body.qrCode!=null)
    {
        qrCode=req.body.qrCode;
    }
    if(req.body!=null&&req.body.barCode!=null)
    {
        barCode=req.body.barCode;
    }
    if(req.query!=null&&req.query.redeemcode!=null)
    {
       orderCode=req.query.redeemcode;
    }
    var objResult=new Object();
    var con=connDB.InitConnectDB();
    con.query('call GetOrderByCode("'+orderCode+'","","",1)', function (error, results, fields) {
      if (error) {
        objResult.ErrorCode=1;
        objResult.ErrorMessage=error.sqlMessage;
        objResult.Result=null;
        logger.WriteLogError("GetOrderByCode  call DB => error : orderCode = " +orderCode +", ex ="+ error);
      }
      else
      {
        objResult.ErrorCode=0;
        objResult.ErrorMessage='success';
        if(results!=null)
        {
          objResult.Result=results[0];
          if(results[0].length==0)
          {
            objResult.ErrorMessage='Không có data';
          }

        }
      }
      res.end(JSON.stringify(objResult));
      connDB.DetroyConnectDB(con);
    });
}

function insertgiftorder(req,res)
{
 // const canvas = new Canvas();
  var objResult=new Object();
  objResult.ErrorCode=0;
  objResult.ErrorMessage='success';
  objResult.Result=null;
  var datetime=moment().format('Y-M-D H:m:s');
 // var orderCode=uuid.v1();
  var numberRandom = RandomOrderCode(100000000,999999999);
  var bCode=numberRandom.toString();

  var qrCode='',barCode='',stockCode='',customerPhone='',createdUser='',qrCodeImage='',barCodeImage='', authenId='',otpCode='';
  res.setHeader("Content-Type","application/json");
    
  
   if(req.body.stockCode!=null&&req.body.stockCode!='')
   {
    stockCode=req.body.stockCode;
   }
   if(req.body.customerPhone!=null&&req.body.customerPhone!='')
   {
    customerPhone=req.body.customerPhone;
   }
   if(req.body.otpCode!=null&&req.body.otpCode!='')
   {
    otpCode=req.body.otpCode;
   }
   if(req.body.authenId!=null&&req.body.authenId!='')
   {
    authenId=req.body.authenId;
   }
   if(customerPhone==''||customerPhone==null)
   {
       objResult.ErrorCode=1;
       objResult.ErrorMessage="Vui lòng nhập số điện thoại";
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
   
    var lstProduct=new Object();
  if(req.body.lstProduct!=null&&req.body.lstProduct!='')
  {

    var orderId=0;
    var con=connDB.InitConnectDB();
   lstProduct=req.body.lstProduct;
    lstProduct.forEach(item =>{
      var quantityProduct=0;
        if(item.productCode==null||item.productCode=='')
        {
          objResult.ErrorCode=1;
          objResult.ErrorMessage="Vui lòng chọn mã quà tặng";
          objResult.result=null;
          res.end(JSON.stringify(objResult))
          return objResult;
        }
        var quantity=parseFloat(item.quantity);
        if(!isNaN(quantity))
        {
          quantityProduct=quantity;
        }
        if(quantityProduct==0)
        {
          objResult.ErrorCode=1;
          objResult.ErrorMessage="Vui lòng chọn số lượng sản phẩm";
          objResult.result=null;
          res.end(JSON.stringify(objResult))
          return objResult;
        }

        var orderCode = generator.generate({ 
          length: 6, 
          numbers: true, 
          uppercase: false
        
      }); 
         var linkOrder=LinkWebEvent+orderCode;  
         QRCode.toString(linkOrder, {
          errorCorrectionLevel: 'H',
          type: 'svg'
        }, function(err, data) {
          if (err) {
            logger.WriteLogError("insertgiftorder  QRCode.toString => error : orderCode = " +orderCode +", ex ="+ err);
            return;
          };
          qrCode=data;
        });
      
        qrCodeImage='/Images/QRCode/'+orderCode+'.png';
        
        //var pathImage='/var/www/Images/QRCode/'+orderCode+'.png';
        var pathImage=qrcodePath + orderCode+'.png';
        //var pathImage='/Images/QRCode/'+orderCode+'.png';
      
        
          QRCode.toFile(pathImage, linkOrder, {
            errorCorrectionLevel: 'H'
          }, function(err) {
            if (err) {
              logger.WriteLogError("insertgiftorder  QRCode.toFile => error : orderCode = " +orderCode +", ex ="+ err);
            };
            
          });
          
         // var pathBarcode= '/var/www/Images/BarCode/'+orderCode+'.png';
          var pathBarcode= barcodePath + orderCode+'.png';
        //  var pathBarcode= '../Images/BarCode/'+orderCode+'.png';
          barCodeImage='/Images/BarCode/'+orderCode+'.png';
      
          bwipjs.toBuffer({
            bcid:        'code128',       // Barcode type
            text:        orderCode,    // Text to encode
            scale:       3,               // 3x scaling factor
            height:      10,              // Bar height, in millimeters
            includetext: true,            // Show human-readable text
            textxalign:  'center',        // Always good to set this
        }, function (err, png) {
            if (err) {
              logger.WriteLogError("insertgiftorder  bwipjs.saveImage => error : orderCode = " +orderCode +", ex ="+ err);
            } else {
              console.log(png);
              fs.writeFile(pathBarcode,png,errs=>{
                  if(errs)
                  {
                    logger.WriteLogError("insertgiftorder  bwipjs.saveImage => error : orderCode = " +orderCode +", ex ="+ err);
                  }
              });
            }
        });
      

        con.query("call InsertGiftOrder('"+stockCode+"','"+customerPhone+"','"+orderCode+"','"+qrCode+"','"+barCode+"','"+qrCodeImage+"','"+barCodeImage+"','"+datetime+"','','"+item.productCode+"','"+item.productName+"','"+item.productImage+"','"+item.quantity+"')",function (error, results, fields) {
          if (error) {
            objResult.ErrorCode=1;
            objResult.ErrorMessage=error.sqlMessage;
            objResult.Result=null;
            logger.WriteLogError("insertgiftorder  update DB  => error : orderCode = " +orderCode +", ex ="+ error);
          }
          else
          {
            objResult.ErrorCode=0;
            objResult.ErrorMessage='success';
            objResult.Result=null;
            if(results!=null)
            {
              objResult.Result=results[0][0].Id;
            }
        }
        });
    });

    res.end(JSON.stringify(objResult))
    connDB.DetroyConnectDB(con);
    
  }
  else
  {
    objResult.ErrorCode=1;
    objResult.ErrorMessage="Vui lòng chọn quà tặng cần đổi";
    objResult.result=null;
    res.end(JSON.stringify(objResult))
    return objResult;
  }
  //var barcode=textToBase64Barcode(orderCode);
 //console.log(barCode);
}

function updategiftorder(req,res)
{
  var objResult=new Object();
  objResult.ErrorCode=0;
  objResult.ErrorMessage='success';
  objResult.Result=null;
  var datetime=moment().format('Y-M-D H:m:s');
  var oldOrderId=0;
  //var orderCode=uuid.v1();
  var numberRandom = RandomOrderCode(100000000,999999999);
  var bCode=numberRandom.toString();
  var qrCode='',barCode='',stockCode='',customerPhone='',createdUser='',qrCodeImage='',barCodeImage='',authenId='',otpCode='';
  res.setHeader("Content-Type","application/json");
    
    if(req.body.oldOrderId!=null&&req.body.oldOrderId!='')
    {
      var id=parseInt(req.body.oldOrderId);
        if(!isNaN(id))
        {
          oldOrderId=id;
        }
    }
   if(req.body.stockCode!=null&&req.body.stockCode!='')
   {
    stockCode=req.body.stockCode;
   }
   if(req.body.customerPhone!=null&&req.body.customerPhone!='')
   {
    customerPhone=req.body.customerPhone;
   }
   if(req.body.otpCode!=null&&req.body.otpCode!='')
   {
    otpCode=req.body.otpCode;
   }
   if(req.body.authenId!=null&&req.body.authenId!='')
   {
    authenId=req.body.authenId;
   }
   if(oldOrderId==0||oldOrderId==null)
   {
       objResult.ErrorCode=1;
       objResult.ErrorMessage="Vui lòng nhập mã đơn hàng cũ";
       objResult.result=null;
       res.end(JSON.stringify(objResult))
       return objResult;
   }
   /*
   if(otpCode==''||otpCode==null)
   {
       objResult.ErrorCode=1;
       objResult.ErrorMessage="Vui lòng nhập mã xác thực";
       objResult.result=null;
       res.end(JSON.stringify(objResult))
       return objResult;
   }
   */
   if(customerPhone==''||customerPhone==null)
   {
       objResult.ErrorCode=1;
       objResult.ErrorMessage="Vui lòng nhập số điện thoại";
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
   
  

  if(req.body.lstProduct!=null&&req.body.lstProduct!='')
  {
   
    var orderId=0;
    var con=connDB.InitConnectDB();
    var lstProduct=req.body.lstProduct;
    lstProduct.forEach(item =>{
      var quantityProduct=0;
        if(item.productCode==null||item.productCode=='')
        {
          objResult.ErrorCode=1;
          objResult.ErrorMessage="Vui lòng chọn mã quà tặng";
          objResult.result=null;
          res.end(JSON.stringify(objResult))
          return objResult;
        }
        var quantity=parseFloat(item.quantity);
        if(!isNaN(quantity))
        {
          quantityProduct=quantity;
        }
        if(quantityProduct==0)
        {
          objResult.ErrorCode=1;
          objResult.ErrorMessage="Vui lòng chọn số lượng sản phẩm";
          objResult.result=null;
          res.end(JSON.stringify(objResult))
          return objResult;
        }
        var orderCode = generator.generate({ 
          length: 6, 
          numbers: true, 
          uppercase: false
        
      }); 
        var linkOrder=LinkWebEvent+orderCode;  
     
        QRCode.toString(linkOrder, {
         errorCorrectionLevel: 'H',
         type: 'svg'
       }, function(err, data) {
         if (err) {
           logger.WriteLogError("updategiftorder  QRCode.toString => error : orderCode = " +orderCode +", ex ="+ err);
           return;
         }
         qrCode=data;
       });
       
       qrCodeImage='/Images/QRCode/'+orderCode+'.png';
       
      // var pathImage='/var/www/Images/QRCode/'+orderCode+'.png';
       var pathImage= qrcodePath + orderCode+'.png';
         QRCode.toFile(pathImage, linkOrder, {
           errorCorrectionLevel: 'H'
         }, function(err) {
           if (err) {
             logger.WriteLogError("updategiftorder  QRCode.toFile => error : orderCode = " +orderCode +", ex ="+ err);
           };
           
         });
         
         
       //  var pathBarcode= '/var/www/Images/BarCode/'+orderCode+'.png';
         var pathBarcode= barcodePath + orderCode+'.png';
         barCodeImage='/Images/BarCode/'+orderCode+'.png';
         bwipjs.toBuffer({
           bcid:        'code128',       // Barcode type
           text:        orderCode,    // Text to encode
           scale:       3,               // 3x scaling factor
           height:      10,              // Bar height, in millimeters
           includetext: true,            // Show human-readable text
           textxalign:  'center',        // Always good to set this
       }, function (err, png) {
           if (err) {
             logger.WriteLogError("UpdateGiftOrder  bwipjs.saveImage => error : orderCode = " +orderCode +", ex ="+ err);
           } else {
             console.log(png);
             fs.writeFile(pathBarcode,png,errs=>{
                 if(errs)
                 {
                   logger.WriteLogError("UpdateGiftOrder  bwipjs.saveImage => error : orderCode = " +orderCode +", ex ="+ err);
                 }
             });
           }
       });
        con.query("call UpdateGiftOrder("+oldOrderId+",'"+stockCode+"','"+customerPhone+"','"+orderCode+"','"+qrCode+"','"+barCode+"','"+qrCodeImage+"','"+barCodeImage+"','"+datetime+"','','"+item.productCode+"','"+item.productName+"','"+item.productImage+"','"+item.quantity+"')",function (error, results, fields) {
          if (error) {
            objResult.ErrorCode=1;
            objResult.ErrorMessage=error.sqlMessage;
            objResult.Result=null;
            logger.WriteLogError("UpdateGiftOrder  Update DB => error : orderCode = " +orderCode +", ex ="+ error);
          }
          else
          {
            objResult.ErrorCode=0;
            objResult.ErrorMessage="success";
            objResult.result=results[0][0].Id;
          }
        });
    });
    connDB.DetroyConnectDB(con);
    res.end(JSON.stringify(objResult))
   
   
  }
  else
  {
    objResult.ErrorCode=1;
    objResult.ErrorMessage="Vui lòng chọn quà tặng cần đổi";
    objResult.result=null;
    res.end(JSON.stringify(objResult))
    return objResult;
  }
 
}

function updategiftorderfinish(req,res)
{
  var datetime=moment().format('Y-M-D H:m:s');
  res.setHeader("Content-Type","application/json");
  var orderCode='',transactionId='';
  if(req.body.redeemcode!=null&&req.body.redeemcode!='')
  {
    orderCode=req.body.redeemcode;
  }
  if(req.body.transactionId!=null&&req.body.transactionId!='')
  {
    transactionId=req.body.transactionId;
  }
  if(orderCode==''||orderCode==null)
  {
      objResult.ErrorCode=1;
      objResult.ErrorMessage="Mã đơn hàng không hợp lệ";
      objResult.result=null;
      res.end(JSON.stringify(objResult))
      return objResult;
  }
  if(transactionId==null||transactionId=='')
  {
      transactionId=uuid.v1();
  }
    var objResult=new Object();
    var con=connDB.InitConnectDB();
    con.query("call UpdateGiftOrderFinish('"+orderCode+"','','','"+req.body.updatedDate+"','"+req.body.updatedUser+"')",function (error, results, fields) {
      if (error) {
        objResult.ErrorCode=1;
        objResult.ErrorMessage=error.sqlMessage;
        objResult.Result=null;
        logger.WriteLogError("UpdateGiftOrderFinish  Update DB => error : orderCode = " +orderCode +", ex ="+ error);
      }
    else{
        objResult.ErrorCode=1;
        objResult.ErrorMessage='success';
        if(results!=null&&results.affectedRows==0)
        {
          objResult.ErrorMessage="Mã đơn hàng không hợp lệ";
        }
        else
        {
          con.query('call GetOrderByCode("'+orderCode+'","","",-1)', function (error, results2, fields) {
            if (error) {
              objResult.ErrorCode=1;
              objResult.ErrorMessage=error.sqlMessage;
              objResult.Result=null;
              logger.WriteLogError("UpdateGiftOrderFinish  call GetOrderByCode => error : orderCode = " +orderCode +", ex ="+ error);
            }
            else
            {
              objResult.ErrorCode=0;
              objResult.ErrorMessage='success';
                objResult.Result=results2[0];
                var lstGift=results2[0];
                if(lstGift!=null)
                {
                lstGift.forEach(item=>{
                   // console.log(item.CustomerPhone);
                    con.query("call InsertGiftTransaction('"+transactionId+"','Giao dịch đổi quà',1,'"+datetime+"','"+item.ProductCode+"','"+item.ProductName+"',"+item.OrderId+",'"+item.CustomerPhone+"','"+datetime+"',"+item.Quantity+",'"+item.StockCode+"')",function (error, results, fields) {
                      if (error) {
                        logger.WriteLogError("UpdateGiftOrderFinish  call InsertGiftTransaction => error : orderCode = " +orderCode +", ex ="+ error);
                      }
                  });
                  con.query("call InsertTemTransactionUpdateOrderFinish('"+transactionId+"','Trừ tem đổi quà',2,'"+datetime+"',"+item.TemQuantity+",'"+item.StockCode+"','"+item.CustomerPhone+"','"+datetime+"')",function (error, results, fields) {
                    if (error) {
                      logger.WriteLogError("UpdateGiftOrderFinish  call InsertTemTransactionUpdateOrderFinish => error : orderCode = " +orderCode +", ex ="+ error);
                    }                   
                });
                connDB.DetroyConnectDB(con);
                });
              
            }
          }
        });
        objResult.results=results
        }
      }
      res.end(JSON.stringify(objResult))
     // 
    });
}

function updatelistgiftorderfinish(req,res)
{
  var datetime=moment().format('Y-M-D H:m:s');
  res.setHeader("Content-Type","application/json");
  var orderCode='',transactionId='';
  var objResult=new Object();
  if(req.body.lstGiftOrder!=null&&req.body.lstGiftOrder!='')
  {
   
    var lstGiftOrder=req.body.lstGiftOrder;
    lstGiftOrder.forEach(items =>{
      var con=connDB.InitConnectDB();
      if(items.redeemcode==''||items.redeemcode==null)
      {
          objResult.ErrorCode=1;
          objResult.ErrorMessage="Mã đơn hàng không hợp lệ";
          objResult.result=null;
          res.end(JSON.stringify(objResult))
          return objResult;
      }
      if(items.transactionId==null||items.transactionId=='')
      {
          transactionId=uuid.v1();
      }
       
       
        con.query("call UpdateGiftOrderFinish('"+items.redeemcode+"','','','"+items.updatedDate+"','"+items.updatedUser+"')",function (error, results, fields) {
          if (error) {
            objResult.ErrorCode=1;
            objResult.ErrorMessage=error.sqlMessage;
            objResult.Result=null;
            logger.WriteLogError("updatelistgiftorderfinish =>  UpdateGiftOrderFinish error : items.redeemcode = " +items.redeemcode +", ex ="+ error);
          }
        else{
            objResult.ErrorCode=1;
            objResult.ErrorMessage='success';
            if(results!=null&&results.affectedRows==0)
            {

              objResult.ErrorMessage="Mã đơn hàng không hợp lệ";
              res.end(JSON.stringify(objResult))
              return objResult;
            }
            else
            {
              con.query('call GetOrderByCode("'+items.redeemcode+'","","",-1)', function (error2, results2, fields) {
                if (error2) {
                  objResult.ErrorCode=1;
                  objResult.ErrorMessage=error2.sqlMessage;
                  objResult.Result=null;
                  logger.WriteLogError("updatelistgiftorderfinish =>  GetOrderByCode error : items.redeemcode = " +items.redeemcode +", ex ="+ error2);
                  res.end(JSON.stringify(objResult))
                  return objResult;
                }
                else
                {
                  logger.WriteLogInfo("updatelistgiftorderfinish =>  GetOrderByCode success : items.redeemcode = " +items.redeemcode +", results2[0] ="+ results2[0]);
                  objResult.ErrorCode=0;
                  objResult.ErrorMessage='success';
                    //objResult.Result=results2[0];
                    var lstGift=results2[0];
                    if(lstGift!=null)
                    {
                    lstGift.forEach(item=>{
                       // console.log(item.CustomerPhone);
                        con.query("call InsertGiftTransaction('"+items.transactionId+"','Giao dịch đổi quà',1,'"+datetime+"','"+item.ProductCode+"','"+item.ProductName+"',"+item.OrderId+",'"+item.CustomerPhone+"','"+datetime+"',"+item.Quantity+",'"+item.StockCode+"')",function (error3, results3, fields) {
                          if (error3) {
                            logger.WriteLogError("updatelistgiftorderfinish =>  InsertGiftTransaction error : items.redeemcode = " +items.redeemcode +", ex ="+ error3);
                          }
                      });
                      con.query("call InsertTemTransactionUpdateOrderFinish('"+items.transactionId+"','Trừ tem đổi quà',2,'"+datetime+"',"+item.TemQuantity+",'"+item.StockCode+"','"+item.CustomerPhone+"','"+datetime+"')",function (error3, results3, fields) {
                        if (error3) {
                          logger.WriteLogError("updatelistgiftorderfinish =>  InsertTemTransactionUpdateOrderFinish error : items.redeemcode = " +items.redeemcode +", ex ="+ error3);
                        }                   
                    });
                   
                    });
                  
                }
                else
                {
                  logger.WriteLogInfo("updatelistgiftorderfinish =>  lstGift no data : items.redeemcode = " +items.redeemcode +", lstGift ="+ lstGift);
                }
                objResult.results=results
                res.end(JSON.stringify(objResult))
                connDB.DetroyConnectDB(con);
   
              }
            });
            
            }
          }
        });
    });
    
  }
  else
  {
    objResult.ErrorCode=1;
    objResult.ErrorMessage="Không có danh sách quà cập nhật";
    objResult.result=null;
    res.end(JSON.stringify(objResult))
    return objResult;
  }
}

function readqrcode(req,res)
{
  res.setHeader("Content-Type","application/json");
  var objResult=new Object();
  var pathImage=process.cwd() + '/Images/63585510-8690-11ee-9d38-fb491f94c4b8.png';
  const buffer = fs.readFileSync(pathImage);
  Jimp.read(buffer, function(err, image) {
    if (err) {
        console.error(err);
        return;
    }
    const qrCodeInstance = new qrCodeReader();

    qrCodeInstance.callback = function(err, value) {
        if (err) {
            console.error(err);
            return;
        }
        var orderCode=value.result;
        
        console.log(value.result);
        var con=connDB.InitConnectDB();
        con.query('call GetOrderByCode("'+orderCode+'","","",1)', function (error, results, fields) {
          if (error) {
            objResult.ErrorCode=1;
            objResult.ErrorMessage=error.sqlMessage;
            objResult.Result=null;
          }
          else
          {
            objResult.ErrorCode=0;
            objResult.ErrorMessage='success';
            objResult.Result=results;
          }
         
          connDB.DetroyConnectDB(con);
        });
    };
});
res.end(JSON.stringify(objResult));
}

function RandomOrderCode(min, max) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}

module.exports={
  insertgiftorder,
  updategiftorderfinish,
  giftorderbycode,
  getgiforder,
  giftorderdetailbyorderId,
  readqrcode,
  updategiftorder,
  updatelistgiftorderfinish
}