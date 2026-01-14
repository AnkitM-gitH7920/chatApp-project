import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.COMPANY_EMAIL,
        pass: process.env.COMPANY_APP_PASSWORD
    }
});

async function sendHtmlMail(recipientAddress, subject, mailBodyAsHtml) {
    const mailResponse = await transporter.sendMail({
        from: process.env.COMPANY_EMAIL,
        to: recipientAddress,
        subject: subject,
        html: mailBodyAsHtml
    });
    return mailResponse;
}
async function sendTextMail(recipientAddress, subject, mailBodyAsText) {
    const mailResponse = await transporter.sendMail({
        from: process.env.COMPANY_EMAIL,
        to: recipientAddress,
        subject: subject,
        html: mailBodyAsText
    });
    return mailResponse;
}


export {
    sendHtmlMail,
    sendTextMail
};