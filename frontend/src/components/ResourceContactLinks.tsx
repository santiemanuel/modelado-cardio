export type DirectoryContact = {
  phones?: readonly {
    label: string;
    href: string;
  }[];
  whatsapps?: readonly {
    label: string;
    href: string;
  }[];
};

type ResourceContactLinksProps = {
  contact?: DirectoryContact;
};

function PhoneIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M6.6 4.8 8.7 7c.5.5.6 1.3.2 1.9l-.9 1.4c.9 1.8 2.4 3.3 4.1 4.1l1.4-.9c.6-.4 1.4-.3 1.9.2l2.2 2.1c.6.6.6 1.6 0 2.2l-.9.9c-.8.8-2 1.1-3.1.7-4.8-1.5-8.6-5.3-10.1-10.1-.4-1.1-.1-2.3.7-3.1l.9-.9c.6-.6 1.5-.6 2.1 0Z" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M5.2 19.2 6.1 16A8.1 8.1 0 1 1 9 18.8l-3.8.4Z" />
      <path d="M9.1 8.2c.3-.5.6-.5.9-.2l.8 1c.2.3.2.6 0 .9l-.4.6c.6 1.2 1.5 2.1 2.7 2.7l.6-.4c.3-.2.6-.2.9 0l1 .8c.3.3.3.6-.2.9-.7.4-1.5.6-2.3.3-2.1-.7-3.8-2.4-4.5-4.5-.2-.7 0-1.5.5-2.1Z" />
    </svg>
  );
}

export function ResourceContactLinks({ contact }: ResourceContactLinksProps) {
  const phones = contact?.phones ?? [];
  const whatsapps = contact?.whatsapps ?? [];

  if (phones.length === 0 && whatsapps.length === 0) {
    return null;
  }

  return (
    <div className="directory-contact-list" aria-label="Datos de contacto">
      {phones.map((phone) => (
        <a className="directory-contact-link contact-phone" href={phone.href} key={`phone-${phone.href}`}>
          <PhoneIcon />
          <span className="contact-link-label">Teléfono {phone.label}</span>
        </a>
      ))}
      {whatsapps.map((whatsapp) => (
        <a
          className="directory-contact-link contact-whatsapp"
          href={whatsapp.href}
          target="_blank"
          rel="noreferrer"
          key={`whatsapp-${whatsapp.href}`}
        >
          <WhatsappIcon />
          <span className="contact-link-label">WhatsApp {whatsapp.label}</span>
        </a>
      ))}
    </div>
  );
}
