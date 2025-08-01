// const nodemailer = require('nodemailer');

// const sendEmail = async(options) => {
//     //create  reusable transporter with using SMTP
//     const transporter = nodemailer.createTransport({
//         host: process.env.SMTP_HOST,
//         port: process.env.SMTP_PORT,
//         auth: {
//             user: process.env.SMTP_EMAIL,
//             pass: process.env.SMTP_PASSWORD
//         }

//     });

//     const message = {
//         from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//     }

//     const info = await transporter.sendMail(message);
//     console.log('Message sent: %s', info.messageId)
// }

// module.exports = sendEmail;

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.MAIL_HOST,     
    port: process.env.MAIL_PORT,      
    secure: false,                    
    auth: {
      user: process.env.MAIL_USER,    
      pass: process.env.MAIL_PASS,    
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId)
};

module.exports = sendEmail;