import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_ACCOMMODATION_LENGTH, PICKUP_ZONES } from '../../lib/storePricing.js';

/**
 * @param {{ pickupZone: string, accommodation: string,
 *   onPickupZoneChange: (value: string) => void,
 *   onAccommodationChange: (value: string) => void }} props
 */
export default function PickupFields({ pickupZone, accommodation, onPickupZoneChange, onAccommodationChange }) {
  const { t } = useTranslation('store');
  const id = useId();

  return (
    <fieldset className="store-pickup-fields" aria-describedby={`${id}-hint`}>
      <legend>{t('pickup.title')}</legend>
      <p className="store-pickup-fields__hint" id={`${id}-hint`}>{t('pickup.hint')}</p>
      <label htmlFor={`${id}-zone`}>{t('pickup.zone_label')}</label>
      <select
        id={`${id}-zone`}
        name="pickupZone"
        value={pickupZone}
        required
        onChange={(event) => onPickupZoneChange(event.target.value)}
      >
        <option value="">{t('pickup.zone_placeholder')}</option>
        {PICKUP_ZONES.map((zone) => <option value={zone} key={zone}>{t(`pickup.zones.${zone}`)}</option>)}
      </select>
      <label htmlFor={`${id}-accommodation`}>{t('pickup.accommodation_label')}</label>
      <input
        id={`${id}-accommodation`}
        type="text"
        name="accommodation"
        value={accommodation}
        required
        maxLength={MAX_ACCOMMODATION_LENGTH}
        placeholder={t('pickup.accommodation_placeholder')}
        onChange={(event) => onAccommodationChange(event.target.value.replace(/\p{Cc}/gu, '').slice(0, MAX_ACCOMMODATION_LENGTH))}
      />
    </fieldset>
  );
}
