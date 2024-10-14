


var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  //res.send('login page');
  res.render('login');
});

router.post('/login',function(req,res,next) {
  let userName=req.body.username;
  let password=req.body.password;
  console.log("userName:"+userName+" password:"+password);
  res.end("welcome "+userName);
})



module.exports = router;
