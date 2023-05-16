import progressBar from 'progress'
import { NUMBER_OF_PAGES } from '../config';
export const ProgressBar = new progressBar('Scraping [:bar] :percent | :elapseds of :etas', {
  complete: '=',
  incomplete: ' ',
  width: 200,
  total: NUMBER_OF_PAGES
});
