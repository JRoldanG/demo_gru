import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const { formData, items, total } = data;

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

        const itemsHtml = items.map((item: any) =>
            `<li>${item.quantity}x <strong>${item.name}</strong> - $${(item.price * item.quantity).toLocaleString('es-CO')}</li>`
        ).join('');

        // Send Mail
        await transporter.sendMail({
            from: `"Gruinfacol Web" <${process.env.EMAIL_USER}>`,
            to: 'daroga17@yahoo.es',
            subject: `Nuevo Pedido Web - ${formData.name}`,
            html: `
        <h2>Nuevo Pedido Recibido</h2>
        <p>Se ha registrado un nuevo pedido a través del sitio web.</p>
        
        <h3>Datos del Cliente:</h3>
        <ul>
          <li><strong>Nombre:</strong> ${formData.name}</li>
          <li><strong>Email:</strong> ${formData.email}</li>
          <li><strong>Teléfono:</strong> ${formData.phone}</li>
          <li><strong>Dirección:</strong> ${formData.address}, ${formData.city}</li>
          ${formData.notes ? `<li><strong>Notas:</strong> ${formData.notes}</li>` : ''}
        </ul>

        <h3>Resumen del Pedido:</h3>
        <ul>
          ${itemsHtml}
        </ul>
        
        <h3>Total Estimado: $${total.toLocaleString('es-CO')} COP</h3>
        <hr/>
        <p>Gruinfacol S.A. - Notificación Automática</p>
      `,
        });

        return NextResponse.json({ message: 'Email enviado con éxito' }, { status: 200 });

    } catch (error: any) {
        console.error("Error sending email:", error);
        return NextResponse.json(
            { error: 'Error al enviar el correo', details: error.message },
            { status: 500 }
        );
    }
}
