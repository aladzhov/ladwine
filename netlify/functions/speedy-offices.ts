// Netlify function to proxy Speedy API calls (keeps credentials server-side)
// Set SPEEDY_USERNAME and SPEEDY_PASSWORD in Netlify environment variables
// Makes two calls (BG + EN) and merges results so the client gets both languages.

export default async (req: Request) => {
  const username = process.env.SPEEDY_USERNAME || '1996450';
  const password = process.env.SPEEDY_PASSWORD || '8394984122';

  if (!username || !password) {
    return new Response(
      JSON.stringify({ error: 'Speedy API credentials not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const buildBody = (language: string) => JSON.stringify({
    userName: username,
    password: password,
    countryId: 100, // Bulgaria
    language,
  });

  try {
    const [bgResponse, enResponse] = await Promise.all([
      fetch('https://api.speedy.bg/v1/location/office/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: buildBody('BG'),
      }),
      fetch('https://api.speedy.bg/v1/location/office/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: buildBody('EN'),
      }),
    ]);

    if (!bgResponse.ok) {
      const errorText = await bgResponse.text();
      return new Response(
        JSON.stringify({ error: `Speedy API error: ${bgResponse.status}`, details: errorText }),
        { status: bgResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const bgData = await bgResponse.json();
    const enData = enResponse.ok ? await enResponse.json() : { offices: [] };

    // Build a lookup map of EN offices by id
    const enMap = new Map<number, any>();
    for (const office of (enData.offices || [])) {
      enMap.set(office.id, office);
    }

    // Merge: BG office is the base, EN fields are added alongside
    const merged = (bgData.offices || []).map((bgOffice: any) => {
      const enOffice = enMap.get(bgOffice.id);
      return {
        ...bgOffice,
        nameEn: enOffice.name,
        address: {
          ...bgOffice.address,
          siteNameEn: enOffice.address.siteName,
          fullAddressStringEn: enOffice.address?.fullAddressString
        },
      };
    });

    return new Response(JSON.stringify({ offices: merged }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch Speedy offices', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
