#!/usr/bin/env node

import axios from "axios";
import { Command } from "commander";
const program = new Command();
const API_BASE = "http://localhost:9876/api"; // your API URL

program
  .name("se2519")
  .description("CLI for my REST API")
  .version("1.0.0");


if (process.argv.length <= 2) {
  program.help();
}

program
	.command("healthcheck")
  	.description("perform heathckeck for DB")
  	.action(async () => 
	{
    		try 
		{
      			const res = await axios.get(`${API_BASE}/admin/healthcheck`);
      			console.log((res.data));
    		} 
		catch (err) 
		{
      			console.error("Error fetching data:", err.message);
    		}
  	});

program
  .command("resetpoints")
  .description("reset charging station points from file in system")
  .action(async () => {
    try {
      const res = await axios.post(`${API_BASE}/admin/resetpoints`);
      console.log(res.data);
    } catch (err) {
      console.error("Error creating user:", err.message);
    }
  });

program
	.command("points")
	.description("get points")
	.option("--status <status>", "status of requested points")
	.option("--format <format>", "choose between json and csv format for data", "csv")
	.action(async (opts) =>
	{
		try
		{	
			const params = {};
    			if (opts.status) {
      				params.status = opts.status;
    			}

        		params.format = opts.format;
			const res = await axios.get(`${API_BASE}/points`, { params } );

			if (opts.format === "json") {
 				console.log(JSON.stringify(res.data));
			} else {
  				console.log(res.data);
			}
		}
		catch (err)
		{
			console.error("Error fetching points:", err.message);
		}
	});

program
        .command("point")
        .description("get specific point")
        .requiredOption("--id <id>", "id of requested point")
        .action(async (opts) =>
        {
                try
                {
                	const res = await axios.get(`${API_BASE}/point/${opts.id}`);

                        console.log(res.data);
                }
                catch (err)
                {
                        console.error("Error fetching points:", err.message);
                }
        });

program.parse(process.argv);
