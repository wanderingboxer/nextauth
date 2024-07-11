import User from "@/models/userModel";
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";

export const sendEmail = async({email, emailType, userId}:any) => {
    try {
      // create a hashed token
      const hashedToken = await bcryptjs.hash(userId.toString(), 10)

      if (emailType === "VERIFY") {
        await User.findOneAndUpdate(userId,
          {$set:
            {verifyToken: hashedToken,
            verifyTokenExpiry: Date.now() + 3600000}});
      } else if(emailType === "RESET") {
         await User.findOneAndUpdate(userId,
          {$set:{forgotPasswordToken: hashedToken, 
          forgotPasswordTokenExpiry: Date.now() + 3600000}});
      }

      var transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "626c590243af51",
          pass: "5fd002a8df60fc"
        }
      });

          const mailOptions = {
            from: 'aditya@aditya.ai', 
            to: email, 
            subject: emailType === 'VERIFY' ? "Verify your email" : "Reset your password", 
            html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token{hashedToken}">
            here<a> to $ {emailType === "VERIFY" ? "verify your email" : "reset your password"
            } or copy and paste the link below in your browser. 
            <b> ${process.env.DOMAIN}/verifyemailToken?token=${hashedToken} 
            <p>`, 
          }

          const mailResponse = await transport.sendMail(mailOptions);
          return mailResponse;

    } catch (error:any) {
        throw new Error(error.message);
    }
}