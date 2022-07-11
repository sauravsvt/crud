const nodemailer = require('nodemailer');

function sendEmail () {
    console.log("Sending email every second ")

    let mailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'saurav.shriwastav@girnarsoft.co.in',
            pass: '.............'
        }
    });
    
    const id = 5
    
    let mailDetails = {
        from: 'saurav.shriwastav@girnarsoft.co.in',
        to: 'saurav.8448619415@ipu.ac.in',
        subject: 'Test',
        text: 'Test',
        html:  `<h1>joasd ${id}</h1>`
    };
    
    mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log('Error Occurs');
        } else {
            console.log('Email sent successfully');
        }
    });
    


}

setInterval(sendEmail, 1000)
