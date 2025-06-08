import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
    },
});

const sendVerificationEmail = async ({ to, name, subject, text }) => {
    await transporter.senderEmail({
        from : process.env.EMAIL_USER,
        to,
        subject: "Verify your email",
        html:  `
            <h2>Hello ${name},</h2>
            <p>Please verify your email by clicking the link below:</p>
            <a href="${url}" target="_blank" style="padding:10px 20px;background:#007bff;color:#fff;border:none;border-radius:5px;text-decoration:none;">Verify Email</a>
            <p>This link will expire in 24 hours.</p>
    `,
    })
}

export default sendVerificationEmail; // This function sends a verification email to the user