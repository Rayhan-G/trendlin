globalThis.process ??= {}; globalThis.process.env ??= {};
import { d as defineMiddleware, s as sequence } from './chunks/render-context_Cr5-KhtI.mjs';
import { g as getCurrentUser } from './chunks/auth_Db9O8NHf.mjs';
import './chunks/astro-designed-error-pages_PWd5Th_x.mjs';
import './chunks/astro/server_DVHrQl8d.mjs';

const onRequest$2 = defineMiddleware(async (context, next) => {
  const { request, locals, redirect } = context;
  const url = new URL(request.url);
  const publicPaths = ["/admin/login", "/api/auth/login", "/api/auth/logout", "/_astro", "/favicon.ico"];
  if (publicPaths.some((path) => url.pathname.startsWith(path)) || url.pathname === "/admin/") {
    return next();
  }
  if (url.pathname.startsWith("/admin")) {
    const { DB } = locals.runtime.env;
    const user = await getCurrentUser(request, DB);
    if (!user) {
      return redirect("/admin/login?error=Please login first");
    }
    locals.user = user;
  }
  return next();
});

const onRequest$1 = (context, next) => {
  if (context.isPrerendered) {
    context.locals.runtime ??= {
      env: process.env
    };
  }
  return next();
};

const onRequest = sequence(
	onRequest$1,
	onRequest$2
	
);

export { onRequest };
