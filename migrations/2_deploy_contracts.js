var Event = artifacts.require("./Event.sol");

module.exports = function(deployer) {
	// const total = 20;
	// const price = "2000000000000000000";
    deployer.deploy(Event,"20","2000000000000000000");
};
