import { KeyboardEvent, useState } from "react";
import { createPortal } from "react-dom";
import { searchPostalCode } from "../../api/masterApi";
import type { AddressFields, PostalCodeSearchResult } from "../../utils/addressUtils";
import {
  formatPostalCandidateLabel,
  formatPostalCodeDisplay,
  normalizePostalCode,
  parsePostalResultToFormFields,
} from "../../utils/addressUtils";

type PostalCodeSearchModalProps = {
  open: boolean;
  zipcode: string;
  results: PostalCodeSearchResult[];
  loading: boolean;
  error: string;
  onClose: () => void;
  onSelect: (result: PostalCodeSearchResult) => void;
};

function PostalCodeSearchModal({
  open,
  zipcode,
  results,
  loading,
  error,
  onClose,
  onSelect,
}: PostalCodeSearchModalProps) {
  const handleSelect = (result: PostalCodeSearchResult) => {
    onSelect(result);
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="postal-search-title"
      >
        <div className="modal-header">
          <h2 id="postal-search-title">住所を選択</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>

        {zipcode && (
          <p className="postal-search-hint">
            〒{formatPostalCodeDisplay(zipcode)} の検索結果
          </p>
        )}

        {loading && <p className="postal-search-loading">検索中...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && results.length > 0 && (
          <div className="postal-search-results">
            <p className="postal-search-hint">該当する住所を選択してください</p>
            <ul>
              {results.map((row, index) => (
                <li key={`${row.postalCode}-${row.city}-${row.town}-${index}`}>
                  <button type="button" onClick={() => handleSelect(row)}>
                    <span className="postal-search-label">
                      {formatPostalCandidateLabel(row)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export type AddressFormValue = AddressFields;

type AddressFormFieldsProps = {
  value: AddressFormValue;
  onChange: (value: AddressFormValue) => void;
  required?: boolean;
};

export function AddressFormFields({
  value,
  onChange,
  required = false,
}: AddressFormFieldsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [results, setResults] = useState<PostalCodeSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchedZipcode, setSearchedZipcode] = useState("");

  const updateField = (patch: Partial<AddressFormValue>) => {
    onChange({ ...value, ...patch });
  };

  const handlePostalSelect = (result: PostalCodeSearchResult) => {
    const parsed = parsePostalResultToFormFields(result);
    onChange({
      ...value,
      postalCode: result.postalCode,
      prefecture: parsed.prefecture,
      city: parsed.city,
      town: parsed.town,
    });
  };

  const handleSearch = async () => {
    const digits = normalizePostalCode(value.postalCode ?? "");
    if (digits.length !== 7) {
      setSearchError("郵便番号は7桁で入力してください");
      return;
    }

    setSearchError("");
    setSearchedZipcode(digits);
    setResults([]);
    setModalOpen(true);
    setSearchLoading(true);

    try {
      const rows = await searchPostalCode(digits);
      setResults(rows);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "検索に失敗しました");
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePostalKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSearch();
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <fieldset className="address-form-fields">
        <legend>住所</legend>

        <label>
          郵便番号
          <div className="postal-input-row">
            <input
              value={value.postalCode ?? ""}
              onChange={(e) => updateField({ postalCode: e.target.value })}
              onKeyDown={handlePostalKeyDown}
              placeholder="例: 100-0001"
              inputMode="numeric"
            />
            <button
              type="button"
              className="btn-secondary"
              disabled={searchLoading}
              onClick={() => void handleSearch()}
            >
              {searchLoading ? "検索中..." : "検索"}
            </button>
          </div>
        </label>
        {searchError && !modalOpen && <p className="error">{searchError}</p>}

        <div className="address-split-grid">
          <label>
            都道府県
            <input
              value={value.prefecture ?? ""}
              onChange={(e) => updateField({ prefecture: e.target.value })}
              required={required}
            />
          </label>
          <label>
            市区町村
            <input
              value={value.city ?? ""}
              onChange={(e) => updateField({ city: e.target.value })}
              required={required}
            />
          </label>
          <label>
            町名
            <input
              value={value.town ?? ""}
              onChange={(e) => updateField({ town: e.target.value })}
            />
          </label>
          <label className="address-street-field">
            番地以下
            <input
              value={value.streetAddress ?? ""}
              onChange={(e) => updateField({ streetAddress: e.target.value })}
              placeholder="例: 1-2-3 サンプルビル4F"
            />
          </label>
        </div>
      </fieldset>

      <PostalCodeSearchModal
        open={modalOpen}
        zipcode={searchedZipcode}
        results={results}
        loading={searchLoading}
        error={modalOpen ? searchError : ""}
        onClose={handleCloseModal}
        onSelect={handlePostalSelect}
      />
    </>
  );
}
