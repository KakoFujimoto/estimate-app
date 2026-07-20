export type AddressParts = {
  postalCode?: string | null;
  prefecture?: string | null;
  city?: string | null;
  town?: string | null;
  streetAddress?: string | null;
};

export function normalizePostalCode(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatPostalCodeDisplay(value: string): string {
  const digits = normalizePostalCode(value);
  if (digits.length === 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return value.trim();
}

export function formatFullAddress(parts: AddressParts): string {
  const postalDigits = normalizePostalCode(parts.postalCode ?? '');
  const postalPart =
    postalDigits.length === 7
      ? `〒${formatPostalCodeDisplay(postalDigits)} `
      : parts.postalCode?.trim()
        ? `〒${parts.postalCode.trim()} `
        : '';

  const body = [
    parts.prefecture?.trim(),
    parts.city?.trim(),
    parts.town?.trim(),
    parts.streetAddress?.trim(),
  ]
    .filter(Boolean)
    .join('');

  return `${postalPart}${body}`.trim();
}

export function applyFormattedAddress<T extends AddressParts & { address: string }>(
  entity: T,
): T {
  entity.address = formatFullAddress(entity);
  return entity;
}
