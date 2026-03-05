import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const { name, idType, idNumber, email, phone, role } = data;

        // Config Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Send Mail to Admin
        await transporter.sendMail({
            from: `"Gruinfacol Web" <${process.env.EMAIL_USER}>`,
            to: 'daroga1735@gmail.com', // Explicit instruction to notify this email
            subject: `Nueva Resgistro en Tienda - ${name}`,
            html: `
        <h2>Nuevo Usuario Registrado</h2>
        <p>Un nuevo cliente se ha registrado en la plataforma y se le asignó automáticamente la lista de precios <strong>${role}</strong>.</p>
        <p>Por favor revise si necesita un ajuste de lista de precios a ACCIONISTA o DROGUISTA.</p>
        
        <h3>Datos del Cliente:</h3>
        <ul>
          <li><strong>Nombre:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Identificación:</strong> ${idType} ${idNumber}</li>
          <li><strong>Teléfono:</strong> ${phone}</li>
        </ul>

        <hr/>
        <p>Gruinfacol S.A. - Control de Acceso</p>
      `,
        });

        return NextResponse.json({ message: 'Notificación enviada con éxito' }, { status: 200 });

    } catch (error: any) {
        console.error("Error sending registration email:", error);
        return NextResponse.json(
            { error: 'Error al enviar la notificación', details: error.message },
            { status: 500 }
        );
    }
}
