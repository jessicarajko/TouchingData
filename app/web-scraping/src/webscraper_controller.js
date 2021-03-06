/* ****************** MAIN.JS ******************
 * 2019 October 23 : Aaron Zhang : Created
 ********************************************
 * Purpose : File that runs the webscraper.js class. *
 */

const webscraperjs = require("./webscraper.js");
const downloaderjs = require("./downloader.js");
const DAO = require("../../DAO.js");
let sqlDatabaseName = "data/POLITICS_OF_THE_GRID.db";
let Website = require("../../models/Website.js");
let EM = require("../../emitter.js");
const fs = require("fs");
let timeouts = [];

class WS_Controller {
  constructor() {
    //This API key is used for gathering websites and the free tier is limited for 3000 searches.
    //More information about this can be found at docs/Bing API Documentation for Touching Data.docx.
    this.bing_api_key = "502360db0e564d8eb338b5e985ade3b4";
    this.webscraper = new webscraperjs();
    this.downloader = new downloaderjs();
    this.dao = new DAO(sqlDatabaseName);
  }
  getBingResults() {
    let recipients = this.dao.selectAllRecipients();
    let time = 1000;
		let state = "go"
    //Since you cannot use "this" in a promise, put "this" in a local variable.
    let thisthat = this;
		EM.on("kill",function(data) {
			timeouts.forEach(timeout=>{
				clearTimeout(timeout);
			});
			state = "stop";
		});
		for (let i = 0; i < recipients.length; i++) {
			if (state === "stop") return;
      let recipient = recipients[i];
      //If the recipient row in the DB does not have a corresponding website variable.
      if(recipient.website == null || recipient.website == ""){
        //Adding 3 seconds to the amount of time needing to wait.
        time = time + 3000;
        let progress = i/recipients.length * 100;
        //Setting a timeout allows the function to run syncronously inside a node function. 
				//The main goal is to allow the first info to go in 3 seconds, then 3 seconds after that run the second inf

        const timeoutObj = setTimeout(function() {
					thisthat.webscraper.getSiteFromName(recipient.name, thisthat.bing_api_key).then(function(url) {
						console.log(url);
						EM.emit('websiteUrl', {
              urlResult: url,
              companyName: recipient.name,
              urlProgress: progress
            });
            let website = new Website("", url);
            thisthat.dao.insertWebsite(website);
            //This gets the ID of the website we just inserted into the database to insert into the recipient table
            website = thisthat.dao.selectWebsiteByDomain(url);
            //The ID gets returned in a num format and we have to turn it into a string. Trust me, this is the easiest way to do it
            let num_string = String(website.id);
            let num_array = num_string.split(".");
            let website_id = num_array[0];
            thisthat.dao.updateRecipientWebsite(recipient.id, website_id);
          });
        }, time);
				timeouts.push(timeoutObj)
      }
    }
  }
  async webscrapeAllSites() {
    fs.mkdir("data/abouts", err=>{
      console.log(`Problem Creating the data/abouts folder. \n Honestly, 70% chance it's already created`);
    }); 
    let recipients = this.dao.selectAllRecipients();
    let howlong = .25; //In percentages of a minute. .25 = 15 seconds
    let time = 0;
    const minute = 60000; //Time is in milliseconds
		let state = "go";

		EM.on("kill",function(data) {
			timeouts.forEach(timeout=>{
				clearTimeout(timeout);
			});
			state = "stop";
		});
    for (let i = 0; i < recipients.length; i++) {
			if (state === "stop") return;
      let recipient = recipients[i];
      let recipient_id = recipient.id;      
      let recipient_website_id = recipient.website;

      let website = this.dao.selectWebsiteById(recipient_website_id);
      
	  if (!website) continue;
      let website_domain = website.domain;

      //Origin is the website without anything after the domain name.
      let origin = new URL(website_domain).origin;

      //stop_time is the cumulative amount of time before the website function stops.
      let stop_time = new Date().valueOf() + time + howlong * minute;

      let thisthat = this;


      const timeoutObj = setTimeout(function() {
				console.log(website);
        let progress = i/recipients.length * 100;
        EM.emit("website", 
        {websiteName: website_domain,
          webscrapeProgress: progress
        });
        let links_visited = thisthat.webscraper.getSite(
          origin,
          website_domain,
          [website_domain],
          recipient_id,
          stop_time
        );
      }, time);

			timeouts.push(timeoutObj)

      //howlong * minutes should be the amount of time waiting between each website
      time = time + howlong * minute;

    }
  }
}

module.exports = WS_Controller;
