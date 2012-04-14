/*
 * Module Dependencies
 */

var azure = require('azure'),
    uuid = require('node-uuid');

//Contants for working with Azure Table Storage
var ServiceClient = azure.ServiceClient;
var tableName = 'messages';
var tableQuery = azure.TableQuery;

chatLog = function(storageAccount, storageKey){
    this.tableClient = azure.createTableService(storageAccount, storageKey);
    //In case we feel like working with the storage emulator
    // this.tableClient = azure.createTableService(ServiceClient.DEVSTORE_STORAGE_ACCOUNT,
    //   ServiceClient.DEVSTORE_STORAGE_ACCESS_KEY, ServiceClient.DEVSTORE_TABLE_HOST);
};

/* Initialization method to ensure that our Azure Table exists */
chatLog.prototype.init = function(){
    this.tableClient.createTableIfNotExists(tableName, function(error, created){
       if(error){ //If there was an error attempting to create this table, log it
           console.log(error.message);
       }
       if(created){
           console.log('Successfully created table %s', tableName);
       }
    });
}

/* Save a chat message to Azure Table Storage */
chatLog.prototype.save = function(room, message, fn){
    var chatMessage = {
      PartitionKey: room,
      RowKey: uuid(), //we don't really care much about the row key; most of our queries are by timestamp
      Author: message.author,
      Text: message.text,
    };

    this.tableClient.insertEntity(tableName, chatMessage, fn);
}


/* Get the last N messages for a chat room in reverse-chronological order */
chatLog.prototype.getMessages = function(room, messageCount, fn){
    var query = tableQuery.select()
        .from(tableName).where("PartitionKey eq ?", room).top(30);

    this.tableClient.queryEntities(query, function(error, rows){
        if(error){ //Return the error back to the caller via callback
            console.log('error: %s', error.message);
            return fn(error, null);
        }

        var messages = [];

        if(typeof(rows.length) == "undefined"){
         rows = [rows]; //Cast our parameter variable into a list of users containing only a single item (itself)
        }

        //Sorts the responses back
        rows.sort(function(a,b){
          a = new Date(a.Timestamp);
          b = new Date(b.Timestamp);
          return a<b?-1:a>b?1:0;
        });

        for(var i=0; i < rows.length;i++){
          console.log(rows[i]);
            messages[messages.length] = mapMessage(rows[i]);
        }

        //Send completed set of objects back to the caller
        fn(null, messages);
    });
}

/* Utility method for mapping an Azure Table Row into a usable message object */
var mapMessage = function(tableRow){
    return {"author": tableRow.Author, "text":tableRow.Text, "timestamp": tableRow.Timestamp};
}

exports.chatLog = chatLog;