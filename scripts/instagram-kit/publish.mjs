// Publica o post do dia do kit semanal no Instagram e na Página do Facebook,
// pela Graph API da Meta (a mesma conta do Meta Business Suite):
//   - segunda: carrossel "Seguro em minutos" + Story
//   - quarta:  Reels + Story
//   - sexta:   carrossel "Carro da semana" + Story
// Lê o manifest.json da semana no Supabase Storage (gerado pelo build.mjs
// --upload). Se a semana ainda não tiver kit, gera e sobe na hora.
// Cada destino publicado fica registrado em published-<dia>.json: rodar de
// novo só tenta o que falhou, nunca repete um post.
//
// Variáveis: META_ACCESS_TOKEN (token de usuário do sistema do Business
// Manager, com instagram_basic, instagram_content_publish, pages_show_list,
// pages_read_engagement, pages_manage_posts e business_management);
// FB_PAGE_ID (Página do Facebook); IG_USER_ID (conta profissional do
// Instagram; se faltar, é descoberta pela Página); IG_LOCATION_ID (opcional);
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
//
// Uso: node scripts/instagram-kit/publish.mjs [--day mon|wed|fri] [--week AAAA-MM-DD] [--dry-run] [--force] [--check]

import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT, loadEnvLocal, weekMonday, iso, publicUrl, getJson, putJson } from "./storage.mjs";

const GRAPH = `https://graph.facebook.com/${process.env.GRAPH_API_VERSION || "v24.0"}`;
const DAYS = { 1: "mon", 3: "wed", 5: "fri" };

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith("--") ? next : true;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function graph(method, endpoint, params, token) {
  const url = new URL(endpoint.startsWith("http") ? endpoint : `${GRAPH}/${endpoint}`);
  const body = new URLSearchParams({ ...params, access_token: token });
  let res;
  if (method === "GET") {
    body.forEach((v, k) => url.searchParams.set(k, v));
    res = await fetch(url);
  } else {
    res = await fetch(url, { method, body });
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const e = json.error || {};
    throw new Error(`Graph ${method} ${endpoint}: ${e.message || res.status}${e.error_user_msg ? ` (${e.error_user_msg})` : ""}`);
  }
  return json;
}

// ---------- Instagram ----------

// O container precisa estar FINISHED antes do media_publish (vídeo leva
// alguns minutos para processar).
async function igWait(id, token, timeoutMs = 15 * 60 * 1000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { status_code: code, status } = await graph("GET", id, { fields: "status_code,status" }, token);
    if (code === "FINISHED") return;
    if (code === "ERROR" || code === "EXPIRED") throw new Error(`Container ${id}: ${status || code}`);
    await sleep(5000);
  }
  throw new Error(`Container ${id} não ficou pronto a tempo.`);
}

async function igCreate(params, ig, token) {
  const { id } = await graph("POST", `${ig}/media`, params, token);
  await igWait(id, token);
  return id;
}

async function igPublish(creationId, ig, token) {
  const { id } = await graph("POST", `${ig}/media_publish`, { creation_id: creationId }, token);
  return id;
}

// IG_LOCATION_ID (opcional): marca o local no post (ex.: Águas Claras),
// o que ajuda o post a aparecer para quem está na região.
const located = (params) => (process.env.IG_LOCATION_ID ? { ...params, location_id: process.env.IG_LOCATION_ID } : params);

async function igFeed(post, url, ig, token) {
  if (post.type === "reels") {
    const c = await igCreate(located({ media_type: "REELS", video_url: url(post.video), cover_url: url(post.cover), caption: post.caption, share_to_feed: "true" }), ig, token);
    return igPublish(c, ig, token);
  }
  const children = [];
  for (const m of post.media) children.push(await igCreate({ image_url: url(m), is_carousel_item: "true" }, ig, token));
  const c = await igCreate(located({ media_type: "CAROUSEL", children: children.join(","), caption: post.caption }), ig, token);
  return igPublish(c, ig, token);
}

async function igStory(post, url, ig, token) {
  const c = await igCreate({ media_type: "STORIES", image_url: url(post.story) }, ig, token);
  return igPublish(c, ig, token);
}

// ---------- Facebook (Página) ----------

async function pageToken(pageId, token) {
  // Com token de usuário do sistema, pega o token da Página; se o próprio
  // META_ACCESS_TOKEN já for de Página, usa ele.
  const res = await graph("GET", pageId, { fields: "access_token" }, token).catch(() => ({}));
  return res.access_token || token;
}

async function fbFeed(post, url, pageId, token) {
  if (post.type === "reels") {
    const { video_id: videoId } = await graph("POST", `${pageId}/video_reels`, { upload_phase: "start" }, token);
    const up = await fetch(`https://rupload.facebook.com/video-upload/${GRAPH.split("/").pop()}/${videoId}`, {
      method: "POST", headers: { Authorization: `OAuth ${token}`, file_url: url(post.video) },
    });
    if (!up.ok) throw new Error(`Upload do Reels no Facebook: ${up.status} ${await up.text()}`);
    await graph("POST", `${pageId}/video_reels`, { upload_phase: "finish", video_id: videoId, video_state: "PUBLISHED", description: post.caption }, token);
    return videoId;
  }
  const params = { message: post.caption };
  for (const [i, m] of post.media.entries()) {
    const { id } = await graph("POST", `${pageId}/photos`, { url: url(m), published: "false" }, token);
    params[`attached_media[${i}]`] = JSON.stringify({ media_fbid: id });
  }
  const { id } = await graph("POST", `${pageId}/feed`, params, token);
  return id;
}

async function fbStory(post, url, pageId, token) {
  const { id: photoId } = await graph("POST", `${pageId}/photos`, { url: url(post.story), published: "false" }, token);
  const { post_id: id } = await graph("POST", `${pageId}/photo_stories`, { photo_id: photoId }, token);
  return id;
}

// ---------- Execução ----------

async function loadManifest(week) {
  let manifest = await getJson(`${week}/manifest.json`);
  if (manifest) return manifest;
  console.log(`Semana ${week} sem kit no Storage: gerando agora.`);
  execFileSync(process.execPath, [path.join(ROOT, "scripts", "instagram-kit", "build.mjs"), "--week", week, "--upload"], { stdio: "inherit" });
  manifest = await getJson(`${week}/manifest.json`);
  if (!manifest) throw new Error("Kit gerado, mas o manifest.json não apareceu no Storage.");
  return manifest;
}

// --check: só lê (não publica). Confirma que o token enxerga a Página e o
// Instagram e tem as permissões de publicação.
const REQUIRED = ["instagram_basic", "instagram_content_publish", "pages_show_list", "pages_read_engagement", "pages_manage_posts"];

async function check() {
  const { META_ACCESS_TOKEN: token, FB_PAGE_ID: pageId } = process.env;
  if (!token) throw new Error("META_ACCESS_TOKEN não configurado.");
  if (!pageId) throw new Error("FB_PAGE_ID não configurado.");
  const problems = [];
  const perms = await graph("GET", "me/permissions", {}, token).catch((e) => ({ error: e.message }));
  if (perms.error) problems.push(`Não deu para ler as permissões do token: ${perms.error}`);
  else {
    const granted = new Set((perms.data || []).filter((p) => p.status === "granted").map((p) => p.permission));
    const missing = REQUIRED.filter((p) => !granted.has(p));
    console.log(`Permissões do token: ${[...granted].join(", ") || "nenhuma"}`);
    if (missing.length) problems.push(`Faltam permissões no token: ${missing.join(", ")}`);
  }
  const page = await graph("GET", pageId, { fields: "name,access_token,instagram_business_account{id,username,followers_count}" }, token)
    .catch((e) => ({ error: e.message }));
  if (page.error) problems.push(`Página ${pageId}: ${page.error}`);
  else {
    console.log(`Página: ${page.name} (${pageId}) · token da Página: ${page.access_token ? "ok" : "NÃO veio"}`);
    if (!page.access_token) problems.push("O usuário do sistema não recebeu acesso de conteúdo à Página.");
    const ig = page.instagram_business_account;
    if (ig) console.log(`Instagram: @${ig.username} (${ig.id}) · ${ig.followers_count} seguidores`);
    else problems.push("A Página não tem Instagram profissional ligado (ou o token não enxerga).");
  }
  if (problems.length) throw new Error(`Verificação falhou:\n- ${problems.join("\n- ")}`);
  console.log("✓ Tudo certo: o token consegue publicar no Instagram e na Página.");
}

async function main() {
  loadEnvLocal();
  if (arg("check")) return check();
  const today = new Date(Date.now() - 3 * 3600 * 1000); // Brasília
  const day = arg("day", DAYS[today.getUTCDay()]);
  if (!["mon", "wed", "fri"].includes(day)) {
    console.log("Hoje não é dia de post (segunda, quarta ou sexta). Nada a fazer.");
    return;
  }
  const week = iso(weekMonday(arg("week")));
  const manifest = await loadManifest(week);
  const post = manifest.posts[day];
  if (!post) throw new Error(`O kit de ${week} não tem post para ${day} (Reels gerado com --no-video?).`);

  const url = (key) => publicUrl(`${week}/${key}`);
  const markerKey = `${week}/published-${day}.json`;
  const done = (!arg("force") && (await getJson(markerKey))) || {};

  const { META_ACCESS_TOKEN: token, FB_PAGE_ID: pageId } = process.env;
  let ig = process.env.IG_USER_ID;
  // Sem IG_USER_ID, descobre a conta do Instagram ligada à Página.
  if (!ig && pageId && token) {
    const res = await graph("GET", pageId, { fields: "instagram_business_account" }, token).catch(() => ({}));
    ig = res.instagram_business_account?.id;
    if (ig) console.log(`Instagram ligado à Página: ${ig} (cadastre como IG_USER_ID para pular esta consulta).`);
  }
  // "Siga {{perfil}}" da legenda: o @ no Instagram, "a nossa página" no Facebook.
  let handle = "o nosso perfil";
  if (ig && token) {
    const res = await graph("GET", ig, { fields: "username" }, token).catch(() => ({}));
    if (res.username) handle = `@${res.username}`;
  }
  const igPost = { ...post, caption: post.caption.replaceAll("{{perfil}}", handle) };
  const fbPost = { ...post, caption: post.caption.replaceAll("{{perfil}}", "a nossa página") };

  const targets = [];
  if (ig) targets.push(["instagram-feed", (t) => igFeed(igPost, url, ig, t)], ["instagram-story", (t) => igStory(igPost, url, ig, t)]);
  if (pageId) targets.push(["facebook-feed", (t) => fbFeed(fbPost, url, pageId, t)], ["facebook-story", (t) => fbStory(fbPost, url, pageId, t)]);

  console.log(`Semana ${week} · ${day} · ${post.type} · ${targets.map(([n]) => n).join(", ") || "nenhum destino configurado"}`);
  if (arg("dry-run")) {
    console.log(JSON.stringify({ ...post, urls: [...(post.media || []), post.video, post.cover, post.story].filter(Boolean).map(url) }, null, 2));
    return;
  }
  if (!token) throw new Error("META_ACCESS_TOKEN não configurado.");
  if (!targets.length) throw new Error("Configure IG_USER_ID e/ou FB_PAGE_ID.");

  const fbToken = pageId ? await pageToken(pageId, token) : null;
  const failures = [];
  for (const [name, run] of targets) {
    if (done[name]) { console.log(`✓ ${name} já publicado (${done[name].id}), pulando.`); continue; }
    try {
      const id = await run(name.startsWith("facebook") ? fbToken : token);
      done[name] = { id, at: new Date().toISOString() };
      await putJson(markerKey, done);
      console.log(`✓ ${name} publicado: ${id}`);
    } catch (error) {
      failures.push(`${name}: ${error.message}`);
      console.error(`✗ ${name}: ${error.message}`);
    }
  }
  if (failures.length) throw new Error(`Falhou:\n${failures.join("\n")}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
