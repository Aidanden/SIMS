import nodemailer from 'nodemailer';

class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // أو يمكنك استخدام host/port للإعدادات المخصصة
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD, // App Password for Gmail
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    async sendPasswordResetEmail(to: string, resetToken: string) {
        const resetLink = `${process.env.CORS_ORIGIN}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: 'إعادة تعيين كلمة المرور - نظام SIMS',
            html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
          <h2>طلب إعادة تعيين كلمة المرور</h2>
          <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في نظام SIMS.</p>
          <p>لإعادة تعيين كلمة المرور، يرجى النقر على الرابط أدناه:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">إعادة تعيين كلمة المرور</a>
          <p>هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
          <p>إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.</p>
        </div>
      `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Password reset email sent to ${to}`);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);

            // في وضع التطوير، إذا فشل الإرسال، اطبع الرابط في الكونسول لنتمكن من المتابعة
            if (process.env.NODE_ENV !== 'production') {
                console.log('=================================================================');
                console.log('🚧 DEV MODE: Email sending failed. Here is the reset link:');
                console.log(resetLink);
                console.log('=================================================================');
                return true; // نعتبره نجاحاً لنتمكن من تكملة السيناريو في الواجهة
            }

            return false;
        }
    }
}

export const emailService = new EmailService();
