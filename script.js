/* ================= CONFIG ================= */
const API_KEY = "81687KX5J0FKER5L"; // 👈 ADD KEY HERE
let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];



/* ================= SEARCH STOCK ================= */
async function searchStock() {
  const symbol = document.getElementById("symbolInput").value.trim().toUpperCase();
  const output = document.getElementById("stockCard");

  if (!symbol) {
    alert("Enter stock symbol");
    return;
  }

  output.innerHTML = "<p>⏳ Fetching data...</p>";

  try {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    const data = await res.json();
    const quote = data["Global Quote"];

    if (!quote || !quote["05. price"]) {
      throw new Error("Invalid symbol or API limit");
    }

    const price = parseFloat(quote["05. price"]);
    const change = parseFloat(quote["09. change"]);
    const percent = parseFloat(quote["10. change percent"]);

    const stock = {
      symbol: quote["01. symbol"],
      price: price.toFixed(2),
      change: change.toFixed(2),
      percent: percent.toFixed(2),
      sentiment: getSentiment(change)
    };
    currentSymbol = stock.symbol;
    renderStock(stock);

  } catch (err) {
    output.innerHTML = `<p style="color:red">⚠ Error fetching data</p>`;
    console.error(err.message);
  }
}

/* ================= SENTIMENT ================= */
function getSentiment(change) {
  if (change > 0) return "Bullish";
  if (change < 0) return "Bearish";
  return "Neutral";
}

function renderStock(stock) {
  const card = document.getElementById("stockCard");
  const changeClass = stock.change >= 0 ? "up" : "down";

  

  card.innerHTML = `
    <div class="stock-insight">
      <span class="symbol-chip">${stock.symbol}</span>
      <div class="price">$${stock.price}</div>
      <div class="change ${changeClass}">${stock.change} (${stock.percent}%)</div>
      <span class="sentiment ${stock.sentiment.toLowerCase()}">${stock.sentiment} Sentiment</span>
      <div class="divider"></div>
      <small class="ai-text ${stock.sentiment.toLowerCase()}">
  🧠 AI Insight: ${aiInsight(stock.sentiment)}
</small>
      <div style="margin-top:12px">
        <button class="add-watchlist-btn" onclick='addToWatchlist(${JSON.stringify(stock)})'>
          <span>⭐</span> Add to Watchlist
        </button>
      </div>
    </div>
  `;
}

/* ================= AI INSIGHT TEXT ================= */
function aiInsight(sentiment) {
  if (sentiment === "Bullish")
    return "Positive momentum with strong buying interest.";
  if (sentiment === "Bearish")
    return "Weak performance with selling pressure.";
  return "Stable movement with low volatility.";
}

/* ================= WATCHLIST ================= */
function addToWatchlist(stock) {
  if (watchlist.some(item => item.symbol === stock.symbol)) {
    alert("Already in watchlist");
    return;
  }
  watchlist.push(stock);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  renderWatchlist();
}

function removeFromWatchlist(symbol) {
  watchlist = watchlist.filter(item => item.symbol !== symbol);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  renderWatchlist();
}

function renderWatchlist() {
  const list = document.getElementById("watchlist");
  list.innerHTML = "";

  if (watchlist.length === 0) {
    list.innerHTML = "<p class='subtitle'>No stocks added</p>";
    return;
  }

  watchlist.forEach(item => {
    list.innerHTML += `
      <li class="watch-item">
        <span>${item.symbol}</span>
        <span>$${item.price}</span>
        <button onclick="removeFromWatchlist('${item.symbol}')">✖</button>
      </li>
    `;
  });
}

renderWatchlist();
