const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
app.use(morgan('dev'));
require('dotenv').config();
const surveyRoutes = require('./api/routes/survey');
app.use(express.json());
// User Auth
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

// temporary data store  you can store data in database.
const users = [];

// landing page
app.get('/',function(req,res){
    res.render("index");
});

app.get("/users",authenticateToken,function(req,res){ // I am authenticating here you can authenticate in landing page.
    res.redirect('/');
});
//registration form
app.get("/users/new",function(req,res){
    res.render("registration.ejs");
});
// usrname and passwd post request
app.post("/users", async(req,res)=>{
    try{
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password,salt);
        const user = {username : req.body.username, password : hashedPassword}
        users.push(user);
        res.status(200).redirect("/users/");

    }
    catch{
        res.status(500).send("Caught an Error");
    }
});
// login page 
app.get('/users/login',function(req,res){
    res.render("login");
});
app.post('/users/login',async (req,res)=>{
    const user = users.find(user=>user.username = req.body.username)
    
    if(user == null){
        return res.status(404).send("user not found");
    }
    try{
        if(await bcrypt.compare(req.body.password,user.password) ){
            console.log(user);
            const username = req.body.username;
            const uname = {
                username: username
            }
            const accessToken = jwt.sign(uname,process.env.ACCESS_TOKEN_SECRET);
            res.json({accessToken : accessToken}); // you can send your response here.
            //   res.send("success");  
        }
        else{
            res.send("Not allowed");
        }
        
    }
    catch{
        res.status(500).send();
    }
} );

// Authenticate function
function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization'];
    console.log(authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    if(token==null) return res.status(401);
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if(err){
            console.log("here");
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

// Survey Routes
app.use('/survey', surveyRoutes);
// Error handling
app.use((req,res,next)=>{
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message : error.message
        }
    });
});

module.exports = app;