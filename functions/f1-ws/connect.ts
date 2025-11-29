export async function onRequest(context: any) {
  const url = new URL(context.request.url);
  
  // Construct the target URL
  // Replace /f1-ws with /signalr and point to the F1 server
  const targetUrl = new URL(
    url.pathname.replace(/^\/f1-ws/, '/signalr'),
    'https://livetiming.formula1.com'
  );
  
  // Copy search params
  url.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  // Create new headers
  const headers = new Headers(context.request.headers);
  headers.set('Origin', 'https://www.formula1.com');
  headers.set('Referer', 'https://www.formula1.com/');
  headers.set('Host', 'livetiming.formula1.com');
  
  // Create the proxy request
  const proxyRequest = new Request(targetUrl.toString(), {
    method: context.request.method,
    headers: headers,
    body: context.request.body,
    redirect: 'follow'
  });

  try {
    const response = await fetch(proxyRequest);
    
    // Recreate the response to ensure headers are passed correctly
    // especially Upgrade and Connection headers for WebSockets
    const responseHeaders = new Headers(response.headers);
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  } catch (e: any) {
    return new Response(`Error connecting to F1 server: ${e.message}`, { status: 500 });
  }
}
