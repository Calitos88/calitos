import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { MapPin, Navigation, Clock, ShoppingCart, LogIn, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, trackConversion, ConversionType, login } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const BUSINESS_LOCATION = {
  lat: 10.4721, // Approximate for Kakuri, Kaduna
  lng: 7.4243,
  address: "PrimeLink Business Hub Ltd, B15 Rigachukwa Rd, off Ahmadu Bello Way, Kakuri, Kaduna 800283, Kaduna",
  name: "PrimeLink Business Hub Ltd"
};

export default function App() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    
    if (!apiKey) {
      setMapError("Google Maps API Key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your project secrets.");
      return;
    }

    setOptions({
      key: apiKey,
      libraries: ["places"]
    });

    const initMap = async () => {
      try {
        const { Map, InfoWindow } = await importLibrary('maps') as google.maps.MapsLibrary;
        const { Marker } = await importLibrary('marker') as google.maps.MarkerLibrary;

        if (mapRef.current) {
          const newMap = new Map(mapRef.current, {
            center: BUSINESS_LOCATION,
            zoom: 15,
            mapId: "DEMO_MAP_ID",
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          });

          const marker = new Marker({
            position: BUSINESS_LOCATION,
            map: newMap,
            title: BUSINESS_LOCATION.name,
          });

          const infoWindow = new InfoWindow({
            content: `
              <div style="padding: 8px; color: #1a1a1a;">
                <h3 style="margin: 0 0 4px 0; font-weight: 600;">${BUSINESS_LOCATION.name}</h3>
                <p style="margin: 0; font-size: 12px; opacity: 0.8;">${BUSINESS_LOCATION.address}</p>
              </div>
            `
          });

          marker.addListener("click", () => {
            infoWindow.open(newMap, marker);
            trackConversion(ConversionType.MAP_CLICK);
          });

          setMap(newMap);
        }
      } catch (e) {
        console.error("Error loading Google Maps:", e);
        setMapError(
          "The 'Maps JavaScript API' is not enabled for your API key. " +
          "Please enable it in the Google Cloud Console to display the map."
        );
      }
    };

    initMap();
  }, []);

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(BUSINESS_LOCATION.address)}`;
    window.open(url, '_blank');
    trackConversion(ConversionType.DIRECTIONS_REQUEST);
  };

  const handleCheckHours = () => {
    trackConversion(ConversionType.HOURS_CHECK);
    alert("Business Hours: Mon-Fri 8:00 AM - 6:00 PM, Sat 9:00 AM - 2:00 PM");
  };

  const handlePurchase = () => {
    trackConversion(ConversionType.PURCHASE_INITIATION);
    alert("Redirecting to our secure checkout portal...");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-[#1a1a1a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <MapPin size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-blue-900">PrimeLink <span className="text-gray-500 font-medium">Business Hub</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 bg-gray-100 px-3 py-1.5 rounded-full">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden">
                {user.photoURL ? <img src={user.photoURL} alt={user.displayName || ''} /> : <User size={18} />}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{user.displayName}</span>
            </div>
          ) : (
            <button 
              onClick={login}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <LogIn size={18} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Actions */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-3xl font-bold mb-4 leading-tight">Your Gateway to <span className="text-blue-600">Business Excellence</span></h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Visit us at our state-of-the-art facility in Kaduna. We provide premium workspace solutions, consulting, and networking opportunities for modern entrepreneurs.
            </p>

            <div className="space-y-4">
              <button 
                onClick={handleDirections}
                className="w-full flex items-center justify-between bg-blue-50 text-blue-700 p-5 rounded-2xl hover:bg-blue-100 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Navigation size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Get Directions</div>
                    <div className="text-xs opacity-70">Open in Google Maps</div>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">→</div>
              </button>

              <button 
                onClick={handleCheckHours}
                className="w-full flex items-center justify-between bg-emerald-50 text-emerald-700 p-5 rounded-2xl hover:bg-emerald-100 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Clock size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Check Hours</div>
                    <div className="text-xs opacity-70">View our schedule</div>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">→</div>
              </button>

              <button 
                onClick={handlePurchase}
                className="w-full flex items-center justify-between bg-orange-50 text-orange-700 p-5 rounded-2xl hover:bg-orange-100 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <ShoppingCart size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Book a Space</div>
                    <div className="text-xs opacity-70">Start your purchase</div>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">→</div>
              </button>
            </div>
          </section>

          <section className="bg-blue-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Need Help?</h3>
              <p className="text-blue-100 text-sm mb-6">Our support team is available 24/7 to assist you with your business needs.</p>
              <button className="bg-white text-blue-900 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                Contact Support
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-800 rounded-full opacity-50 blur-3xl"></div>
          </section>
        </div>

        {/* Right Column: Map */}
        <div className="lg:col-span-2 h-[600px] lg:h-auto min-h-[500px] relative">
          {mapError ? (
            <div className="w-full h-full rounded-3xl bg-red-50 border-4 border-red-100 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-bold text-red-900 mb-2">Map Loading Error</h3>
              <p className="text-red-700 max-w-md mb-6">{mapError}</p>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-200 text-left max-w-md mb-8">
                <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs">!</span>
                  How to fix this:
                </h4>
                <ol className="text-sm text-red-800 space-y-3 list-decimal pl-4">
                  <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline font-bold">Google Cloud Credentials</a></li>
                  <li>Click on your API key to edit it</li>
                  <li>Under <strong>"API restrictions"</strong>, ensure <strong>"Maps JavaScript API"</strong> is checked</li>
                  <li>Click <strong>Save</strong> and wait 3-5 minutes</li>
                  <li>Click the <strong>Retry</strong> button below</li>
                </ol>
              </div>

              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200"
              >
                Retry Loading Map
              </button>
            </div>
          ) : (
            <>
              <div 
                ref={mapRef} 
                className="w-full h-full rounded-3xl shadow-xl border-4 border-white overflow-hidden"
              />
              
              {/* Map Overlay Info */}
              <div className="absolute top-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20 hidden sm:flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-sm">PrimeLink Business Hub Ltd</div>
                    <div className="text-xs text-gray-500">B15 Rigachukwa Rd, Kaduna</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Open Now</span>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto p-6 mt-12 border-t border-gray-200 text-center">
        <p className="text-gray-500 text-sm">
          © 2026 PrimeLink Business Hub Ltd. All rights reserved. 
          <span className="mx-2">|</span>
          <a href="#" className="hover:text-blue-600">Privacy Policy</a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:text-blue-600">Terms of Service</a>
        </p>
      </footer>
    </div>
  );
}
