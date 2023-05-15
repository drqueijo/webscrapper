import startRankingScript from "./scripts/rankingByCountry";
import { NUMBER_OF_PAGES, SCRIPT_TYPE } from "./config";
import { BrowserTypes, ScriptTypes } from "./utils/enums";
import { Builder, ThenableWebDriver, WebDriver } from "selenium-webdriver";
import startGameInfoScript from "./scripts/infoByGame";

const getDriver = async (browser: BrowserTypes = BrowserTypes.CHROME): Promise<ThenableWebDriver | null> => {
  let BROWSERDRIVER: WebDriver | null = null
  try {
    BROWSERDRIVER = await new Builder().forBrowser(browser).build();
  } catch (e) {
    console.log(e)
  } finally {
    if(BROWSERDRIVER) console.log('driver started')
  }
  return BROWSERDRIVER
}

(async () => {

  const driver = await getDriver(BrowserTypes.CHROME)
  if(!driver) return console.log('error getting driver')

  if(SCRIPT_TYPE === ScriptTypes.RANKING) await startRankingScript(NUMBER_OF_PAGES, driver)
  if(SCRIPT_TYPE === ScriptTypes.GAMEINFO) await startGameInfoScript(NUMBER_OF_PAGES, driver)
})()
