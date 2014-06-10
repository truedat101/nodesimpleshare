/**
#
#Copyright (c) 2011-2014 Razortooth Communications, LLC. All rights reserved.
#
#Redistribution and use in source and binary forms, with or without modification,
#are permitted provided that the following conditions are met:
#
#    * Redistributions of source code must retain the above copyright notice,
#      this list of conditions and the following disclaimer.
#
#    * Redistributions in binary form must reproduce the above copyright notice,
#      this list of conditions and the following disclaimer in the documentation
#      and/or other materials provided with the distribution.
#
#    * Neither the name of Razortooth Communications, LLC, nor the names of its
#      contributors may be used to endorse or promote products derived from this
#      software without specific prior written permission.
#
#THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
#ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
#WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
#DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
#ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
#(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
#LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
#ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
#(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
#SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/

var JS =  require("js.js").JS,
	util = require("util"),
	url = require('url'),
  qs = require("querystring"),
  path = require("path"),
  fs = require("fs"),
  shareconfig = require('./shareconfig.json');

var INVALID_SHARE_PARAMETERS = "Missing required query parameters: apikey";
var INVALID_SHARE_REQUEST = "Missing required resource file in request";
var UNAUTHORIZED_USER = "You are not authorized to access this document";
var RESOURCE_PERMISSION_DENIED = "This resource is not available, permission denied";

var js = new JS();
js.CONFIG.DOCROOT = './static';
console.log(js.CONFIG);
js.create(js.address, js.CONFIG.HTTPWS_PORT);
js.listenHttpWS();
js.listenSocketIO(js.js_handler); // This is initially set to null, so it will fallback to use js.DEFAULT_JS_HANDLER

var starttime = (new Date()).getTime();

js.getterer("/share/[\\w\\.\\-]+", function(req, res) {
  var aquery = qs.parse(url.parse(req.url).query);
  console.log("aquery = " + JSON.stringify(aquery));
  var apikey = aquery.apikey;


  // Is there an api key?
  if (apikey === undefined || apikey === '') {
    console.log('Undefined API Key');
    res.writeHead(403, {  'Content-Type': 'text/plain',
                          'Content-Length': INVALID_SHARE_PARAMETERS.length
                  });
    res.write(INVALID_SHARE_PARAMETERS);
    res.end();
  } else {
    var aurl = url.parse(req.url);
    // Validate the API key in our ACL
    var adoc = aurl.pathname.substring(aurl.pathname.lastIndexOf('/') + 1);
    var assetpath = '/assets/' + adoc;
    console.log(aurl);
    console.log('adoc = ' + adoc);
    if (adoc === null || adoc === '') {
      console.log(INVALID_SHARE_REQUEST);
      res.writeHead(403, {  'Content-Type': 'text/plain',
                          'Content-Length': INVALID_SHARE_REQUEST.length
                  });
      res.write(INVALID_SHARE_REQUEST);
      res.end();
    }
    // Is the document under access control
    if (adoc in shareconfig.documents) {
      console.log('Document lookup succeeded for ' + JSON.stringify(shareconfig.documents[adoc]));
      // Is the api key in our ACL?
      if ((apikey in shareconfig.documents[adoc]) !== true) {
        console.log(UNAUTHORIZED_USER);
        res.writeHead(403, {  'Content-Type': 'text/plain',
                          'Content-Length': UNAUTHORIZED_USER.length
                  });
        res.write(UNAUTHORIZED_USER);
        res.end();
      } else {
        console.log("Lookup of acl user: " + apikey + " succeeded for " + adoc);
      }
    } else {
      console.log("failed to lookup " + adoc + " in ");
      console.log(shareconfig.documents);
      console.log(RESOURCE_PERMISSION_DENIED);
      res.writeHead(403, {  'Content-Type': 'text/plain',
                          'Content-Length': RESOURCE_PERMISSION_DENIED.length
                  });
      res.write(RESOURCE_PERMISSION_DENIED);
      res.end();
    }
    console.log("Getting share under path: " + url.parse(assetpath).pathname);
    return js.staticHandler("." + url.parse(assetpath).pathname)(req, res);
  }
});

js.get("/up", function(req, res) {
  res.simpleJSON(200, { "starttime": starttime});
});

