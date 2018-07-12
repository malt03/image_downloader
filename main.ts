import { launch } from 'puppeteer'
import * as request from 'request';
import * as fs from 'fs';
import * as sleep from 'sleep';
import * as mkdirp from 'mkdirp';

const queries = process.argv.slice(2);

(async () => {
  const browser = await launch();
  const page = await browser.newPage();
  for (const query of queries) {
    console.log(query);
    let directory = 'out/' + query + '/';
    mkdirp.sync(directory);
    await page.goto('https://www.google.co.jp/search?q=' + query + '&tbm=isch');
    const imageUrls = await page.$$eval('div.rg_meta.notranslate', (elements) =>
      elements.map((e) => JSON.parse(e.innerHTML).ou as string)
    );

    imageUrls.forEach((imageUrl, index) => {
      let extension = imageUrl.split('?').shift().split('.').pop();
      if (extension != 'png' && extension != 'jpg') { return; }
      request({ method: 'GET', url: imageUrl, encoding: null }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          fs.writeFile(directory + index + '.' + extension, body, 'binary', (error) => { });
        }
      });
    });

    sleep.sleep(1);
  }

  await browser.close();
})();
