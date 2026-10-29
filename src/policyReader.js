// ---------------------------------------------------------------------------
// Leitura de apólice anterior (PDF) para pré-preencher a cotação
// ---------------------------------------------------------------------------
// Tudo roda no navegador da pessoa: o PDF nunca é enviado ao servidor nem a
// terceiros. Só funciona com PDF que tem texto (o que as seguradoras mandam
// por e-mail); foto ou PDF escaneado não tem texto e cai no preenchimento
// manual. Cada seguradora formata a apólice de um jeito, então a extração é
// por rótulos comuns ("CPF", "Classe de bônus", "Vigência"...) e tudo que for
// lido é marcado na tela para a pessoa conferir antes de cotar.

// pdf.js é pesado (~1 MB): só carrega quando alguém envia um arquivo.
async function loadPdfJs() {
  const [pdfjs, worker] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  return pdfjs;
}

export class PolicyPasswordError extends Error {
  constructor(wrongPassword) {
    super(wrongPassword ? "Senha incorreta." : "Este PDF tem senha.");
    this.wrongPassword = wrongPassword;
  }
}

// Extrai o texto do PDF, uma linha por linha visual (pdf.js marca o fim de
// linha em hasEOL). Algumas seguradoras protegem a apólice com senha
// (geralmente os primeiros dígitos do CPF): sem ela, lança PolicyPasswordError.
export async function extractPdfText(file, password) {
  const pdfjs = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  let doc;
  try {
    doc = await pdfjs.getDocument({ data, password: password || undefined }).promise;
  } catch (err) {
    if (err?.name === "PasswordException") throw new PolicyPasswordError(Boolean(password));
    throw err;
  }
  const pages = [];
  for (let i = 1; i <= Math.min(doc.numPages, 15); i++) {
    const content = await (await doc.getPage(i)).getTextContent();
    pages.push(content.items.map((it) => (it.str || "") + (it.hasEOL ? "\n" : " ")).join(""));
  }
  await doc.destroy();
  return pages.join("\n");
}

// ---- utilitários ----------------------------------------------------------

const onlyDigits = (s) => (s || "").replace(/\D/g, "");

function isValidCpf(raw) {
  const d = onlyDigits(raw);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const calc = (len) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const rem = (sum * 10) % 11;
    return rem === 10 || rem === 11 ? 0 : rem;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

// "10/03/2026" → "2026-03-10" (ou null se não for data válida).
function brDateToIso(s) {
  const m = /(\d{2})[/.-](\d{2})[/.-](\d{4})/.exec(s || "");
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  if (Number(mm) < 1 || Number(mm) > 12 || Number(dd) < 1 || Number(dd) > 31) return null;
  return `${yyyy}-${mm}-${dd}`;
}

// Sem acento e em minúsculas, para comparar rótulos e nomes.
export function normalize(s) {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Valores que vêm logo depois de cada ocorrência de um rótulo, na mesma linha
// ("Profissão: Médico", ou separado por espaços numa tabela) ou na linha
// seguinte (rótulo em cima, valor embaixo). Rótulo no meio de uma frase
// ("Prezado segurado, ...") não conta. Devolve o primeiro que passa em `accept`.
function valueAfter(text, labelRe, accept = Boolean) {
  const re = new RegExp(`(?:${labelRe.source})(?:[ \\t]*:[ \\t]*|[ \\t]{2,}|[ \\t]*\\n[ \\t]*)([^\\n]*)`, "gi");
  let m;
  while ((m = re.exec(text))) {
    const value = m[1].trim();
    if (value && accept(value)) return value;
  }
  return null;
}

// Tabelas em colunas ("Segurado   Profissão" e, na linha de baixo,
// "MARIA DA SILVA   Engenheira") viram pares "rótulo: valor", colocados no
// começo do texto para terem prioridade sobre a leitura linha a linha.
function expandTables(text) {
  const lines = text.split("\n");
  const pairs = [];
  for (let i = 0; i < lines.length - 1; i++) {
    const labels = lines[i].trim().split(/\s{2,}/);
    const values = lines[i + 1].trim().split(/\s{2,}/);
    if (labels.length < 2 || labels.length !== values.length) continue;
    if (labels.some((l) => /\d|:/.test(l) || l.length > 40)) continue;
    labels.forEach((l, k) => pairs.push(`${l}: ${values[k]}`));
  }
  return pairs.length ? `${pairs.join("\n")}\n${text}` : text;
}

// Trecho de até `len` caracteres depois do rótulo (para achar datas/números
// próximos sem depender do layout exato).
function windowAfter(text, labelRe, len = 160) {
  const m = new RegExp(labelRe.source, "gi");
  const out = [];
  let hit;
  while ((hit = m.exec(text))) out.push(text.slice(hit.index, hit.index + len));
  return out;
}

// ---- seguradoras ----------------------------------------------------------

// Nomes como aparecem em apólices → chave do enum da Segfy. A Liberty virou
// Yelum em 2024; apólices novas trazem o nome novo.
const INSURER_ALIASES = [
  ["porto", /porto seguro/],
  ["azul", /azul (?:companhia de )?seguros/],
  ["itau", /itau seguros/],
  ["allianz", /allianz/],
  ["liberty", /liberty seguros|yelum/],
  ["bradesco", /bradesco (?:auto|seguros)/],
  ["suhai", /suhai/],
  ["hdi", /\bhdi\b/],
  ["tokio", /tokio marine/],
  ["mapfre", /mapfre/],
  ["sompo", /sompo/],
  ["zurich", /zurich/],
  ["mitsui", /mitsui sumitomo/],
  ["youse", /\byouse\b/],
  ["sura", /\bsura\b/],
  ["alfa", /alfa seguradora/],
  ["generali", /generali/],
  ["santander", /santander (?:auto|seguros)/],
  ["caixa", /caixa seguradora|caixa seguros/],
  ["sul_america_cia_nacional_auto", /sul ?america/],
];

// A seguradora emissora é a mais citada no documento (cabeçalho, rodapé,
// CNPJ, SAC...). Outra que aparece de passagem (ex.: banco do débito) perde.
function detectInsurer(norm) {
  let best = null;
  for (const [key, re] of INSURER_ALIASES) {
    const count = (norm.match(new RegExp(re.source, "g")) || []).length;
    if (count && (!best || count > best.count)) best = { key, count };
  }
  return best?.key || null;
}

// ---- extração ---------------------------------------------------------------

const SEX_MAP = [["female", /feminino/], ["male", /masculino/]];
const MARITAL_MAP = [
  ["married", /casad|uniao estavel|convivente/],
  ["divorced", /divorciad|separad/],
  ["widower", /viuv/],
  ["single", /solteir/],
];

function pick(map, value) {
  const n = normalize(value);
  return map.find(([, re]) => re.test(n))?.[0] || null;
}

// Devolve só o que foi encontrado; campos ausentes ficam de fora.
// `brands` = lista de marcas da Segfy ({ id, value, text }), para reconhecer a
// marca do veículo pelo nome.
export function parsePolicy(rawText, { brands = [] } = {}) {
  const out = {};
  const text = expandTables(rawText);
  const norm = normalize(text);

  // CPF: o primeiro CPF válido perto do rótulo; senão, o primeiro válido do
  // documento (CNPJ da seguradora e corretora tem 14 dígitos e não casa).
  const cpfRe = /\d{3}\.?\d{3}\.?\d{3}-?\d{2}(?!\d)/g;
  const labeled = windowAfter(text, /\bCPF\b/, 60).map((w) => (w.match(cpfRe) || []).find(isValidCpf)).find(Boolean);
  const anyCpf = (text.match(cpfRe) || []).find(isValidCpf);
  if (labeled || anyCpf) out.cpf = onlyDigits(labeled || anyCpf);

  // Nome: depois de "Segurado" / "Nome do segurado". Só aceita algo com cara
  // de nome (2+ palavras, sem números).
  const cleanName = (v) => v.split(/\s{2,}|CPF|CNPJ/i)[0].trim();
  const looksLikeName = (v) => {
    const n = cleanName(v);
    return /^[A-Za-zÀ-ÿ' ]+$/.test(n) && n.split(/\s+/).length >= 2 && n.length <= 80;
  };
  const nameRaw = valueAfter(text, /(?:nome do segurado|segurado\(a\)|segurado|proponente)/, looksLikeName);
  const name = nameRaw && cleanName(nameRaw);
  if (name) {
    out.nome = name
      .replace(/\s+/g, " ")
      .toLowerCase()
      .replace(/(^|\s)\S/g, (c) => c.toUpperCase())
      .replace(/ (Da|De|Do|Das|Dos|E)(?= )/g, (w) => w.toLowerCase());
  }

  const birth = windowAfter(text, /data de nascimento|nascimento|dt\.? nasc/, 60).map(brDateToIso).find(Boolean);
  if (birth) out.nascimento = birth;

  const sex = valueAfter(text, /\bsexo\b/, (v) => pick(SEX_MAP, v));
  if (sex) out.sexo = pick(SEX_MAP, sex);

  const marital = valueAfter(text, /estado civil/, (v) => pick(MARITAL_MAP, v));
  if (marital) out.estadoCivil = pick(MARITAL_MAP, marital);

  const firstCell = (v) => v.split(/\s{2,}/)[0].trim();
  const profession = valueAfter(text, /profiss[aã]o|ocupa[cç][aã]o/, (v) => /^[A-Za-zÀ-ÿ/() .-]{3,60}$/.test(firstCell(v)));
  if (profession) out.profissao = firstCell(profession);

  const email = /[\w.+-]+@[\w-]+\.[\w.-]+/.exec(text)?.[0];
  if (email && !/seguro|seguradora|corretora|sac|atendimento|ouvidoria/i.test(email)) out.email = email.toLowerCase();

  // CEP: o de pernoite/risco é o que vale para o seguro; senão, o primeiro.
  const cepRe = /\d{5}-?\d{3}(?!\d)/;
  const cep =
    windowAfter(text, /cep de pernoite|cep pernoite|cep de risco|cep de circula[cç][aã]o/, 60).map((w) => cepRe.exec(w)?.[0]).find(Boolean) ||
    windowAfter(text, /\bCEP\b/, 30).map((w) => cepRe.exec(w)?.[0]).find(Boolean);
  if (cep) out.cep = onlyDigits(cep);

  // Veículo: código FIPE (6 dígitos + verificador) e ano modelo.
  const fipe = windowAfter(text, /fipe/, 60).map((w) => /\b(\d{6}-?\d)\b/.exec(w)?.[1]).find(Boolean);
  if (fipe) out.fipe = onlyDigits(fipe).replace(/(\d{6})(\d)/, "$1-$2");

  // Descrição do veículo ("BYD DOLPHIN 95 CV ELÉTRICO"), para achar o modelo
  // pelo nome quando a apólice não traz o FIPE (ou ele não está na Segfy).
  const vehicleRaw = valueAfter(
    text,
    /marca\s*\/\s*modelo|modelo do ve[ií]culo|ve[ií]culo segurado|descri[cç][aã]o do ve[ií]culo|ve[ií]culo|modelo/,
    (v) => /[A-Za-zÀ-ÿ]{3}/.test(firstCell(v)) && firstCell(v).length >= 5 && !/^(\d{4}|sim|n[aã]o)\b/i.test(v)
  );
  const modelo = vehicleRaw && firstCell(vehicleRaw)
    .split(/c[oó]d(?:igo|\.)?\s*fipe|\bfipe\b|\bano\b|\bplaca\b|\bchassi\b/i)[0]
    .replace(/^[^:]{1,25}:\s*/, "") // rótulo em cima e "Modelo: ..." embaixo
    .trim();
  if (modelo && modelo.length >= 3) out.modelo = modelo;

  const yearPair = /ano\s*(?:de\s*)?fab(?:rica[cç][aã]o)?\.?\s*\/\s*mod(?:elo)?\.?\s*:?\s*(\d{4})\s*\/\s*(\d{4})/i.exec(text);
  const modelYear = yearPair?.[2] || windowAfter(text, /ano\s*(?:do\s*)?modelo/, 30).map((w) => /\b(19|20)\d{2}\b/.exec(w)?.[0]).find(Boolean);
  if (modelYear) out.ano = modelYear;

  // Marca: a da lista da Segfy mais citada como palavra inteira (testando
  // também as partes de nomes compostos, ex.: "GM - Chevrolet").
  let bestBrand = null;
  for (const b of brands) {
    const names = new Set(
      [b.value, b.text].flatMap((s) => [s, ...String(s || "").split(/\s*[-/]\s*/)]).map((s) => normalize(s).trim()).filter((s) => s.length >= 2)
    );
    let count = 0;
    for (const name of names) {
      const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
      count = Math.max(count, (norm.match(re) || []).length);
    }
    if (count && (!bestBrand || count > bestBrand.count)) bestBrand = { id: b.id, count };
  }
  if (bestBrand) out.brandId = bestBrand.id;

  const alienated = valueAfter(text, /aliena[cç][aã]o fiduci[aá]ria|alienado|financiado/, (v) => /^(sim|n[aã]o)\b/i.test(v));
  if (alienated) out.financiado = /^sim/i.test(alienated) ? "sim" : "nao";

  // Seguro atual.
  const insurer = detectInsurer(norm);
  if (insurer) out.seguradoraAtual = insurer;

  // Fim de vigência: a data mais tarde do trecho "Vigência ... de X até Y".
  const validityDates = windowAfter(text, /vig[eê]ncia/, 160)
    .flatMap((w) => (w.match(/\d{2}[/.-]\d{2}[/.-]\d{4}/g) || []).map(brDateToIso))
    .filter(Boolean);
  if (validityDates.length) out.fimVigencia = validityDates.sort().at(-1);

  const bonus = windowAfter(text, /classe\s*(?:de\s*)?b[oô]nus|\bb[oô]nus\b/, 40)
    .map((w) => /(?:b[oô]nus)\s*(?:atual|do segurado)?\s*:?\s*(?:classe\s*)?(\d{1,2})\b/i.exec(w)?.[1])
    .find((c) => c != null && Number(c) <= 10);
  if (bonus != null) out.classeBonus = String(Number(bonus));

  if (out.seguradoraAtual || out.fimVigencia || out.classeBonus != null) out.temSeguro = "sim";

  return out;
}

// ---- modelo na lista da Segfy ----------------------------------------------

// Palavras que quase todo modelo tem e não ajudam a distinguir.
const MODEL_STOPWORDS = new Set([
  "eletrico", "hibrido", "flex", "gasolina", "diesel", "aut", "automatico", "mec", "manual", "cv", "16v", "8v",
  "4p", "5p", "turbo", "tb", "ev", "phev", "hev", "4x2", "4x4", "awd", "fwd",
]);

function modelTokens(s) {
  return normalize(s)
    .replace(/(\d)[.,](\d)/g, "$1$2")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2 && !MODEL_STOPWORDS.has(t));
}

// Escolhe o modelo da lista da Segfy (`models` de model-list) que corresponde
// ao veículo da apólice: pelo código FIPE, se houver; senão pelo nome, só
// quando um único modelo ganha com folga (2+ palavras em comum, ou é o único
// com alguma). Na dúvida devolve null e a pessoa escolhe na lista.
export function matchModel(models, { fipe, modelo } = {}) {
  if (fipe) {
    const byFipe = models.find((m) => m.data_fipe?.fipe_code === fipe);
    if (byFipe) return byFipe;
  }
  if (!modelo) return null;
  const wanted = new Set(modelTokens(modelo));
  const scored = models
    .map((m) => ({ m, score: modelTokens(String(m.text || "").replace(/\s-\s[\d-]+$/, "")).filter((t) => wanted.has(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!scored.length) return null;
  const [best, second] = scored;
  if (scored.length === 1 || (best.score >= 2 && best.score > second.score)) return best.m;
  return null;
}

