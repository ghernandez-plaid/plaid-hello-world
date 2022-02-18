import Button from "plaid-threads/Button";
import CodeBlockHighlighted from "plaid-threads/CodeBlockHighlighted";
import React, { useState, useCallback } from "react";
import { usePlaidLink } from "react-plaid-link";
import * as api from "./api";

import "./App.scss";

function App() {
  const [token, setToken] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const createLinkToken = useCallback(async () => {
    const response = await fetch ("/api/create_link_token", {
      method: "GET",
    });
    const data = await response.json();
    const linkToken = data.link_token;
    setToken(linkToken);
    setLoading(false);
  }, []);

  const onSuccess = useCallback(async (publicToken, metadata) => {
    setLoading(true);
    await fetch("/api/exchange_public_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_token: publicToken }),
    });
    const response = await fetch("/api/data", {
      method: "GET",
    });
    const data = await response.json();
    setData(data);
    setLoading(false);
  }, []);

  // generate link token on app load
  React.useEffect(() => {
    createLinkToken();
  }, [createLinkToken]);

  const { open, ready } = usePlaidLink({
    token,
    onSuccess,
  });

  return (
    <div className="App">
      <h3>Plaid Hello World</h3>
      {loading && <div className="spinner"></div>}

      {!loading && data == null && (
        <Button onClick={() => open()} disabled={!ready}>
          Link account
        </Button>
      )}

      {!loading &&
        data != null &&
        Object.entries(data).map((entry, i) => (
          <CodeBlockHighlighted
            key={i}
            title={entry[0]}
            code={JSON.stringify(entry[1], null, 2)}
            lang="json"
            className="codeblock"
          />
        ))}
    </div>
  );
}

export default App;
