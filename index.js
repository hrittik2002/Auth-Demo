const express = require('express');
const app = express();
const User = require('./models/user.js');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session')

/**
 * ***********************************************
 *                DATABASE WORK
 * ***********************************************
 */

 mongoose.connect('mongodb://localhost:27017/authDemo')

 /***
  * If there is error the print connection error
  * else print Database connected
  */
 const db = mongoose.connection;
 db.on("error" , console.error.bind(console , "connection error:"))
 db.once("open" , () =>{
     console.log("Database connected")
 });

app.set('view engine' , 'ejs');
app.set('views' , 'views');
app.use(express.urlencoded({extended: true}));
app.use(session({secret : 'notagoodsecret'}))


const requireLogin = (req , res , next) => {
    if(!req.session.user_id){
        return res.redirect('/login')
    }
    next()
}

app.get('/' , (req , res) => {
    res.send('HOME')
})

// register
app.get('/register' , (req , res) => {
    res.render('register.ejs')
})

app.post('/register' , async(req , res)=>{
    const {password , username} = req.body;
    const hash = await bcrypt.hash(password , 12)
    const user = new User({
        username,
        password : hash
    })
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/')
})

// login
app.get('/login' , (req , res)=> {
    res.render('login.ejs');
})
app.post('/login' , async (req , res)=> {
    const {password , username} = req.body;
    const user = await User.findOne({username});
    const validPassward  = await bcrypt.compare(password , user.password);
    if(validPassward){
        req.session.user_id = user._id;
        res.redirect('/secret')
    }
    else{
        res.redirect('/login')
    }
}) 

//logout
app.post('/logout' , (req , res) => {
    req.session.destroy();
    res.redirect('/login')
})

app.get('/secret' , requireLogin , (req , res) =>{
    res.render('secret.ejs')
})
app.get('/topsecret' , requireLogin , (req , res) =>{
    res.send('he he')
})

app.listen(3000 , () => {
    console.log("SERVING YOUR APP!")
})