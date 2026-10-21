// Regras de IPVA por estado para o "custo em 5 anos" (levantamento de
// 21/10/2026). Cada estado diz a alíquota do carro comum e o tratamento dado
// a elétrico (BEV), híbrido plug-in (PHEV) e híbrido (HEV), ano a ano.
//
// `conf` diz de onde veio a regra: "oficial" quando lemos a lei ou a página da
// Sefaz; "imprensa" quando só achamos matérias (que muitas vezes divergem entre
// si). Por isso a página deixa a pessoa trocar a alíquota.
//
// rate(car, year, base) devolve a alíquota daquele exercício como fração
// (0.04 = 4%). `base` é o valor do carro usado no cálculo daquele ano.

const pct = (n) => n / 100;
const isElectrified = (car) => car.fuelType === "BEV" || car.fuelType === "PHEV" || car.fuelType === "HEV";

// Híbridos cujo motor a combustão aceita etanol: só eles entram na regra de SP
// (Lei 18.065/2024 exige motor "a etanol, alternativa ou exclusivamente").
export const ETHANOL_HYBRIDS = new Set([
  "byd-atto-2-gl", "byd-atto-2-gs", "byd-song-pro-dm-i-flex", "gwm-haval-h6-phev35",
  "toyota-corolla-hybrid", "toyota-corolla-cross-hybrid", "toyota-yaris-cross-hybrid",
]);

// faixas por potência (cv), da menor para a maior: [[limite, %], ..., [Infinity, %]]
const byPower = (bands) => (car) => pct(bands.find(([max]) => (car.powerCv || 0) <= max)[1]);
const flat = (n) => () => pct(n);

export const IPVA_STATES = [
  {
    uf: "AC", name: "Acre", conf: "imprensa", base: flat(2),
    rate: (car, year, base, std) => (isElectrified(car) ? 0 : std),
    summary: "Isenção para elétricos e híbridos; carro comum paga 2%.",
    source: "AutoPapo (jan/2026) e Vrum (jul/2026)",
  },
  {
    uf: "AL", name: "Alagoas", conf: "oficial", base: byPower([[80, 2.75], [160, 3], [Infinity, 3.25]]),
    rate: (car, year, base, std) => (car.fuelType === "BEV" ? pct(2) : car.fuelType === "PHEV" || car.fuelType === "HEV" ? pct(1.5) : std),
    summary: "Elétrico paga 2% e híbrido 1,5% (carro comum: 2,75% a 3,25% conforme a potência). A imprensa cita isenção no 1º ano, que não encontramos na Sefaz.",
    source: "Sefaz-AL, perguntas frequentes do IPVA (cálculo e alíquotas)",
    url: "https://www.sefaz.al.gov.br/nise/faq/ipva/473-3-calculo-e-aliquotas",
  },
  {
    uf: "AP", name: "Amapá", conf: "imprensa", base: flat(3),
    rate: (car, year, base, std) => (isElectrified(car) && year <= 2026 ? 0 : std),
    summary: "Isenção para elétricos e híbridos só até 31/12/2026; depois, 3% como carro comum.",
    source: "AutoPapo (jan/2026)",
  },
  {
    uf: "AM", name: "Amazonas", conf: "imprensa", base: flat(2),
    rate: (car, year, base, std) => (isElectrified(car) ? pct(1.5) : std),
    summary: "Elétrico e híbrido pagam 1,5% (carro comum acima de 1.000 cc: 2%), pela LC 280/2025.",
    source: "LC 280/2025, conforme levantamento do ValorFinal (set/2026)",
  },
  {
    uf: "BA", name: "Bahia", conf: "imprensa", base: flat(2.5),
    rate: (car, year, base, std) => (car.fuelType === "BEV" && base <= 300000 ? 0 : std),
    summary: "Isenção para 100% elétrico de até R$ 300 mil (pedido no portal ba.gov.br); híbrido paga 2,5%.",
    source: "Sefaz-BA, conforme COAD e imprensa",
  },
  {
    uf: "CE", name: "Ceará", conf: "imprensa", base: byPower([[100, 2.5], [180, 3], [Infinity, 3.5]]),
    rate: (car, year, base, std) => std,
    summary: "Sem benefício confirmado: 2,5% a 3,5% conforme a potência. Algumas fontes citam isenção ou 2% para elétricos; confirme na Sefaz-CE.",
    source: "Tabela de alíquotas da Sefaz-CE, conforme ValorFinal (set/2026)",
  },
  {
    uf: "DF", name: "Distrito Federal", conf: "imprensa", base: flat(3),
    rate: (car, year, base, std) => (isElectrified(car) ? 0 : std),
    summary: "Isenção para elétricos e híbridos comprados no DF; carro comum paga 3%.",
    source: "CNN Brasil e AutoPapo (2026)",
  },
  {
    uf: "ES", name: "Espírito Santo", conf: "imprensa", base: flat(2),
    rate: (car, year, base, std) => std,
    summary: "Sem benefício para elétricos: 2%.",
    source: "AutoPapo (jan/2026) e ValorFinal (set/2026)",
  },
  {
    uf: "GO", name: "Goiás", conf: "imprensa", base: byPower([[100, 3], [Infinity, 3.75]]),
    rate: (car, year, base, std) => std,
    summary: "Sem benefício para elétricos: 3% até 100 cv e 3,75% acima.",
    source: "Governo de Goiás (perguntas e respostas), conforme ValorFinal",
  },
  {
    uf: "MA", name: "Maranhão", conf: "imprensa", base: flat(2.5),
    rate: (car, year, base, std) => (car.fuelType === "BEV" ? 0 : std),
    summary: "Isenção para 100% elétrico comprado no Maranhão; híbrido paga 2,5%.",
    source: "AutoPapo (jan/2026) e Vrum (jul/2026)",
  },
  {
    uf: "MG", name: "Minas Gerais", conf: "imprensa", base: flat(4),
    rate: (car, year, base, std) => std,
    summary: "4%. O benefício mineiro vale só para eletrificados fabricados em Minas, e nenhum carro deste catálogo é.",
    source: "AutoPapo (jan/2026) e CNN Brasil",
  },
  {
    uf: "MS", name: "Mato Grosso do Sul", conf: "imprensa", base: flat(3),
    rate: (car, year, base, std, i) => (car.fuelType === "BEV" || car.fuelType === "PHEV" ? (i === 0 ? 0 : std * 0.3) : std),
    summary: "Elétrico e plug-in: isenção no 1º ano e desconto de 70% depois (paga 0,9%). Fontes divergem; confirme na Sefaz-MS.",
    source: "Vrum (jul/2026)",
  },
  {
    uf: "MT", name: "Mato Grosso", conf: "imprensa", base: flat(3),
    rate: (car, year, base, std) => std,
    summary: "Sem benefício para elétricos: 3% (acima de 1.000 cc). A base é a tabela de valor venal do próprio estado.",
    source: "Sefaz-MT, conforme ValorFinal (set/2026)",
  },
  {
    uf: "PA", name: "Pará", conf: "imprensa", base: flat(2.5),
    rate: (car, year, base, std) => (car.fuelType === "BEV" && base <= 150000 ? 0 : std),
    summary: "Isenção para 100% elétrico de até R$ 150 mil; os demais pagam 2,5%.",
    source: "AutoPapo (jan/2026)",
  },
  {
    uf: "PB", name: "Paraíba", conf: "imprensa", base: flat(2.5),
    rate: (car, year, base, std) => (car.fuelType === "BEV" ? 0 : std),
    summary: "Isenção para 100% elétrico; híbrido paga 2,5%.",
    source: "AutoPapo (jan/2026) e Vrum (jul/2026)",
  },
  {
    uf: "PE", name: "Pernambuco", conf: "imprensa", base: flat(2.4),
    rate: (car, year, base, std) => (car.fuelType === "BEV" ? 0 : std),
    summary: "Isenção para 100% elétrico; híbrido paga 2,4%.",
    source: "AutoPapo (jan/2026) e Diario de Pernambuco",
  },
  {
    uf: "PI", name: "Piauí", conf: "imprensa", base: () => null,
    rate: (car, year, base) => (car.fuelType === "BEV" ? pct(1) : base <= 150000 ? pct(2.5) : pct(3)),
    summary: "Elétrico paga 1%; os demais, 2,5% até R$ 150 mil e 3% acima (Lei 6.749/2015).",
    source: "AutoPapo (jan/2026) e Lei 6.749/2015, conforme ValorFinal",
  },
  {
    uf: "PR", name: "Paraná", conf: "imprensa", base: flat(1.9),
    rate: (car, year, base, std) => std,
    summary: "1,9% para todos desde 2026 (Lei 22.645/2025). Há guias citando isenção para elétricos, mas não achamos lei que a confirme.",
    source: "Lei 22.645/2025, conforme Tribuna PR e Bem Paraná",
  },
  {
    uf: "RJ", name: "Rio de Janeiro", conf: "imprensa", base: flat(4),
    rate: (car, year, base, std) => (car.fuelType === "BEV" ? pct(0.5) : car.fuelType === "PHEV" || car.fuelType === "HEV" ? pct(1.5) : std),
    summary: "Elétrico paga 0,5% e híbrido 1,5% (carro comum: 4%).",
    source: "Diário do Comércio e AutoPapo (2026)",
  },
  {
    uf: "RN", name: "Rio Grande do Norte", conf: "imprensa", base: flat(3),
    rate: (car, year, base, std) => (car.fuelType === "BEV" ? 0 : std),
    summary: "Isenção para 100% elétrico; híbrido paga 3%.",
    source: "AutoPapo (jan/2026)",
  },
  {
    uf: "RO", name: "Rondônia", conf: "imprensa", base: flat(3),
    rate: (car, year, base, std) => std,
    summary: "Sem benefício para elétricos: 3% (acima de 1.000 cc).",
    source: "Lei 950/2000 consolidada (Sefin-RO) e calculadoras de IPVA",
  },
  {
    uf: "RR", name: "Roraima", conf: "imprensa", base: flat(3),
    rate: (car, year, base, std) => std,
    summary: "Sem benefício para elétricos: 3%.",
    source: "AutoPapo (jan/2026) e ValorFinal (set/2026)",
  },
  {
    uf: "RS", name: "Rio Grande do Sul", conf: "imprensa", base: flat(3),
    rate: (car, year, base, std) => (car.fuelType === "BEV" ? 0 : std),
    summary: "Isenção para 100% elétrico (Lei 8.115/1985); híbrido paga 3%.",
    source: "AutoPapo (jan/2026) e PagBank (jun/2026)",
  },
  {
    uf: "SC", name: "Santa Catarina", conf: "imprensa", base: flat(2),
    rate: (car, year, base, std) => std,
    summary: "Sem benefício para elétricos: 2%.",
    source: "SEF-SC, conforme Legisweb e Econet (2026)",
  },
  {
    uf: "SE", name: "Sergipe", conf: "imprensa", base: () => null,
    rate: (car, year, base) => (base <= 120000 ? pct(2.5) : pct(3)),
    summary: "Sem benefício para elétricos: 2,5% até R$ 120 mil e 3% acima.",
    source: "Lei 7.655/2013, conforme ValorFinal (set/2026)",
  },
  {
    uf: "SP", name: "São Paulo", conf: "oficial", base: flat(4),
    rate: (car, year, base, std) => {
      // Lei 18.065/2024, art. 5º: híbrido com motor a etanol de até R$ 250 mil
      // (corrigido pelo IPCA: R$ 261.154,45 em 2026) é isento em 2025-2026 e
      // depois paga 1% (2027), 2% (2028), 3% (2029) e 4% (2030 em diante).
      if ((car.fuelType === "PHEV" || car.fuelType === "HEV") && ETHANOL_HYBRIDS.has(car.id) && (car.price || Infinity) <= 261154) {
        return year <= 2026 ? 0 : pct(Math.min(4, year - 2026));
      }
      return std;
    },
    summary: "Elétrico paga 4%, sem benefício. Híbrido a etanol (flex) de até R$ 261 mil: isento até 2026, depois 1% em 2027, 2% em 2028, 3% em 2029 e 4% a partir de 2030.",
    source: "Lei estadual 18.065/2024 (Alesp)",
    url: "https://www.al.sp.gov.br/repositorio/legislacao/lei/2024/lei-18065-18.12.2024.html",
  },
  {
    uf: "TO", name: "Tocantins", conf: "imprensa", base: byPower([[100, 2.5], [Infinity, 3.5]]),
    rate: (car, year, base, std) => {
      if (!isElectrified(car)) return std;
      if (year <= 2027) return 0;
      const cut = { 2028: 0.5, 2029: 0.4, 2030: 0.3 }[year] || 0;
      return std * (1 - cut);
    },
    summary: "Elétrico e híbrido comprados no Tocantins: isentos em 2026 e 2027, depois redução de 50% (2028), 40% (2029) e 30% (2030) (Lei 5.061/2026).",
    source: "Lei 5.061/2026, conforme Canal VE e Legisweb",
  },
];

export const IPVA_BY_UF = Object.fromEntries(IPVA_STATES.map((s) => [s.uf, s]));

// O valor usado no IPVA (FIPE ou tabela do estado) cai com o tempo. Sem dado
// confiável de desvalorização de elétricos no Brasil, usamos 10% ao ano como
// estimativa simples, a partir do preço de tabela.
export const IPVA_VALUE_DROP = 0.1;

// IPVA ano a ano. `override` (fração) substitui a regra do estado em todos os anos.
export function ipvaSchedule(car, uf, firstYear, years, override) {
  const st = IPVA_BY_UF[uf];
  if (!st || !car.price) return null;
  return Array.from({ length: years }, (_, i) => {
    const year = firstYear + i;
    const base = car.price * Math.pow(1 - IPVA_VALUE_DROP, i);
    const std = st.base(car);
    const rate = override != null ? override : st.rate(car, year, base, std, i);
    return { year, base, rate, value: base * rate };
  });
}
