import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/instagram/callback`;

  if (!clientId) {
    return NextResponse.json({ error: 'Instagram Client ID is not configured' }, { status: 500 });
  }

  // Instagram Content Publishing requires Facebook Login to access the linked Instagram Professional Account
  const authUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('state', 'insta_auth');

  return NextResponse.redirect(authUrl.toString());
}
