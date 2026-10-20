// Logs one line per request to the site: method, path, status, time taken, and where it came from.
// Read them in the Netlify dashboard under Logs > Edge Functions > request-log.
// Visitor IP addresses are deliberately not logged; the country and city come from Netlify's geolocation.
export default async (request, context) => {
  const start = Date.now();
  const response = await context.next();
  const url = new URL(request.url);
  const header = name => request.headers.get(name) || undefined;
  console.log(JSON.stringify({
    method: request.method,
    path: url.pathname + url.search,
    status: response.status,
    ms: Date.now() - start,
    range: header('range'), // audio players seek with Range requests
    referer: header('referer'),
    country: context.geo?.country?.code,
    city: context.geo?.city,
    ua: header('user-agent'),
  }));
  return response;
};

export const config = { path: '/*' };
