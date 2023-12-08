const http = require('http');
const https = require('https');
const axios = require('axios');
const { weblisted1, userprofile1 } = require("../model/DBSchema");
const nodemailer = require('nodemailer');
let usertempname = '';

exports.addweblinks = async (req, res) => {
  try {
    const { username, webname, weblink } = req.body;
    const user = await userprofile1.findOne({ username: usertempname });

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Add the new web link to the user's weblists array
    user.weblists.push({ webname, weblink });

    // Save the updated user profile
    await user.save();

    res.redirect('/checkweblist');

  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}


exports.weblist = async (req, res) => {
  try {
    // Fetch data from the database
    const getallweblisted1 = await userprofile1.findOne({ username: usertempname });

    // Create an array to store the extracted data with HTTP status
    const extractedData = [];
    const extractedDataissues = [];
    let hasError = true; // A flag to check if any link has a non-200 status
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: getallweblisted1.useremail,
        pass: getallweblisted1.useremailpassword
      }
    });

    for (const item of getallweblisted1.weblists) {
      const { webname, weblink } = item;
      try {
        // Send a request to each web link
        const response = await axios.get("https://" + weblink);
        if (response.status == 200) {
          hasError = false;
        }
        extractedData.push({
          webname,
          weblink,
          statusCode: response.status,
          statusText: response.statusText
        })
      } catch (error) {
        // If there's an error, include an error message
        extractedData.push({
          webname,
          weblink,
          error: error.message,
          statusCode: 'N/A'
        });
        extractedDataissues.push({
          webname,
          weblink,
          error: error.message,
          statusCode: 'N/A'
        });
      }

    }


    // Generate an HTML table with the data
    const tableHtml = `
    <meta http-equiv="Refresh" content="60"> 
          <a> Hi ${usertempname} </a>
            <table>
                <thead>
                    <tr>
                        <th>Web Name</th>
                        <th>Web Link</th>
                        <th>Status Code</th>
                        <th>Status Text</th>
                    </tr>
                </thead>
                <tbody>
                    ${extractedData.map(item => `
                        <tr>
                            <td>${item.webname}</td>
                            <td>${item.weblink}</td>
                            <td>${item.statusCode}</td>
                            <td>${item.statusText}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <h1>Add Web Link</h1>
        <form action="/addWebLink" method="POST">
        <label for="webname">Web Name:</label>
        <input type="text" id="webname" name="webname" required><br><br>
        <label for="weblink">Web Link:</label>
        <input type="text" id="weblink" name="weblink" required><br><br>
        <button type="submit">Add Web Link</button>
        </form>
        
        <button type="button" onclick="editprofile()" >Edit Profile</button>
        <button type="button" onclick="redirectTohome()" >Log out</button>
        <script>
          function redirectTohome() {
            usertempname = '';
            window.location.href = '/home';
          }
          function editprofile() {
            window.location.href = '/editprofile';
          }
        </script>
        `;

    if (extractedDataissues != null) {
      const emailText = "The following web links have issues:\n\n" +
        extractedDataissues.map((issue, index) => {
          const { webname, weblink, statusCode, statusText, error } = issue;
          return `Web Name: ${webname}\nWeb Link: ${weblink}\nStatus Code: ${statusCode}\nStatus Text: ${statusText}\nError: ${error}\n\n`;
        }).join("\n");

      var mailOptions = {
        from: getallweblisted1.useremail,
        to: getallweblisted1.reciepentemail,
        subject: 'The following webs have issue',
        text: emailText
      };
      // Send the HTML response with the table
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {

        } else {

        }
      });
    }
    res.status(200).send(tableHtml);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}






exports.homepage = async (req, res) => {
  try {
    // Generate an HTML table with the data
    const homepagehtml =
      `<html>
    <head>
      <title>Welcome to App Monitoring System</title>
    </head>
    <body>
        <a>Hi! Welcome to App monitoring system....</a>
        <br><br>
        <button onclick="redirectToLogin()">Login</button>
        <br><br>
        <button onclick="redirectToRegister()">Register</button>

        <script>
          function redirectToLogin() {
            window.location.href = '/login';
          }

          function redirectToRegister() {
            window.location.href = '/register';
          }
        </script>
      </body>
    </html>`;
    res.status(200).send(homepagehtml);
  }
  catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}


exports.loginuser = async (req, res) => {
  try {
    // Generate an HTML table with the data
    const loginpagehtml =
      `<html>
    <head>
      <title>Login</title>
    </head>
    <body>
    <form action="/checkuserlogin" method="post">
    <label for="username">User Name:</label>
    <input type="text" id="username" name="username" required><br><br>
    <label for="password">Password:</label>
    <input type="password" id="password" name="password" required><br><br>
    <button type="submit">Login</button>
    </form>
      </body>
    </html>`;
    res.status(200).send(loginpagehtml);
  }
  catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}

exports.checkuserslogin = async (req, res) => {
  try {
    let checkuserdetails = await userprofile1.findOne({
      username: req.body.username,
      password: req.body.password,
    })
    if (!checkuserdetails) {
      const loginfailedpagehtml =
        `<html>
      <head>
        <title>Login Failed</title>
      </head>
      <body>
          <a>Hi! Login Failed. User does'nt exist or incorrect password combination.</a>
          <br><br>
          <button onclick="redirectToHome()">Home</button>  
          <script>
            function redirectToHome() {
              window.location.href = '/home';
            }
          </script>
        </body>
      </html>`;
      res.send(loginfailedpagehtml);
    } else {
      usertempname = req.body.username;
      res.redirect('/checkweblist');
    }
  }
  catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}

exports.registeruserform = async (req, res) => {
  try {
    // Generate an HTML table with the data
    const registerpagehtml =
      `<html>
    <head>
      <title>Login</title>
    </head>
    <body>
    <form action="/registeruserdetails" method="post">
    <label for="username">Username:</label>
    <input type="text" id="username" name="username" required><br><br>
    <label for="password">Password:</label>
    <input type="password" id="password" name="password" required><br><br>
    <label for="emailid">Email Id:</label>
    <input type="email" id="emailid" name="emailid" required><br><br>
    <label for="emailpassword">Email Password:</label>
    <input type="password" id="emailpassword" name="emailpassword" required><br><br>
    <label for="reciepentemail">Reciepent Email:</label>
    <input type="email" id="reciepentemail" name="reciepentemail" required><br><br>
    <button type="submit">Register</button>
    </form>
      </body>
    </html>`;
    res.status(200).send(registerpagehtml);
  }
  catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}

exports.registerusers = async (req, res) => {
  try {
    const userprofile = new userprofile1(
      {
        username: req.body.username,
        password: req.body.password,
        useremail: req.body.emailid,
        useremailpassword: req.body.emailpassword,
        reciepentemail: req.body.reciepentemail,
        weblists: []
      }
    )
    try {
      let olduserdetails = await userprofile1.findOne({
        username: req.body.username
      })
      if (!olduserdetails) {
        await userprofile.save();
        //return res.send({ message: "Registered successfully" });
        const registersuccessfulhtml =
          `<html>
      <head>
        <title>Registration Successfull</title>
      </head>
      <body>
          <a>Hi! Registration Successfull. Click Below to Return to Login page</a>
          <br><br>
          <button onclick="redirectToLogin()">Click Here</button>  
          <script>
            function redirectToLogin() {
              window.location.href = '/login';
            }
          </script>
        </body>
      </html>`;
        res.status(200).send(registersuccessfulhtml);
      } else {
        //return res.send({ message: "User name already registered Either Login or Choose a different username" });
        const registerfailedhtml =
          `<html>
    <head>
      <title>Registration Failed</title>
    </head>
    <body>
        <a>Hi! Registration Failed. User name already registered Either Login or Choose a different username.</a>
        <br><br>
        <button onclick="redirectToHome()">Home</button>  
        <button onclick="redirectToRegister()">Register</button>  
        <script>
          function redirectToHome() {
            window.location.href = '/home';
          }
          function redirectToRegister() {
            window.location.href = '/register';
          }
        </script>
      </body>
    </html>`;
        res.send(registerfailedhtml);
      }
    }
    catch (error) {
      res.status(500).send(`Error: ${error.message}`);
    }
  }
  catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}



exports.edituserprofile = async (req, res) => {
  try {
    // Fetch data from the database
    let userdetails = await userprofile1.findOne({
      username: usertempname
    })

    const edituserpagehtml =
      `<html>
  <head>
    <title>Edit user</title>
  </head>
  <body>
  <form action="/editusers" method="post">
  <label for="username">Username:</label>
  <input type="text" id="username"
  value="${userdetails.username}"
  name="username" required><br><br>
  <label for="password">Password:</label>
  <input type="password" id="password" 
  value="${userdetails.password}"
  name="password" required><br><br>
  <label for="emailid">Email Id:</label>
  <input type="email" id="emailid" 
  value="${userdetails.useremail}"
  name="emailid" required><br><br>
  <label for="emailpassword">Email Password:</label>
  <input type="password" id="emailpassword" 
  value="${userdetails.useremailpassword}"
  name="emailpassword" required><br><br>
  <label for="reciepentemail">Reciepent Email:</label>
  <input type="email" id="reciepentemail" 
  value="${userdetails.reciepentemail}"
  name="reciepentemail" required><br><br>
  <button type="submit">Save</button>
  </form>
  <button onclick="redirectToHome()">Cancel</button>

        <script>
          function redirectToHome() {
            window.location.href = '/home';
          }    
        </script>
    </body>
  </html>`;
    res.status(200).send(edituserpagehtml);
  }
  catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}



exports.saveeditedusersprofile = async (req, res) => {
  try {
    let userdetailsupdate = await userprofile1.findOneAndUpdate(
      { username: usertempname },
      {
        $set: {
          username: req.body.username,
          password: req.body.password,
          useremail: req.body.useremail,
          useremailpassword: req.body.useremailpassword,
          reciepentemail: req.body.reciepentemail,
        }
      }
    )
 

    const editsuccessfullhtml =
      `<html>
  <head>
    <title>User Updated successfully</title>
  </head>
  <body>
    User details updated successfully. Click Below to return to Home
  </form>
  <button onclick="redirectToHome()">Home</button>

        <script>
          function redirectToHome() {
            window.location.href = '/home';
          }
        </script>
    </body>
  </html>`;

    const editfailhtml =
      `<html>
  <head>
    <title>User Detail Updation failed</title>
  </head>
  <body>
    Could not update user details. Click Below to return to Home
  </form>
  <button onclick="redirectToHome()">Home</button>
        <script>
          function redirectToHome() {
            window.location.href = '/home';
          }
        </script>
    </body>
  </html>`;

    if (!userdetailsupdate) {
      res.status(200).send(editfailhtml);
    }
    else {
      res.status(200).send(editsuccessfullhtml);
    }

    res.status(200).send("hi");
  }
  catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}

