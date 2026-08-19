import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';
import { dataset, projectId, apiVersion } from '@/sanity/env';

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) throw new Error('Missing slug parameter');

    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token: process.env.SANITY_WRITE_TOKEN,
    });

    // Find the document ID by slug
    const docId = await client.fetch<string>(
      '*[_type == "blogPost" && slug.current == $slug][0]._id',
      { slug }
    );
    if (!docId) throw new Error('Blog post not found');

    await client.patch(docId).inc({ viewCount: 1 }).commit();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update view count' }, { status: 400 });
  }
}
