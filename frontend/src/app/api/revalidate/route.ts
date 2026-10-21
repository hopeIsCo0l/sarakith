import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath, revalidateTag } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * On-demand cache invalidation for administrators.
 *
 * The caller must send the access token of a signed-in admin. The token is
 * verified against Supabase Auth and the public.is_admin() RLS helper before
 * any cache entry is dropped.
 */
export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured on this deployment.' },
      { status: 500 }
    );
  }

  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';

  if (!token) {
    return NextResponse.json({ error: 'Missing admin access token.' }, { status: 401 });
  }

  const adminClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error: userError,
  } = await adminClient.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 });
  }

  const { data: isAdmin, error: adminError } = await adminClient.rpc('is_admin');

  if (adminError) {
    return NextResponse.json(
      { error: 'Admin verification failed. Has the security migration been applied?' },
      { status: 500 }
    );
  }

  if (!isAdmin) {
    return NextResponse.json({ error: 'This account is not an administrator.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as { tags?: string[]; paths?: string[] };

  const tags = Array.isArray(body.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === 'string')
    : [];
  const paths = Array.isArray(body.paths)
    ? body.paths.filter((path): path is string => typeof path === 'string')
    : [];

  tags.forEach((tag) => revalidateTag(tag, { expire: 0 }));
  paths.forEach((path) => revalidatePath(path));

  return NextResponse.json({
    revalidated: { tags, paths },
    at: new Date().toISOString(),
  });
}
