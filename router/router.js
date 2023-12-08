const express = require('express');
const app = express();
const employeeRoute = express.Router();



const users = require("../services/users");



//Check Slot details
//employeeRoute.get("/", users.checkHttpStatus); 

//Check Slot details
employeeRoute.get("/checkweblist", users.weblist);

//Post new weblink
employeeRoute.post("/addWebLink", users.addweblinks);

//route to home page
employeeRoute.get("/home", users.homepage);

//check login
employeeRoute.get("/login", users.loginuser);

//route to home page
employeeRoute.get("/register", users.registeruserform);

//check login
employeeRoute.post("/checkuserlogin", users.checkuserslogin);

//register usert
employeeRoute.post("/registeruserdetails", users.registerusers);

//register usert
employeeRoute.get("/editprofile", users.edituserprofile);

//register usert
employeeRoute.post("/editusers", users.saveeditedusersprofile);

module.exports = employeeRoute;
