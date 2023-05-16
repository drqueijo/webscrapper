import { Builder, By, Key, until, ThenableWebDriver, WebDriver, WebElement } from 'selenium-webdriver';
const { Select } = require('selenium-webdriver')
import { COUNTRY_CODE, DEFAULT_URL, NUMBER_OF_PAGES } from "../config";
import progressBar from 'progress';
import { connection } from "../database";
import { getDriver } from '..';
import { BrowserTypes } from '../utils/enums';
let actualPage = 1
const ELEMENTS_PER_PAGE = 28
export const ProgressBar = new progressBar('Scraping [:bar] :percent | :elapseds of :etas', {
  complete: '/',
  incomplete: ' ',
  width: 200,
  total: NUMBER_OF_PAGES * ELEMENTS_PER_PAGE
});
const TABLE_INFO_BY_GAME_NAME = 'game_info'
export const createTableIfNotExists = () => {
  const sql = `CREATE TABLE IF NOT EXISTS ${TABLE_INFO_BY_GAME_NAME} (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    release_date VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    rtp VARCHAR(255) NOT NULL,
    variance VARCHAR(255) NOT NULL,
    hit_frequency VARCHAR(255) NOT NULL,
    max_win VARCHAR(255) NOT NULL,
    min_bet VARCHAR(255) NOT NULL,
    max_bet VARCHAR(255) NOT NULL,
    layout VARCHAR(255) NOT NULL,
    betways VARCHAR(255) NOT NULL,
    features VARCHAR(255) NOT NULL,
    theme VARCHAR(255) NOT NULL,
    objects VARCHAR(255) NOT NULL,
    genre VARCHAR(255) NOT NULL,
    other_tags VARCHAR(255) NOT NULL,
    technology VARCHAR(255) NOT NULL,
    game_size VARCHAR(255) NOT NULL,
    last_update VARCHAR(255) NOT NULL
  );`

  connection.query(sql, (error) => {
    if (error) throw error;
    console.log(`Table ${TABLE_INFO_BY_GAME_NAME} created or already exists.`);
  });
};

const getPageGames = async (driver: WebDriver): Promise<void> => {
  let gameCards = await driver.findElements(By.className('providerCard'));
  for (let i = 0; i < gameCards.length; i++) {
    const gameCardLink = await gameCards[i].findElement(By.className("providerName"));
    const gameTitle = await gameCardLink.getText();
    const currentWindowHandle = await driver.getWindowHandle();
    await gameCardLink.sendKeys(Key.CONTROL, Key.RETURN);

    await driver.wait(async () => {
      const windowHandles = await driver.getAllWindowHandles();
      return windowHandles.length > 1;
    });

    const windowHandles = await driver.getAllWindowHandles();
    const newWindowHandle = windowHandles[1];
    await driver.switchTo().window(newWindowHandle);

    await getTableInfo(driver, gameTitle)

    await driver.close();
    await driver.switchTo().window(currentWindowHandle);
  }
}

const getTableInfo = async (driver: WebDriver, gameTitle: string) => {
  const elementExists = await driver.findElements(By.className('slotAttrReview')).then(elements => elements.length > 0);
  let tableDiv: WebElement | null = null
  if(!elementExists) return 
  
  tableDiv = await driver.findElement(By.className('slotAttrReview'))
  const tableBody = await tableDiv.findElement(By.tagName('tbody'))
  const tableBodyTr = await tableBody.findElements(By.tagName('tr'))
  let name = gameTitle
  let provider = ''
  let release_date = ''
  let type = ''
  let rtp = ''
  let variance = ''
  let hit_frequency = ''
  let max_win = ''
  let min_bet = ''
  let max_bet = ''
  let layout = ''
  let betways = ''
  let features = ''
  let theme = ''
  let objects = ''
  let genre = ''
  let other_tags = ''
  let technology = ''
  let game_size = ''
  let last_update = ''

  for (let i = 0; i < tableBodyTr.length; i++) {
    const firstChild = await tableBodyTr[i].findElement(By.xpath("./*[1]"));
    const firstChildText = await firstChild.getAttribute('textContent');

    if(firstChildText === 'Provider:')  {
      const res = await tableBodyTr[i].findElement(By.xpath('./td[1]')).getText();
      provider = res
      continue
    }
    if(firstChildText === 'Release Date:') {
      const res = (await tableBodyTr[i].findElement(By.xpath('./td[1]')).getText()).replace('[ i ]', '');
      release_date = res
      continue
    }
    if(firstChildText === 'Type:') {
      const res = await tableBodyTr[i].findElement(By.xpath('./td[1]')).getText()
      type = res
      continue
    }
    if(firstChildText === 'RTP:') {
      const res = await tableBodyTr[i].findElement(By.xpath('./td[1]')).getText()
      rtp = res.replace('RTP RANGES!','')
      continue
    }
    if(firstChildText === 'Variance:') {
      const res = await tableBodyTr[i].findElement(By.xpath('./td[1]')).getText()
      variance = res
      continue
    }
    if(firstChildText === 'Hit Frequency:') {
      const res = (await tableBodyTr[i].findElement(By.xpath('./td[1]')).getText()).replace('[ i ]', '');
      hit_frequency = res
      continue
    }
    if(firstChildText === 'Max Win:') {
      const res = (await tableBodyTr[i].findElement(By.xpath('./td[1]')).getText()).replace('[ i ]', '');
      max_win = res
      continue
    }
    if(firstChildText === 'Min bet R$:') {
      const res = await tableBodyTr[i].findElement(By.xpath('./td[1]')).getText()
      min_bet = res
      continue
    }
    if(firstChildText === 'Max bet R$:') {
      const res = await tableBodyTr[i].findElement(By.xpath('./td[1]')).getText()
      max_bet = res
      continue
    }
    if(firstChildText === 'Layout:') {
      const res = await tableBodyTr[i].findElement(By.xpath('./td[1]')).getText()
      layout = res
      continue
    }
    if(firstChildText === 'Betways:') {
      const res = await tableBodyTr[i].findElement(By.xpath('./td[1]')).getText()
      betways = res
      continue
    }
    if(firstChildText.includes('Theme:')) {
      const themeRes = await firstChild.findElements(By.tagName('a'))
      let res = ''
      for(let i = 0; i < themeRes.length; i++) {
        res += await themeRes[i].getText()
        if(i < themeRes.length -1 ) res += ', '
      }
      theme = res
      continue
    }
    if(firstChildText.includes('Objects:')) {
      const objectsRes = await firstChild.findElements(By.tagName('a'))
      let res = ''
      for(let i = 0; i < objectsRes.length; i++) {
        res += await objectsRes[i].getText()
        if(i < objectsRes.length -1 ) res += ', '
      }
      objects = res
      continue
    }
    if(firstChildText.includes('Features:')) {
      const featuresRes = await firstChild.findElements(By.tagName('a'))
      let res = ''
      for(let i = 0; i < featuresRes.length; i++) {
        res += await featuresRes[i].getText()
        if(i < featuresRes.length -1 ) res += ', '
      }
      features = res
      continue
    }
    if(firstChildText.includes('Genre:')) {
      const genreRes = await firstChild.findElements(By.tagName('a'))
      let res = ''
      for(let i = 0; i < genreRes.length; i++) {
        res += await genreRes[i].getText()
        if(i < genreRes.length -1 ) res += ', '
      }
      genre = res
      continue
    }
    if(firstChildText.includes('Other tags:')) {
      const tagsRes = await firstChild.findElements(By.tagName('a'))
      let res = ''
      for(let i = 0; i < tagsRes.length; i++) {
        res += await tagsRes[i].getText()
        if(i < tagsRes.length -1 ) res += ', '
      }
      other_tags = res
      continue
    }
    if(firstChildText === 'Technology:') {
      const res = await tableBodyTr[i].findElement(By.xpath('./td[1]')).getText()
      technology = res
      continue
    }
    if(firstChildText === 'Game Size:') {
      const res = await tableBodyTr[i].findElement(By.xpath('./td[1]')).getText()
      game_size = res
      continue
    }
    if(firstChildText === 'Last Update:') {
      const res = await tableBodyTr[i].findElement(By.xpath('./td[1]')).getText()
      last_update = res
      continue
    }
    
  }
  insertIntoDatabase(
    name,
    provider,
    release_date,
    type,
    rtp,
    variance,
    hit_frequency,
    max_win,
    min_bet,
    max_bet,
    layout,
    betways,
    features,
    theme,
    objects,
    genre,
    other_tags,
    technology,
    game_size,
    last_update,
  )
  ProgressBar.tick();
}

const insertIntoDatabase = (
  name: string,
  provider: string,
  release_date: string,
  type: string,
  rtp: string,
  variance: string,
  hit_frequency: string,
  max_win: string,
  min_bet: string,
  max_bet: string,
  layout: string,
  betways: string,
  features: string,
  theme: string,
  objects: string,
  genre: string,
  other_tags: string,
  technology: string,
  game_size: string,
  last_update: string,
) => {
  const values: string[] = [
    name,
    provider,
    release_date,
    type,
    rtp,
    variance,
    hit_frequency,
    max_win,
    min_bet,
    max_bet,
    layout,
    betways,
    features,
    theme,
    objects,
    genre,
    other_tags,
    technology,
    game_size,
    last_update,
  ]
  let query = `INSERT INTO ${TABLE_INFO_BY_GAME_NAME} `
  query += '(name, provider, release_date, type, rtp, variance, hit_frequency, max_win, min_bet, max_bet, layout, betways, features, theme, objects, genre, other_tags, technology, game_size, last_update) '
  query += 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'  
  connection.query(query, values, (error, results, fields) => {
    if (error) throw error;
  });
}

const navigate = async (driver: WebDriver): Promise<void> => {
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



export default async function startGameInfoScript(numberOfPages: number) {
  const driver = await getDriver(BrowserTypes.CHROME)
  if(!driver) return
  createTableIfNotExists()
  try {
    await driver.get(DEFAULT_URL);
    for (let i = 0; i < numberOfPages; i++) {
      if(i !== 0) await navigate(driver)
      await getPageGames(driver)
      actualPage++
    }

  } catch (e) {
    console.log('Error at page '+ actualPage)
    console.log(e)
  }
  finally {
    console.log('Scrapping finished!!')
  }
};