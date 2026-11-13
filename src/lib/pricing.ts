/**
 * Servicegebühr als Anteil am Mietpreis (0.08 = 8 %).
 * Bleibt 0, bis das Gebührenmodell verbindlich festgelegt ist – dann erscheint die Zeile automatisch in der Preisübersicht.
 */
export const SERVICE_FEE_RATE = 0;

export function rentalDays(from: Date, to: Date) {
  const hours = (to.getTime() - from.getTime()) / 36e5;
  return Math.max(1, Math.ceil(hours / 24));
}

export function quote(pricePerDay: number, from: Date, to: Date) {
  const days = rentalDays(from, to);
  const rent = days * pricePerDay;
  const service = SERVICE_FEE_RATE > 0 ? Math.round(rent * SERVICE_FEE_RATE * 20) / 20 : 0;
  return { days, rent, service, total: rent + service };
}
