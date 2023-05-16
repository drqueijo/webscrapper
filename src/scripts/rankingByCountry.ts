import { Builder, By, Key, until, ThenableWebDriver, WebDriver } from 'selenium-webdriver';
const { Select } = require('selenium-webdriver')
import { COUNTRY_CODE, DEFAULT_URL, TABLE_NAME } from "../config";
import { ProgressBar } from '../utils/progressBar'
import { connection } from "../database";
import { getDriver } from '..';
import { BrowserTypes } from '../utils/enums';

export const createTableIfNotExists = (tableName: string) => {
  const sql = `CREATE TABLE IF NOT EXISTS ${tableName.replaceAll(' ', '_')} (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ranking VARCHAR(255) NOT NULL
  );`;

  connection.query(sql, (error) => {
    if (error) throw error;
    console.log(`Table ${tableName} created or already exists.`);
  });
};

const getRankingByName = async (driver: WebDriver): Promise<void> => {
  let gamesNames = await driver.findElements(By.className('providerName'));
  let gameRankings = await driver.findElements(By.className('widgetSRBIG-small-pr'));
  for (let i = 0; i < gamesNames.length; i++) {
    let gameName = await gamesNames[i].getText();
    let gameRanking = await gameRankings[i].getText();
    const query = `INSERT INTO ${TABLE_NAME} (name, ranking) VALUES (?, ?)`;
    connection.query(query, [gameName, gameRanking], (error, results, fields) => {
      if (error) throw error;
    });

  }
}

const navigate = async (driver: WebDriver, page: number): Promise<void> => {
  let navpagCont = await driver.findElement(By.className("navpag-cont"));
  let liElements = await navpagCont.findElements(By.tagName("li"));

  let activeLi = await navpagCont.findElement(By.css("li.active"));

  let nextLi = await activeLi.findElement(By.xpath("following-sibling::li[1]"));

  let link = await nextLi.findElement(By.tagName("a"));
  await driver.executeScript(await link.getAttribute("onclick"));

  await driver.wait(until.stalenessOf(link));
  await driver.wait(until.urlContains('#anchorFltrList'));

  await driver.wait(async () => {
    const readyState = await driver.executeScript('return document.readyState;');
    return readyState === 'complete';
  });
};

const selectCountry = async (driver: WebDriver, country: string): Promise<void> => {
  let filter = await driver.findElement(By.id('aFltrBtnModal'))
  await driver.executeScript(await filter.getAttribute("onclick"));
  let select = await driver.findElement(By.name('cISO'));
  let selectOption = await new Select(select).selectByValue(country)
  let divFilter = await driver.findElement(By.className('battonFiltrMenuShow'));
  let linkFilter = await divFilter.findElement(By.tagName("a"));
  await driver.executeScript(await linkFilter.getAttribute("onclick"));
  await driver.wait(until.stalenessOf(linkFilter));
  await driver.wait(async () => {
    const readyState = await driver.executeScript('return document.readyState;');
    return readyState === 'complete';
  });
}

export default async function startRankingScript(numberOfPages: number, tableName: string, country: string = COUNTRY_CODE) {
    createTableIfNotExists(tableName)
    const driver = await getDriver(BrowserTypes.CHROME)
    if(!driver) return
    try {
      await driver.get(DEFAULT_URL);
      await selectCountry(driver, country)

      for (let i = 0; i < numberOfPages; i++) {
        if(i !== 0) await navigate(driver, i + 1)
        await getRankingByName(driver)
        ProgressBar.tick();
      }

    } catch (e) {
      console.log('Error in script ---- ', e)
    }
    finally {
      await driver.quit();
      console.log('Scrapping finished in ' + COUNTRY_CODE)
    }
};


