const nodemailer = require('nodemailer');

require('dotenv').config();
const transporter = nodemailer.createTransport({
    host : 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls:{
        rejectUnauthorized:false
    }

});
// require('dotenv').config();

transporter.verify((error, success) => {
    if (error) {
        console.error('Transporter configuration error:', {
            message: error.message,
            code: error.code,
            hostname: error.hostname,
            command: error.command
        });
    } else {
        console.log('Server is ready to send emails');
    }
});


console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '********' : 'undefined');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '********' : 'undefined');

const sendOTP = async (email, otp) => {
    try{
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to:email,
            subject: "Your OTP for Student  Management System",
            text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
        };

        
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent', {
            response: info.response,
            messageId: info.messageId
        });
        return true;

    }catch(error){
        console.error('Error sending OTP:', {
            message: error.message,
            code: error.code,
            hostname: error.hostname,
            command: error.command
        });
        return false;
    }
};

module.exports = { sendOTP };