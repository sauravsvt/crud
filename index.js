//importing modules
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { QueryTypes, or } = require('sequelize');

console.log(uuidv4())


const cors = require('cors');
const app = express();
var router = express.Router();
app.use(cors())
app.use(bodyParser.urlencoded({extended:false}));
app.use(router);
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const cookie = require('cookie-parser');
require("dotenv").config();


app.use(cookie());
app.use(express.json()) //req.body is undefined by default, you need to use a parser middleware


//database connection
const {Sequelize, DataTypes, Model} = require('sequelize');
const { Op } = require('sequelize');
const sequelize = new Sequelize('fullauth', 'root', '', {
    host: 'localhost',
    dialect: `mysql`,
    define: {
        timestamps: false
    }
});

try{
     sequelize.authenticate();
    console.log('Database Connected')

} catch(error) {
    console.error('Unable to connect to the database: ', error);
}

//creating models
const User = sequelize.define('User',{
// class User extends Model {}
// User.init({
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },

    name: {
        type: Sequelize.STRING
    },

    email: {
        type: Sequelize.STRING
    },

    phone: {
        type: Sequelize.STRING
    },

    password: {
        type: Sequelize.STRING
    },

    status: {
        type: Sequelize.ENUM('active', 'inactive')
    },
    role: {
      type: Sequelize.STRING
    }, 

    confirmationCode: {
      type: Sequelize.STRING
    }

  })
// }
// ,
// {
//     sequelize, 
//     modelName: 'User'
// });


const salary = sequelize.define('salary', {
  eid: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  }, 

  id: {
    type: Sequelize.INTEGER,
  }, 

  amount: {
    type: Sequelize.STRING
  }, 

  monthly_deduction: {
    type: Sequelize.STRING
  },

  days: {
    type: Sequelize.STRING
  }
})


const departments = sequelize.define('departments', {
  eid: {
    type: Sequelize.INTEGER,
    primaryKey: true
  }, 

  technologies: {
    type: Sequelize.ENUM('mysql', 'reactjs', 'nodejs', 'php')
  }
})

User.hasMany(salary, {foreignKey: 'id'});
salary.belongsTo(User, {primaryKey: 'id', foreignKey: 'eid'});
User.hasMany(departments, {foreignKey: 'eid'});
// departments.belongsTo(salary, {foreignKey: 'id'})



//validations

validateall = (req, res, next) => {
    function ValidateEmail(email) {
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return (true);
      }
      return (false);
    }
    function validatePn(phone) {
      if (/^\d{10}$/.test(phone)) return true;
      else return false;
    }
    

   
    const { name, email, phone, status, role } = req.body; 

    if (!name || !email || !phone || !status || !role ) {
      res.send({ status: 400, message: "Fill all fields" });
    }
    
    else if (ValidateEmail(email) == false) {
      res.send({ status: 400, message: "Please enter valid email" });
    } 
    
    
    // else if (validatePn(phone) == false) {
    //   res.send({ status: 400, message: "Enter a valid phone number" });
    // }
    
    else if (validatePn(phone) == false) {
      res.send({ status: 400, message: "Enter a valid phone number" });
    }

    // else if (!password || password.length < 6) {
    //   return res.status(400).send({
    //     msg: 'Please enter a password with min. 6 chars'
    //   });
    // }
    
    else next();
  };

  const records = async(req, res) => {

    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);
   const users = await User.findAndCountAll(
    {
      include: [
        {
          model: departments,
          required: true
      },

      {
        model: salary,
        required: true
    }]
    }, 

    { limit, offset}

    ).then(data=> {
      const response = getPagingData(data, page, limit);
      console.log(data, page, limit)
      res.send(response);
    })
    // const users2 = await sequelize.query('select Users.id, name, email, salaries.amount, salaries.monthly_deduction, departments.technologies from Users JOIN salaries on Users.id = salaries.id JOIN departments on departments.eid = salaries.eid')
    // console.log(users)
    // res.send(users)
  }

  const EmployeeList = async (req, res) => {
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);
   const users = await User.findAndCountAll(
    {
      include: [
        {
          model: departments,
          required: true
      },

      {
        model: salary,
        required: true
    }]
    }, 

    { limit, offset}

    ).then(data=> {
      const response = getPagingData(data, page, limit);
      res.send(response);
    })
    // .then(data=> {
    //   const response = getPagingData(data, page, limit);
    //   res.send(response);
    // }).catch(err => {
    //   res.status(500).send({
    //     message:
    //     err.message || "Some error occurred"
    //   });

  // const users =
  //   await User.findAll(
      
  //     {
  //     include: [
  //       {
  //         model: departments,
  //         required: true
  //     },

  //     {
  //       model: salary,
  //       required: true
  //   }
    
  //   ]
  //   }
    
  //   )

    
    //.then((data) => {
          
    //       console.log("*********************\n\n\n\n\n",data);
    //       res.send({msg: data})
    // });

  
    

    // const users = await User.findAll({ include: {model: departments, required: true} });
    // const hello = JSON.stringify(users)
    // console.log(JSON.stringify(users, null, 2));
  
    // console.log(users)
  
  }

  app.get('/employeelist', EmployeeList)
  app.get('/employeelist2', records)

  const Search = async (req, res) => {

    // var regex = new RegExp('checkuser' ,'i');
    // User.find({name: regex}).then((result)=> {
    //   res.status(200).json(result)
    // })
    const users = await User.findAll(
      {
        include: [
          {
            model: departments,
            required: true
        },
  
        {
          model: salary,
          required: true
      }]
      }
      )

      console.log(users)

    
      // .then( async data=> {
        const {q} = req.query
        console.log( q)

        const keys = ["name", "email"];

        const search2 = (data) => {
          return data.filter((item) => {
            keys.some((key) => item[key].toLowerCase().includes(q))
          })
        }

        res.json(search2(users).splice(0,10));

        // console.log(search2, "search2")

        // res.json(search2(data).splice(0,10))
     
    
    // console.log(data)
    //   let result = await data.find({
    //   "$or": [
    //     {name: {$regex: req.params.key}}
    //   ]
    // });
    // console.log(result)
    // res.send(result)
    
  
  
  }


  app.get('/search/abcd', Search)

  // const bauwa = ["a", "b", "c"]


  app.get("/search",async (req,res)=>{
    
    // const { page, size } = req.query;
    // const { limit, offset } = getPagination(page, size);
    const {q} = req.query

  const data = 
  await sequelize.query(`SELECT 
  Users.id, 
  name, email, phone, 
  salaries.amount, salaries.monthly_deduction, 
  GROUP_CONCAT(departments.technologies )
  as technologies
   from Users 
  JOIN salaries on Users.id = salaries.id 
  JOIN departments on departments.eid = salaries.eid

  WHERE Users.name LIKE '%${req.query.q}%'
  OR
  Users.phone LIKE '%${req.query.q}%'
  OR
  salaries.amount LIKE '%${req.query.q}%'
  OR
  departments.technologies LIKE '%${req.query.q}%'
  GROUP BY Users.id
  ` , {
    type: Sequelize.QueryTypes.SELECT 
  })

//     let data = await User.findAndCountAll(

//       {
//         where: {name : {[Op.like]: '%' + req.query.q + '%'}},
//         include: 
//         [  {
//             model: departments,
//             required: true
//         //    where: {technologies : {[Op.like]: '%' + req.query.q + '%'}}
//         }
// ,
//         {
//           model: salary,
//           required: true
//      //     where: {amount : {[Op.like]: '%' + req.query.q + '%'}}
//       }

//       ]

     

//     }
   // )
   .then(data => {
      // const response = getPagingData(data, 1, 5);
      // console.log(data, 1, 5)
      res.send(data.flat());
      console.log(data.flat())
    })

    // if(data.length == 0){
    //   res.status(400).send("User Not Found")
    // }
    // else
    // res.status(200).send(data)
   
})


app.get("/searchbyname",async (req,res)=>{
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);
  const {q} = req.query
  let data = await User.findAndCountAll(

    {
      where: {name : {[Op.like]: '%' + req.query.q + '%'}},
      include: 
      {
        model: salary,
        required: true,
        where: {amount : {[Op.like]: '%' + req.query.q + '%'}}
    }
  
  }
  ).then(data => {
    const response = getPagingData(data, page, limit);
    console.log(data, page, limit)
    res.send(response);
    console.log(response)
  })

  // if(data.length == 0){
  //   res.status(400).send("User Not Found")
  // }
  // else
  // res.status(200).send(data)
 
})

  




//registration API
const registration = async (req, res, next) => {
  const {name, email, phone, status, role} = req.body;
  const confirmationCode = uuidv4();
  const user = await User.findOne({ where : {email : req.body.email }});
  console.log("fining ", user)
  if(!user) {

    User.create({   
      name,
      email,
      phone,
      status,
      role,
      confirmationCode
  })

  res.send({status: 200, message: "User Created Sucessfully"});
  next()

  }

  else
  res.status(400).send({msg: "Email Already Exists, Please login"})   
   }

app.post('/post',validateall, registration);

const login = async (req, res) => {
  const { email, password } = req.body;

  if(!email || !password) {

    res.status(404).send({msg: "Fill Credentials"})
  }

  else {
    const user = await User.findOne({ where : {email : req.body.email }});
    if(user) {
              const password_valid = await bcrypt.compare(req.body.password,user.password);
              if(password_valid){
                const accessToken = jwt.sign({ "id" : user.id,"email" : user.email, "name": user.name, "role": user.role },"sauravsvt-secretkey", {
                  expiresIn: 86400
                });
              
                res.cookie('data', accessToken, {
                  maxAge: 1000*60*60
                })

              res.status(200).header("accessToken", accessToken).send({"accessToken" : accessToken, message: "Logged in"})

            }
              else {
                res.status(400).json({ error : "Password Incorrect" });
              }

    }

  else {
    res.status(404).send({ error : "User does not exist" });
  }

  }


}
 
app.post('/login', login);


const validateToken = (req, res, next) => {
  const token = req.params.token
  console.log("params to", token)
  // const token = localStorage.getItem("data")
  if(!token) return res.status(400).json({error: "User not authenticated"})
  else
  try{
    const validToken = jwt.verify(token, "sauravsvt-secretkey")
    if (validToken){
      next()
    }
    else{
      res.json({msg: "Invalid Token"})
    }

  }
  catch (err){
    return res.status(400).json({error : err})

  }
}

app.delete('/logout', (req, res) => {
  res.clearCookie('data')
  res.send("logged out")
})





app.put('/change-password/:confirmationCode', (req, res) => {
  const new_password = req.body.password
  const confirmPassword = req.body.confirmPassword
  const confirmationCode = req.params.confirmationCode
  if(!new_password || !confirmPassword) {
    res.status(404).send({msg: "Please enter both fields"})

  }
else if (new_password != confirmPassword) {
  res.status(404).send({msg: "Both fields must match"})
}

else {
  const password = bcrypt.hashSync(confirmPassword, 10);
  User.update({
    password,
    status: 'active'
    }, {
     where: {confirmationCode}
   })
  
   res.status(200).send({msg: "Password Created Successfully, Please login"})

}
  /*
  const password = bcrypt.hashSync(req.body.password, 10);

  if(!password) {
    res.status(404).send({msg: "Enter Password"})
  }

  else if(password.length < 6) {
    res.status(404).send({msg: "Password Should be at least  6 chars"})
  }

  else
  console.log("password coming", password)
  console.log( "working", confirmationCode)

 
  */

})


app.put('/change-password/', (req, res) => {

  const password = bcrypt.hashSync(req.body.password, 10);
  if(!password) {
    res.status(404).send({msg: "Enter Password"})
  }

  else if(password.length < 6) {
    res.status(404).send({msg: "Password Should be at least  6 chars"})
  }

  else
  console.log("password coming", password)

  User.update({
   password
   }, {
    where: {confirmationCode}
  })
  res.send("ok")

})



const UpdatePassword = async (req, res) => {

  const {old_password, password} = req.body;
  const email = req.params.email;
  
  if(!old_password || !password) {
  res.send("Enter Empty Fields")
  }
  else {
  const user = await User.findOne({ where : {email : req.params.email }});
  const password_valid = await bcrypt.compare(old_password,user.password);
  if(password_valid) {
    const new_password = bcrypt.hashSync(password, 10);
  
    User.update({
     password: new_password,
     }, {
      where: {email}
    })

    res.status(200).send({msg: "Password Updated Successfully"})

  }
  else {
    res.status(400).send({msg: "Old Password Doesnot Match"})
  }

  }
  
  }

  app.put('/UpdatePassword/:email', UpdatePassword);



// app.get ('/k', async (req, res) => {
//   const user = await User.findOne({ where : {id: 83 }});
//   res.send(user)
// } )

const regwithAdmin = async(req, res) => {

  const {name, email, phone, status} = req.body;
  const password = bcrypt.hashSync(req.body.password, 10);
  const confirmationCode = uuidv4();
  const role = 'user';
const user = await User.findOne({ where : {email : req.body.email }});
console.log("finding ", user)
if(!user) {
  User.create({   
    name,
    email,
    phone,
    status,
    password,
    role,
    confirmationCode

    
})
res.status(200).send({msg: "Registration Successful"})
}

else {
  res.status(404).send({msg: "User Already Exists"})
}
}

 app.post('/regwithAdmin', regwithAdmin);




const sendEmail = async(req, res)=> {
  const {name, email, phone} = req.body;
  const confirmationCode = uuidv4();
  const role = 'user';
  const status = 'inactive';
  
const user = await User.findOne({ where : {email : req.body.email }});
  console.log("fining ", user)
if(!user) {
  User.create({   
    name,
    email,
    phone,
    status,
    role,
    confirmationCode
})


const link = `http://localhost:3000/confirmed/${confirmationCode}`

let mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'saurav.shriwastav@girnarsoft.co.in',
      pass: '................'
  }
});


let mailDetails = {
  from: 'saurav.shriwastav@girnarsoft.co.in',
  to: 'saurav.8448619415@ipu.ac.in', 
  subject: 'Test',
  text: 'Test',
  html:  `<h1>Hello ${name}, click <a href=${link}> here </a> to reset your password </h1>`
};


 
mailTransporter.sendMail(mailDetails, function(err, data) {
  if(err) {
      console.log('Error Occurs');
  } else {
    res.status(200).send({msg: "Email sent"})

  }


});

res.status(200).send({msg: "Email sent successfully"})

}

else{

  res.status(404).send({msg: "User Already Exists, Please Login"})

}

}

app.post('/send-email', sendEmail);


const VerifyEmail = async (req, res) => {
  res.send("Email Verified")


}

app.get('/verify', VerifyEmail);


app.get('/send-email/:id', async (req, res)=> {
// const email = req.body
// console.log("params working" ,email)
// const name = req.body.name
const user = await User.findOne({ where : {email: email }});
console.log("sendemailworkingawait", user.dataValues.confirmationCode);
const confirmationCode = user.dataValues.confirmationCode;
console.log( confirmationCode)
console.log("send-email working with id", email)




  // const token = req.cookies['data']
//   const token4 = req.query.token
//   var token2 = req.params.token
//   token3  = "'"+token2+"'";
//  const token = token3;
//   console.log(token4)

//   //const obj = JSON.parse(JSON.stringify(req.cookies)); // req.body = [Object: null prototype] { title: 'product' }
// // console.log(token)
//  const user = jwt.verify(token2, "sauravsvt-secretkey")
//   const id = user.id
//   const email = user.email
//   const name = user.name
//confirmation code from findone

 const link = `http://localhost:3000/confirmed/${confirmationCode}`
//   console.log(link)

  let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'saurav.shriwastav@girnarsoft.co.in',
        pass: 'Peace-4403'
    }
});

let mailDetails = {
  from: 'saurav.shriwastav@girnarsoft.co.in',
  to: 'saurav.8448619415@ipu.ac.in', 
  subject: 'Test',
  text: 'Test',
  html:  `<h1>Hello ${name}, click <a href=${link}> here </a> to reset your password </h1>`
};

mailTransporter.sendMail(mailDetails, function(err, data) {
  if(err) {
      console.log('Error Occurs');
  } else {
      console.log('Email sent successfully');
  }
});
//res.send(`Confirmation Link has been sent to your ${email}, Your link is ${link}`)
})


app.put('/set-password/:id/:token', validateToken,(req, res, next)=> {
      const token = req.params.token
      const user = jwt.verify(token, "sauravsvt-secretkey")
      const id = user.id
      const password = bcrypt.hashSync(req.body.password, 10);
        User.update({
          password
        }, {
          where: {id:id}
        })
        res.send("Password updated")
    
  
  


 
})



app.get("/set-password/verify-email/:confirmationCode", async (req, res) => {

  //get from database

console.log(" api hit setpass", req.params.confirmationCode)
const user = await User.findOne({ where : {confirmationCode: req.params.confirmationCode }});

if(user.password == null) {
  console.log("getting confirmation code from database", user.dataValues.confirmationCode)
  const confirmationCode = user.dataValues.confirmationCode
  // User.update({
  //   status: "active"
  // }, {
  //   where: {confirmationCode : req.params.confirmationCode}
  // })
  res.status(200).send({msg: "Account verified"})
  console.log("Account Verified")
}

else{
  res.status(400).send({msg: "Invalid Link"})

}

})

  
 // const confirmationCode = 'awfijodsfj0jrafgweg'







// app.get('/set-password/:id/:token',(req, res, next)=> {
//   const {id, token} = req.params
//   const link =` http://localhost:3000/set-password/${id}/${token}`
//   res.send(link)
//   // var reo ='<html><head><title>VerifyEmail</title></head><body><h1 style = "color:blue;">Your email is verified</h1><a href="http://localhost:3000/forgot">Click here to Change Your Password</a></body></html>';
//   // res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
//   // res.write( reo, 'utf-8');
//   // res.end();
  
// })

// app.get('/send-email/:id', validateToken, (req, res, next)=> {
//   const token = req.cookies['data']
//   const user = jwt.verify(token, "sauravsvt-secretkey")
//   const email = user.email
//   const id = req.params
//   console.log("tokjhbkmen", token)
//   res.send(user)

// })

//route access
// app.get('/me',
//  async(req,res,next)=>{
//   try {
//     let token = req.headers['authorization'].split(" ")[1];
//     let decoded = jwt.verify(token,"sauravsvt-secretkey");
//     req.user = decoded;
//     next();
//   } catch(err){
//     res.status(401).json({"msg":"Couldnt Authenticate"});
//   }
//   },
//   async(req,res,next)=>{
//     let user = await User.findOne({where:{id : req.user.id},attributes:{exclude:["password"]}});
//     if(user === null){
//       res.status(404).json({'msg':"User not found"});
//     }
//     res.status(200).json(user);
//  }); 



const getPagination = (page, size) => {
  const limit = size ? +size : 2;
  const offset = page ? page * limit : 1;
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: users } = data;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, users, totalPages, currentPage };
};


app.get('/get', function(req, res) {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);
  User.findAndCountAll({ limit, offset})
  .then(data=> {
    const response = getPagingData(data, page, limit);
    res.send(response);
  }).catch(err => {
    res.status(500).send({
      message:
      err.message || "Some error occurred"
    });
  });

   // User.findAll().then(User => res.json(User));
    // let errors = [];
    // errors.push({Text: 'Email already exists'});
    // res.json({ errors: errors })
    
  });

  const deleteUser = (req, res) => {
    const id = req.params.id;
    User.destroy({
      where: {id:id}
    })
    res.send({status: 200, message: "User Deleted Sucessfully"});
  }

  app.delete('/delete/:id', deleteUser);


  app.get('/oneUser/:id', function(req, res) {
    const id = req.params.id;
    User.findOne({where:{id}}).then(User => res.json(User));
  });


  
  //validations for repeated user                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
const repeated = async (email) => {
  try {
    let data = await User.findOne({
       where: {
         email: email
       }
    });

    console.log(data)


  }
  catch(error) {
    throw new Error(error);
  }
}
  const update = async(req, res, next) => {

    try{
      const {name, email, phone, status} = req.body;
      const id = req.params.id;
      const token = req.params.token
      console.log( "F", token)
      const user_front = jwt.verify(token, "sauravsvt-secretkey")
      const role = user_front.role
      console.log("userfront", user_front.role)
     
      let user = await User.findOne({
        where: {
          email: email
        }
     });
      console.log("user back", user)

         if(user == null  || email == user_front.email )  {
          User.update({
            name,
            email,
            phone,
            status,
        }, {where: {Id:id}});

        const accessToken = jwt.sign({ "id" : id,"email" : email, "name": name, "role": user_front.role },"sauravsvt-secretkey", {
          expiresIn: 86400
        });
      
        res.cookie('data', accessToken, {
          maxAge: 1000*60*60
        })

      res.status(200).header("accessToken", accessToken).send({"accessToken" : accessToken, message: "User Updated Successfully"})

        }

      else 
     res.status(400).send({msg: "User Already Exists"})
    }
    catch(error){
      next(error)
  
    }
      
    }



    const updateUser = async(req, res, next) => {
      const {name, email, phone, status} = req.body;
      const id = req.params.id;
      try{
        let user = await User.findOne({
          where: {
            email: email
          }
       });
     
           if(user == null)  {
            User.update({
              name,
              email,
              phone,
              status,
          }, {where: {Id:id}});
          res.status(200).send("User upadted sucessfully")
          }
        else 
         res.status(400).send({msg: "User Already Exists"})
      }
  
      catch(error){
        next(error)
    
      }
        
      }

      const addDetails = async(req, res, next) => {
        const id = req.params.id;
        let user = await salary.findOne({
          where: {
            id: id
          }
        })
       

      if(!user) {
        try{
              const {amount, monthly_deduction, days, } = req.body;
              
              salary.create({
                id,
                amount,
                monthly_deduction,
                days,
            });
            res.send("User Created")
        }
        catch(error){
          res.send(error)
          next(error)
      
        }

      }

        else 
        res.status(400).send("Duplicate id not allowed")
          
        }



        const techDetails = async(req, res, next) => {
          const technologies = req.body.tech
          console.log(technologies)
          const eid = req.params.id;     
          console.log(eid) 
          let user = await departments.findOne({
            where: {
              eid: req.params.id,
              technologies: technologies
            }
          })

          if(!user) {

            try{
              departments.create({
                eid,
                technologies
            });
            res.send("Tech Created")
        }
        catch(error){
          res.send(error)
          next(error)
      
        }

          }

          else {
            res.status(400).send({msg: "Technology field already exisits"})
          }

   

          }

          

 const roleUserAdmin = async(req, res, next) => {
  const id = req.params.id;
  const role = 'admin'
  let data = await User.findOne({
    where: {
      id: id,
      role: role
    }
 });

    }
 app.get('/checkUA/:id',roleUserAdmin);

  app.put('/put/:id/:token', update);
  app.post('/addDetails/:id', addDetails);
  app.post('/techDetails/:id', techDetails);
  app.put('/updateUser/:id/', updateUser);


//connecting to server
app.listen(3001, ()=> {
    console.log('SERVER IS RUNNING on 3001');
});
