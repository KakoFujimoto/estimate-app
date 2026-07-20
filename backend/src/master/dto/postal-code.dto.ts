export type PostalCodeSearchResult = {
  postalCode: string;
  prefecture: string;
  city: string;
  town: string;
};

export type ZipcloudResponse = {
  status: number;
  message: string | null;
  results: Array<{
    zipcode: string;
    address1: string;
    address2: string;
    address3: string;
  }> | null;
};
