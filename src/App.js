import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [quote, setQuote] = useState({
    citation: "",
    auteur: "",
    date_creation: "",
  });
  const [dailyQuote, setDailyQuote] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState(".");

  const fetchDailyQuote = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "https://qotd-api.herokuapp.com/api/daily_quote"
      );
      setQuote(response.data);
      setDailyQuote(response.data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la citation du jour:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRandomQuote = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "https://qotd-api.herokuapp.com/api/random_quote"
      );
      setQuote(response.data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la citation aléatoire:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyQuote();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText((prevLoadingText) => {
        if (prevLoadingText === ".") {
          return "..";
        } else {
          return ".";
        }
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const isNotDailyQuote = quote.id !== dailyQuote.id;

  function getYear(dateString) {
    const date = new Date(dateString);
    return date.getFullYear();
  }

  return (
    <div className="App">
      <header className="App-header">
        <br />
        <br />
        <br />
        <br />
        <br />
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
            <p>{getYear(quote.date_creation)}</p>
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
