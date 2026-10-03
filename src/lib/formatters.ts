/**
 * 🌍 Currency and Location Localization Formatters
 * Formats prize money into local currency numbering systems (e.g. ₹1,00,000 INR vs $10,000 USD)
 * and normalizes geographic locations (Country, State, City).
 */

/**
 * Format prize money according to currency standard:
 * - INR: ₹1,00,000 (Indian numbering system)
 * - USD: $10,000 (Western numbering system)
 * - Other currencies: formatted with appropriate symbol
 */
export function formatPrizeAmount(
  amount?: number | null,
  currency: string = 'USD'
): string {
  const numericAmount = Number(amount) || 0;
  if (numericAmount <= 0) {
    return 'Swag & Certificates';
  }

  const normalizedCurrency = (currency || 'USD').toUpperCase().trim();

  if (normalizedCurrency === 'INR' || normalizedCurrency === '₹' || normalizedCurrency === 'RS') {
    // Format using Indian numbering system (e.g. 1,00,000)
    return `₹${Math.round(numericAmount).toLocaleString('en-IN')}`;
  }

  if (normalizedCurrency === 'EUR' || normalizedCurrency === '€') {
    return `€${Math.round(numericAmount).toLocaleString('de-DE')}`;
  }

  if (normalizedCurrency === 'GBP' || normalizedCurrency === '£') {
    return `£${Math.round(numericAmount).toLocaleString('en-GB')}`;
  }

  // Default to USD / en-US
  return `$${Math.round(numericAmount).toLocaleString('en-US')}`;
}

/**
 * Formats prize money with explicit currency code (ideal for Telegram messages):
 * e.g. "₹1,00,000 INR" or "$50,000 USD"
 */
export function formatPrizeWithCode(
  amount?: number | null,
  currency: string = 'USD'
): string {
  const numericAmount = Number(amount) || 0;
  if (numericAmount <= 0) {
    return '🏆 *Prizes:* Swag, Mentorship & Certificates';
  }

  const normalizedCurrency = (currency || 'USD').toUpperCase().trim();
  const code = normalizedCurrency === '₹' || normalizedCurrency === 'RS' ? 'INR' : normalizedCurrency;
  const formatted = formatPrizeAmount(numericAmount, code);

  return `💰 *Prize Pool:* ${formatted} ${code}`;
}

/**
 * Normalize city names (e.g., Bengaluru -> Bangalore for unified filtering)
 */
export function normalizeCity(cityName?: string | null): string {
  if (!cityName) return '';
  const trimmed = cityName.trim();
  if (/^bengaluru$/i.test(trimmed)) return 'Bangalore';
  if (/^new delhi$/i.test(trimmed)) return 'Delhi';
  return trimmed;
}

/**
 * Normalizes mode string to 'online' | 'in-person' | 'hybrid'
 */
export function normalizeMode(modeStr?: string | null): 'online' | 'in-person' | 'hybrid' {
  const lower = (modeStr || '').toLowerCase();
  if (lower.includes('person') || lower.includes('offline') || lower.includes('on-site')) {
    return 'in-person';
  }
  if (lower.includes('hybrid')) {
    return 'hybrid';
  }
  return 'online';
}

/**
 * Formats mode and location for display in UI or Telegram:
 * e.g. "📍 Mode: In-Person, Bangalore (India)" or "🌐 Mode: Online"
 */
export function formatModeWithLocation(hackathon: {
  mode?: string;
  location_type?: string;
  city?: string;
  country?: string;
  location?: string;
}): {
  label: string;
  telegramText: string;
  isOnline: boolean;
} {
  const mode = normalizeMode(hackathon.mode || hackathon.location_type);
  const city = normalizeCity(hackathon.city);
  const country = hackathon.country?.trim() || '';

  if (mode === 'online') {
    return {
      label: 'Online (Worldwide)',
      telegramText: '🌐 *Mode:* Online',
      isOnline: true,
    };
  }

  const locParts: string[] = [];
  if (city) locParts.push(city);
  if (country) locParts.push(city ? `(${country})` : country);

  const locString = locParts.length > 0 ? locParts.join(' ') : hackathon.location || 'In-Person';

  if (mode === 'hybrid') {
    return {
      label: `Hybrid • ${locString}`,
      telegramText: `🌐📍 *Mode:* Hybrid, ${locString}`,
      isOnline: false,
    };
  }

  return {
    label: `In-Person • ${locString}`,
    telegramText: `📍 *Mode:* In-Person, ${locString}`,
    isOnline: false,
  };
}
