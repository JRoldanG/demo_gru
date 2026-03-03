"use client";

import { MessageCircle } from 'lucide-react';
import React from 'react';

export default function WhatsAppButton() {
    const phoneNumber = "573202180000";
    // The default message URL encoded.
    // Original: "¡Hola! Estoy interesado/a en los productos del laboratorio Gruinfacol S.A. ¿Podrían brindarme asesoría especializada?"
    const defaultMessage = "%C2%A1Hola%21%20Estoy%20interesado%2Fa%20en%20los%20productos%20del%20laboratorio%20Gruinfacol%20S.A.%20%C2%BFPodr%C3%ADan%20brindarme%20asesor%C3%ADa%20especializada%3F";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-button"
            aria-label="Contactar por WhatsApp"
        >
            <div className="whatsapp-pulse"></div>
            <MessageCircle size={32} />
        </a>
    );
}
