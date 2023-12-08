const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema for list of itemtype in the menu
let weblist = new Schema({
    webname:
    {
        type: String
    },
    weblink:
    {
        type: String
    }
})

// Define collection and schema for users
let userprofile = new Schema({
    username:
    {   type: String   },
    password:
    {   type: String   },
    useremail:
    {   type: String   },
    useremailpassword:
    {   type: String   },
    reciepentemail:
    {   type: String   },
    weblists: [weblist] 
})

const weblistschema = mongoose.model('weblisted', weblist);
const userprofileschema = mongoose.model('userprofiled', userprofile);

module.exports = {
    weblisted1: weblistschema,
    userprofile1: userprofileschema,
}