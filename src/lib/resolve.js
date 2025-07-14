// export  const DATA_BASE = 'https://star-mods.github.io/assets/data/';
// export  const DATA_BASE = 'https://star-mods.github.io/assets/data/';
export  const DATA_BASE = './data/';

const _cache = new Map();     // Map<type:key, data>
const _promises = new Map();  // Map<type:key, Promise>


/**
 * Define how to resolve URL per type
 */
function resolveUrl(...keys) {


  if (keys[0] === "$"){
    return `${DATA_BASE}${keys[1]}.json`;
  }
  if( !keys[1]) {
    return `${DATA_BASE}${keys[0]}/index.json`;
  }
  switch (keys[1]) {
    case 'faction': {
      return `${DATA_BASE}${keys[0]}/race/${keys[2].toLowerCase()}.json`;
    }
    case 'unit': {
      return `${DATA_BASE}${keys[0]}/unit/${keys[2].toLowerCase()}.json`;
    }
    case 'upgrade': {
      return `${DATA_BASE}${keys[0]}/upgrade/${keys[2].toLowerCase()}.json`;
    }
    default: {
      throw new Error(`Unknown data type: ${keys[1]}`);
    }
  }
}

/**
 * General purpose data loader with caching and deduplication.
 * @param {'mod'|'faction'|'unit'|'upgrade'|'mods'} type
 * @param {string} key e.g. 'lotv', or 'lotv:terran', or 'lotv:marine'
 * @returns {Promise<object>} loaded JSON data
 */
export function loadData( ...keys) {

  let key = keys.join(":")
  keys = key.split(":")

  if (_cache.has(key)) {
    return Promise.resolve(_cache.get(key));
  }

  if (_promises.has(key)) {
    return _promises.get(key);
  }

  const url = resolveUrl( ...keys);

  const promise = fetch(url)
    .then(res => {
      if (!res.ok){
        console.log(`Failed to load data: ${key}`);
      }
      return res.json();
    })
    .then(json => {
      _cache.set(key, json);
      _promises.delete(key);
      return json;
    })
    .then(json =>{
      //unit loaded, lets cache its weapons
      if(["unit"].includes(keys[1])){
        json.$Weapons = json.Weapons
        delete json.Weapons
        if(json.$Weapons)for(let weapon of json.$Weapons){
          _cache.set(`${keys[0]}:weapon:${weapon.id}`,weapon)
        }
        if(json.$Behaviors)for(let behavior of json.$Behaviors){
          _cache.set(`${keys[0]}:behavior:${behavior.id}`,behavior)
        }
        if(json.$Abilities)for(let ability of json.$Abilities){
          _cache.set(`${keys[0]}:behavior:${ability.id}`,ability)
        }


        if(json.CardLayouts) {
          for (let cardID in json.CardLayouts) {
            let layoutButtons = json.CardLayouts[cardID]


            for (const lb of layoutButtons) {
              _cache.set(`${keys[0]}:button:${lb.id}`, {
                id: lb.id,
                Name: lb.Name,
                Icon: lb.Icon,
                Hotkey: lb.Hotkey,
                Tooltip: lb.Tooltip
              })
            }
          }
        }
      }
      //wait for race data to load
      if(["unit","ugrade"].includes(keys[1])){
        return loadData(keys[0],"faction", json.Race).then(() => json)
      }
      return json
    })
    .catch(err => {
      _promises.delete(key);
      throw err;
    });

  _promises.set(key, promise);
  return promise;
}

/**
 * Optional: clear cached data
 */
export function clearCache(type = null) {
  if (type) {
    for (const key of _cache.keys()) {
      if (key.startsWith(type + ':')) _cache.delete(key);
    }
  } else {
    _cache.clear();
  }
}
