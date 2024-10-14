

var express = require('express');
var router = express.Router();

var fs=require("fs");
var path=require("path");
const userDataPath=path.join(__dirname,'../data','userData.json');


//add middleware 
const {requiresAuth}=require('express-openid-connect');

/* GET users listing. */
router.get('/',requiresAuth(), function(req, res, next) {
  console.log("my page Authenticated:", req.oidc.isAuthenticated());
  console.log("+++++++ my page User:", req.oidc.user);
  console.log("my page user name:", req.oidc.user.name);

  const userId=req.oidc.user.sub; //this is unique identifier for each user 

  fs.readFile(userDataPath,(err,data)=> {
    if (err) {
        console.error("Error reading file:", err);
        return res.status(500).render('error', {
            message: "Error reading file", 
            error: {
                status: 500, 
                stack: err.stack 
            }
        });
    }

    const users=JSON.parse(data.toString());
    const user=users.find(u=>u.userId===userId); 
  

  res.render('mypage', {
    title :`MY PAGE FOR ${userId}`,
    userProfile:JSON.stringify(req.oidc.user,null,2),
    isAuthenticated: req.oidc.isAuthenticated(),
    newsItems: user ? user.newsItems : [] 

    
  });
});
});


router.post('/addtoMyNews', requiresAuth(), function(req, res, next) {
    
    let {newsId:link, newsTitle:title} = req.body;
    title = typeof title === 'string' ? title.trim().replace(/\n/g, ' ') : '';

    const date=new Date().toISOString().split('T')[0];

    const userId = req.oidc.user.sub; //  identifier for the user
  
    fs.readFile(userDataPath, (err, data) => {
      if (err) {
        console.error("Error reading user data:", err);
        return res.status(500).send("Error processing request");
      }
  
      const users = JSON.parse(data.toString());
      let user = users.find(u => u.userId === userId);
  
      if (user) {
        // User exists
        user.newsItems.push({ title, link ,date});
      } else {
        // New user
        users.push({ userId, newsItems: [{ title, link,date }] }); //here we push the news item add new items to the array
      }
  
      fs.writeFile(userDataPath, JSON.stringify(users, null, 2), (writeErr) => {
        if (writeErr) {
          console.error("Error saving user data:", writeErr);
          return res.status(500).send("Error processing request");
        }
        res.send("News item added successfully");
      });
    });
  });

  //delete from my news 


  router.post('/deleteNews', requiresAuth(), function(req, res, next) {
    const newsId = req.body.newsId; // The unique ID of the news item to delete
    const userId = req.oidc.user.sub; // Unique identifier for the user
    const newsLink = req.body.newsLink;
  
    fs.readFile(userDataPath, (err, data) => {
        if (err) {
            console.error("Error reading user data:", err);
            return res.status(500).send("Error processing request");
        }
  
        const users = JSON.parse(data.toString());
        let user = users.find(u => u.userId === userId);
  
        if (user && user.newsItems) {
            // Filter out the news item to be deleted
            //user.newsItems = user.newsItems.filter(item => item.link !== newsId);
            //user.newsItems=user.newsItems.filter((item,index)=> index.toString() !== newsId);
            user.newsItems = user.newsItems.filter(item => item.link !== newsLink);

        }
  
        // Write the updated users data back to the file
        fs.writeFile(userDataPath, JSON.stringify(users, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error saving user data:", writeErr);
                return res.status(500).send("Error processing request");
            }
            res.send({ success: true, message: "News item deleted successfully" });
        });
    });
});



module.exports = router;
