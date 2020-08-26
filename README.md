# Coding Rooms for LEGO Hardware

> LEGO® hardware web execution environment embedded in an iframe for use in Coding Rooms

> Current supporting: SPIKE™ Prime

# File navigation

## ```index.html```
Coding Rooms index markup that simulates the interaction between Coding Rooms and the iframe environment. ```CCWebExecManager``` file.


## ```iframe.html```
iframe environment to be hosted by TuftsCEEO. Implementation of ```CCWebExecClient```.


## ```/modules/ServiceDock_SPIKE.js```
TuftsCEEO Service Dock for SPIKE™ Prime file (used only in the iframe)

# Current protocol payload (JSON) 
|Parameters   	| Usage   	| Description  	|
|---	          |---	      |---	          |
|language       | string    | language of data sent ("LEGO" when customizing)  	   |
|defaultFileName| string  	      |   	name of the "file"             |
|files   	      | JSON object     |  keys: name of "file", values: string content of file  |
|stdin   	      |   string	      |   	          |

Javascript payload object sent by ```webExecManager``` on ```'execute_code'```
```javascript
        var payload = {
          language: 'demo-lang',
          defaultFileName: fileName,
          files: files,
          stdin: ''
        };

```
