# 💻 Amperio | CLI Client

The Amperio CLI is a terminal-based tool designed for administrators to allow for direct interaction with the Amperio API without needing a web browser.
This directory contains:
 - all the Node JS files required to run the CLI.
 - a `/tests` directory with test cases for the CLI commands.

## 🛠 Setup & Installation

Before using the CLI, ensure the **Backend Server** is running.

1. **Install Dependencies:**
```bash
cd cli-client
npm install
```


2. **Link the CLI:**
Still in the cli-client directory, run:
```bash
npm link
```

Now you can run the cli anywhere in the terminal using the keyword se2519   

## ⌨️ Usage & Commands

Starting with the keyword `se2519` you can type any of the following commands to interface with the amperio api

| Scope | Parameters | Comment | Corresponding REST API Call |
| --- | --- | --- | --- |
| **healthcheck** |  |  | `/admin/healthcheck` |
| **resetpoints** |  |  | `/admin/resetpoints` |
| **addpoints** | ***`--source`*** | Name of the CSV file with new point data | `/admin/addpoints` |
| **points** | `--status`, `--format` |  | `/points` |
| **point** | ***`--id`*** |  | `/point` |
| **reserve** | ***`--id`***, `--minutes` |  | `/reserve` |
| **updpoint** | ***`--id`***, `--status`, `--price` | At least one of the parameters 'status' or 'price' is mandatory | `/updpoint` |
| **newsession** | ***`--id`***, ***`--starttime`***, ***`--endtime`***, ***`--startsoc`***, ***`--endsoc`***, ***`--totalkwh`***, ***`--kwhprice`***, ***`--amount`*** |  | `/newsession` |
| **sessions** | ***`--id`***, ***`--from`***, ***`--to`***, `--format` |  | `/sessions` |
| **pointstatus** | ***`--id`***, ***`--from`***, ***`--to`***, `--format` |  | `/pointstatus` |

**Note**: Parameters marked with bold italics are mandatory for the respective command.

exapmle command: 
```bash 
se2519 reserve --id 123 --minutes 30
```

## 🧪 Testing
To run the test cases for the CLI commands, ensure the **Backend Server** is running and then use the following command in the cli-client directory:

```bash
npm test healthcheck.test.js
```
to test the healthcheck command  

**OR** Open Git Bash in the `cli-client/tests` directory and run the

```bash
./test_commands.sh 
```
to test all the other commands at once

⚠**Warning**: Testing will modify the database, you can change the database used for testing by changing the `DB_TEST_NAME` variable in the `.env` file of the backend server to a different database than the one used for production. To set up the test database, you can run the same SQL scripts as for the production database, but make sure to use the name specified in `DB_TEST_NAME` when creating the database and running the scripts.


## 🛠 Troubleshooting

* **Authority Invalid:** If you encounter an "err_cer_authority_invalid" error, you may need to run an api endpoint on your browser and accept the security exception for the backend server's SSL certificate. 
