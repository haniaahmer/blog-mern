import nodemailer from "nodemailer";


export const mailer = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port: Number(process.env.SMTP_PORT || 587),
secure: false,
auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});


export const MAIL_FROM = process.env.MAIL_FROM || "no-reply@cms.local";


export async function sendNewCommentEmail(to, blog, comment){
if (!to?.length) return;
const subject = `New comment on: ${blog.title}`;
const html = `<p><b>${comment.username || "Anonymous"}</b> left a comment on <b>${blog.title}</b>:</p><blockquote>${(comment.text||"")
.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</blockquote>`;
await mailer.sendMail({ from: MAIL_FROM, to: to.join(","), subject, html });
}