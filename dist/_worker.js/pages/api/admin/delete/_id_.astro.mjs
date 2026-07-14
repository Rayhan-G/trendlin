globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

async function GET({ params }) {
  const { id } = params;
  return new Response(null, {
    status: 302,
    headers: {
      "Location": "/admin/dashboard?deleted=success"
    }
  });
}
async function DELETE({ params }) {
  const { id } = params;
  console.log(`🗑️ Deleting post ${id}`);
  return new Response(JSON.stringify({
    success: true,
    message: `Post ${id} deleted successfully`
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
async function POST({ params }) {
  const { id } = params;
  console.log(`🗑️ Deleting post ${id} via POST`);
  return new Response(JSON.stringify({
    success: true,
    message: `Post ${id} deleted successfully`,
    redirect: "/admin/dashboard?deleted=success"
  }), {
    headers: { "Content-Type": "application/json" }
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
