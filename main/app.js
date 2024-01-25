var express = require('express');
var app = express();
const cors = require('cors');
var config=require("../Config/appsetting.json");
var ruleManagement=require("../RuleManagement/rule.js");
var gift=require("../GifCondition/giftcondition.js");
var store=require("../Store/store.js");
var product=require("../Product/product.js");
var productTransaction=require("../TransactionProduct/transactionproduct.js");
var temTransaction=require("../TransactionTem/transactiontem.js");
var customerObj=require("../Customer/customer.js");
var billTransaction=require("../TransactionBill/transactionbill.js");
var giftOrder=require("../GiftOrder/giftorder.js");
var authen=require("../Authen/authen.js");
var admin=require("../Admin/admin.js");
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(cors({
    origin:'*'
  }));
  //app.use(express.static('public'));
  //app.use('/Images', express.static('Images'));
  //app.use(express.static('../Images'));
  //app.use('/Images/QRCode/:', express.static('Images'));
let host='', port;
if(config!=null&&config.app!=null)
{
    host=config.app.host;
    port=config.app.port;
}
/*
app.get('/images/:fileName',function(req,res){
   // res.end("<img src='http://42.112.26.181:4000/images/banner.png' />");
    return;
});
*/
app.get('/getrulemanagement', function (req, res) {
        ruleManagement.getrulemanagement(req,res);
    });
app.get('/rulemanagementdetail', function (req, res) {
        ruleManagement.rulemanagementdetail(req,res);
    });
app.post('/insertrulemanagement', function (req, res) {
        ruleManagement.insertrulemanagement(req,res);
    });
app.post('/updaterulemanagement', function (req, res) {
        ruleManagement.updaterulemanagement(req,res);
    });
app.post('/deleterulemanagement', function (req, res) {
        ruleManagement.deleterulemanagement(req,res);
    });
app.get('/getgiftcondition', function (req, res) {
        gift.getgiftcondition(req,res);
    });
app.get('/listgift', function (req, res) {
    gift.listgift(req,res);
    });
app.get('/giftconditiondetail', function (req, res) {
        gift.giftconditiondetail(req,res);
    });
app.post('/insertgiftcondition', function (req, res) {
        gift.insertgiftcondition(req,res);
    });
app.post('/updategiftcondition', function (req, res) {
        gift.updategiftcondition(req,res);
    });
app.post('/deletegiftcondition', function (req, res) {
        gift.deletegiftcondition(req,res);
    });
    
app.post('/insertstore', function (req, res) {
        store.insertstore(req,res);
    });

app.get('/getstore', function (req, res) {
        store.getstore(req,res);
    });
app.get('/storedetail', function (req, res) {
        store.storedetail(req,res);
    });
    
app.post('/insertproduct', function (req, res) {
        product.insertproduct(req,res);
    });
    
app.get('/getproduct', function (req, res) {
        product.getproduct(req,res);
    });
app.get('/api/v1/getlistproductnotallowchange', function (req, res) {
    product.getlistproductnotallowchange(req,res);
    });
app.get('/productdetail', function (req, res) {
        product.productdetail(req,res);
    });
app.post('/UpdateOnOffProduct', function (req, res) {
        product.UpdateOnOffProduct(req,res);
    });
app.post('/updateallowchangetemproduct', function (req, res) {
    product.updateallowchangetemproduct(req,res);
    });
app.post('/insertgifttransaction', function (req, res) {
        productTransaction.insertgifttransaction(req,res);
    });
app.get('/getgifttransaction', function (req, res) {
        productTransaction.getgifttransaction(req,res);
    });
app.post('/inserttemtransaction', function (req, res) {
    temTransaction.inserttemtransaction(req,res);
    });
app.get('/gettemtransaction', function (req, res) {
    temTransaction.gettemtransaction(req,res);
    });

app.post('/createcustomerbill', function (req, res) {
    customerObj.insertcustomer(req,res);
    });
app.get('/getcustomer', function (req, res) {
    customerObj.getcustomer(req,res);
    });
app.get('/getlistgiftbycustomer', function (req, res) {
    customerObj.getlistgiftbycustomer(req,res);
    });
    
app.post('/customerdetail', function (req, res) {
    customerObj.customerdetail(req,res);
    });
app.post('/exportexcelbycustomer', function (req, res) {
        customerObj.exportexcelbycustomer(req,res);
    });
app.post('/api/v1/createbilltransaction', function (req, res) {
    billTransaction.insertbilltransaction(req,res);
    });
app.get('/api/v1/gettransactionbill', function (req, res) {
    billTransaction.gettransactionbill(req,res);
    });
app.post('/insertgiftorder', function (req, res) {
    giftOrder.insertgiftorder(req,res);
    });
    
app.post('/updategiftorder', function (req, res) {
        giftOrder.updategiftorder(req,res);
    });

app.get('/getgiforder', function (req, res) {
    giftOrder.getgiforder(req,res);
    });

app.get('/readqrcode', function (req, res) {
    giftOrder.readqrcode(req,res);
    });
    
app.post('/api/v1/updategiftorderfinish', function (req, res) {
    giftOrder.updategiftorderfinish(req,res);
    });
app.post('/api/v1/updatelistgiftorderfinish', function (req, res) {
    giftOrder.updatelistgiftorderfinish(req,res);
    });
app.get('/api/v1/giftorderbycode', function (req, res) {
    giftOrder.giftorderbycode(req,res);
    });
app.get('/giftorderdetailbyorderId', function (req, res) {
    giftOrder.giftorderdetailbyorderId(req,res);
    });

app.post('/GetOtp', function (req, res) {
    authen.GetOtp(req,res);
    });
app.post('/ValidateOtp', function (req, res) {
    authen.ValidateOtp(req,res);
    });

app.post('/AdminLogon', function (req, res) {
    admin.AdminLogon(req,res);
    });
app.post('/Logout', function (req, res) {
    admin.Logout(req,res);
    });

app.listen(port, function () {
  console.log('Run app listening on port '+port);
});