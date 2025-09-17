const utilites  = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
    const nav = await utilites.getNave()
    res.render("index", {title: "Home", nva})
}

module.exports = baseController