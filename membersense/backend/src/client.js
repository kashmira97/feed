// client.js
const BASE_URL = "http://localhost:3000";

async function login(username, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error(`Login failed: ${res.status}`);
  }

  const data = await res.json();
  console.log("Login response:", data);
  return data.sessionId; // adjust if your API uses a different key
}

async function fetchMembers(sessionId) {
  const res = await fetch(`${BASE_URL}/api/members`, {
    headers: { Authorization: sessionId },
  });

  if (!res.ok) {
    throw new Error(`Fetch members failed: ${res.status}`);
  }

  const data = await res.json();
  console.log("Members:", data);
}

async function logout(sessionId) {
  const res = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { Authorization: sessionId },
  });

  console.log("Logout status:", res.status);
}

(async () => {
  try {
    const sessionId = await login("yourUser", "yourPass");

    await fetchMembers(sessionId);

    await logout(sessionId);
  } catch (err) {
    console.error(err);
  }
})();
