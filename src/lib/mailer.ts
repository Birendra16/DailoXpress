import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
   service:"gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail= async (to:string,subject:string,html:string)=>{
    await transporter.sendMail({
        from:`"DailoXpress" <${process.env.EMAIL}> `,
        to,
        subject,
        html
    })
}