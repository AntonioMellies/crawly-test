require('dotenv/config');
const {convertToken} =  require('./utils/token.utils')
const puppeteer = require('puppeteer')
const cheerio = require('cheerio');
const { default: axios } = require('axios');
const qs = require('qs');

const URL = process.env.WEB_CRAWLER_URL

const crawlerBrowserEmulate = async () => {
	const browser = await puppeteer.launch()
	const page = await browser.newPage()
	await page.goto(URL, { waitUntil: 'networkidle0' })


    page.click('input[type=button]')
    await page.waitForNavigation()

    const resposta = await page.evaluate(() =>{  
        return document.querySelector('#answer').innerText
    })
    console.log('Crawler Browser Emulate :: Resposta: ', resposta);

	await browser.close()
}


const crawlerLevelLow = async () => {
    let page;
    let $;
	
    page = await axios.get(URL);
    $ = cheerio.load(page.data);
    
    const token = $("body").find("#token")[0].attribs.value;
    
    var dataToken = qs.stringify({
        'token': convertToken(token) 
    });
    var config = {
        method: 'post',
        url: URL,
        headers: {
            "Cookie": page.headers['set-cookie'][0].split(';')[0],
            'Origin': URL, 
            'Referer': URL, 
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : dataToken
    };

    
    page = await axios(config);
    $ = cheerio.load(page.data);
    const resposta = $("#answer").text();

    console.log('Crawler Level Low :: Resposta: ', resposta);
    
}


const start = async function() {
    await crawlerBrowserEmulate()
    await crawlerLevelLow()
}

start();