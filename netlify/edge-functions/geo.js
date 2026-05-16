export default async (_request, context) => {
  const country = context?.geo?.country?.code || null;
  return new Response(JSON.stringify({ country }), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  });
};

export const config = { path: '/api/geo' };
