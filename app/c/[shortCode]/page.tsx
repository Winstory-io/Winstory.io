"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useActiveAccount } from 'thirdweb/react';

interface GeolocationData {
  countryCode?: string;
  countryName?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export default function ShortLinkRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const account = useActiveAccount();
  const shortCode = params.shortCode as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geolocation, setGeolocation] = useState<GeolocationData | null>(null);

  // Récupérer la géolocalisation
  useEffect(() => {
    const fetchGeolocation = async () => {
      try {
        // Utiliser un service de géolocalisation gratuit (ipapi.co, ip-api.com, etc.)
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          setGeolocation({
            countryCode: data.country_code,
            countryName: data.country_name,
            region: data.region,
            city: data.city,
            latitude: data.latitude,
            longitude: data.longitude
          });
        }
      } catch (err) {
        console.warn('Failed to fetch geolocation:', err);
        // Continuer sans géolocalisation
      }
    };

    fetchGeolocation();
  }, []);

  useEffect(() => {
    if (!shortCode) {
      setError('Invalid short code');
      setLoading(false);
      return;
    }

    // Récupérer le lien complet depuis l'API
    const fetchRedirect = async () => {
      try {
        const response = await fetch(`/api/campaigns/short-link/redirect?shortCode=${shortCode}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch redirect');
        }

        const data = await response.json();
        
        if (data.success && data.fullUrl) {
          // Tracker le clic avec toutes les métriques
          const referrer = typeof document !== 'undefined' ? document.referrer : null;
          
          await fetch(`/api/campaigns/short-link/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              shortCode,
              walletAddress: account?.address || null,
              geolocation,
              referrer
            })
          });

          // Rediriger vers l'URL complète
          // Extraire le campaignId de l'URL si présent
          const url = new URL(data.fullUrl);
          const campaignId = url.searchParams.get('campaignId');
          
          if (campaignId) {
            // Rediriger vers la page de completion avec le campaignId
            router.push(`/completion?campaignId=${campaignId}`);
          } else {
            // Fallback: rediriger vers l'URL complète
            window.location.href = data.fullUrl;
          }
        } else {
          throw new Error('Invalid redirect data');
        }
      } catch (err: any) {
        console.error('Error fetching redirect:', err);
        setError(err.message || 'Failed to redirect');
        setLoading(false);
      }
    };

    // Attendre un peu pour la géolocalisation, mais ne pas bloquer la redirection
    const timeout = setTimeout(() => {
      fetchRedirect();
    }, 500); // Attendre 500ms max pour la géolocalisation

    return () => clearTimeout(timeout);
  }, [shortCode, router, account, geolocation]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#000',
        color: '#00FF00',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
        <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
          Redirection en cours...
        </h1>
        <p style={{ fontSize: '16px', color: '#ccc' }}>
          Vous allez être redirigé vers la page de completion.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#000',
        color: '#FF0000',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>❌</div>
        <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
          Erreur de redirection
        </h1>
        <p style={{ fontSize: '16px', color: '#ccc', marginBottom: '24px' }}>
          {error}
        </p>
        <button
          onClick={() => router.push('/completion')}
          style={{
            background: '#00FF00',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Aller à la page de completion
        </button>
      </div>
    );
  }

  return null;
}

