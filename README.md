Production: [![Netlify Status](https://api.netlify.com/api/v1/badges/5c3bd66f-d018-436d-91d6-6271e16acb69/deploy-status)](https://app.netlify.com/sites/tufts-cr-for-lego/deploys) QA: [![Netlify Status](https://api.netlify.com/api/v1/badges/2dd6078f-2ae0-46c6-be77-9b3349283948/deploy-status)](https://app.netlify.com/sites/tufts-cr-for-lego-qa/deploys)

# Coding Rooms for LEGO Hardware

### **LEGO® hardware web execution environment embedded in an iframe for use in Coding Rooms**

#### **Current supporting: SPIKE™ Prime**

# File navigation

## ```index.html```
Coding Rooms index markup that simulates the interaction between Coding Rooms and the iframe environment. THe ```CCWebExecManager```


## ```iframe.html```
iframe environment. Implementation of ```CCWebExecClient```.


## ```/modules/ServiceDock_SPIKE.js```
LEGO SPIKE™ Prime TuftsCEEO Service (used only in the iframe)

# Current protocol payload (JSON) 
|Parameters   	| Usage   	| Description  	|
|---	          |---	      |---	          |
|language       | string    | language of data sent ("MicroPython for LEGO" when customizing)  	   |
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
