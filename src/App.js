import React, { useState, useEffect } from "react";
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

  /* ---------------- effects ---------------- */
  useEffect(fetchDailyQuote, []);

  useEffect(() => {
    const interval = setInterval(
      () => setLoadingText((prev) => (prev.length === 1 ? ".." : ".")),
      150
    );
    return () => clearInterval(interval);
  }, []);

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
      </header>
    </div>
  );
}

export default App;
