import { WebDriver } from "selenium-webdriver";
import { DEFAULT_URL, SCRIPT_TYPE } from "../config";
import startRankingScript from "./rankingByCountry";
import country from "../utils/countries";
import { BrowserTypes } from "../utils/enums";
import { getDriver } from "..";

type Country = typeof country.AR;

export default async function startAllRankingsScript(numberOfPages: number, startIn: Country = country.AR) {
  
  try {
    const keys = Object.keys(country);
    let start = false
    const executeAsync = async () => {
      for (const key of keys) {
        if(key === startIn.code) start = true
        if(!start) continue
        const tableName = SCRIPT_TYPE + '_' + (country[key as keyof typeof country].name.replaceAll(' ', ''));
        const countryCode = country[key as keyof typeof country].code;
        await startRankingScript(numberOfPages, tableName, countryCode);
      }
    };
    
    executeAsync().then(() => {
      console.log('All executions complete.'); 
    }).catch((error) => {
      console.error('An error occurred:', error);
    });
    
  } catch (e) {
    console.log(e)
  }
  finally {
    console.log('Scrapping finished!!')
  }
};