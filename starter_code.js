const puppeteer = require('puppeteer');
const dns = require('dns');
const puppeteerResolver = require('puppeteer-chromium-resolver');
const fs = require('fs');
const csv = require('csv-parser');

const domains = [];

// Define the path to the CSV file containing the list of domains
const CRUX_file_path = "/home/cs249i-student/project2/p2/domains/current.csv";

// Read the CSV file and extract all domains


// fs.createReadStream(CRUX_file_path)
//     .pipe(csv())
//     .on('data', (row) => {
//         domains.push(row.origin);
//     })
//     .on('end', () => {
//         // Start crawling all domains
//         runOverDomains();
//     });


let count = 0;
fs.createReadStream(CRUX_file_path)
    .pipe(csv())
    .on('data', (row) => {
    if (count < 1000) {
    domains.push(row.origin);
    count++;
        }
    })
    .on('end', () => {
        // Start crawling the selected domains
        runOverDomains();
    });  

async function resolveIpAddress(hostname) {
    return new Promise((resolve, reject) => {
        dns.lookup(hostname, (err, address) => {
            if (err) {
                reject(err);
            } else {
                resolve(address);
            }
        });
    });
}

async function crawlSite(site) {
    const outObj = {};
    outObj["site"] = site;
    outObj["resources"] = [];

    try {
        // Get IP address of the root page
        const domain = new URL(site).hostname;
        const site_ip = await resolveIpAddress(domain);
        outObj["site_ip"] = site_ip;

        // Resolve the Chromium revision
        const chromiumRevision = await puppeteerResolver();
        const browser = await puppeteer.launch({
            executablePath: chromiumRevision.executablePath,
            timeout: 0 // Setting timeout to 0 to disable it
        });

        const page = await browser.newPage();

        // This event is fired when the browser detects an HTTPResponse
        page.on('response', async (response) => {
            // Collect metadata about each resource
            const responseUrl = response.url();
            const remoteIpAddress = response.remoteAddress().ip; // Extract IP address as a string
            const contentType = response.headers()['content-type'];

            const responseObj = {
                "url": responseUrl,
                "content_type": contentType,
                "ip_address": remoteIpAddress
            };

            outObj["resources"].push(responseObj);
        });

        try {
            // Attempt to navigate to the site
            await page.goto(site, { timeout: 1000000 }); // Set timeout to 1000000 ms
        } catch (e) {
            console.log("Error navigating to:", site);
            console.error(e);
        }

        // Close the browser after navigation
        await browser.close();

        // Resolve with outObj
        return Promise.resolve(outObj);

    } catch (error) {
        console.error(`Error crawling ${site}:`, error);
        outObj["site_ip"] = "UNKNOWN";
        return Promise.resolve(outObj); // Resolve with outObj even in case of error
    }
}


async function runOverDomains() {
    const fileStream = fs.createWriteStream('outputfile.jsonl');
    for (const domain of domains) {
      try {
        const result = await crawlSite(domain);
        fileStream.write(JSON.stringify(result) + '\n');
      } catch (error) {
        console.error(`Error crawling ${domain}:`, error);
      }
    }
    fileStream.end();
}

runOverDomains();