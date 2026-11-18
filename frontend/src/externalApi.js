const POPULAR_MAKES = [
  'Toyota', 'Nissan', 'Subaru', 'Mazda', 'Honda', 'Mitsubishi', 'Suzuki', 'Isuzu',
  'Ford', 'Volkswagen', 'Mercedes-Benz', 'BMW', 'Audi', 'Land Rover', 'Hyundai',
  'Kia', 'Peugeot', 'Lexus', 'Volvo', 'Jeep',
]

const API = 'https://vpic.nhtsa.dot.gov/api/vehicles'

let makesCache = null
const modelsCache = {}

function niceName(text) {
  return text
    .toLowerCase()
    .replace(/(^|[\s-])([a-z])/g, (all, before, letter) => before + letter.toUpperCase())
}

async function getJson(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4000)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error('bad answer')
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

export async function getMakes() {
  if (makesCache) return makesCache
  try {
    const data = await getJson(`${API}/GetMakesForVehicleType/car?format=json`)
    const found = new Set(data.Results.map((item) => niceName(item.MakeName)))
    const popular = POPULAR_MAKES.filter((make) => found.has(make))
    makesCache = popular.length > 5 ? popular : POPULAR_MAKES
  } catch {
    makesCache = POPULAR_MAKES
  }
  return makesCache
}

export async function getModels(make) {
  if (!make) return []
  const key = make.toLowerCase()
  if (modelsCache[key]) return modelsCache[key]
  try {
    const data = await getJson(`${API}/GetModelsForMake/${encodeURIComponent(make)}?format=json`)
    const names = [...new Set(data.Results.map((item) => item.Model_Name))].sort()
    modelsCache[key] = names
  } catch {
    modelsCache[key] = []
  }
  return modelsCache[key]
}
