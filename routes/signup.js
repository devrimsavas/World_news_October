var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('signup');
});

router.post('/signup',function(req,res,next) {
  let fullName=req.body.fullName;
  let email=req.body.email;
  let username=req.body.username;
  let password=req.body.password;
  console.log("fullName:"+fullName+" email:"+email+" username:"+username+" password:"+password);
  res.end("welcome "+fullName);

})

module.exports = router;
