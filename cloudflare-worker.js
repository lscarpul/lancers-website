// ===================================================
// LANCERS BASEBALL - Cloudflare Worker: Groq API Proxy
// ===================================================
// 1. Vai su https://workers.cloudflare.com/ e crea un account gratuito
// 2. Crea un nuovo Worker, incolla tutto questo codice
// 3. Nella tab "Settings" > "Variables" > "Secrets" aggiungi:
//    Nome: GROQ_API_KEY  |  Valore: (la tua chiave gsk_...)
// 4. Copia l'URL del Worker (es: https://groq-proxy.tuonome.workers.dev)
// 5. Incollalo nella variabile PROXY_URL in area-personale.html
// ===================================================

export default {
  async fetch(request, env) {

    // Gestisci preflight CORS (richieste OPTIONS del browser)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const body = await request.json();

      // Chiama Groq con la chiave salvata nei Secrets del Worker (non nel codice)
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await groqResponse.json();

      return new Response(JSON.stringify(data), {
        status: groqResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  }
};
