nodesimpleshare
===============

A simple way to share static files with a brain-dead apikey and some JSON for access control

Setup
=====

> npm install .
* Edit shareconfig.json, add your own documents to share, add your own user api keys

Note: Avoid using api keys that will be escaped in the request query, as this will probably break.

Disclaimer
==========

This isn't intended to be ultra-secure from clever hackers.  So don't use it for anything requiring high levels of security.

