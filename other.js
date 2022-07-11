//importing modules
const express = require('express');
//const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
//var router = express.Router();
app.use(cors());
//app.use(bodyParser.urlencoded({extended:true}));
app.use(router);
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
require("dotenv").config();



app.use(express.json()) //req.body is undefined by default, you need to use a parser middleware


//database connection
const {Sequelize, DataTypes, Model} = require('sequelize');
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
class User extends Model {}
User.init({
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
        type: Sequelize.BIGINT
    },

    password: {
        type: Sequelize.STRING
    },

    status: {
        type: Sequelize.ENUM('active', 'inactive')
    }
}
,
{
    sequelize, 
    modelName: 'User'
});


class userdetails extends Model {}
userdetails.init({

    name: {
        type: Sequelize.STRING
    },

    email: {
        type: Sequelize.STRING
    },
    
    password: {
      type: Sequelize.STRING
    },

    token: {
      type: Sequelize.STRING
    }
   
}
,
{
    sequelize, 
    modelName: 'userdetails'
});


//middleware validations
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
  
  const { name, email, phone, status } = req.body; 
  console.log(req.body); 
  if (!name || !email || !phone || !status) {
    res.send({ status: 400, message: "Fill all fields" });
  } else if (ValidateEmail(email) == false) {
    res.send({ status: 400, message: "Please enter valid email" });
  } else if (validatePn(phone) == false) {
    res.send({ status: 400, message: "Enter a valid phone number" });
  } else next();
};

//validations for repeated user                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
const repeated = async (email) => {
  try {
    let data = await User.findOne({
       where: {
         email: email
       }
    });
    console.log(data);
    return data;
  }
  catch(error) {
    throw new Error(error);
  }
}
//create user
 const registration = async (req, res, next) => {

  try{
    const {name, email, phone, status} = req.body;
    var data = await repeated(email);

    if(data == null ) {
      User.create({   
      name,
      email,
      phone,
      status,
  })
  res.send({status: 200, message: "User Created Sucessfully"});
  //res.redirect('http://localhost:3000/userlist')
    }

    else 
    res.send({status: 400, message: "User already exists"})
    
  }
  catch(error) {
    next(error);
  }
 
 }

 
 app.post('/post',validateall, registration);


//update registration
const update = async(req, res, next) => {

  try{
    const {name, email, phone, status} = req.body;
    const id = req.params.id;
    var data = await repeated(email);
   
       if(data == null) {
        User.update({
          name,
          email,
          phone,
          status,
      }, {where: {Id:id}});
      res.send({status: 200, message: "User Updated Sucessfully"});    
      }
    else 
    res.send({status: 400, message: "User already exists"})
  }
  catch(error){
    next(error)

  }
    
  }
  
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

  app.get('/oneUser/:id', function(req, res) {
    const id = req.params.id;
    User.findOne({where:{id}}).then(User => res.json(User));
  });


// app.delete('/delete/:id', function(req, res){
//   console.log(req.body);
//   const id = req.params.id;
//   User.destroy({
//     where: {id:id}
//   })
//   res.send({status: 200, message: "User Deleted Sucessfully"});
  
// })

const deleteUser = (req, res) => {
  const id = req.params.id;
  User.destroy({
    where: {id:id}
  })
  res.send({status: 200, message: "User Deleted Sucessfully"});
}

app.delete('/delete/:id', deleteUser);
app.put('/put/:id', update);
//creating in bulk
const bulk = function (req, res, next) {
    const {data} = req.body;
    User.bulkCreate(data)
    console.log("adfsg")
 }
 app.post('/bulk',bulk);




// User.bulkCreate([
    // {
    //     name: 'Jack',
    //     email: 'abc@gmail.com',
    //     phone: '1234546',
    //     status: '1'
    // },

//     {
//         name: 'davy',
//         email: 'abc@gmail.com',
//         phone: '1234565',
//         status: '1'
//     }
// ]);



app.post("/register", async (req, res) => {

  // Our register logic starts here
  try {
    // Get user input
    const { name, email, password } = req.body;

    // Validate user input
    if (!(email && password && name)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await userdetails.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await userdetails.create({
      name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign({email}, "jwtSecret", {
      expiresIn: 300,
     })


    // const token = jwt.sign(
    //   { userdetails_id: userdetails._id, email },
    //   process.env.TOKEN_KEY,
    //   {
    //     expiresIn: "2h",
    //   }
    // );
    // save user token
    userdetails.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});



//connecting to server
app.listen(3001, ()=> {
    console.log('SERVER IS RUNNING');
});
