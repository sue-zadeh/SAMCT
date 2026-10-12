export type MarketingContactDetails = {
  contactName?: string
  contactPhone?: string
}

export default function MarketingContact({ contactName, contactPhone }: MarketingContactDetails) {
  if (!contactName || !contactPhone) return null

  return <p className="marketing-contact small mb-3">
    Contact {contactName} on{' '}
    <a href={`tel:${contactPhone.replace(/[^\d+]/g, '')}`} className="fw-semibold text-nowrap">{contactPhone}</a>.
  </p>
}
