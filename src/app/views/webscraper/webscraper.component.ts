import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as socketio from "socket.io-client";

@Component({
  selector: "app-webscraper",
  templateUrl: "./webscraper.component.html",
  styleUrls: ["./webscraper.component.scss"]
})
export class WebscraperComponent implements OnInit {
  progressOutput;
  outputBox;
  startScrapeButton;
  stopScrapeButton;
  progressBar;
  io;
  progressAmount;
  stopFetchButton;
  startFetchButton;
  startDownloadButton;
  stopDownloadButton;
  startConvertButton;
  stopConvertButton;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.progressOutput = document.getElementById("progressOutput");
    this.outputBox = document.getElementById("output");
    this.startScrapeButton = document.getElementById("startScraping");
    this.stopScrapeButton = document.getElementById("stopScraping");
    this.startFetchButton = document.getElementById("startFetching");
    this.stopFetchButton = document.getElementById("stopFetching");
    this.startDownloadButton = document.getElementById("startDownloading");
    this.stopDownloadButton = document.getElementById("stopDownloading");
    this.startConvertButton = document.getElementById("startConverting");
    this.stopConvertButton = document.getElementById("stopConverting");
    this.progressBar = document.getElementById("progressbar");
    this.progressAmount = document.getElementById("progress");
    this.io = socketio("http://localhost:3000");
  }

  startScrape() {
    var x = confirm(
      "This will begin the Webscraper.. This is a 5 hour process. Are you sure you want to begin scraping?"
    );
    if (x == true) {
      this.outputBox.setAttribute("style", "display:block");
      this.startScrapeButton.setAttribute("style", "display: none");
      this.stopScrapeButton.setAttribute("style", "display: flex");
      this.progressBar.setAttribute("style", "display: inline-block");

      this.io.on("website", data => {
        this.progressOutput.textContent =
          "Scraping site: " + data["arg1"].websiteName;
        this.progressAmount.style.width = data["arg1"].webscrapeProgress + "%";
      });
      console.log("bopped");
      this.http.get("/scrapeSites").subscribe(
        data => {
          console.log("Currently Scraping");
        },
        err => {
          console.log("Error detected on scraping sites");
          console.log(JSON.stringify(err));
        }
      );
    } else {
    }
  }
  fetchWebsites() {
    var x = confirm(
      "This will begin to fetch websites.. This is a 15 minute process. Are you sure you want to begin Fetching?"
    );
    if (x == true) {
      this.outputBox.setAttribute("style", "display:block");
      this.progressBar.style.display = "inline-block";
      this.startFetchButton.setAttribute("style", "display: none");
      this.stopFetchButton.setAttribute("style", "display: flex");
      this.io.on("websiteUrl", data => {
        this.progressOutput.textContent =
          "Website found. Company Name: " +
          data["arg1"].companyName +
          " URL: " +
          data["arg1"].urlResult;
        this.progressAmount.style.width = data["arg1"].urlProgress + "%";
      });
      this.http.get("/getWebsites").subscribe(
        data => {
          console.log("Currently Getting Websites");
        },
        err => {
          console.log("Error detected on getting bing results");
          console.log(JSON.stringify(err));
        }
      );
    } else {
    }
  }
  downloadMedia() {
    var x = confirm(
      "This will begin to download media.. This is a 10 minute process. Are you sure you want to begin downloading media?"
    );
    if (x == true) {
      this.outputBox.setAttribute("style", "display:block");
      this.progressBar.setAttribute("style", "display: inline-block");
      this.startDownloadButton.setAttribute("style", "display: none");
      this.stopDownloadButton.setAttribute("style", "display: flex");
      this.io.on("downloadMediaStatus", data => {
        this.progressOutput.textContent = data["arg1"].mediaFileName;
        this.progressAmount.style.width =
          data["arg1"].mediaDownloadProgress + "%";
      });
      this.http.get("/downloadMedia").subscribe(
        data => {
          console.log("Currently Downloading Media");
        },
        err => {
          console.log("Error detected on downloading media");
          console.log(JSON.stringify(err));
        }
      );
    } else {
    }
  }
  convertTextToAudio() {
    var x = confirm(
      "This will begin to convert text files to audio.. This is a 10 minute process. Are you sure you want to begin text to audio?"
    );
    if (x == true) {
      this.outputBox.setAttribute("style", "display:block");
      this.progressBar.setAttribute("style", "display: inline-block");
      this.startConvertButton.setAttribute("style", "display: none");
      this.stopConvertButton.setAttribute("style", "display: flex");
      this.io.on("textToAudioStatus", data => {
        this.progressOutput.textContent = data["arg1"].textFileName;
        this.progressAmount.style.width =
          data["arg1"].textConversionProgress + "%";
      });
      this.http.get("/convertTextToAudio").subscribe(
        data => {
          console.log("Currently Converting Text to Audio");
        },
        err => {
          console.log("Error detected on converting text");
          console.log(JSON.stringify(err));
        }
      );
    } else {
    }
  }
  stopScrape() {
    var x = confirm(
      "This will stop the Webscraper.. This will terminate the process. Are you sure you want to stop scraping?"
    );
    if (x == true) {
      this.stopScrapeButton.setAttribute("style", "display:none");
      this.startScrapeButton.setAttribute("style", "display: flex");
      this.outputBox.setAttribute("style", "display: none");
      this.progressBar.setAttribute("style", "display: none");
      this.http.get("/cancelJob").subscribe();
    } else {
    }
  }
  stopFetching() {
    var x = confirm(
      "This will stop fetching websites.. This will terminate the process. Are you sure you want to stop fetching websties?"
    );
    if (x == true) {
      this.stopFetchButton.setAttribute("style", "display:none");
      this.startFetchButton.setAttribute("style", "display: flex");
      this.outputBox.setAttribute("style", "display: none");
      this.progressBar.setAttribute("style", "display: none");
      this.http.get("/cancelJob").subscribe();
    } else {
    }
  }
  stopDownloading() {
    var x = confirm(
      "This will stop downloading the media.. This will terminate the process. Are you sure you want to stop downloading?"
    );
    if (x == true) {
      this.stopDownloadButton.setAttribute("style", "display:none");
      this.startDownloadButton.setAttribute("style", "display: flex");
      this.outputBox.setAttribute("style", "display: none");
      this.progressBar.setAttribute("style", "display: none");
      this.http.get("/cancelJob").subscribe();
    } else {
    }
  }
  stopConverting() {
    var x = confirm(
      "This will stop the text to audio conversion.. This will terminate the process. Are you sure you want to stop converting?"
    );
    if (x == true) {
      this.stopConvertButton.setAttribute("style", "display:none");
      this.startConvertButton.setAttribute("style", "display: flex");
      this.outputBox.setAttribute("style", "display: none");
      this.progressBar.setAttribute("style", "display: none");
      this.http.get("/cancelJob").subscribe();
    } else {
    }
  }
}
