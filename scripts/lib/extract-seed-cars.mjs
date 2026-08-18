// Extrai o array SEED_CARS de dentro de src/App.jsx sem precisar de um
// bundler — o trecho entre os dois marcadores abaixo é JS puro (sem JSX,
// sem imports), então dá pra rodar isolado numa sandbox do Node. Usado
// tanto pra gerar o SQL de sincronização manual quanto pelo script que
// sincroniza direto com o Supabase.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function extractSeedCars() {
  const appPath = path.join(__dirname, "..", "..", "src", "App.jsx");
  const src = fs.readFileSync(appPath, "utf8");

  const startMarker = "function custoScore(price) {";
  const endMarker = "const SEED_CARS = [...SEED_CARS_DETAILED, ...BULK_CARS];";
  const startIdx = src.indexOf(startMarker);
  const endIdx = src.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error("Não achei os marcadores esperados em App.jsx — o arquivo mudou de estrutura?");
  }

  // `const`/`let` de nível superior não viram propriedade do sandbox no vm
  // do Node — só existem dentro do próprio script. Por isso anexamos essa
  // linha extra pra conseguir ler o resultado depois de rodar.
  const dataBlock = src.slice(startIdx, endIdx + endMarker.length) + "\nglobalThis.__EXTRACTED_CARS__ = SEED_CARS;";

  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(dataBlock, sandbox);
  const cars = sandbox.__EXTRACTED_CARS__;

  if (!Array.isArray(cars) || cars.length === 0) {
    throw new Error("SEED_CARS veio vazio — algo deu errado na extração.");
  }
  return cars;
}

// Mapeia um carro no formato usado em App.jsx (camelCase) pro formato de
// colunas da tabela `cars` no Supabase (snake_case).
export function carToRow(c) {
  return {
    id: c.id,
    name: c.name,
    brand: c.brand,
    category: c.category,
    price: c.price ?? null,
    power_cv: c.powerCv ?? null,
    torque_nm: c.torqueNm ?? null,
    battery_kwh: c.batteryKwh ?? null,
    battery_chem: c.batteryChem ?? null,
    motor_type: c.motorType ?? null,
    range_km: c.rangeKm ?? null,
    accel: c.accel ?? null,
    ground_clearance: c.groundClearance ?? null,
    trunk_l: c.trunkL ?? null,
    weight_kg: c.weightKg ?? null,
    wallbox: c.wallbox ?? null,
    ac_kw: c.acKw ?? null,
    dc_kw: c.dcKw ?? null,
    airbags: c.airbags ?? null,
    warranty: c.warranty ?? null,
    fuel_type: c.fuelType,
    verified: c.verified ?? null,
    price_verified_date: c.priceVerifiedDate ?? null,
    maintenance_interval: c.maintenanceInterval ?? null,
    maintenance_first_cost: c.maintenanceFirstCost ?? null,
    maintenance_km_base: c.maintenanceKmBase ?? null,
    maintenance_total_cost: c.maintenanceTotalCost ?? null,
    consumption_kwh_100: c.consumptionKwh100 ?? null,
    tech_notes: c.techNotes ?? null,
    image_url: c.imageUrl ?? null,
    video_url: c.videoUrl ?? null,
    personas: c.personas ?? null,
  };
}
