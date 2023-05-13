const { Builder, By, Key, until, Select  } = require('selenium-webdriver');
import { COUNTRY_CODE, DEFAULT_URL, NUMBER_OF_PAGES, ProgressBar, TABLE_NAME } from "../config";
import { connection, createTableIfNotExists } from "../database";

const getDriver = async (browser: 'chrome' | 'firefox' | 'edge'): Promise<any | null> => {
  let BROWSERDRIVER = null
  try {
    BROWSERDRIVER = await new Builder().forBrowser(browser).build();
  } catch (e) {
    console.log(e)
  } finally {
    if(BROWSERDRIVER) console.log('driver started')
  }
  return BROWSERDRIVER
}

const getRankingByName = async (driver: any) => {
  let gamesNames = await driver.findElements(By.className('providerName'));
  let gameRankings = await driver.findElements(By.className('widgetSRBIG-small-pr'));
  for (let i = 0; i < gamesNames.length; i++) {
    let gameName = await gamesNames[i].getText();
    let gameRanking = await gameRankings[i].getText();
    const query = `INSERT INTO ${TABLE_NAME} (name, ranking) VALUES (?, ?)`;
    connection.query(query, [gameName, gameRanking], (error: any, results: any, fields: any) => {
      if (error) throw error;
    });

  }
}

const navigate = async (driver: any, page: number) => {
  let navpagCont = await driver.findElement(By.className("navpag-cont"));
  let liElements = await navpagCont.findElements(By.tagName("li"));

  let activeLi = await navpagCont.findElement(By.css("li.active"));

  let nextLi = await activeLi.findElement(By.xpath("following-sibling::li[1]"));

  let link = await nextLi.findElement(By.tagName("a"));
  await driver.executeScript(link.getAttribute("onclick"));

  await driver.wait(until.stalenessOf(link));
  await driver.wait(until.urlContains('#anchorFltrList'));

  await driver.wait(async () => {
    const readyState = await driver.executeScript('return document.readyState;');
    return readyState === 'complete';
  });
};

const selectCountry = async (driver: any) => {
  let filter = await driver.findElement(By.id('aFltrBtnModal'))
  await driver.executeScript(filter.getAttribute("onclick"));
  let select = await driver.findElement(By.name('cISO'));
  let selectOption = await new Select(select).selectByValue(COUNTRY_CODE)
  let divFilter = await driver.findElement(By.className('battonFiltrMenuShow'));
  let linkFilter = await divFilter.findElement(By.tagName("a"));
  await driver.executeScript(linkFilter.getAttribute("onclick"));
  await driver.wait(until.stalenessOf(linkFilter));
  await driver.wait(async () => {
    const readyState = await driver.executeScript('return document.readyState;');
    return readyState === 'complete';
  });
}

export default async function start(numberOfPages: number) {

    const driver = await getDriver('chrome')
    if(!driver) return console.log('error getting driver')
    createTableIfNotExists(TABLE_NAME)
    try {
      await driver.get(DEFAULT_URL);
      await selectCountry(driver)

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
      connection.end((err: any) => {
        if (err) {
          console.error('Error closing database connection: ', err);
          return;
        }
        console.log('Database connection closed!');
      });
    }
};


