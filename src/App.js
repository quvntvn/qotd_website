import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "https://qotd-api-ne8l.onrender.com/api";

function App() {
  const [quote, setQuote] = useState({
    citation: "",
    auteur: "",
    date_creation: null,
  });
  const [dailyQuote, setDailyQuote] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState(".");
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("notifyDailyQuote") === "true"
  );
  const notificationTimer = useRef({ timeoutId: null, intervalId: null });

  /* ---------------- helpers ---------------- */
  const fetchQuote = async (endpoint, rememberAsDaily = false) => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${API_BASE}${endpoint}`);
      setQuote(data);
      if (rememberAsDaily) setDailyQuote(data);
    } catch (err) {
      console.error("Erreur de récupération :", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailyQuote = () => fetchQuote("/daily_quote", true);
  const fetchRandomQuote = () => fetchQuote("/random_quote");

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).getFullYear() : "Date inconnue";

  const scheduleNotifications = () => {
    const showNotification = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/daily_quote`);
        const year = formatDate(data.date_creation);
        const body = `${data.citation}\n${data.auteur}${year !== "Date inconnue" ? `\n${year}` : ""}`;
        new Notification("Citation du jour", { body });
      } catch (err) {
        console.error("Erreur de notification :", err);
      }
    };

    const computeDelay = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(10, 0, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      return target - now;
    };

    notificationTimer.current.timeoutId = setTimeout(() => {
      showNotification();
      notificationTimer.current.intervalId = setInterval(
        showNotification,
        24 * 60 * 60 * 1000
      );
    }, computeDelay());
  };

  /* ---------------- effects ---------------- */
  useEffect(fetchDailyQuote, []);

  useEffect(() => {
    const interval = setInterval(
      () => setLoadingText((prev) => (prev.length === 1 ? ".." : ".")),
      150
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (notificationTimer.current.timeoutId) {
        clearTimeout(notificationTimer.current.timeoutId);
      }
      if (notificationTimer.current.intervalId) {
        clearInterval(notificationTimer.current.intervalId);
      }
    };
  }, []);

  useEffect(() => {
    if (notificationsEnabled && Notification.permission === "granted") {
      scheduleNotifications();
    }
  }, [notificationsEnabled]);

  const enableNotifications = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      localStorage.setItem("notifyDailyQuote", "true");
      setNotificationsEnabled(true);
      scheduleNotifications();
    }
  };

  /* ----------------------------------------- */
  const isNotDailyQuote = quote.id !== dailyQuote.id;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Citation du jour</h1>

        {isLoading ? (
          <>
            <p>{loadingText}</p>
            <p>{loadingText}</p>
            <p>{loadingText}</p>
          </>
        ) : (
          <>
            <p>{quote.citation}</p>
            <p>{quote.auteur}</p>
            <p>{formatDate(quote.date_creation)}</p>
          </>
        )}

        <br />
        <button onClick={fetchRandomQuote}>Voir une autre citation</button>
        <br />
        {isNotDailyQuote && (
          <button onClick={fetchDailyQuote}>Citation du jour</button>
        )}
        <br />
        {!notificationsEnabled && (
          <button onClick={enableNotifications}>
            Activer les notifications à 10h
          </button>
        )}
        {notificationsEnabled && (
          <p>Notifications activées</p>
        )}
      </header>
    </div>
  );
}

export default App;
