import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();


 const sendEmail = async ({ email, subject, text }) => {
  try {
    // Create a transporter object using your email service
    const transporter = nodemailer.createTransport({
     host:process.env.HOST,
     service:process.env.SERVICE,
     port:Number(process.env.EMAIL_PORT),
     secure:Boolean(process.env.SECURE),
     auth:{
      user:process.env.USER,
      pass:process.env.PASS
     }

    });
    await transporter.sendMail({
      from:process.env.USER,
      to:email,
      subject:subject,
      text:text
    })
    console.log("email sent");
    

  }
  catch(error){
    console.log(error);
    

  }
}
export {sendEmail}