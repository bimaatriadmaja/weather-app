import React, { useState } from 'react';

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localTime, setLocalTime] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const API_KEY = '98740f4ebc0d63bc0f8ba70090e5a091';
  const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
  const GEOLOCATION_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid=${API_KEY}&units=metric`;

  const fetchWeather = async (url) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.cod === 200) {
        setWeatherData(data);
        updateLocalTime(data.timezone);
        setCity(data.name); // Set nama kota berdasarkan lokasi
      } else {
        setError('No data found');
        setWeatherData(null);
        setLocalTime('');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const updateLocalTime = (timezone) => {
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const localTime = new Date(utcTime + timezone * 1000);
    const formattedTime = localTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // Format 12 jam (AM/PM)
    });
    setLocalTime(formattedTime);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (city) {
      fetchWeather(API_URL);
    }
  };

  // Fungsi untuk mendapatkan cuaca berdasarkan lokasi pengguna
  const getWeatherByLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const url = GEOLOCATION_API_URL.replace('{lat}', latitude).replace('{lon}', longitude);
          fetchWeather(url);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Failed to get your location. Please enable location access.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  // Fungsi untuk membagikan cuaca ke WhatsApp
  const shareWeather = () => {
    if (weatherData) {
      const shareText = `Current weather in ${weatherData.name}: ${weatherData.main.temp}°C, ${weatherData.weather[0].description}. Check it out at https://website-saya.vercel.app!!`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      setError('No weather data to share.');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const getFormattedDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const today = new Date();
    const dayName = days[today.getDay()];
    const date = today.getDate();
    const monthName = months[today.getMonth()];
    const year = today.getFullYear();
    return `${dayName}, ${date} ${monthName} ${year}`;
  };

  const getWeatherIcon = (weatherCode) => {
    switch (weatherCode) {
      case '01d':
        return '☀️';
      case '01n':
        return '🌙';
      case '02d':
      case '02n':
        return '⛅';
      case '03d':
      case '03n':
        return '☁️';
      case '04d':
      case '04n':
        return '☁️☁️';
      case '09d':
      case '09n':
        return '🌧️';
      case '10d':
      case '10n':
        return '🌦️';
      case '11d':
      case '11n':
        return '⛈️';
      case '13d':
      case '13n':
        return '❄️';
      case '50d':
      case '50n':
        return '🌫️';
      default:
        return '🌈';
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-400 to-purple-500 text-gray-800'} flex items-center justify-center p-4`}>
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white/90'} backdrop-blur-md rounded-xl shadow-2xl w-full max-w-md p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center">Weather App</h1>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} hover:bg-gray-300 transition-colors`}
          >
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>
        <form onSubmit={handleSearch} className="mb-6">
          <div className={`flex items-center ${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg overflow-hidden shadow-sm`}>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
              className={`w-full p-3 ${darkMode ? 'bg-gray-700 text-white' : 'text-gray-700'} focus:outline-none`}
            />
            <button
              type="submit"
              className={`p-3 ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white hover:bg-blue-600 transition-colors`}
            >
              🔍
            </button>
          </div>
        </form>
        <button
          onClick={getWeatherByLocation}
          className={`w-full p-3 ${darkMode ? 'bg-purple-800' : 'bg-purple-500'} text-white rounded-lg hover:bg-purple-600 transition-colors mb-6`}
        >
          🌍 Get My Location Weather
        </button>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-red-500">{error}</p>
          </div>
        ) : weatherData ? (
          <div className="text-center">
            <div className="text-6xl mb-4">
              {getWeatherIcon(weatherData.weather[0].icon)}
            </div>
            <h2 className="text-2xl font-semibold">{weatherData.name}</h2>
            <p className="text-lg">{weatherData.weather[0].description}</p>
            <p className="text-5xl font-bold mt-4">
              {weatherData.main.temp}°C
            </p>
            <p className="mt-2">{getFormattedDate()}</p>
            <p className="mt-1">{localTime}</p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white/80'} rounded-lg p-4 shadow-sm`}>
                <p>Humidity</p>
                <p className="text-xl font-semibold">
                  {weatherData.main.humidity}%
                </p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white/80'} rounded-lg p-4 shadow-sm`}>
                <p>Wind</p>
                <p className="text-xl font-semibold">
                  {weatherData.wind.speed} m/s
                </p>
              </div>
            </div>
            <button
              onClick={shareWeather}
              className={`w-full p-3 ${darkMode ? 'bg-green-700' : 'bg-green-500'} text-white rounded-lg hover:bg-green-600 transition-colors mt-6`}
            >
              📤 Share Weather via WhatsApp
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p>Please enter a city name or use your location to get weather data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;