const progressBar = require('progress');

const country = {
  BR: {
    name: 'Brazil',
    code: 'BR'
  },
  CN: {
    name: 'China',
    code: 'CN'
  },
  USNJ: {
    name: 'US New Jersey',
    code: 'US-NJ'
  },
  GB: {
    name: 'United Kingdom',
    code: 'GB'
  },
}
const {name, code} = country.GB
export const COUNTRY_NAME = name
export const COUNTRY_CODE = code
export const NUMBER_OF_PAGES = 1060
export const DEFAULT_URL = "https://slotcatalog.com/en/The-Best-Slots?typ=2#anchorFltrList"
export const SCRIPT_TYPE = 'ranking'
export const TABLE_NAME = SCRIPT_TYPE + '_' + (COUNTRY_NAME.replaceAll(' ', ''))

export const ProgressBar = new progressBar('Scraping [:bar] :percent | :elapseds of :etas', {
  complete: '=',
  incomplete: ' ',
  width: 100,
  total: NUMBER_OF_PAGES
});