import React, { useEffect, useState } from 'react';
import { Ticket, QrCode, User2, ChevronDown, ChevronUp } from 'lucide-react';
import config from '../config';
import { jwtDecode } from 'jwt-decode';

import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const OffersList = () => {
  const [offers, setOffers] = useState([]);
  const [expandedOfferId, setExpandedOfferId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';

  // Add useTranslation hook
  const { t } = useTranslation();

  useEffect(() => {
    // Get current user ID from JWT
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
      } catch (e) {
        console.error('Invalid token');
      }
    }
  }, []);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch(config.getApiUrl('offers'));
        const data = await res.json();

        if (data.success) {
          setOffers(data.offers);
        }
      } catch (err) {
        console.error('Error fetching offers:', err);
      }
    };

    const fetchRedemptions = async () => {
      if (!userId) return;
      try {
        const res = await fetch(config.getApiUrl(`redemptions/user/${userId}`));
        const data = await res.json();
        if (data.success) {
          setRedemptions(data.redemptions.map(r => r.offerId));
        }
      } catch (err) {
        console.error('Error fetching redemptions:', err);
      }
    };

    fetchOffers();
    fetchRedemptions();
  }, [userId]);

  const isRedeemed = (offerId) => redemptions.includes(offerId);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="space-y-4">
      {offers
        .filter((offer) => !isRedeemed(offer._id))
        .map((offer) => {
          const name = offer.name?.[preferredLanguage] || offer.name?.en || 'Unnamed';
          const description = offer.description?.[preferredLanguage] || offer.description?.en || '';
          const isExpanded = expandedOfferId === offer._id;

          return (
            <div
              key={offer._id}
              className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition relative"
            >
              <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => setExpandedOfferId(isExpanded ? null : offer._id)}>
                <div className="flex items-center space-x-2">
                {offer.image ? (
                    <img
                        src={offer.image}
                        alt={name}
                        className="h-10 w-10 rounded-full object-cover border border-gray-300"
                        onError={(e) => {
                        e.target.style.display = 'none';
                        }}
                    />
                    ) : (
                    <Ticket className="h-5 w-5 text-green-500" />
                    )}

                  <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
                </div>
                {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
              </div>
              <p className="text-sm text-gray-600 mb-2">{description}</p>

              {offer.partnerId && (
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <User2 className="w-4 h-4 mr-1" />
                  <span>{offer.partnerId.businessName || offer.partnerId.firstName || 'Business'}</span>
                </div>
              )}

              <p className="text-sm font-medium text-gray-900">💶 {offer.price?.toFixed(2)} €</p>

              {isExpanded && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{t('map.showThisCode', 'Show this QR code to redeem the offer')}</p>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${config.getApiUrl(`offers/redeem/${offer.qrCode}/${userId}`)}`}
                    alt="QR Code"
                    className="mx-auto rounded shadow"
                  />
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default OffersList;
