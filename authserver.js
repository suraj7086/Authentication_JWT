const http = require('http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
app.use(morgan('dev'));
require('dotenv').config();
app.use(express.json());
// User Auth
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));


let refreshTokens = [];

app.get("/users",authenticateToken,function(req,res){
    res.json(users);
});

app.post("/token",(req,res) => {
    const refreshToken = req.body.toke;
    if(refreshToken == null){
        return res.sendStatus(401);
    }
    if(!refreshTokens.includes(refreshToken))
    {
        return res.sendStatus(403);
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,(err,user)=>{
        if(err){
            return res.sendStatus(403);
        }
        const accessToken = generateAccessToken(user.username);
        res.json({accessToken : accessToken});
    })
});

app.delete("/logout",(req,res)=>{
    refreshTokens = refreshTokens.filter(token => token!== req.body.token);
    res.sendStatus(204);
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
            const accessToken = generateAccessToken(uname);
            const refreshtToken = jwt.sign(uname,process.env.REFRESH_TOKEN_SECRET);
            refreshTokens.push(refreshToken);
            res.json({accessToken : accessToken, refreshToken : refreshToken});
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
function generateAccessToken(user){
    return jwt.sign(uname,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'10m'});
}

const port = process.env.PORT || 4000;

const server = http.createServer(app);

server.listen(port);