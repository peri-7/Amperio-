# 💻 Amperio | CLI Client

The Amperio CLI is a terminal-based tool designed for administrators to allow for direct interaction with the Amperio API without needing a web browser.
This directory contains all the Node JS files required to run the CLI.

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

## 🛠 Troubleshooting

* **Authority Invalid:** If you encounter an "err_cer_authority_invalid" error, you may need to run an api endpoint on your browser and accept the security exception for the backend server's SSL certificate. 

Alternatively, you can try to add the backend server's SSL certificate to your system's trusted certificates. This is a common issue when working with self-signed certificates in development environments. //this was autocompleted by chatgpt, so it may not be accurate. Please verify this information before including it in the README.
