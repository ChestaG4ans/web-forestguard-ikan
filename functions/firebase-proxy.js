/**
 * Cloudflare Worker: Firebase RTDB Proxy
 * Mengatasi CORS issue antara Cloudflare Pages dan Firebase RTDB
 */

const FIREBASE_RTDB_URL = "https://fireforest-fc4ec-default-rtdb.asia-southeast1.firebasedatabase.app";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace('/api/', ''); // hapus /api/ prefix

  try {
    const response = await fetch(`${FIREBASE_RTDB_URL}/${path}.json`);

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Firebase error: ${response.status}` }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
