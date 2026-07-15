// /src/pages/api/admin/newsletter/subscribers.ts
import type { APIRoute } from 'astro';
import { getSubscribers, deleteSubscriber } from '../../../lib/newsletter';

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const env = locals.env;
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('per_page') || '20');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const offset = (page - 1) * perPage;

    const subscribers = await getSubscribers(env, {
      status: status || undefined,
      search: search || undefined,
      limit: perPage,
      offset
    });

    // Get total count (simplified)
    const total = subscribers.length;

    return new Response(
      JSON.stringify({
        success: true,
        data: subscribers,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage)
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch subscribers' }),
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.env;
    const adminId = locals.user?.id;
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');

    if (!adminId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Subscriber ID required' }),
        { status: 400 }
      );
    }

    await deleteSubscriber(env, id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscriber deleted successfully'
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete subscriber' }),
      { status: 500 }
    );
  }
};