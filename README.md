# crud_back
The server side of this project used the following dependencies:
 (a) Nodemailer - for email verification
 (b) uuidv4     - for generating random token
 (c) sequelize  - Object Relational Mapping tool 
 (d) bcrypt     - for hashing the passwords
 (e) cookie     - to save cookies
 (f) mysql      - database
 (g) jsonwebtoken - for generating tokens while logging in
 (h) node-localstorage - for saving generated tokens in localstorage
 (i) cors  - for cross origin resource sharing
 

1. Created a database named "fullauth" and configured (Line no. 28 - 44)
2. Created Three Models named "User", "Salary" & "Departments" having attributes:
User - id, name, email, phone, password, status, role, confirmationCode
salary - eid, id, amount, monthly_deduction, days
departments - eid, technologies
where, 
User.id is the primary key for Model User
salary.eid is the primary key for Model salary
salary.id is the foreign key for Model salary from User.id
departments.eid is the foreign key for departments from salary.eid


validateAll are the middleware validations in registration form


const records fetches the whole data along with pagination (DON'T USE)
const employeeList fetches all threee databases along with pagination (trail)
const Search fetches data according to query and filters data (failed trail)


Line 346-411 => /search/?q= returns data according to queries
included fields name, amount, phone, deduction, technologies
(WORKING)

/searchbyname searches data according to name only (trail)

const registration:
creates user only for unique emails, no duplicate emails allowed

const login:
logs in and creates token and saves in header

const validateToken: 
validates token - for APIs to work inside login 

app.delete:
removes token and clears cookie and headers



const UpdatePassword: 
updates user password


const regwithAdmin:
registrations that don't need email verification
and are only allowed to admins

const sendEmail:
for role users only, no admins are allowed, creates user with status inactive
and sends confirmationcode to user to verify if email belongs to the same
user


app.get(/set-password/verify-email/:confirmationCode):
returns if the url hit matches the confirmationcode sent to email and 
if the user sets password then automatically status is changed from inactive to active


const getPagination and getPagingdata:
for pagination

app.get(/get):
returns registered user in database User along with pagination

const deleteUser:
deletes user 

const update:
updates all users

const updateuser:
updates only for logged in users

const addDetails and techDetails:
adding details for logged in users in salary and technolgoies














