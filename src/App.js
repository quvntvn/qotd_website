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
  const [notifsEnabled, setNotifsEnabled] = useState(false);
  const notificationScheduled = useRef(false);

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

  const showQuoteNotification = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/daily_quote`);
      const year = data.date_creation
        ? new Date(data.date_creation).getFullYear()
        : "";
      const body = `${data.auteur}${year ? ` - ${year}` : ""}`;
      new Notification(data.citation, { body });
    } catch (err) {
      console.error("Erreur notification :", err);
    }
  };

  const scheduleDailyNotification = () => {
    if (notificationScheduled.current || Notification.permission !== "granted")
      return;
    const now = new Date();
    const next = new Date();
    next.setHours(10, 0, 0, 0);
    if (now >= next) next.setDate(next.getDate() + 1);
    const delay = next.getTime() - now.getTime();

    const trigger = async () => {
      await showQuoteNotification();
      setTimeout(trigger, 24 * 60 * 60 * 1000);
    };

    setTimeout(trigger, delay);
    notificationScheduled.current = true;
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("Notifications non supportées");
      return;
    }
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    if (permission === "granted") {
      setNotifsEnabled(true);
    }
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
    if (Notification.permission === "granted") {
      setNotifsEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (notifsEnabled) scheduleDailyNotification();
  }, [notifsEnabled]);

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
        {!notifsEnabled && (
          <>
            <br />
            <button onClick={requestNotificationPermission}>
              Activer les notifications quotidiennes
            </button>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
