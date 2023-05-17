import startRankingScript from "./scripts/rankingByCountry";
import { NUMBER_OF_PAGES, SCRIPT_TYPE, TABLE_NAME } from "./config";
import { BrowserTypes, ScriptTypes } from "./utils/enums";
import { Builder, ThenableWebDriver, WebDriver } from "selenium-webdriver";
import startGameInfoScript from "./scripts/infoByGame";
import startAllRankingsScript from "./scripts/allCountriesRankings";
import { connection } from "./database";

export const getDriver = async (browser: BrowserTypes = BrowserTypes.CHROME): Promise<ThenableWebDriver | null> => {
  let BROWSERDRIVER: WebDriver | null = null
  try {
    BROWSERDRIVER = await new Builder().forBrowser(browser).build();
  } catch (e) {
    console.log('error getting driver')
    console.log(e)
  } finally {
    if(BROWSERDRIVER) console.log('driver started')
  }
  return BROWSERDRIVER
}

(async () => {
  if(SCRIPT_TYPE === ScriptTypes.RANKING) await startRankingScript(NUMBER_OF_PAGES, TABLE_NAME)
  if(SCRIPT_TYPE === ScriptTypes.GAMEINFO) await startGameInfoScript(NUMBER_OF_PAGES)
  if(SCRIPT_TYPE === ScriptTypes.ALLRANKINGS) await startAllRankingsScript(NUMBER_OF_PAGES)
})()
