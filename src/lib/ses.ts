import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';

// AWS SES設定
const sesClient = new SESClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

// Gmail SMTP設定（テスト用）
const gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // Gmailアドレス
        pass: process.env.GMAIL_APP_PASSWORD, // Gmailアプリパスワード
    },
});

// Mailtrap設定（開発用・個人キー不要）
const mailtrapTransporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
});

// カスタムSMTP設定（汎用）
const customTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
    // デモモードの場合、実際のメール送信はスキップ
    if (isDemoMode) {
        console.log('📧 デモモード: メール送信をシミュレート');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('HTML:', options.html.substring(0, 100) + '...');
        return;
    }

    // Mailtrapを使用する場合（開発用）
    if (isMailtrapMode) {
        await sendEmailWithMailtrap(options);
        return;
    }

    // カスタムSMTPを使用する場合
    if (isCustomSMTPMode) {
        await sendEmailWithCustomSMTP(options);
        return;
    }

    // Gmail SMTPを使用する場合
    if (isGmailMode) {
        await sendEmailWithGmail(options);
        return;
    }

    // AWS SESを使用する場合
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        throw new Error('AWS credentials are not configured');
    }

    const params = {
        Source: options.from || process.env.AWS_SES_FROM_EMAIL || 'noreply@example.com',
        Destination: {
            ToAddresses: [options.to],
        },
        Message: {
            Subject: {
                Data: options.subject,
                Charset: 'UTF-8',
            },
            Body: {
                Html: {
                    Data: options.html,
                    Charset: 'UTF-8',
                },
            },
        },
    };

    try {
        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        console.log('📧 メール送信成功:', options.to, '- MessageId:', response.MessageId);
    } catch (error) {
        console.error('❌ メール送信エラー:', error);
        throw error;
    }
}

// Gmail SMTPでメール送信（個人キー必要）
async function sendEmailWithGmail(options: SendEmailOptions): Promise<void> {
    const mailOptions = {
        from: options.from || process.env.GMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
    };

    try {
        const result = await gmailTransporter.sendMail(mailOptions);
        console.log('📧 Gmail経由でメール送信成功:', options.to, '- MessageId:', result.messageId);
    } catch (error) {
        console.error('❌ Gmail経由でのメール送信エラー:', error);
        throw error;
    }
}

// Mailtrapでメール送信（開発用・個人キー不要）
async function sendEmailWithMailtrap(options: SendEmailOptions): Promise<void> {
    const mailOptions = {
        from: options.from || 'test@example.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
    };

    try {
        const result = await mailtrapTransporter.sendMail(mailOptions);
        console.log('📧 Mailtrap経由でメール送信成功:', options.to, '- MessageId:', result.messageId);
    } catch (error) {
        console.error('❌ Mailtrap経由でのメール送信エラー:', error);
        throw error;
    }
}

// カスタムSMTPでメール送信
async function sendEmailWithCustomSMTP(options: SendEmailOptions): Promise<void> {
    const mailOptions = {
        from: options.from || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
    };

    try {
        const result = await customTransporter.sendMail(mailOptions);
        console.log('📧 カスタムSMTP経由でメール送信成功:', options.to, '- MessageId:', result.messageId);
    } catch (error) {
        console.error('❌ カスタムSMTP経由でのメール送信エラー:', error);
        throw error;
    }
}

// モード判定
export const isDemoMode = !process.env.AWS_ACCESS_KEY_ID && !process.env.GMAIL_USER && !process.env.MAILTRAP_USER && !process.env.SMTP_HOST;
export const isGmailMode = !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD;
export const isMailtrapMode = !!process.env.MAILTRAP_USER && !!process.env.MAILTRAP_PASS;
export const isCustomSMTPMode = !!process.env.SMTP_HOST && !!process.env.SMTP_USER;
export const isAwsMode = !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY;

// 現在のモードを取得
export const getCurrentMode = (): string => {
    if (isAwsMode) return 'AWS SES';
    if (isGmailMode) return 'Gmail SMTP';
    if (isMailtrapMode) return 'Mailtrap';
    if (isCustomSMTPMode) return 'Custom SMTP';
    return 'Demo Mode';
}; 
