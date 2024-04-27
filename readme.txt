Files included:
starter_code.js: javascript code for gathering meta data of websites (Runs first)
asn_tag.py: python code that tagged ASN and AS names for metadata entries (Runs after start_code.js)
output.jsonl: final output data for metadata of domains crawled 


Description:
We started off by working with the given javascript code to crawl the website to gather metadata for just a single domain. Once we got this working we tested it out for 25 domains in the csv file to see special cases. We used a csv parser to handle the csv file containing the domain names and limited the number of domains to only the first 1000 and initialized the crawling process. We resolved each domain’s IP address, launched a headless browser instance using puppeteer and navigated to the domain’s URL where we collected the metadata about each resource loaded on the page. We also did some error handling for when an error occurs during metadata collection so it handles it and moves on to the next domain without issues. Specifically the error was a “Protocol Timeout error”  and we bypassed this by using a try and catch and adding a timeout of 1000000ms. A post on Ed was really helpful here about this. Some of the errors we got while running this for all th website were: 

- Error: net::ERR_CONNECTION_TIMED_OUT
- Error: net::ERR_HTTP2_PROTOCOL_ERROR
- Error: getaddrinfo ENOTFOUND

We resolved this by filling those entries with “UNKOWN”

We then wanted to tag the ip addresses with their ASN and AS names. To do this we wrote a python script that used pyasn, a python library, that iiterated over the output json file from the previous step. It then tagged these ASN using the latest ipasn database.
The final output we got seems to tag most sites appropriately, but there were still some websites that seemed off or caused errors. For example, we saw some data URLs which seemed obviously off containing spaces, however, this is fine and was not removed as it is a way to embed a small resource (e.g., an image) directly into the URL. 
