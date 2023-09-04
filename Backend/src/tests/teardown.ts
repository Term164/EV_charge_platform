import database from "../utils/database";
import helper from "./helper";

module.exports = async function teardown() {
    await database.establishDBConnection();
    await helper.clearAllTables();
    await database.closeDBConnection();
};