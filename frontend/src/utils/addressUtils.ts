export type AddressFields = {
  postalCode: string;
  prefecture: string;
  city: string;
  town: string;
  streetAddress: string;
};

export type PostalCodeSearchResult = {
  postalCode: string;
  prefecture: string;
  city: string;
  town: string;
};

export const emptyAddressFields = (): AddressFields => ({
  postalCode: "",
  prefecture: "",
  city: "",
  town: "",
  streetAddress: "",
});

export function normalizePostalCode(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatPostalCodeDisplay(value: string): string {
  const digits = normalizePostalCode(value);
  if (digits.length === 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  return value.trim();
}

/** 郵便番号検索候補の表示ラベル（例: 西五反田　1丁目） */
export function formatPostalCandidateLabel(result: PostalCodeSearchResult): string {
  const city = result.city.trim();
  const town = result.town.trim();

  if (/^\d+丁目$/.test(town)) {
    const oaza = extractOazaFromCity(city);
    return `${oaza}　${town}`;
  }

  const split = town.match(/^(.+?)(\d+丁目)$/);
  if (split) {
    return `${split[1]}　${split[2]}`;
  }

  if (town) {
    return town;
  }

  return city;
}

/** zipcloud の結果を分割住所フィールドへ正規化 */
export function parsePostalResultToFormFields(
  result: PostalCodeSearchResult,
): Pick<AddressFields, "prefecture" | "city" | "town"> {
  const prefecture = result.prefecture.trim();
  const city = result.city.trim();
  const town = result.town.trim();

  if (/^\d+丁目$/.test(town)) {
    const wardMatch = city.match(/^(.+?[市区町村])(.+)$/);
    if (wardMatch) {
      return {
        prefecture,
        city: wardMatch[1],
        town: `${wardMatch[2]}${town}`,
      };
    }
    return {
      prefecture,
      city,
      town: `${extractOazaFromCity(city)}${town}`,
    };
  }

  const split = town.match(/^(.+?)(\d+丁目)$/);
  if (split) {
    const wardMatch = city.match(/^(.+?[市区])(.+)$/);
    if (wardMatch?.[2] === split[1]) {
      return { prefecture, city: wardMatch[1], town };
    }
    return { prefecture, city, town };
  }

  const wardMatch = city.match(/^(.+?[市区町村])(.*)$/);
  if (wardMatch && !wardMatch[2]) {
    return { prefecture, city: wardMatch[1], town };
  }

  return { prefecture, city, town };
}

function extractOazaFromCity(city: string): string {
  const match = city.match(/^.+?[市区町村](.+)$/);
  return match?.[1]?.trim() || city;
}

export function formatFullAddress(parts: Partial<AddressFields>): string {
  const postalDigits = normalizePostalCode(parts.postalCode ?? "");
  const postalPart =
    postalDigits.length === 7
      ? `〒${formatPostalCodeDisplay(postalDigits)} `
      : parts.postalCode?.trim()
        ? `〒${parts.postalCode.trim()} `
        : "";

  const body = [
    parts.prefecture?.trim(),
    parts.city?.trim(),
    parts.town?.trim(),
    parts.streetAddress?.trim(),
  ]
    .filter(Boolean)
    .join("");

  return `${postalPart}${body}`.trim();
}

export function addressFieldsFromRecord(
  record: Partial<AddressFields> & { address?: string },
): AddressFields {
  const hasStructured = Boolean(
    record.postalCode ||
      record.prefecture ||
      record.city ||
      record.town ||
      record.streetAddress,
  );

  if (hasStructured) {
    return {
      postalCode: record.postalCode ?? "",
      prefecture: record.prefecture ?? "",
      city: record.city ?? "",
      town: record.town ?? "",
      streetAddress: record.streetAddress ?? "",
    };
  }

  return {
    ...emptyAddressFields(),
    streetAddress: record.address?.trim() ?? "",
  };
}

export function withFormattedAddress<T extends AddressFields>(
  fields: T,
): T & { address: string } {
  return {
    ...fields,
    address: formatFullAddress(fields),
  };
}
