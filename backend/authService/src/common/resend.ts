import { Resend } from "resend";
import "dotenv/config";

declare const process: {
  env: {
    DOMAIN: string;
    SUB_DOMAIN_VERIFY: string;
    RESEND_API_KEY: string;
  };
};

type subDomain = `${string}.${typeof process.env.SUB_DOMAIN_VERIFY}`;
// type subDomain = `${string}.${typeof process.env.DOMAIN}`
// value 1 of type "subDomain"
// example: "update.domain.com"
// "reflect of purpose" and "domain.com"

type domain = `${typeof process.env.DOMAIN}`;


interface EmailVerificationForm {
 nameCompany: string;
  email: string;
  html: string;
  subject: string;
  text: string;
  domainAddress: subDomain | domain;
}

export class ResendEmail {
  
  async sendVerificationEmail(props: EmailVerificationForm) {

    // send verification email
    const resend = new Resend(process.env.RESEND_API_KEY);
    const response = await resend.emails.send({
      from: `${props.nameCompany} <company@${props.domainAddress}>`,
      to: props.email,
      subject: props.subject,
      text: props.text,
      html: props.html,
    })

    return response
  }
  
  
}