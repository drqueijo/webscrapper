import start from "./scripts/rankingByCountry";
import { NUMBER_OF_PAGES, SCRIPT_TYPE } from "./config";

(async () => {
  if(SCRIPT_TYPE === 'ranking') await start(NUMBER_OF_PAGES)
})()
