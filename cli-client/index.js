#!/usr/bin/env node

import axios from "axios";
import { Command } from "commander";
const program = new Command();
import { stringify } from "csv-stringify/sync";
import FormData from "form-data";
import fs from "fs";
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
				console.error("Error with healthcheck:", err.message);
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
			console.error("Error with reset:", err.message);
		}
	});

program
	.command("addpoints")
	.description("add charging station points from file in source")
	.requiredOption("--source <source>", "path of the source file for points")
	.action(async (opts) => {
	try {
		// 1. Create multipart form
		const form = new FormData();
		form.append("file", fs.createReadStream(opts.source), {
			contentType: "text/csv",
			filename: opts.source.split("/").pop()
		});

		// 2. POST request
		const res = await axios.post(`${API_BASE}/admin/addpoints`, form, {
			headers: {
				...form.getHeaders()
			}
		});

		console.log("Upload successful");
		console.log(res.data);
	} catch (err) {
		console.error("Upload failed:", err.response?.data || err.message);
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

				const res = await axios.get(`${API_BASE}/points`, { params } );

				res.data.sort((a, b) => b.pointid - a.pointid);

				if (opts.format === "json") {
					console.log(JSON.stringify(res.data, null, 2));
				} else if (opts.format === "csv") {
					const csv = stringify(res.data, { header: true });
					console.log(csv);
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

program
	.command("reserve")
	.requiredOption("--id <id>")
	.option("--minutes <minutes>")
	.description("reserve charging station")
	.action(async (opts) => {
		try 
		{
			const url = opts.minutes ? `${API_BASE}/reserve/${opts.id}/${opts.minutes}` : `${API_BASE}/reserve/${opts.id}`;
			const res = await axios.post(url);
			console.log(res.data);
		} 
		catch (err) 
		{
			console.error("Error reserving station:", err.message);
		}
	});

program
	.command("updpoint")
	.requiredOption("--id <id>")
	.option("--status <status>")
	.option("--price <price>")
	.description("update information on a charging point")
	.action(async (opts) => {
		try
		{
			const params = {};

			if (opts.status == null && opts.price == null)
			{
				throw new Error("At least one of the fields status, price must be given");
			}
			if (opts.status != null)
			{
				params.status = opts.status;
			}
			if (opts.price != null)
			{
				params.kwhprice = opts.price;
			}

			const res = await axios.post(`${API_BASE}/updpoint/${opts.id}`, params );

			console.log(res.data);
		} 
		catch (err) 
		{
			console.error("Error updating station:", err.message);
		}
	});

program
	.command("newsession")
	.requiredOption("--id <id>")
	.requiredOption("--starttime <starttime>")
	.requiredOption("--endtime <endtime>")
	.requiredOption("--startsoc <startsoc>")
	.requiredOption("--endsoc <endsoc>")
	.requiredOption("--totalkwh <totalkwh>")
	.requiredOption("--kwhprice <kwhprice>")
	.requiredOption("--amount <amount>")
	.description("insert new session")
	.action(async (opts) => {
		try
		{
			const params = { "pointid" : opts.id,
				"starttime" : opts.starttime,
				"endtime" : opts.endtime,
				"startsoc" : opts.startsoc,
				"endsoc" : opts.endsoc,
				"totalkwh" : opts.totalkwh,
				"kwhprice" : opts.kwhprice,
				"amount" : opts.amount
			};

			const res = await axios.post(`${API_BASE}/newsession`, params );

			console.log(res.data);
		}
		catch (err)
		{
			console.error("Error newsession:", err.message);
		}
	});

program
	.command("sessions")
	.description("get list of sessions for a charger")
	.requiredOption("--id <id>", "id of requested point")
	.requiredOption("--from <from>", "id of requested point")
	.requiredOption("--to <to>", "id of requested point")
	.option("--format <format>", "json or csv format for data", "csv")
	.action(async (opts) =>
		{
			try
			{
				const res = await axios.get(`${API_BASE}/sessions/${opts.id}/${opts.from}/${opts.to}`);

				res.data.sort((a, b) => b.starttime - a.starttime);

				if (opts.format === "json") {
                                        console.log(JSON.stringify(res.data, null, 2));
                                } else if (opts.format === "csv") {
                                        const csv = stringify(res.data, { header: true });
                                        console.log(csv);
                                }
			}
			catch (err)
			{
				console.error("Error fetching sessions:", err.message);
			}
		});

program.parse(process.argv);
