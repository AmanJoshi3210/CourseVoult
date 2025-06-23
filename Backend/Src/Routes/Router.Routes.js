const express = require("express");
const { Fetch_Data, Add_Resource,getAllPendingResources,deletePendingResource,approved_Data } = require("../Controller/Study_Materials.controller");

const Router = express.Router();

Router.route("/fetch").get(Fetch_Data);
Router.route("/resource").post(Add_Resource);
Router.route("/admin").get(getAllPendingResources);
Router.route("/delete/:id").delete(deletePendingResource);
// Router.route("/addResources").post();
Router.route("/AddPendingToProduct/:id").post(approved_Data);
module.exports = Router;
