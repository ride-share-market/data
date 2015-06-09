# Ride Share Market Data

This is a Node.js RabbitMQ RPC application.

## Overview

A Node.js daemon processes [json-rpc protocol](http://json-rpc.org/) messages from a RabbitMQ queue.

Processing is a request/reply model.

An example message from the RabbitMQ queue (the request):

    {
      jsonrpc: '2.0',
      method: 'user.findById',
      params: {
        id: '542ecc5738cd267f52ac2085'
      },
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    }

An example reply to the RabbitMQ queue (the response):

    {
    "jsonrpc":"2.0",
    "id":"f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "error":
        {
            "code":404,
            "message":"not_found",
            "data":"Account profile not found."
        }
    }

In between the request and response the Node.js application code does a database query.

Currently MongoDB is the database store.

## Process Details

- Listens for requests
- Validate input
- Process the request
- Return result
- Non Errors are simply the JSON-RPC property 'result'
- Errors are the JSON-RPC property 'errors' and have 3 properties which will map to JSON-API this way:
    - code (JSON-RPC code => JSON-API HTTP status)
    - message (JSON-RPC message => JSON-API code - Application/machine message)
    - data (JSON-RPC data => JSON-API title - Human readable message)

## Dependencies

- io.js 1.x (preferred) or Node.js 0.12.x
- [RabbitMQ](http://www.rabbitmq.com/)
- [MongoDB](https://www.mongodb.org/)

RabbitMQ requires a vhost `/rsm` and a enabled user named `rsm` with a password.

MongoDB currently has no authentication implemented, access is restricted by IP address.

The defaults and examples assume RabbitMQ and MongoDB are running in a virtual machine at 192.168.33.10.

## Install

- `git clone git@github.com:rudijs/ride-share-market-data.git`
- `npm install`
- `npm install -g gulp pm2`
- Copy example environment configuration files
- `gulp init`
- Update the `env/*.json` files with your RabbitMQ rsm user password.

## Dev Tools

- `gulp help`

## Tests

- `gulp lint`
- `gulp watch-lint`
- You may also send RPC message manually with `app/rpc/rpc-publisher-mongodb.js`
- Example:
- `RABBITMQ_URL="rsm:UPDATE-THIS-PASSWORD@192.168.33.10/rsm" node rpc-publisher-mongodb.js`
- Edit `app/rpc/rpc-publisher-mongodb.js` to alter the RPC message body.

## Start

- Development Env
- `pm2 start config/processes.json`

- Production Env
- TODO
