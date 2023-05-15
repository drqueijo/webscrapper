import country from "./utils/countries"
import { ScriptTypes } from "./utils/enums"

const {name, code} = country.GB

export const COUNTRY_NAME = name
export const COUNTRY_CODE = code
export const NUMBER_OF_PAGES = 1060
export const DEFAULT_URL = "https://slotcatalog.com/en/The-Best-Slots?typ=2#anchorFltrList"
export const SCRIPT_TYPE: ScriptTypes = ScriptTypes.GAMEINFO
export const TABLE_NAME = SCRIPT_TYPE + '_' + (COUNTRY_NAME.replaceAll(' ', ''))


